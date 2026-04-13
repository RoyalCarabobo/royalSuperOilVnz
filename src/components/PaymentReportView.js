'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Upload, Send, CheckCircle, XCircle, 
  Landmark, Calendar, Hash, Info, Filter 
} from 'lucide-react';

// Aquí integrarías la constante METODOS_PAGO mencionada arriba

export default function PaymentReportView({ order, userRole = 'vendedor', onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [pagoTotal, setPagoTotal] = useState(true);
  
  // Nuevo estado para manejar el método seleccionado desde la constante
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(METODOS_PAGO[0]);

  const [formData, setFormData] = useState({
    referencia: '',
    fecha: new Date().toISOString().split('T')[0],
    monto: order?.monto_total || 0,
    archivo: null
  });

  const [historialPagos, setHistorialPagos] = useState([]);

  useEffect(() => {
    if (order?.id) fetchPagos();
  }, [order]);

  const fetchPagos = async () => {
    const { data } = await supabase
      .from('pagos_reportados')
      .select('*')
      .eq('pedido_id', order.id)
      .order('created_at', { ascending: false });
    setHistorialPagos(data || []);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let publicUrl = null;
      if (formData.archivo) {
        const fileExt = formData.archivo.name.split('.').pop();
        const fileName = `${order.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(fileName, formData.archivo);
        if (!uploadError) {
          const { data } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
          publicUrl = data.publicUrl;
        }
      }

      const { error } = await supabase.from('pagos_reportados').insert({
        pedido_id: order.id,
        vendedor_id: (await supabase.auth.getUser()).data.user.id,
        monto_pagado: pagoTotal ? order.monto_total : formData.monto,
        metodo_pago: metodoSeleccionado.tipo,
        banco_destino: metodoSeleccionado.banco,
        referencia: formData.referencia,
        fecha_pago: formData.fecha,
        comprobante_url: publicUrl,
        tipo_reporte: pagoTotal ? 'completo' : 'parcial'
      });

      if (error) throw error;
      alert("Reporte enviado con éxito");
      fetchPagos();
      onUpdate(); 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-surface text-on-surface p-4">
      
      <div className="lg:col-span-7 space-y-10">
        <section>
          <h1 className="text-4xl font-black italic tracking-tighter mb-2 text-on-background uppercase">
            {userRole === 'admin' ? 'Verificación de Pagos' : 'Reportar Pago'}
          </h1>
          <p className="text-on-surface-variant text-sm font-medium uppercase tracking-widest">
            {order?.clientes?.razon_social} <span className="text-primary mx-2">//</span> Pedido #{order?.id}
          </p>
        </section>

        {userRole === 'vendedor' && (
          <form onSubmit={handleSubmitReport} className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Selector Dinámico de Métodos de Pago */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Cuenta de Destino</label>
                <select 
                  className="w-full bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 focus:ring-2 ring-primary outline-none font-bold text-sm"
                  onChange={(e) => setMetodoSeleccionado(METODOS_PAGO.find(m => m.id === parseInt(e.target.value)))}
                >
                  {METODOS_PAGO.map(m => (
                    <option key={m.id} value={m.id}>{m.banco} ({m.tipo})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Fecha de Transacción</label>
                <input 
                  type="date" 
                  className="w-full bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 font-bold text-sm"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Nº Referencia</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 font-bold text-sm"
                  value={formData.referencia}
                  onChange={(e) => setFormData({...formData, referencia: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">Monto a Reportar ($)</label>
                <input 
                  type="number" 
                  disabled={pagoTotal}
                  className={`w-full p-4 rounded-xl border font-black text-sm ${pagoTotal ? 'bg-surface-dim' : 'bg-surface-container-lowest border-primary'}`}
                  value={pagoTotal ? order?.monto_total : formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                />
              </div>
            </div>

            {/* Toggle Pago Parcial/Completo */}
            <div className="inline-flex p-1.5 bg-surface-container-highest rounded-full w-full max-w-sm">
              <button 
                type="button"
                onClick={() => setPagoTotal(true)}
                className={`flex-1 py-3 px-6 rounded-full text-xs font-black uppercase transition-all ${pagoTotal ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant'}`}
              >Total</button>
              <button 
                type="button"
                onClick={() => setPagoTotal(false)}
                className={`flex-1 py-3 px-6 rounded-full text-xs font-black uppercase transition-all ${!pagoTotal ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant'}`}
              >Abono Parcial</button>
            </div>

            {/* Upload */}
            <div className="relative group border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 text-center hover:bg-surface-container-low transition-colors">
                <Upload className="mx-auto text-primary mb-2" />
                <p className="text-xs font-bold uppercase">{formData.archivo ? formData.archivo.name : 'Adjuntar Comprobante'}</p>
                <input type="file" onChange={(e) => setFormData({...formData, archivo: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <button disabled={loading} className="w-full py-4 bg-primary text-on-primary font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all">
              {loading ? 'Enviando...' : 'Confirmar Reporte de Pago'}
            </button>
          </form>
        )}

        {/* Historial de Reportes */}
        <div className="mt-10 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Movimientos del Pedido</h3>
          {historialPagos.map((pago) => (
            <div key={pago.id} className="bg-surface-container-lowest border border-outline-variant/10 p-5 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${pago.estatus === 'confirmado' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <div>
                  <p className="font-black italic text-lg">${pago.monto_pagado}</p>
                  <p className="text-[9px] font-bold opacity-60 uppercase">{pago.metodo_pago} - Ref: {pago.referencia}</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase bg-surface-container-high px-3 py-1 rounded-full">{pago.estatus}</span>
            </div>
          ))}
        </div>
      </div>

      {/* COLUMNA DERECHA: Datos Dinámicos */}
      <div className="lg:col-span-5 space-y-6 sticky top-6">
        {/* Resumen de Cuenta (Saldo) */}
        <div className="bg-inverse-surface text-inverse-on-surface p-8 rounded-3xl shadow-xl">
            <h4 className="text-[10px] font-black uppercase text-primary mb-4">Balance General</h4>
            <div className="flex justify-between items-end">
                <p className="text-xs font-bold opacity-70 uppercase">Por Cobrar:</p>
                <p className="text-4xl font-black italic text-primary">
                    ${(order?.monto_total - historialPagos.filter(p => p.estatus === 'confirmado').reduce((acc, p) => acc + Number(p.monto_pagado), 0)).toFixed(2)}
                </p>
            </div>
        </div>

        {/* Cuentas Receptoras Dinámicas */}
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Landmark size={14} className="text-primary"/> Cuentas Autorizadas
          </h4>
          <div className="space-y-6">
            {METODOS_PAGO.map((m) => (
              <div key={m.id} className="border-b border-outline-variant/5 pb-4 last:border-0">
                <p className="text-[10px] font-black text-primary uppercase">{m.tipo} - {m.moneda}</p>
                <p className="text-sm font-black uppercase">{m.banco}</p>
                <div className="mt-2 text-[10px] font-mono space-y-1 opacity-70">
                  {Object.entries(m.detalles).map(([label, value]) => (
                    <p key={label}><span className="uppercase font-bold">{label}:</span> {value}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}