'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderService } from '@/services/orders';
import { TasaOficial } from '@/services/tasa';
import { AuthService } from '@/services/auth';
import { useInventario } from '@/hooks/useInventario';
import { getCreditDays } from '@/constants/getCreditDays';
import Image from 'next/image';

export default function CreateOrderClientePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [maxCreditDays, setMaxCreditDays] = useState(0);
    const [availableOptions, setAvailableOptions] = useState([
        { label: 'CONTADO', days: 0 }
    ]);

    // 1. Hook de Inventario en Tiempo Real
    const { productos: products, loading: loadingProducts } = useInventario();
    const [rate, setRate] = useState(36.50);

    const [order, setOrder] = useState({
        client: null,
        items: [],
        total_amount: 0,
        credit_days: 0,
        vendedor_id: '',
        vendedor_name: ''
    });

    useEffect(() => {
        async function init() {
            try {
                const profile = await AuthService.getCurrentProfileClient();
                if (!profile) return router.push('/login');

                const t = await TasaOficial.obtener();
                setRate(t || 36.50);

                // LOGICA DE PUNTOS:
                // Usamos el campo pedidos_completados que viene del perfil de Supabase
                const maxDays = getCreditDays(profile.pedidos_completados || 0);
                setMaxCreditDays(maxDays);

                // Generar opciones basadas en lo que tiene desbloqueado
                const options = [{ label: 'CONTADO', days: 0 }];
                if (maxDays >= 7) options.push({ label: '7 DÍAS', days: 7 });
                if (maxDays >= 14) options.push({ label: '14 DÍAS', days: 14 });
                if (maxDays >= 21) options.push({ label: '21 DÍAS', days: 21 });

                setAvailableOptions(options);

                setOrder(prev => ({
                    ...prev,
                    client: profile,
                    vendedor_id: profile.vendedor_id || '',
                }));
            } catch (error) {
                console.error("Error inicializando:", error);
            }
        }
        init();
    }, [router]); useEffect(() => {
        async function init() {
            try {
                const profile = await AuthService.getCurrentProfileClient();
                if (!profile) return router.push('/login');

                const t = await TasaOficial.obtener();
                setRate(t || 36.50);

                // LOGICA DE PUNTOS:
                // Usamos el campo pedidos_completados que viene del perfil de Supabase
                const maxDays = getCreditDays(profile.pedidos_completados || 0);
                setMaxCreditDays(maxDays);

                // Generar opciones basadas en lo que tiene desbloqueado
                const options = [{ label: 'CONTADO', days: 0 }];
                if (maxDays >= 7) options.push({ label: '7 DÍAS', days: 7 });
                if (maxDays >= 14) options.push({ label: '14 DÍAS', days: 14 });
                if (maxDays >= 21) options.push({ label: '21 DÍAS', days: 21 });

                setAvailableOptions(options);

                setOrder(prev => ({
                    ...prev,
                    client: profile,
                    vendedor_id: profile.vendedor_id || '',
                }));
            } catch (error) {
                console.error("Error inicializando:", error);
            }
        }
        init();
    }, [router]);

    // 2. Carga de Perfil del Cliente y Tasa
    useEffect(() => {
        async function init() {
            try {
                // Obtenemos el perfil del cliente logueado
                const profile = await AuthService.getCurrentProfileClient();
                if (!profile) return router.push('/login');

                const t = await TasaOficial.obtener();
                setRate(t || 36.50);

                setOrder(prev => ({
                    ...prev,
                    client: profile,
                    vendedor_id: profile.vendedor_id || '', // El vendedor asignado a este cliente
                }));
            } catch (error) {
                console.error("Error inicializando:", error);
            }
        }
        init();
    }, [router]);

    // 3. Lógica de Carrito (Sincronizada con el stock del Hook)
    const addToCart = (product) => {
        // Buscamos el stock más reciente desde el Hook useInventario
        const latestProduct = products.find(p => p.id === product.id);
        if (!latestProduct || latestProduct.stock <= 0) return alert("Sin existencia");

        const existing = order.items.find(item => item.product_id === product.id);
        const priceToUse = order.credit_days > 0 ? latestProduct.precio_credito : latestProduct.precio_contado;

        let newItems;
        if (existing) {
            if (existing.quantity >= latestProduct.stock) return alert("Stock máximo alcanzado");
            newItems = order.items.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * priceToUse }
                    : item
            );
        } else {
            newItems = [...order.items, {
                product_id: product.id,
                name: latestProduct.nombre,
                quantity: 1,
                unit_price: priceToUse,
                total: priceToUse
            }];
        }
        updateOrderTotals(newItems);
    };

    const resToCart = (product) => {
        const existing = order.items.find(item => item.product_id === product.id);
        if (!existing) return;

        let newItems;
        if (existing.quantity > 1) {
            newItems = order.items.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.unit_price }
                    : item
            );
        } else {
            newItems = order.items.filter(item => item.product_id !== product.id);
        }
        updateOrderTotals(newItems);
    };

    // Recalcular precios si cambia la condición de pago
    useEffect(() => {
        if (order.items.length === 0 || products.length === 0) return;
        const updatedItems = order.items.map(item => {
            const product = products.find(p => p.id === item.product_id);
            if (!product) return item;
            const newPrice = order.credit_days > 0 ? product.precio_credito : product.precio_contado;
            return { ...item, unit_price: newPrice, total: item.quantity * newPrice };
        });
        updateOrderTotals(updatedItems);
    }, [order.credit_days, products]);

    const updateOrderTotals = (items) => {
        const total = items.reduce((acc, i) => acc + i.total, 0);
        setOrder(prev => ({ ...prev, items, total_amount: total }));
    };

    const handleSave = async () => {
        if (order.items.length === 0) return alert("El carrito está vacío");
        setIsSubmitting(true);
        try {
            // Usamos el RPC para procesar de forma segura (ver paso anterior)
            await OrderService.createOrder({
                cliente_id: order.client.id,
                vendedor_id: order.vendedor_id,
                monto_total: order.total_amount,
                dias_credito: order.credit_days,
                status_logistico: 'pendiente',
                status_pago: 'por cobrar'
            }, order.items.map(item => ({
                producto_id: item.product_id,
                cantidad: item.quantity,
                precio_unitario: item.unit_price,
                subtotal: item.total
            })));

            router.push('/dashboard/cliente/pedidos');
        } catch (e) {
            alert(`Error: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-black overflow-hidden font-sans p-2 md:p-6 lg:p-2 ">


            <div className="flex h-[calc(100vh-64px)] overflow-hidden">

                <main className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-8">

                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        <section>

                            <h3 className="text-[15px] font-black uppercase tracking-[0.3em] mb-3 text-white italic">Catálogo de Productos</h3>

                            {loadingProducts ? (
                                <div className="text-center py-20 font-black animate-pulse">Sincronizando Inventario...</div>
                            ) : (
                                <div className="grid grid-rows-2 grid-flow-col flex overflow-x-auto gap-5 pb-5 bg-primary rounded-[2rem] p-1 scrollbar-hide snap-x snap-mandatory ">
                                    {products.map(p => (
                                        <div key={p.id} className="min-w-[270px] bg-gray-300 rounded-[2rem] p-2 border border-gray-200 shadow-sm flex flex-col h-[400px]">

                                            <div className="relative h-50 w-full bg-gray-50 rounded-[1.5rem] overflow-hidden">

                                                <Image src={p.foto_producto_url || '/placeholder.png'} alt={p.nombre} fill className="object-contain p-4" />

                                                <div className="absolute top-4 right-4 bg-foreground px-3 py-1 rounded-full text-[15px] font-black">
                                                    Stock: {p.stock}
                                                </div>
                                            </div>

                                            <div className="p-3 flex flex-col flex-grow">
                                                <h3 className="text-black font-black text-sm uppercase italic line-clamp-2 mb-4">{p.nombre}</h3>
                                                <div className="grid grid-cols-2 gap-4 border-t pt-4 mb-2">
                                                    <div>
                                                        <p className="text-[12px] text-black font-black uppercase">Contado</p>
                                                        <p className="text-lg font-black text-black">${p.precio_contado}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[12px] text-black font-black uppercase">Crédito</p>
                                                        <p className="text-lg font-black text-blue-600">${p.precio_credito}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 mt-[5px]">
                                                    <button onClick={() => addToCart(p)} disabled={p.stock <= 0} className="flex-1 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase hover:bg-green-600 disabled:bg-gray-200">
                                                        {p.stock > 0 ? 'Agregar' : 'Agotado'}
                                                    </button>
                                                    {order.items.find(i => i.product_id === p.id) && (
                                                        <button onClick={() => resToCart(p)} className="px-4 bg-gray-100 text-black rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                                                            -
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="col-span-12 lg:col-span-4">

                        <div className="sticky top-0 bg-gray-200 border border-gray-800 rounded-[2.5rem] flex flex-col h-[82vh]">
                            <div className="p-8 border-b border-gray-800">

                                <h3 className="font-black uppercase italic text-[25px]">Tu Pedido</h3>

                                <div className="text-[11px] font-black uppercase bg-foreground/50 text-blue-400 px-3 py-1 rounded-full border border-primary">
                                    Cliente: <span className="text-black">{order.client?.razon_social}</span>
                                </div>

                                <div className="mt-4 flex flex-col gap-2">
                                    <label className="text-[15px] font-black text-black uppercase">¿Cómo deseas pagar?</label>
                                    <label className="text-[10px] font-black text-black uppercase">Los pagos en Bs. son calculados a tasa Especial</label>

                                    {/* Agregamos un indicador de nivel de fidelidad */}
                                    <p className="text-[10px] font-bold text-blue-700">
                                        Pedidos completados: {order.client?.pedidos_completados || 0}
                                        {maxCreditDays > 0 ? ` (Crédito hasta ${maxCreditDays} días)` : ' (Solo contado)'}
                                    </p>

                                    <div className="grid grid-cols-3 bg-black p-1.5 rounded-2xl border border-gray-800">
                                        {availableOptions.map((opt) => (
                                            <button
                                                key={opt.days}
                                                onClick={() => setOrder({ ...order, credit_days: opt.days })}
                                                className={`py-2 text-[10px] font-black rounded-xl transition-all ${order.credit_days === opt.days
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-400 hover:bg-gray-700'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[16px] font-black uppercase">{item.name}</p>
                                            <p className="text-[14px]  font-black">{item.quantity} unidades</p>
                                        </div>
                                        <p className="font-black italic">${item.total}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-primary border-t border-black rounded-b-[2.5rem]">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-[17px] font-black text-foreground uppercase tracking-widest">Monto a Pagar</span>
                                    <div className="text-right">
                                        <p className="text-4xl font-black italic">${order.total_amount}</p>
                                        <p className="text-xs text-gray-500 font-bold">Bs. {(order.total_amount * rate).toLocaleString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSubmitting || order.items.length === 0}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs hover:bg-green-600 hover:text-white transition-all disabled:opacity-30"
                                >
                                    {isSubmitting ? 'Confirmando Pedido...' : 'Enviar Pedido Directo'}
                                </button>
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
}