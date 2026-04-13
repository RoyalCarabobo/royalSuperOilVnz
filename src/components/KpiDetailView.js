'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, CheckCircle, Eye } from 'lucide-react';
import OrderDetailModal from '@/components/OrderDetailModal';
import { createClient } from '@/utils/supabase/client';
import { OrderService } from '@/services/orders';


export default function KpiDetailView({ type, data = [],
  onBack,
  onRefresh,
  onAnular,
  onClose,
  onPrintRequest }) {

  const router = useRouter();

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Asumiendo que guardas el rol en la tabla 'perfiles' o en user_metadata
        const { data } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();
        setUserRole(data?.rol); // 'admin', 'vendedor', etc.
      }
    };
    getUser();
  }, []);

  const handleAnularPedido = async (orderId) => {
    try {
      // Confirmación visual antes de proceder
      const confirmar = confirm("¿Estás seguro de anular este pedido Royal? El stock se devolverá al inventario automáticamente.");
      if (!confirmar) return;

      // Llamamos al servicio (aquí es donde verás los console.log que pusimos antes)
      const result = await OrderService.deleteOrder(orderId);

      if (result.success) {
        alert("✅ Pedido anulado y stock reintegrado correctamente.");

        // Refrescamos la lista de la consola para que el pedido desaparezca o cambie de estado
        if (onRefresh) onRefresh();

        // Cerramos el modal
        setIsModalOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error al anular:", error);
      alert("❌ Error en Red Royal: " + error.message);
    }
  };

  const handleDespachar = async (orderId) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status_logistico: 'despachado' }) // Eliminado el .select erróneo
        .eq('id', orderId);

      if (error) throw error;

      alert("✅ Pedido marcado como DESPACHADO.");

      // USAMOS onRefresh que viene de las props para actualizar la lista
      if (onRefresh) onRefresh();
      setIsModalOpen(false); // Cerramos el modal tras la acción
    } catch (err) {
      console.error("Error al despachar:", err.message);
      alert("Error al procesar el despacho");
    }
  }

  // CORRECCIÓN: handleEntregarPedido
  const handleEntregarPedido = async (pedidoId) => {
    // Usamos el cliente que ya tienes importado arriba como 'supabase' 
    // o el createClient() localmente, pero lo importante es la función de refresco.
    const supabaseClient = createClient();

    const { error } = await supabaseClient
      .from('pedidos')
      .update({ status_logistico: 'entregado' })
      .eq('id', pedidoId);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      alert("✅ Pedido entregado al cliente.");

      // AQUÍ ESTABA EL ERROR: Cambiamos fetchOrders() por onRefresh()
      if (onRefresh) onRefresh();

      setIsModalOpen(false); // Cerramos el modal
      setSelectedOrder(null);
    }
  };
  const handleReportarPago = (order) => {
    // Redirigir a la página de pagos pasando el ID del pedido
    // Ajusta esta ruta según tu estructura de carpetas
    router.push(`/dashboard/vendedor/ventas`);
  };

  // 2. Cambiamos el nombre para que sea consistente (selectedOrder)
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFilteredOrders = () => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    const typeKey = type?.toLowerCase().trim();

    switch (typeKey) {
      case 'pedidos totales': return data;

      case 'por confirmar': return data.filter(o => o.status_logistico === 'pendiente');

      case 'por cobrar': return data.filter(o => ['aprobado', 'por cobrar', 'despachado'].includes(o.status_logistico));

      case 'morosos': return data.filter(o => {

        if (o.status_pago === 'pagado') return false;

        const fechaBase = o.fecha_vencimiento ? new Date(o.fecha_vencimiento) : null;

        if (!fechaBase) {
          const calculada = new Date(o.fecha_pedido);
          calculada.setDate(calculada.getDate() + (o.dias_credito || 0));
          return calculada < now;
        }
        return fechaBase < now;
      });
      default: return data;
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleAprobar = async (id) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ status_logistico: 'aprobado' })
      .eq('id', id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("¡Pedido Royal Aprobado!");
      if (onRefresh) onRefresh();
      setIsModalOpen(false); // <--- Cerramos el modal tras aprobar
      setSelectedOrder(null);
    }
  };

  const filtered = getFilteredOrders();

  const getStatusLogisticoStyle = (status) => {
    const s = status?.toLowerCase().trim();
    switch (s) {
      case 'pendiente': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'aprobado': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'despachado': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'entregado': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusPagoStyle = (status) => {
    const s = status?.toLowerCase().trim();
    if (s === 'pagado') return 'text-emerald-500';
    return 'text-red-500'; // "por cobrar" o cualquier otro es rojo según tu regla
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 font-black uppercase text-[10px]"
      >
        <ArrowLeft size={14} /> Volver a la Consola
      </button>

      <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-black/20">
          <div>
            <h2 className="text-xl font-black italic uppercase text-blue-500">{type}</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              {filtered?.length || 0} Registros encontrados
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black text-[10px] font-black uppercase text-gray-500 border-b border-gray-800">
                <th className="py-6 px-8">Cliente</th>
                <th className="py-6 px-8 text-center">Fecha / Vence</th>
                <th className="py-6 px-8 text-center">Status</th>
                <th className="py-6 px-8 text-center">Monto</th>
                <th className="py-6 px-8 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/50">
              {filtered?.map((order) => (
                <tr key={order.id} className="hover:bg-blue-500/[0.03] transition-colors">
                  <td className="py-6 px-8">
                    <p className="font-black text-sm text-white uppercase">{order.clientes?.razon_social || "Cliente General"}</p>
                    <p className="text-[13px] text-red-500 uppercase font-bold">RIF: {order.clientes?.rif || "N/A"}</p>
                  </td>

                  <td className="py-6 px-8 text-center">
                    <p className="text-xs font-bold">Pedido: {new Date(order.fecha_pedido).toLocaleDateString()}</p>
                    <p className="text-[15px] ">Vence: {order.fecha_vencimiento ? new Date(order.fecha_vencimiento).toLocaleDateString() : 'Pendiente'}</p>
                  </td>

                  <td className="py-6 px-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {/* Badge Logístico: Naranja, Ámbar, Azul o Verde */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusLogisticoStyle(order.status_logistico)}`}>
                        {order.status_logistico}
                      </span>

                      {/* Estatus de Pago: Rojo o Verde */}
                      <span className={`text-[11px] font-bold uppercase italic flex items-center gap-1 ${getStatusPagoStyle(order.status_pago)}`}>
                        <span className="opacity-50 text-[9px] text-gray-500 not-italic">Pago:</span>
                        {order.status_pago}
                      </span>
                    </div>
                  </td>

                  <td className="py-6 px-8 text-center">
                    <p className="font-black text-blue-400">${order.monto_total?.toLocaleString()}</p>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => handleOpenDetails(order)} // 3. LLAMAR A LA FUNCIÓN DE DETALLES
                        className="p-2 bg-gray-800 hover:bg-blue-600 rounded-xl transition-all" title="Ver Detalles"
                      >
                        <Eye size={16} />
                      </button>

                      {/* SOLO SE MUESTRA SI ES "POR CONFIRMAR" Y EL USUARIO ES ADMIN */}
                      {type.toLowerCase() === 'por confirmar' && userRole === 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm('¿Desea aprobar oficialmente este pedido Royal?')) {
                              handleAprobar(order.id);
                            }
                          }}
                          className="p-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-lg shadow-emerald-900/10 border border-emerald-600/20"
                          title="Aprobar Pedido (Solo Admin)"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. INSERTAR EL COMPONENTE MODAL AL FINAL */}
      <OrderDetailModal
        isOpen={isModalOpen}
        order={selectedOrder}
        onClose={() => setIsModalOpen(false)}
        onAnular={handleAnularPedido}
        onEntregar={handleEntregarPedido}
        onDespachar={handleDespachar}
        onReportarPago={handleReportarPago}
        onPrintRequest={onPrintRequest}
        onAprobar={handleAprobar}
        userRole={userRole}

      />
    </div >
  );
}
