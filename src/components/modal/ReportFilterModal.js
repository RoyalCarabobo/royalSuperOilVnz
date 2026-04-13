import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, FileText, Download, Filter } from 'lucide-react';
import { exportToPDF } from '@/funciones/exporToPDF';

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const ANIOS = [2026, 2027, 2028];

export default function ReportFilterModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    mes: new Date().getMonth(), // Mes actual por defecto
    anio: 2026,
    tipo: 'todos' // 'todos', 'pagados', 'por cobrar'
  });

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Calcular rango de fechas del mes seleccionado
      const firstDay = new Date(filters.anio, filters.mes, 1).toISOString();
      const lastDay = new Date(filters.anio, parseInt(filters.mes) + 1, 0, 23, 59, 59).toISOString();

      let query = supabase
        .from('pedidos')
        .select(`
          *,
          clientes (razon_social),
          usuarios (nombre_completo)
        `)
        .gte('fecha_pedido', firstDay)
        .lte('fecha_pedido', lastDay);

      // Aplicar filtros de estatus de pago
      if (filters.tipo === 'pagados') {
        query = query.eq('status_pago', 'pagado');
      } else if (filters.tipo === 'por cobrar') {
        query = query.neq('status_pago', 'pagado');
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data.length === 0) {
        alert("No se encontraron pedidos en este periodo.");
      } else {
        const periodLabel = `${MESES[filters.mes]} ${filters.anio}`;
        exportToPDF(data, periodLabel);
        onClose();
      }
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Error al obtener datos de la base de datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] w-full max-w-md rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-blue-600/10">
          <div>
            <h2 className="text-xl font-black italic uppercase text-blue-500 flex items-center gap-2">
              <FileText size={24} /> Reporte Royal
            </h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Configurar exportación PDF</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Selector de Mes y Año */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Mes</label>
              <select 
                value={filters.mes}
                onChange={(e) => setFilters({...filters, mes: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                {MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Año</label>
              <select 
                value={filters.anio}
                onChange={(e) => setFilters({...filters, anio: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Selector de Tipo de Pedidos */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Filtro de Estatus</label>
            <div className="grid grid-cols-1 gap-2">
              {['todos', 'pagados', 'por cobrar'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFilters({...filters, tipo})}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all font-black uppercase text-xs ${
                    filters.tipo === tipo 
                    ? 'border-blue-500 bg-blue-500/10 text-white' 
                    : 'border-gray-800 bg-black/40 text-gray-500 hover:border-gray-700'
                  }`}
                >
                  {tipo.replace('_', ' ')}
                  {filters.tipo === tipo && <Filter size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de Acción */}
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <> <Download size={18} /> Generar Reporte PDF </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}