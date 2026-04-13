import { supabase } from '@/lib/supabase';

const countParams = { count: 'exact', head: true };

export const StatsServices = {
  getTotalOrders: () =>
    supabase.from('pedidos').select('*', countParams),

  getPendingOrders: () =>
    // Ajustado a 'status_logistico' que es el campo que usas en el resto del código
    supabase.from('pedidos').select('*', countParams).eq('status_logistico', 'pendiente'),

  getLowStock: (limit = 10) =>
    supabase.from('productos').select('*', countParams).lt('stock', limit),

  getActiveSellers: () =>
    supabase.from('usuarios').select('*', countParams).eq('rol', 'vendedor'),

  getRecentOrders: (limit = 5) =>
    supabase
      .from('pedidos')
      .select(`
        id, 
        fecha_pedido, 
        monto_total, 
        status_logistico, 
        clientes (razon_social),
        usuarios (nombre_completo)
      `)
      .order('fecha_pedido', { ascending: false })
      .limit(limit),

  getSellerPerformance: () =>
    supabase
      .from('usuarios')
      .select(`
        nombre_completo, 
        pedidos (monto_total)
      `)
      .eq('rol', 'vendedor'),

  getPendingClients: () => 
    supabase.from('clientes').select('*', countParams).eq('status_logistico', 'pendiente') 
};