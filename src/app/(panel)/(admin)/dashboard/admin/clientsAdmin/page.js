'use client';
import { useEffect, useState } from 'react';
import { ClientService } from '@/services/clients';
import Link from 'next/link';

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState('todos'); // todos, pendiente, aprobado
  const [loading, setLoading] = useState(true);


  // --- CÁLCULOS DE ESTADÍSTICAS ---
  const totalAliados = clients.length;
  const aprobados = clients.filter(c => c.status === 'habilitado').length;
  const pendientes = clients.filter(c => c.status === 'pendiente').length;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    try {
      setLoading(true);
      const data = await ClientService.getAllForAdmin();
      setClients(data || []);

    } catch (error) {
      // Log detallado para capturar errores de nombres de columna
      console.error("Error en AdminClients:", error.message);
    } finally {
      setLoading(false);
    }
  };


  const filteredClients = clients.filter(c =>
    filter === 'todos' ? true : c.status === filter
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="text-blue-500 animate-pulse font-black uppercase tracking-widest">
        Sincronizando Cartera de Aliados...
      </div>
    </div>
  );


  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-10 font-['Manrope']">

      {/* Encabezado Profesional */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Red de <span className="text-blue-500">Aliados</span>
          </h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2">Control de Distribución y Puntos de Venta</p>
        </div>

        <Link href="/dashboard/admin/clients/new" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs transition-all shadow-lg shadow-blue-900/20">
          + Registrar Aliado
        </Link>
      </div>

      {/* Filtros de Estado */}
      <div className="max-w-7xl mx-auto mb-6 flex gap-2 p-1 bg-[#1a1a1a] w-fit rounded-2xl border border-gray-800">
        {['todos', 'pendiente', 'habilitado', 'deshabilitado'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filter === tab ? 'bg-blue-600 text-white' : 'text-gray-500'
              }`}
          >
            {tab === 'habilitado' ? 'Activos' : tab}
          </button>
        ))}
      </div>

      {/* Sección de Estadísticas Rápidas */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-[2rem] shadow-xl">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Cartera</p>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black italic">{totalAliados}</h2>
            <span className="text-blue-500 material-symbols-outlined text-3xl">groups</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-[2rem] shadow-xl border-l-green-500/30">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Aliados Activos</p>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black italic text-green-500">{aprobados}</h2>
            <span className="text-green-500/50 material-symbols-outlined text-3xl">verified</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-[2rem] shadow-xl border-l-orange-500/30">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Por Validar</p>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-black italic text-orange-500">{pendientes}</h2>
            <span className="text-orange-500/50 material-symbols-outlined text-3xl">pending_actions</span>
          </div>
        </div>

      </div>

      {/* Tabla de Inteligencia Comercial */}
      <div className="max-w-7xl mx-auto bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#222] border-b border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500">Aliado Comercial</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500">RIF</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500">Contacto</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 text-right">Vendedor</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 text-right">Gestión</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/50">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-[#0f0f0f] border border-gray-800 overflow-hidden">
                        <img src={client.foto_fachada_url || '/placeholder-store.jpg'} className="w-full h-full object-cover opacity-80" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{client.razon_social}</p>
                        <p className="text-[10px] text-gray-500 truncate max-w-[200px] uppercase">{client.direccion}</p>
                      </div>
                    </div>

                  </td>
                  <td className="px-8 py-6 text-xs font-mono text-blue-400">{client.rif}</td>
                  <td className="px-8 py-6 text-xs">
                    <p className="text-gray-300 font-bold">{client.encargado}</p>
                    <p className="text-gray-500 text-[10px]">{client.telefono}</p>
                  </td>

                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${client.status === 'habilitado' // Antes decía 'aprobado'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                      }`}>
                      {client.status === 'habilitado' ? 'Activo' : client.status}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-xs font-bold text-blue-400 text-right">
                    {client.vendedor?.nombre_completo || 'Sin asignar'}
                  </td>

                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/admin/clientsAdmin/${client.id}`}>
                        <button className="p-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-500 hover:text-white transition-all">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </Link>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {filteredClients.length === 0 && (
            <div className="p-20 text-center text-gray-600 uppercase font-bold text-xs">
              No se encontraron aliados con este estado
            </div>
          )}
        </div>
      </div>
    </main>
  );
}