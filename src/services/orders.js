import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const OrderService = {
  /**
   * ESTADÍSTICAS Y KPIS (Vendedores)
   */
  async getDashboardStats(vendedorId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`*, clientes:cliente_id(razon_social, rif)`)
      .eq('vendedor_id', vendedorId)
      .gte('fecha_pedido', startOfMonth)
      .order('fecha_pedido', { ascending: false });

    if (error) throw error;

    // Nota: Asegúrate de si es 'total_amount' o 'monto_total' en tu DB
    const totalVendido = pedidos?.reduce((acc, p) => acc + (Number(p.monto_total) || 0), 0) || 0;
    const porConfirmar = pedidos?.filter(p => p.status === 'pendiente').length || 0;
    const porCobrar = pedidos?.filter(p => p.status_pago === 'por cobrar').length || 0;

    const morosos = pedidos?.filter(p => {
      if (p.status_pago !== 'por cobrar' || !p.fecha_vencimiento) return false;
      return new Date(p.fecha_vencimiento) < now;
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

  async getOrderContext(vendedorId) {
    const [clientsRes, productsRes] = await Promise.all([
      supabase.from('clientes').select('*').eq('vendedor_id', vendedorId).eq('status', 'habilitado').order('razon_social'),
      supabase.from('productos').select('*').eq('status', 'habilitado').gt('stock', 0).order('nombre')
    ]);

    if (clientsRes.error) throw clientsRes.error;
    if (productsRes.error) throw productsRes.error;

    return { clients: clientsRes.data, products: productsRes.data };
  },

  async createOrder(orderData, items) {
    // 1. Insertar cabecera
    const { data: order, error: orderError } = await supabase
      .from('pedidos')
      .insert([{
        cliente_id: orderData.cliente_id,
        vendedor_id: orderData.vendedor_id || null,
        monto_total: orderData.monto_total,
        dias_credito: orderData.dias_credito || 0,
        status_logistico: orderData.status_logistico || 'pendiente',
        status_pago: orderData.status_pago || 'pendiente',
        origen: orderData.origen || 'vendedor'
      }])
      .select().single();

    if (orderError) throw orderError;

    // 2. Insertar Detalles
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
      await supabase.from('pedidos').delete().eq('id', order.id);
      throw itemsError;
    }
    return order;
  },

  async getMyOrders(vendedorId) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('vendedor_id', vendedorId)
      .order('fecha_pedido', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getClientProducts() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('status', 'habilitado')
      .gt('stock', 0)
      .order('nombre');

    if (error) throw error;
    return data;
  },

  async createOrder(orderData, items) {
    // 1. Insertar cabecera
    const { data: order, error: orderError } = await supabase
      .from('pedidos')
      .insert([{
        cliente_id: orderData.cliente_id,
        vendedor_id: orderData.vendedor_id,
        monto_total: orderData.monto_total,
        dias_credito: orderData.dias_credito || 0,
        status_logistico: orderData.status_logistico || 'pendiente',
        status_pago: orderData.status_pago || 'pendiente',
        origen: orderData.origen || 'vendedor'
      }])
      .select().single();

    if (orderError) throw orderError;

    // 2. Insertar Detalles
    const itemsPayload = items.map(item => ({
      pedido_id: order.id,
      producto_id: item.id || item.producto_id, // Soporta ambos formatos
      cantidad: item.cantidad,
      precio_historico: item.precio_contado || item.precio_unitario
    }));

    const { error: itemsError } = await supabase
      .from('detalles_pedido')
      .insert(itemsPayload);

    if (itemsError) {
      await supabase.from('pedidos').delete().eq('id', order.id);
      throw itemsError;
    }
    return order;
  }


};

/**
 * SERVICIO DE CLIENTES
 */


export const ClientService = {
  async getMyClients() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No hay sesión activa");

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('vendedor_id', user.id)
      .order('razon_social', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getMyOrdersAsClient(clienteId) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        detalles:detalles_pedido(
          cantidad,
          precio_historico,
          producto:producto_id(nombre)
        )
      `)
      .eq('cliente_id', clienteId)
      .order('fecha_pedido', { ascending: false });

    if (error) throw error;
    return data;
  },

  async _uploadDocument(file, folder, userId) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const path = `${folder}/${userId}_${Date.now()}.${fileExt}`;

    const { error: upErr } = await supabase.storage
      .from('client-documents')
      .upload(path, file);

    if (upErr) throw upErr;

    const { data: { publicUrl } } = supabase.storage
      .from('client-documents')
      .getPublicUrl(path);

    return publicUrl;
  }
};