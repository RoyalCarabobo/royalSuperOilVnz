'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Users, ArrowUpRight, Target, Plus, Banknote } from 'lucide-react';
import Link from 'next/link';
import VentasStatsGrid from '@/components/VentasStatsGrid';
import KpiDetailView from '@/components/KpiDetailView';
import { useAnularPedido } from '@/hooks/useAnularPedido';
import OrderDocument from '@/components/OrderDocument';


export default function VendedorVentasDashboard() {

    const [loading, setLoading] = useState(true);

    const [metaPersonal, setMetaPersonal] = useState(2500);

    const [currentKpi, setCurrentKpi] = useState(null);

    const [user, setUser] = useState(null);

    const router = useRouter();

    const [isPrinting, setIsPrinting] = useState(false);

    const [orderToPrint, setOrderToPrint] = useState(null);

    const [stats, setStats] = useState({
        totalVendidoMes: 0,
        totalPedidos: 0,
        porConfirmar: 0,
        porCobrar: 0,
        morosos: 0,
        pedidos: []
    });

    const handleGoToPrint = (order) => {
        setOrderToPrint(order);
        setIsPrinting(true);
    };

    const fetchVentasVendedor = useCallback(async () => {
        setLoading(true);
        try {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return router.push('/login');

            const authUser = session.user;
            setUser(authUser);

            const { data: pedidos, error } = await supabase
                .from('pedidos')
                .select(`*, clientes (razon_social, rif, direccion, telefono), usuarios:vendedor_id (nombre_completo), items:detalles_pedido(id, cantidad, precio_historico,productos(nombre))`)
                .eq('vendedor_id', authUser.id)
                .gte('fecha_pedido', firstDay)
                .order('fecha_pedido', { ascending: false });

            if (error) throw error;
            console.log("Primer pedido recibido:", pedidos[0]);

            // 2. Definir variables con valores por defecto (Evita el "not defined")
            let totalVendido = 0;
            let porConfirmar = 0;
            let porCobrar = 0;
            let morosos = 0;

            // 3. Procesar solo si hay pedidos
            if (pedidos && pedidos.length > 0) {
                totalVendido = pedidos.reduce((acc, p) => acc + (p.monto_total || 0), 0);
                porConfirmar = pedidos.filter(p => p.status_logistico === 'pendiente').length;
                porCobrar = pedidos.filter(p => p.status_pago === 'por cobrar').length;

                morosos = pedidos.filter(p => {
                    if (p.status_pago === 'pagado' || p.status_pago === 'anulado')
                        return false
                    if (!p.fecha_vencimiento) return false;
                    return new Date(p.fecha_vencimiento) < now;
                }).length;
            }

            // 4. Sincronizar estado
            setStats({
                totalVendidoMes: totalVendido,
                totalPedidos: pedidos?.length || 0,
                porConfirmar,
                porCobrar,
                morosos,
                pedidos: pedidos || []
            });

        } catch (err) {
            // Ahora el catch es seguro porque no depende de variables externas
            console.error("Error detallado en Dashboard:", err.message || err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    const { anular } = useAnularPedido(fetchVentasVendedor);

    useEffect(() => {
        fetchVentasVendedor();
    }, [fetchVentasVendedor]);

    // ESTE ES EL RENDER QUE DABA ERROR
    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
            <p className="animate-pulse font-black italic">CARGANDO DATOS ROYAL...</p>
        </div>
    );

    if (isPrinting && orderToPrint) {
        return (
            <OrderDocument
                order={orderToPrint}
                rate={36.50}
                onBack={() => setIsPrinting(false)}
            />
        );
    }

    return (
        <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-screen text-white font-sans">
            {/* Ahora currentKpi sí está definido en este scope */}
            {currentKpi ? (
                <KpiDetailView
                    type={currentKpi}
                    data={stats.pedidos}
                    onBack={() => setCurrentKpi(null)}
                    onRefresh={fetchVentasVendedor}
                    onAnular={anular}
                    onPrintRequest={handleGoToPrint}
                />
            ) : (
                <>
                    {/* HEADER CON ACCIONES RÁPIDAS */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-8">
                        <div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Mi Panel de <span className="text-blue-600">Ventas</span></h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Control Personal de Cartera Royal Super Oil</p>
                        </div>

                        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                            <Link href="/dashboard/vendedor/ventas/new-order" className="flex-1">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                                    <Plus size={16} /> Nuevo Pedido
                                </button>
                            </Link>
                            <Link href="/dashboard/vendedor/ventas/new-pago" className="flex-1">
                                <button className="w-full bg-white hover:bg-gray-200 text-black px-6 py-4 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg">
                                    <Banknote size={16} /> Reportar Pago
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* WIDGET DE META PERSONAL (ESTILO ADMIN) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        <div className="lg:col-span-2 bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] flex items-center gap-2">
                                    <Target size={14} /> Mi Meta Mensual
                                </span>
                                <span className="text-xs font-bold text-gray-500">
                                    {((stats.totalVendidoMes / metaPersonal) * 100).toFixed(1)}% Completado
                                </span>
                            </div>

                            <div className="h-4 bg-black rounded-full overflow-hidden mb-6 border border-gray-800">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-700 to-blue-400 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                    style={{ width: `${Math.min((stats.totalVendidoMes / metaPersonal) * 100, 100)}%` }}
                                ></div>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black italic">${stats.totalVendidoMes.toLocaleString()}</span>
                                <span className="text-gray-500 font-bold uppercase text-xs">Objetivo: ${metaPersonal.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* PEQUEÑO RECUADRO DE CLIENTES ACTIVOS */}
                        <div className="bg-blue-600 p-8 rounded-[2.5rem] flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Users size={160} />
                            </div>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Mis Clientes</p>
                            <h3 className="text-4xl font-black italic">Activos</h3>
                            <p className="text-white text-sm font-bold mt-4 flex items-center gap-2">
                                <ArrowUpRight size={16} /> Gestionar Cartera
                            </p>
                        </div>
                    </div>

                    {/* KPI GRID (REUTILIZADO) */}
                    <VentasStatsGrid
                        data={stats}
                        onCardClick={(label) => setCurrentKpi(label)}
                    />

                    {/* TABLA DE ÚLTIMOS MOVIMIENTOS (ESTILO ADMIN) */}
                    <div className="mt-10 bg-[#1a1a1a] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="font-black italic uppercase tracking-widest text-sm">Mi Historial Reciente</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-black text-[10px] font-black uppercase text-gray-500">
                                        <th className="py-6 px-8">Cliente</th>
                                        <th className="py-6 px-8 text-center">Monto</th>
                                        <th className="py-6 px-8 text-center">Estatus</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-800/50">
                                    {stats.pedidos.slice(0, 8).map((pedido) => (
                                        <tr key={pedido.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                                            <td className="py-6 px-8">
                                                <p className="font-black text-sm uppercase">{pedido.clientes?.razon_social || 'Sin Cargar'}</p>
                                                <p className="text-[9px] text-gray-600 font-mono">#{pedido.id.toString().slice(-6)}</p>
                                            </td>

                                            <td className="py-6 px-8 text-center font-black text-blue-400">
                                                ${pedido.monto_total?.toFixed(2)}
                                            </td>
                                            <td className="py-6 px-8 text-center">
                                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${pedido.status === 'pagado' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    pedido.status_logistico === 'pendiente' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    }`}>
                                                    {pedido.status_logistico}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}