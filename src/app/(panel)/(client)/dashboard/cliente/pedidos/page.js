'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCreditDays } from '@/constants/getCreditDays';
import VentasStatsGrid from '@/components/VentasStatsGrid';
import { Package, creditCard, Clock, CheckCircle } from 'lucide-react';

export default function MisPedidosPage() {
    const [pedidos, setPedidos] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentKpi, setCurrentKpi] = useState(null);

    const [stats, setStats] = useState({
        totalVendidoMes: 0,
        totalPedidos: 0,
        porConfirmar: 0,
        porCobrar: 0,
        morosos: 0,
        pedidos: []
    });


    useEffect(() => {
        const fetchUserDataAndOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // 1. Obtener perfil con contador de pedidos
                const { data: profileData } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfile(profileData);

                // 2. Obtener historial de pedidos
                const { data: ordersData } = await supabase
                    .from('pedidos')
                    .select('*')
                    .eq('cliente_id', user.id)
                    .order('creado_en', { ascending: false });

                setPedidos(ordersData || []);
            }
            setLoading(false);
        };

        fetchUserDataAndOrders();
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse font-black">Cargando tu historial...</div>;

    // Lógica de fidelidad
    const pedidosActuales = profile?.pedidos_completados || 0;
    const diasActuales = getCreditDays(pedidosActuales);

    // Calcular siguiente nivel
    const getNextLevelInfo = (count) => {
        if (count < 3) return { faltantes: 3 - count, proximo: 7, total: 3 };
        if (count < 5) return { faltantes: 5 - count, proximo: 14, total: 5 };
        if (count < 8) return { faltantes: 8 - count, proximo: 21, total: 8 };
        return { faltantes: 0, proximo: 21, total: count };
    };

    const nextLevel = getNextLevelInfo(pedidosActuales);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#fbfbfb] min-h-screen">

            {/* 1. SECCIÓN DE FIDELIDAD Y PUNTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Card de Estado de Crédito */}
                <div className="lg:col-span-2 bg-black text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-2 text-blue-400 italic">Estatus de Fidelidad</h2>
                        <div className="flex items-end gap-4 mb-6">
                            <span className="text-6xl font-black italic">{pedidosActuales}</span>
                            <p className="text-xl font-bold uppercase mb-2">Pedidos Realizados</p>
                        </div>

                        {nextLevel.faltantes > 0 ? (
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm font-bold uppercase">
                                    Te faltan <span className="text-white">{nextLevel.faltantes} pedidos</span> para desbloquear <span className="text-blue-500">{nextLevel.proximo} días de crédito</span>.
                                </p>
                                <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden border border-gray-700">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                        style={{ width: `${(pedidosActuales / nextLevel.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-600/20 border border-blue-500 p-4 rounded-2xl">
                                <p className="text-blue-400 font-black uppercase text-center">🏆 ¡Nivel Máximo Alcanzado: 21 Días de Crédito!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Beneficio Actual */}
                <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center">
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                        <span className="material-symbols-outlined text-blue-600 text-4xl">payments</span>
                    </div>
                    <h3 className="text-gray-500 font-black uppercase text-xs tracking-widest mb-1">Tu beneficio actual</h3>
                    <p className="text-3xl font-black text-black">{diasActuales} Días</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 italic">Condición de pago autorizada</p>
                </div>
            </div>

            {/* 2. KPIs ESTADÍSTICOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <VentasStatsGrid
                    data={stats}
                    onCardClick={(label) => setCurrentKpi(label)}
                />
            </div>

            {/* 3. TABLA DE PEDIDOS RECIENTES */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-black uppercase italic text-lg">Historial de Operaciones</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">ID Pedido</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Fecha</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Monto</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Logística</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Crédito</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm">#{pedido.id.toString().slice(-5)}</td>
                                    <td className="px-6 py-4 text-sm">{new Date(pedido.creado_en).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-black">${pedido.monto_total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${pedido.status_logistico === 'entregado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {pedido.status_logistico}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-blue-600">
                                        {pedido.dias_credito > 0 ? `${pedido.dias_credito} DÍAS` : 'CONTADO'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}