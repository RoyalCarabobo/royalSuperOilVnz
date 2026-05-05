'use client';
import { useEffect, useState } from 'react';
import { StatsServices } from '@/services/stats';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  UserPlus,
  ChevronRight,
  Download
} from 'lucide-react';
import OrderDetailModal from '@/components/modal/OrderDetailModal';
import SalesChart from '@/components/SalesChart';
import ReportFilterModal from '@/components/modal/ReportFilterModal';


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [recentOrders, setRecentOrders] = useState([]);

  const [sellerPerformance, setSellerPerformance] = useState([]);

  const [stats, setStats] = useState({
    totalVentas: 0,
    pedidosPendientes: 0,
    stockBajo: 0,
    vendedoresActivos: 0,
    clientesPendientes: 0
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        const [total, pending, stock, sellers, ordersData, performanceData, pendingClients] = await Promise.all([
          StatsServices.getTotalOrders(),
          StatsServices.getPendingOrders(),
          StatsServices.getLowStock(),
          StatsServices.getActiveSellers(),
          StatsServices.getRecentOrders(),
          StatsServices.getSellerPerformance(),
          StatsServices.getPendingClients()
        ]);

        setStats({
          totalVentas: total.count || 0,
          pedidosPendientes: pending.count || 0,
          stockBajo: stock.count || 0,
          vendedoresActivos: sellers.count || 0,
          clientesPendientes: pendingClients.count || 0,
        });

        const orders = ordersData.data || [];
        setRecentOrders(orders);

        // --- PROCESAR DATOS PARA LA GRÁFICA ---
        // Agrupamos ventas por fecha (DD/MM)
        const dailyData = orders.reduce((acc, order) => {
          const date = new Date(order.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' });
          acc[date] = (acc[date] || 0) + Number(order.monto_total || 0);
          return acc;
        }, {});


        const processedPerformance = performanceData.data?.map(seller => ({
          name: seller.nombre_completo || seller.full_name,
          totalSales: seller.pedidos?.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0) || 0
        })).sort((a, b) => b.totalSales - a.totalSales);

        setSellerPerformance(processedPerformance || []);
      } catch (error) {
        console.error('Error al cargar datos del dashboard', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);


  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center'>
        <div className='text-white text-xl animate-pulse font-black italic uppercase tracking-tighter'>
          Sincronizando con <span className='text-blue-600'>Royal Super Oil</span>
        </div>
      </div>
    );
  }

  function StatCard({ title, value, color, icon: Icon }) {
    const colors = {
      blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      red: 'text-red-500 bg-red-500/10 border-red-500/20',
      green: 'text-green-500 bg-green-500/10 border-green-500/20',
      yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    };
    return (
      <div className={`p-6 rounded-3xl border ${colors[color]} bg-[#141414] shadow-2xl transition-transform hover:scale-[1.02]`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${colors[color].split(' ')[1]}`}>
            <Icon size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Live</span>
        </div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">{title}</p>
        <h4 className="text-3xl font-black text-white italic mt-1">{value}</h4>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 bg-[#0a0a0a] min-h-screen">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
            Panel <span className="text-blue-600">Administrativo</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Control Global Royal Super Oil</p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button className="bg-yellow-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-green-700 transition-all shadow-lg shadow-blue-900/20" onClick={() => setIsReportModalOpen(true)}>Imprimir Reporte Mensual</button>

          <Link href="/dashboard/admin/inventario" className="bg-[#1a1a1a] text-white border border-gray-800 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">
            Inventario
          </Link>

          <Link href="/dashboard/admin/ventas" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
            Ver Pedidos
          </Link>
        </div>
      </header>

      {/* Grid de KPIs - Ajustado para Móvil */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard title="Total Ventas" value={stats.totalVentas} color="blue" icon={TrendingUp} />
        <StatCard title="Por Aprobar" value={stats.pedidosPendientes} color="orange" icon={Clock} />
        <StatCard title="Stock Bajo" value={stats.stockBajo} color="red" icon={AlertTriangle} />
        <StatCard title="Vendedores" value={stats.vendedoresActivos} color="green" icon={Users} />
        <StatCard title="Nuevos Aliados" value={stats.clientesPendientes} color="yellow" icon={UserPlus} />
      </div>

      {/* Gráfica de Ventas - */}
      <div className="bg-[#141414] rounded-[2.5rem] border border-gray-800 p-6 md:p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-black italic uppercase text-sm tracking-widest text-white">Rendimiento de Ventas Mensual</h3>
          <span className="text-[10px] text-blue-500 font-bold uppercase">Mes Actual</span>
        </div>
        <SalesChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Top Vendedores */}
        <div className="bg-[#141414] rounded-[2.5rem] border border-gray-800 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-blue-500" size={20} />
            <h3 className="font-black italic uppercase text-sm tracking-widest text-white">Ranking Mensual</h3>
          </div>
          <div className="space-y-8">
            {sellerPerformance.slice(0, 5).map((seller, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">Puesto {index + 1}</span>
                    <span className="text-sm font-black text-white uppercase italic">{seller.name}</span>
                  </div>
                  <span className="text-sm font-black text-blue-500">${seller.totalSales.toLocaleString()}</span>
                </div>
                <div className="w-full bg-black rounded-full h-1.5 overflow-hidden border border-gray-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-blue-400' : 'bg-gray-700'}`}
                    style={{ width: `${Math.min((seller.totalSales / (sellerPerformance[0]?.totalSales || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OrderDetailModal isOpen={isModalOpen} order={selectedOrder} onClose={() => setIsModalOpen(false)} />

      <ReportFilterModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}