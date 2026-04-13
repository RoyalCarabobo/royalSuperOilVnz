'use client'
import React, { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';



export default function SalesmenDashboard() {

  const [profile, setProfile] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Obtener perfil del vendedor
        const usuariosProfile = await AuthService.getCurrentProfile();

        setProfile(usuariosProfile);

        if (usuariosProfile) {
          // 2. Obtener las últimas 3 órdenes (de la tabla 'order')
          const { data: orders } = await supabase
            .from('pedidos')
            .select('*')
            .eq('vendedor_id', usuariosProfile.id) // 
            .order('fecha_pedido', { ascending: false })
            .limit(3);

          setRecentOrders(orders || []);

          // 3. Obtener estadísticas de la tabla 'pedidos'
          const { data: allOrders } = await supabase
            .from('pedidos')
            .select('monto_total')
            .eq('vendedor_id', usuariosProfile.id)
            .neq('status', 'Cancelado');

          // Usamos el nombre correcto del campo: monto_total
          const total = allOrders?.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0) || 0;

          setStats({
            totalSales: total,
            count: allOrders?.length || 0
          });
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="text-gray-500 font-black uppercase italic text-xs tracking-widest">Cargando Sistema...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full px-4 md:px-10 py-8">

      {/* Profile Header Section */}
      <div className="flex p-6 bg-[#111111] rounded-3xl border border-gray-800 shadow-2xl mb-8">
        <div className="flex w-full flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 items-center">
            <div
              className="size-20 md:size-24 rounded-full border-4 border-blue-600 shadow-lg bg-gray-800 bg-cover bg-center"
              style={{ backgroundImage: `url("https://ui-avatars.com/api/?name=${profile?.nombre_completo || 'User'}&background=1d4ed8&color=fff")` }}
            ></div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-white text-2xl font-black uppercase italic tracking-tighter">
                  {profile?.nombre_completo || 'Cargando...'}
                </p>
                <div className="flex items-center gap-1 bg-blue-600/10 text-blue-500 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border border-blue-600/20">
                  <span className="material-symbols-outlined text-xs">verified</span> {profile?.role}
                </div>
              </div>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                ID: <span className="text-white">{profile?.id?.substring(0, 8).toUpperCase() || 'RS-XXXX'}</span>
              </p>
            </div>
          </div>
          {/* <button className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] border border-gray-700 rounded-xl text-white text-xs font-black uppercase italic hover:bg-gray-800 transition-all w-full md:w-auto justify-center">
            <span className="material-symbols-outlined text-sm">edit</span> Editar Perfil
          </button> */}
        </div>
      </div>

      {/* Main Action Area */}
      <div className="flex flex-col md:flex-row px-8 py-8 justify-between items-center bg-gradient-to-r from-blue-900/20 to-red-900/10 rounded-3xl border border-blue-600/20 mb-10 gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">Panel de Clientes</h3>
          <p className="text-gray-400 font-medium">Crea un nuevos clientes.</p>
        </div>

        <Link href="/dashboard/vendedor/clients/new-client">
          <button className="flex min-w-[240px] cursor-pointer items-center justify-center rounded-2xl h-16 px-8 bg-red-600 text-white gap-3 text-lg font-black uppercase italic shadow-xl shadow-red-900/30 hover:bg-red-700 hover:scale-105 transition-all active:scale-95">
            <span className="material-symbols-outlined">add_circle</span>
            Nuevo Cliente
          </button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row px-8 py-8 justify-between items-center bg-gradient-to-r from-blue-900/20 to-red-900/10 rounded-3xl border border-blue-600/20 mb-10 gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">Panel Despacho</h3>
          <p className="text-gray-400 font-medium">Crea un nuevo pedido.</p>
        </div>

        <Link href="/dashboard/vendedor/ventas/new-order">
          <button className="flex min-w-[240px] cursor-pointer items-center justify-center rounded-2xl h-16 px-8 bg-red-600 text-white gap-3 text-lg font-black uppercase italic shadow-xl shadow-red-900/30 hover:bg-red-700 hover:scale-105 transition-all active:scale-95">
            <span className="material-symbols-outlined">add_circle</span>
            Nueva Orden
          </button>
        </Link>
      </div>

      {/* Table Section */}
      <Link href='/dashboard/vendedor/ventas'>
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Ventas Recientes</h2>
          <button className="text-blue-500 text-xs font-black uppercase italic hover:underline flex items-center gap-1">
            Ver Historial <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

        </div>
      </Link>


      <div className="bg-[#111111] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-gray-800">
                <th className="px-6 py-4 text-gray-500 text-xs font-black uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-gray-500 text-xs font-black uppercase tracking-widest">Pedido</th>
                <th className="px-6 py-4 text-gray-500 text-xs font-black uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-gray-500 text-xs font-black uppercase tracking-widest text-right">Monto ($)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/50">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-600/5 transition-colors group">
                  <td className="px-6 py-5 text-gray-400 text-sm font-bold tracking-tighter uppercase">
                    {new Date(order.fecha_pedido).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-white text-sm font-black italic">
                    ORD-{String(order.id).substring(0, 6)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase borde ${order.status === 'Entregado' || order.status === 'pagado'
                      ? 'bg-green-600/10 text-green-500 border border-green-600/20'
                      : 'bg-amber-600/10 text-amber-500 border border-amber-600/20'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-white italic tracking-tighter text-lg">
                    ${parseFloat(order.monto_total).toFixed(2)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className='px-6 py-12 text-center text-gray-600 text-xs font-black uppercase italic' >
                    No has Realizado ordenes Todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Stats */}
      {/* <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#111111] border border-gray-800 flex items-center gap-4">
          <div className="size-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500">
            <span className="material-symbols-outlined">leaderboard</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">Órdenes Totales</p>
            <p className="text-2xl font-black italic text-white tracking-tighter">{stats.count}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#111111] border border-gray-800 flex items-center gap-4">
          <div className="size-12 bg-green-600/10 rounded-2xl flex items-center justify-center text-green-500">
            <span className="material-symbols-outlined">monetization_on</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">Venta Acumulada</p>
            <p className="text-2xl font-black italic text-white tracking-tighter">
              ${stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <Link href='/dashboard/vendedor/catalogo'>
          <button className="p-6 rounded-3xl bg-[#111111] border border-gray-800 flex items-center gap-4 cursor-pointer hover:bg-gray-800 transition-all">
            <div className="size-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <div>
              <p className="text-sm font-black text-blue-500 uppercase italic">Catalogo productos</p>
            </div>
          </button>
        </Link>
      </div> */}
    </div >
  );
}