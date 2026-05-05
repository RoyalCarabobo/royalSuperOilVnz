import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function useInventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    // Función para carga inicial
    const cargarInventario = async () => {
      const { data } = await supabase.from('productos').select('*');
      setProductos(data || []);
      setLoading(false);
    };

    cargarInventario();

    // SUSCRIPCIÓN EN TIEMPO REAL
    const channel = supabase
      .channel('inventario-realtime')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'productos' }, 
        (payload) => {
          // Actualizamos el estado de forma atómica
          setProductos((prev) => 
            prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { productos, loading };
}