'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function CobranzasPage() {
  const router = useRouter();
  const supabase = createClient();

  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState([
    { label: 'Total por Cobrar', value: '$0.00', color: 'text-amber-600', icon: <Clock size={20} /> },
    { label: 'Total Moroso', value: '$0.00', color: 'text-red-600', icon: <AlertCircle size={20} /> },
    { label: 'Recaudado Mes', value: '$0.00', color: 'text-green-600', icon: <CheckCircle2 size={20} /> },
  ]);

  // CORRECCIÓN: Sintaxis de useCallback y dependencias
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Sesión no encontrada");
        return;
      }

      const ahora = new Date();
      const firstDay = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();

      // NOTA: Asegúrate que 'cliente_id' es el nombre de la FK en tu tabla pedidos
      let query = supabase
        .from('pedidos')
        .select(`
          *, 
          clientes (razon_social, rif), 
          usuarios: vendedor_id (nombre_completo)
        `)
        .eq('vendedor_id', user.id)
        .neq('status_pago', 'anulado')
        .neq('status_logistico', 'pendiente')
        .gte('fecha_pedido', firstDay)
        .order('fecha_pedido', { ascending: false });

      if (filtro !== 'todos') {
        query = query.eq('status_pago', filtro);
      }

      if (busqueda) {
        // CORRECCIÓN: Quitamos espacios extra y aseguramos que el ID sea número si es posible
        const isNum = !isNaN(busqueda);
        if (isNum) {
          query = query.or(`id.eq.${busqueda}`);
        } else {
          // Si buscas por texto, solo filtramos por la relación
          query = query.ilike('clientes.razon_social', `%${busqueda}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        // Esto te dirá exactamente qué columna falla (ej: "column status_pago does not exist")
        console.error('ERROR DE SUPABASE:', error.message, error.details, error.hint);
        throw error;
      }

      const hoy = new Date();
      const procesados = data.map(p => {
        const vence = p.fecha_vencimiento ? new Date(p.fecha_vencimiento) : null;
        const diasAtraso = (p.status_pago !== 'pagado' && vence && hoy > vence)
          ? Math.floor((hoy - vence) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          ...p,
          dias_vencidos: diasAtraso,
          estatus_display: diasAtraso > 0 ? 'moroso' : (p.status_pago || 'pendiente')
        };
      });

      setPedidos(procesados);

      // Cálculo de estadísticas con safe-check (|| 0)
      const porCobrar = procesados.filter(p => p.status_pago === 'por cobrar').reduce((acc, curr) => acc + (curr.monto_total || 0), 0);
      const moroso = procesados.filter(p => p.dias_vencidos > 0).reduce((acc, curr) => acc + (curr.monto_total || 0), 0);
      const pagado = procesados.filter(p => p.status_pago === 'pagado').reduce((acc, curr) => acc + (curr.monto_total || 0), 0);

      setStats([
        { label: 'Total por Cobrar', value: `$${porCobrar.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-amber-600', icon: <Clock size={20} /> },
        { label: 'Total Moroso', value: `$${moroso.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-red-600', icon: <AlertCircle size={20} /> },
        { label: 'Recaudado Mes', value: `$${pagado.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: 'text-green-600', icon: <CheckCircle2 size={20} /> },
      ]);

    } catch (error) {
      console.error('Error capturado:', error);
    } finally {
      setLoading(false);
    }
  }, [filtro, busqueda, supabase]); // Eliminamos router de aquí para evitar re-renders innecesarios

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#fcf9f8] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto mb-10">

        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[#1c1b1b]">Control de Cartera</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">Gestión Royal Super Oil</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-[#d0c6ab]/20 shadow-sm min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 opacity-60 uppercase text-[9px] font-black tracking-widest text-gray-500">
                  {stat.icon} {stat.label}
                </div>
                <p className={`text-2xl font-black italic ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-[#1c1b1b] p-4 rounded-3xl shadow-xl flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente o N°..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white font-bold placeholder:text-gray-600 outline-none focus:border-[#ffd80d] transition-all"
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            {['todos', 'por cobrar', 'pagado'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltro(estado)}
                className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${filtro === estado ? 'bg-[#ffd80d] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-8 bg-white rounded-3xl shadow-2xl border border-[#d0c6ab]/20 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center font-black animate-pulse text-gray-400">CARGANDO...</div>
          ) : (
            /* CONTENEDOR DE SCROLL LATERAL */
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="p-6">Pedido / Fecha</th>
                    <th className="p-6">Aliado Comercial</th>
                    <th className="p-6 text-right">Monto Total</th>
                    <th className="p-6 text-center">Estatus</th>
                    <th className="p-6 text-right">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-6 whitespace-nowrap">
                        <p className="font-black text-[#1c1b1b]">#00{pedido.id}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          {pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleDateString() : 'S/F'}
                        </p>
                      </td>

                      <td className="p-6 min-w-[250px]">
                        <p className="font-black text-[#1c1b1b] uppercase italic leading-tight">
                          {pedido.clientes?.razon_social || 'Desconocido'}
                        </p>
                        {pedido.dias_vencidos > 0 && (
                          <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase inline-block mt-1">
                            {pedido.dias_vencidos} Días de mora
                          </span>
                        )}
                      </td>

                      <td className="p-6 text-right font-black text-lg italic text-[#1c1b1b] whitespace-nowrap">
                        ${(pedido.monto_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-6 text-center">
                        <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest inline-block whitespace-nowrap ${pedido.status_pago === 'pagado' ? 'bg-green-100 text-green-700' :
                            pedido.dias_vencidos > 0 ? 'bg-red-100 text-red-700 animate-pulse' :
                              'bg-amber-100 text-amber-700'
                          }`}>
                          {pedido.estatus_display}
                        </span>
                      </td>

                      <td className="p-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {pedido.status_pago !== 'pagado' ? (
                            <button
                              onClick={() => router.push(`/dashboard/vendedor/pagos/new_pago/${pedido.id}`)}
                              className="bg-[#1c1b1b] text-[#ffd80d] p-3 rounded-xl hover:scale-105 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                            >
                              <CreditCard size={18} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">Registrar</span>
                            </button>
                          ) : (
                            <CheckCircle2 size={24} className="text-green-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && pedidos.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <Clock size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase text-xs">No hay registros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}