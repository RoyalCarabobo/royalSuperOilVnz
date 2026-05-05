'use client';
import React from 'react';

export default function ClienteHome() {
  // Datos de ejemplo (Luego los conectarás con Supabase)
  const stats = [
    { label: 'Realizados', value: 12, icon: 'task_alt', color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Pendientes', value: 3, icon: 'schedule', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Morosos', value: 1, icon: 'warning', color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const ultimosPedidos = [
    { id: '1024', fecha: '20/10/2023', total: '$150.00', status: 'Entregado' },
    { id: '1025', fecha: '22/10/2023', total: '$85.50', status: 'En Camino' },
    { id: '1026', fecha: '25/10/2023', total: '$210.00', status: 'Pendiente' },
  ];

  return (
    <div className="space-y-8 p-2 md:p-6 lg:p-8">
      {/* --- HEADER SECCIÓN --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
            Comercial <span className="text-blue-500 underline decoration-yellow-400">Las Torres</span>
          </h1>
          <p className="text-gray-400 font-medium mt-1">Bienvenido de nuevo a tu panel de control.</p>
        </div>

        {/* BOTONES DE ACCIÓN RÁPIDA */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95">
            <span className="material-symbols-outlined">add_shopping_cart</span>
            Hacer Pedido
          </button>
          
          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-2xl font-bold transition-all border border-gray-700 active:scale-95">
            <span className="material-symbols-outlined">payments</span>
            Pagar
          </button>

          <a 
            href="https://wa.me/tu_numero" 
            target="_blank"
            className="flex items-center justify-center size-[52px] bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl transition-all shadow-lg shadow-green-900/20 active:scale-95"
          >
            <span className="material-symbols-outlined">chat</span>
          </a>
        </div>
      </div>

      {/* --- KPI DINÁMICO --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((item, index) => (
          <div key={index} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-3xl flex items-center gap-5">
            <div className={`size-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
              <span className="material-symbols-outlined text-3xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{item.label}</p>
              <h3 className="text-3xl font-black text-white leading-none mt-1">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* --- TABLA ÚLTIMOS PEDIDOS --- */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase italic">
            <span className="material-symbols-outlined text-blue-500">history</span>
            Últimos 5 Pedidos
          </h2>
          <button className="text-blue-500 text-xs font-bold hover:underline">Ver todo</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ultimosPedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-white font-bold">#{pedido.id}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{pedido.fecha}</td>
                  <td className="px-6 py-4 text-yellow-500 font-black">{pedido.total}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gray-800 text-gray-300 uppercase">
                      {pedido.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="size-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-blue-600 transition-all">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
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