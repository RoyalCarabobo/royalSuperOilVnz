'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  ArrowLeft, CheckCircle2, DollarSign,
  CreditCard, Landmark, Camera, Send, User, Hash
} from 'lucide-react';

export default function ReportarPagoPage({ params }) {

  const resolvedParams = React.use(params);
  const pedidoId = resolvedParams.id;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [metodo, setMetodo] = useState('transferencia');

  const [formData, setFormData] = useState({
    referencia: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    banco_destino: 'Banesco - Cuenta Corriente ...1234',
  });

  // 1. Cargar datos del pedido y cliente
  const fetchPedidoData = useCallback(async () => {
    if (!pedidoId) return;

    try {
      // Traemos el pedido y sus pagos relacionados en una sola consulta (si tienes la relación en Supabase)
      // O hacemos dos consultas paralelas para mayor claridad:
      const [pedidoRes, pagosRes] = await Promise.all([
        supabase.from('pedidos').select(`*, clientes (*)`).eq('id', pedidoId).single(),
        supabase.from('pagos_reportados').select('monto_pagado').eq('pedido_id', pedidoId)
      ]);

      if (pedidoRes.error) throw pedidoRes.error;

      const pedidoData = pedidoRes.data;
      const pagosPrevios = pagosRes.data || [];

      // CALCULAMOS LO ABONADO HASTA AHORA
      const totalAbonado = pagosPrevios.reduce((acc, pago) => acc + (pago.monto_pagado || 0), 0);
      const saldoReal = pedidoData.monto_total - totalAbonado;

      // Guardamos en el estado el pedido pero le inyectamos el abono calculado
      setPedido({ ...pedidoData, monto_abonado_calculado: totalAbonado });

      // Sugerir el saldo real restante en el input
      setFormData(prev => ({ ...prev, monto: saldoReal > 0 ? saldoReal.toFixed(2) : "0.00" }));

    } catch (error) {
      console.error("Error cargando datos:", error.message);
    } finally {
      setLoading(false);
    }
  }, [pedidoId, supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const montoAAbonar = parseFloat(formData.monto);
      const abonoPrevio = pedido.monto_abonado_calculado || 0;

      // El nuevo total que habrá pagado el cliente después de este reporte
      const totalAcumuladoFuturo = abonoPrevio + montoAAbonar;

      // DEFINICIÓN DE TIPO DE REPORTE
      // Si lo que se ha pagado + lo nuevo es menor al total, sigue siendo PARCIAL
      const tipoReporte = totalAcumuladoFuturo < pedido.monto_total ? 'parcial' : 'completo';

      // 1. Insertar el nuevo abono
      const { error: pagoError } = await supabase
        .from('pagos_reportados')
        .insert([{
          pedido_id: pedidoId,
          monto_pagado: montoAAbonar,
          referencia: formData.referencia,
          metodo_pago: metodo,
          banco_destino: formData.banco_destino,
          fecha_pago: formData.fecha,
          estatus: 'por cobrar',
          tipo_reporte: tipoReporte
        }]);

      if (pagoError) throw pagoError;

      // 2. Actualizar el estatus del pedido
      // Si el acumulado llega al total, marcamos como 'pagado'
      const nuevoEstatusPedido = totalAcumuladoFuturo >= pedido.monto_total ? 'pagado' : 'por cobrar';

      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ status_pago: nuevoEstatusPedido })
        .eq('id', pedidoId);

      if (updateError) throw updateError;

      alert(`Abono ${tipoReporte} registrado. Saldo restante: $${(pedido.monto_total - totalAcumuladoFuturo).toFixed(2)}`);
      router.push('/dashboard/vendedor/pagos');

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchPedidoData();
  }, [fetchPedidoData]);

  const metodos = [
    { id: 'transferencia', label: 'Transferencia', icon: <Landmark size={20} /> },
    { id: 'pagomovil', label: 'Pago Móvil', icon: <Send size={20} /> },
    { id: 'zelle', label: 'Zelle', icon: <CreditCard size={20} /> },
    { id: 'efectivo', label: 'Efectivo', icon: <DollarSign size={20} /> },
  ];


  if (loading) return <div className="p-20 text-center font-black animate-pulse">CARGANDO DATOS DEL CLIENTE...</div>;

  const saldoRestante = pedido ? (pedido.monto_total - (pedido.monto_pagado || 0)) : 0;


  return (
    <div className="min-h-screen bg-[#fcf9f8] p-6 lg:p-12">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-black font-black uppercase text-[10px] tracking-widest mb-8 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} /> Volver a Cartera
        </button>


        {/* INFO DEL CLIENTE Y PEDIDO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <div className="bg-white p-6 rounded-3xl border border-black shadow-sm">
            <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest mb-2 flex items-center gap-1">
              <User size={12} /> Aliado Comercial
            </p>

            <h2 className="text-xl font-black text-[#1c1b1b] italic uppercase">{pedido?.clientes?.razon_social}</h2>
            <p className="text-xs font-bold text-gray-800 italic uppercase">RIF: {pedido?.clientes?.rif}</p>
          </div>

          <div className="bg-[#ffd80d] p-6 rounded-3xl border border-black shadow-sm">
            <p className="text-[12px] font-black text-black uppercase tracking-widest mb-2 flex items-center gap-1">
              <Hash size={12} /> Balance del Pedido #00{pedido?.id}
            </p>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[15px] text-black font-bold uppercase">Total Pedido: ${pedido?.monto_total?.toLocaleString()}</p>
                <p className="text-2xl font-black italic text-[#1c1b1b]">Saldo: ${(pedido?.monto_total - pedido?.monto_abonado_calculado).toLocaleString()}</p>
              </div>

              {pedido?.monto_pagado > 0 && (
                <span className="text-[8px] font-black bg-black/10 px-2 py-1 rounded-full uppercase">
                  Abonado: ${pedido.monto_pagado.toLocaleString()}
                </span>
              )}nte.toLocaleString()
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-[#d0c6ab]/20 overflow-hidden">
          <div className="bg-[#1c1b1b] p-8 text-white">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Registrar Pago</h1>
            <p className="text-[#ffd80d] font-bold text-[10px] uppercase tracking-[0.2em]">Complete los datos del pago</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">

            {/* Métodos */}
            <div>
              <label className="text-[10px] font-black uppercase text-black mb-4 block tracking-[0.2em]">Método de Pago</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {metodos.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodo(m.id)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${metodo === m.id
                      ? 'border-[#1c1b1b] bg-[#1c1b1b] text-[#ffd80d] shadow-lg scale-105'
                      : 'border-gray-100 bg-gray-50 text-gray-400'
                      }`}
                  >
                    {m.icon}
                    <span className="text-[10px] font-black uppercase">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Monto Dinámico */}
              <div className="space-y-2">

                <label className="text-[10px] font-black uppercase text-black tracking-widest">Monto a Abonar (USD)</label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black">$</span>
                  <input
                    type="number"
                    step="0.01"
                    max={saldoRestante}
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    required={formData.monto}
                    className="w-full bg-gray-50 text-black border-2 border-transparent focus:border-[#ffd80d]  rounded-2xl py-4 pl-10 pr-4 font-black outline-none transition-all text-xl"
                  />
                </div>
                {parseFloat(formData.monto) < saldoRestante && (
                  <p className="text-[12px] text-black font-bold text-amber-600 uppercase italic">* Quedará un saldo pendiente de ${(saldoRestante - formData.monto).toFixed(2)}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-black font-black uppercase text-black tracking-widest">N° Referencia</label>
                <input
                  type="text"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  placeholder="Ej: 450912"
                  className="w-full text-black bg-gray-50 border-2 border-transparent focus:border-[#ffd80d]  rounded-2xl py-4 px-6 font-black outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-black tracking-widest">Destino del Pago</label>
              <select
                value={formData.banco_destino}
                onChange={(e) => setFormData({ ...formData, banco_destino: e.target.value })}
                className="w-full bg-gray-50 border-2 text-black border-transparent focus:border-[#ffd80d] focus:bg-white rounded-2xl py-4 px-6 font-black outline-none transition-all appearance-none"
              >
                <option>Banesco - Cuenta Corriente ...1234</option>
                <option>Banco de Venezuela - Pago Móvil</option>
                <option>Zelle - Royal Super Oil LLC</option>
                <option>Efectivo - Entrega Directa</option>
              </select>
            </div>

            <button
              disabled={sending}
              type="submit"
              className="w-full bg-[#1c1b1b] text-[#ffd80d] font-black uppercase text-sm py-6 rounded-3xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50"
            >
              {sending ? 'REGISTRANDO...' : <><Send size={20} /> Confirmar Reporte de Pago</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
