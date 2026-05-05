'use client';
import React, { useState, useEffect } from 'react';
import { X, Ban, Truck, CreditCard, Package, Printer, ExternalLink, CheckCircle, Clock } from 'lucide-react';

export default function OrderDetailModal({
  isOpen,
  order,
  onClose,
  onAnular,
  onAprobar,
  userRole, // Asegúrate de pasar 'admin' o 'vendedor' desde el padre
  onDespachar,
  onEntregar,
  onReportarPago,
  onPrintRequest,
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isOpen || !order) return null;

  // --- NORMALIZACIÓN ROBUSTA DE DATOS ---
  // Convertimos a string, minúsculas y quitamos espacios para evitar errores de comparación
  const logistica = String(order.status_logistico || '').toLowerCase().trim() || 'pendiente';
  const pago = String(order.status_pago || '').toLowerCase().trim() || 'por cobrar';
  const roleClean = String(userRole || '').toLowerCase().trim();

  // Verificación de Rol
  const isAdmin = roleClean === 'admin';

  // Lógica de Estados (Secuencial)
  const esPendiente = logistica === 'pendiente';
  const esAprobado = logistica === 'aprobado';
  const esDespachado = logistica === 'despachado';
  const esEntregado = logistica === 'entregado';

  const esPagado = pago === 'pagado';
  const esAnulado = pago === 'anulado' || logistica === 'anulado';

  // --- LÓGICA DE VISIBILIDAD DE BOTONES ---
  // El botón de aprobar SÓLO aparece si es pendiente Y el usuario es admin
  const mostrarBotonAprobar = esPendiente && isAdmin;
  
  const mostrarBotonDespachar = esAprobado;
  const mostrarBotonEntregar = esDespachado;
  const mostrarBotonAnular = (esPendiente || esAprobado) && !esAnulado;
  const mostrarBotonPago = esEntregado && !esPagado;

  const montoTotal = order.monto_total || 0;

  const handlePrint = () => {
    onPrintRequest(order);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#fcf9f8] w-full max-w-4xl max-h-[95vh] overflow-hidden relative shadow-2xl border border-[#d0c6ab]/20 flex flex-col rounded-xl">

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[#eae7e7] flex justify-between items-start bg-white">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full ${
                  esEntregado ? 'bg-green-600 text-white' :
                  esDespachado ? 'bg-blue-600 text-white' :
                  esAprobado ? 'bg-purple-600 text-white' :
                  'bg-[#ffd80d] text-[#715e00]'
                }`}>
                {logistica}
              </span>
              <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full border ${
                  esPagado ? 'bg-green-50 border-green-200 text-green-700' :
                  esAnulado ? 'bg-red-50 border-red-200 text-red-700' :
                  'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                PAGO: {pago}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-[#1c1b1b] uppercase italic">
              Expediente de Orden
            </h3>
            <p className="font-mono font-bold text-[#6f5d00] text-sm italic">CONTROL REF: #00{order.id}</p>
          </div>
          <button onClick={onClose} className="text-[#4d4732] hover:rotate-90 transition-transform p-2 bg-gray-100 rounded-full">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-[#6f5d00]">
                <Clock size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Datos del Cliente</p>
              </div>
              <h4 className="text-lg font-black text-[#1c1b1b] uppercase italic">{order.clientes?.razon_social || 'N/A'}</h4>
              <p className="text-xs font-bold text-gray-400 mt-1 font-mono">{order.clientes?.rif}</p>
            </div>

            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-center items-end text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Monto de Operación</p>
              <h4 className="text-3xl font-black text-[#1c1b1b] italic">
                ${montoTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h4>
            </div>
          </div>

          <div className="mb-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4d4732] mb-4 flex items-center gap-2">
              <Package size={14} className="text-[#6f5d00]" /> Detalle de Carga
            </h5>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50">
                    <th className="p-4">Producto</th>
                    <th className="p-4 text-center">Cant.</th>
                    <th className="p-4 text-right">Precio</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                      <td className="p-4 font-black uppercase italic text-xs text-gray-700">{item.productos?.nombre}</td>
                      <td className="p-4 text-center font-bold text-gray-600">{item.cantidad}</td>
                      <td className="p-4 text-right font-mono text-gray-500">${(item.precio_unitario || 0).toFixed(2)}</td>
                      <td className="p-4 text-right font-black italic text-[#6f5d00]">
                        ${((item.cantidad || 0) * (item.precio_unitario || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer de Acciones */}
        <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex flex-col gap-3">
          
          <button
            onClick={handlePrint}
            className="w-full bg-[#1c1b1b] text-[#ffd80d] font-black uppercase text-[10px] tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.01] transition-all shadow-lg active:scale-95"
          >
            <Printer size={18} /> Generar Documentos de Carga <ExternalLink size={14} />
          </button>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            
            {/* BOTÓN APROBAR (Corregido) */}
            {mostrarBotonAprobar && (
              <button
                onClick={() => { if (confirm('¿Desea aprobar este pedido para despacho?')) onAprobar(order.id); }}
                className="flex-1 px-4 py-4 bg-purple-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-xl hover:bg-purple-700 transition-all"
              >
                <CheckCircle size={18} /> Aprobar Pedido
              </button>
            )}

            {mostrarBotonAnular && (
              <button
                onClick={() => { if (confirm('¿Anular pedido definitivamente?')) onAnular(order.id); }}
                className="flex-1 px-4 py-4 border-2 border-red-100 text-red-600 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <Ban size={14} /> Cancelar Pedido
              </button>
            )}

            {mostrarBotonDespachar && (
              <button
                onClick={() => { if (confirm('¿Confirmar salida del camión?')) onDespachar(order.id); }}
                className="flex-[2] px-4 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-xl hover:bg-blue-700 transition-all"
              >
                <Truck size={18} /> Marcar como Despachado
              </button>
            )}

            {mostrarBotonEntregar && (
              <button
                onClick={() => { if (confirm('¿Confirmar entrega al cliente?')) onEntregar(order.id); }}
                className="flex-[2] px-4 py-4 bg-green-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-xl hover:bg-green-700 transition-all"
              >
                <CheckCircle size={18} /> Confirmar Entrega
              </button>
            )}

            {mostrarBotonPago && (
              <button
                onClick={() => { onReportarPago(order); onClose(); }}
                className="flex-[2] px-4 py-4 bg-[#6f5d00] text-[#ffd80d] font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 animate-pulse hover:animate-none transition-all shadow-xl"
              >
                <CreditCard size={18} /> Registrar Pago
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 px-4 py-4 bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
