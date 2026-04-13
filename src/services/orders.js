import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const OrderService = {

  /**
   * ESTADÍSTICAS Y KPIS (Optimizado para no saturar memoria)
   */
  async getDashboardStats(vendedorId) {

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Traemos solo las columnas necesarias para calcular, filtrando por el mes actual
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`*, clientes:cliente_id(razon_social, rif)`)
      .eq('vendedor_id', vendedorId)
      .gte('fecha_pedido', startOfMonth)
      .order('fecha_pedido', { ascending: false });

    if (error) throw error;

    // Procesamiento de métricas
    const totalVendido = pedidos?.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0) || 0;

    const porConfirmar = pedidos?.filter(p => p.status === 'pendiente').length || 0;

    const porCobrar = pedidos?.filter(p => p.status_pago === 'por cobrar').length || 0;

    const morosos = pedidos?.filter(p => {

      if (p.status_pago !== 'por cobrar') return false;

      const fechaVencimiento = new Date(p.fecha_vencimiento);

      return fechaVencimiento < now;
    }).length || 0;

    return {
      totalVendidoMes: totalVendido,
      totalPedidos: pedidos?.length || 0,
      porConfirmar,
      porCobrar,
      morosos,
      pedidos: pedidos || []
    };
  },

  /**
   * CONSULTAS PARA NUEVA ORDEN
   */
  async getOrderContext(vendedorId) {
    // Paralelismo puro para cargar la interfaz de venta velozmente
    const [clientsRes, productsRes] = await Promise.all([
      supabase
        .from('clientes')
        .select('*')
        .eq('vendedor_id', vendedorId)
        .eq('status', 'habilitado')
        .order('razon_social'),
      supabase
        .from('productos')
        .select('*')
        .eq('status', 'habilitado')
        .gt('stock', 0)
        .order('nombre')
    ]);

    if (clientsRes.error) throw clientsRes.error;
    if (productsRes.error) throw productsRes.error;

    return {
      clients: clientsRes.data,
      products: productsRes.data
    };
  },

  // * CREACIÓN DE pedidos
  async createOrder(orderData, items) {
    // 1. Insertar cabecera
    const { data: order, error: orderError } = await supabase
      .from('pedidos')
      .insert([{
        cliente_id: orderData.cliente_id,
        vendedor_id: orderData.vendedor_id,
        monto_total: orderData.monto_total,
        dias_credito: orderData.dias_credito,
        status_logistico: orderData.status_logistico,
        status_pago: orderData.status_pago,
      }])
      .select().single();

    if (orderError) throw orderError;

    // 2. Insertar Detalles (detalles_pedido)
    const itemsPayload = items.map(item => ({
      pedido_id: order.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_historico: item.precio_unitario
    }));

    const { error: itemsError } = await supabase
      .from('detalles_pedido')
      .insert(itemsPayload);

    if (itemsError) {
      // Si fallan los detalles, anulamos el pedido para que el trigger de arriba no deje el stock mal
      await supabase.from('pedidos').delete().eq('id', order.id);
      throw itemsError;
    }

    return order;
  },

  /**
   * GESTIÓN DE ÓRDENES
   */
  async getMyOrders(vendedorId) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('vendedor_id', vendedorId)
      .order('fecha_pedido', { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteOrder(id) {
    // Nota: Por integridad, es mejor "anular" que borrar físicamente
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status_pago: 'anulada' })
      .eq('id', id);

    if (error) throw error;
    return data;
  }
};