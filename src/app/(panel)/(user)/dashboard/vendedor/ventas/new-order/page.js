'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderService } from '@/services/orders';
import { TasaOficial } from '@/services/tasa';
import { AuthService } from '@/services/auth';
import Image from 'next/image';

export default function CreateOrderPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para datos maestros (Catálogos)
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [rate, setRate] = useState(36.50);

    // Estado del pedido
    const [order, setOrder] = useState({
        client: null,
        items: [],
        total_amount: 0,
        credit_days: 0, // 0 = Contado, >0 = Crédito
        vendedor_id: '',
        vendedor_name: 'Cargando...'
    });

    // opciones de crédito constantes
    const creditOptions = [
        { label: 'CONTADO', days: 0 },
        { label: '7 DÍAS', days: 7 },
        { label: '15 DÍAS', days: 15 },
        { label: '21 DÍAS', days: 21 }
    ];

    // 1. Inicialización con Servicios Optimizados
    useEffect(() => {
        async function init() {
            try {

                // Obtenemos el perfil actual (Vendedor)
                const profile = await AuthService.getCurrentProfile();

                // Si no hay perfil, redirigimos al login
                if (!profile) return router.push('/login');

                // Carga en paralelo de Clientes, Productos y Tasa (Data Context)
                const [context, t] = await Promise.all([
                    OrderService.getOrderContext(profile.id),
                    TasaOficial.obtener()
                ]);

                setClients(context.clients || []);
                setProducts(context.products || []);
                setRate(t || 36.50);

                setOrder(prev => ({
                    ...prev,
                    vendedor_id: profile.id,
                    vendedor_name: profile.nombre_completo
                }));
            } catch (error) {
                console.error("Error inicializando orden:", error);
            }
        }
        init();
    }, [router]);

    // 2. Lógica de Carrito Adaptativa (Contado vs Crédito)
    const addToCart = (product) => {
        if (product.stock <= 0) return alert("Sin existencia en inventario");

        const existing = order.items.find(item => item.product_id === product.id);

        // Seleccionamos el precio basado en la condición de pago
        const priceToUse = order.credit_days > 0 ? product.precio_credito : product.precio_contado;

        let newItems;
        if (existing) {
            if (existing.quantity >= product.stock) return alert("Stock máximo alcanzado");
            newItems = order.items.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * priceToUse }
                    : item
            );
        } else {
            newItems = [...order.items, {
                product_id: product.id,
                name: product.nombre,
                quantity: 1,
                unit_price: priceToUse,
                total: priceToUse
            }];
        }
        updateOrderTotals(newItems);
    };

    const resToCart = (product) => {
        // Buscamos si el producto ya está en el carrito
        const existing = order.items.find(item => item.product_id === product.id);

        if (!existing) return; // Si no está, no hacemos nada

        let newItems;
        if (existing.quantity > 1) {
            // Si hay más de uno, restamos 1 y recalculamos el total de esa línea
            newItems = order.items.map(item =>
                item.product_id === product.id
                    ? {
                        ...item,
                        quantity: item.quantity - 1,
                        total: (item.quantity - 1) * item.unit_price
                    }
                    : item
            );
        } else {
            // Si solo queda uno, lo eliminamos por completo del array
            newItems = order.items.filter(item => item.product_id !== product.id);
        }

        updateOrderTotals(newItems);
    };

    // Recalcular cuando cambia el modo de pago (Contado/Crédito)
    useEffect(() => {
        if (order.items.length === 0) return;

        const updatedItems = order.items.map(item => {
            const product = products.find(p => p.id === item.product_id);
            const newPrice = order.credit_days > 0 ? product.precio_credito : product.precio_contado;
            return {
                ...item,
                unit_price: newPrice,
                total: item.quantity * newPrice
            };
        });
        updateOrderTotals(updatedItems);
    }, [order.credit_days, products]);

    const updateOrderTotals = (items) => {
        const total = items.reduce((acc, i) => acc + i.total, 0);
        setOrder(prev => ({ ...prev, items, total_amount: total }));
    };

    // 3. Envío de Información a Supabase
    // Dentro de CreateOrderPage.jsx

    const handleSave = async () => {
        if (!order.client || order.items.length === 0)
            return alert("Seleccione un cliente y productos");

        setIsSubmitting(true);
        try {
            // Cálculo de fechas para la cartera de crédito
            const hoy = new Date();

            await OrderService.createOrder({
                cliente_id: order.client.id,
                vendedor_id: order.vendedor_id,
                monto_total: order.total_amount,
                dias_credito: order.credit_days,
                fecha_pedido: hoy.toISOString(),
                status_logistico: 'pendiente',
                status_pago: 'por cobrar'
            }, order.items.map(item => ({
                producto_id: item.product_id,
                cantidad: item.quantity,
                precio_unitario: item.unit_price,
                subtotal: item.total
            })));

            router.push('/dashboard/vendedor/ventas');
        } catch (e) {
            alert(`Error en red Royal: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">

            {/* Header: Royal Super Oil */}
            <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0f0f0f]">
                <h2 className="font-black uppercase italic tracking-tighter text-xl">
                    Royal <span className="text-blue-500">Super Oil</span>
                </h2>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tasa BCV</p>
                        <p className="text-xs font-bold text-green-500">{rate} Bs/USD</p>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-800"></div>
                    <div className="text-[10px] font-black uppercase text-gray-400">
                        Agente: <span className="text-white">{order.vendedor_name}</span>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">

                {/* Catálogo de Productos */}
                <main className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8 space-y-8">

                        {/* Selector de Aliado */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-gray-500">Aliado Comercial</h3>
                            <select
                                className="w-full bg-[#141414] border border-gray-800 rounded-2xl p-4 font-bold text-sm outline-none focus:border-blue-500"
                                onChange={(e) => setOrder({ ...order, client: clients.find(c => c.id == e.target.value) })}
                                value={order.client?.id || ""}
                            >
                                <option value="">Seleccionar Cliente...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.razon_social} | RIF: {c.rif}
                                    </option>
                                ))}
                            </select>
                        </section>

                        {/* Grid de Productos */}
                        <section>
                            {/* Contenedor Slider */}
                            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory ">
                                {products.map(p => (
                                    <div key={p.id} className="min-w-[280px] md:min-w-[320px] group bg-white rounded-[1.5rem] p-2 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-[450px]">

                                        {/* Visualización del Producto */}
                                        <div className="relative h-65 w-full bg-gray-50 overflow-hidden p-2 rounded-t-[1.2rem]">
                                            <Image
                                                src={p.foto_producto_url || '/placeholder-oil.png'}
                                                alt={p.nombre}
                                                fill
                                                className="object-contain group-hover:scale-110 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 320px"
                                            />

                                            {/* Indicador de Stock Visual */}
                                            <div className="absolute top-3 right-3 flex gap-1">

                                                <div className='text-black text-[10px] p-'> <p>Stock Disponible <span className='font-black italic'>{p.stock} </span></p> </div>

                                                <div className={`w-3 h-3 rounded-full border border-white shadow-sm ${p.stock > 10 ? 'bg-green-500' : p.stock > 5 ? 'bg-orange-500' : 'bg-red-600'
                                                    }`}>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="p-4 flex flex-col flex-grow">
                                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">
                                                {p.categoria || 'Lubricante'}
                                            </span>

                                            <h3 className="text-[#0f0f0f] font-black text-sm leading-tight uppercase italic mb-1 line-clamp-2 h-10">
                                                {p.nombre}
                                            </h3>

                                            {/* Precios Informativos */}
                                            <div className="mt-auto pt-1 border-t border-gray-100 grid grid-cols-2 gap-2 mb-1">
                                                <div>
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase">Contado</p>
                                                    <p className="text-md font-black text-gray-900">${p.precio_contado}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase">Crédito</p>
                                                    <p className="text-md font-black text-blue-600">${p.precio_credito}</p>
                                                </div>
                                            </div>

                                            {/* BOTÓN DE ACCIÓN */}
                                            <div className="flex flex-row gap-2 mt-auto">
                                                {/* BOTÓN SUMAR */}
                                                <button
                                                    onClick={() => addToCart(p)}
                                                    disabled={p.stock <= 0}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p.stock > 0
                                                        ? 'bg-[#0f0f0f] text-white hover:bg-green-600 active:scale-95'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {p.stock > 0 ? '+ Agregar' : 'Agotado'}
                                                </button>

                                                {/* BOTÓN RESTAR/ELIMINAR */}
                                                <button
                                                    onClick={() => resToCart(p)}
                                                    // Solo habilitamos si el producto ya está en el carrito
                                                    disabled={!order.items.find(item => item.product_id === p.id)}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${order.items.find(item => item.product_id === p.id)
                                                        ? 'bg-[#1a1a1a] text-white hover:bg-red-600 active:scale-95 border border-gray-800'
                                                        : 'bg-transparent text-gray-700 border border-gray-800 cursor-not-allowed'
                                                        }`}
                                                >
                                                    Quitar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Resumen Lateral */}
                    <aside className="col-span-12 lg:col-span-4">
                        <div className="sticky top-0 bg-[#141414] border border-gray-800 rounded-[2.5rem] flex flex-col h-[85vh]">
                            <div className="p-8 border-b border-gray-800">
                                <h3 className="font-black uppercase italic tracking-tighter text-lg">Resumen de Venta</h3>

                                {/* SELECTOR DE DÍAS DE CRÉDITO MEJORADO */}
                                <div className="mt-6 flex flex-col gap-2">
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Condición de Pago</label>
                                    <div className="grid grid-cols-4 bg-[#0a0a0a] p-1.5 rounded-2xl border border-gray-800">
                                        {creditOptions.map((opt) => (
                                            <button
                                                key={opt.days}
                                                onClick={() => setOrder({ ...order, credit_days: opt.days })}
                                                className={`py-2 text-[9px] font-black rounded-xl transition-all ${order.credit_days === opt.days
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'text-gray-500 hover:text-gray-300'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Items del Carrito */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-4">
                                        <div className="max-w-[150px]">
                                            <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
                                            <p className="text-[10px] text-blue-500 font-bold mt-1">
                                                {item.quantity} x ${item.unit_price}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black italic">${item.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {order.items.length === 0 && (
                                    <div className="text-center py-20 text-gray-700 font-black uppercase text-[10px] tracking-widest italic">
                                        Esperando Selección...
                                    </div>
                                )}
                            </div>

                            {/* Footer de Resumen */}
                            <div className="p-8 bg-[#0f0f0f] border-t border-gray-800 rounded-b-[2.5rem]">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-[10px] font-black text-gray-600 uppercase">Total Final</span>
                                    <div className="text-right">
                                        <p className="text-4xl font-black italic text-white">${order.total_amount.toLocaleString()}</p>
                                        <p className="text-[11px] text-gray-500 font-bold">Bs. {(order.total_amount * rate).toLocaleString('es-VE')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSubmitting || order.items.length === 0}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs hover:bg-blue-500 hover:text-white transition-all disabled:opacity-10"
                                >
                                    {isSubmitting ? 'Procesando en Red...' : 'Finalizar Pedido'}
                                </button>
                            </div>
                        </div>
                    </aside>
                </main>
            </div >
        </div >
    );
}