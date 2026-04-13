'use client'
import useSWR from 'swr';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

const fetcher = async () => {

  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error cargando productos:', error);
    throw error;
  }
  return data;

};

export function useProducts() {
  const { data, error, isLoading, mutate} = useSWR('productos-catalogo', fetcher, {
    revalidateOnFocus: false, // Evita peticiones al cambiar de pestaña
    dedupingInterval: 5000, // Los datos se consideran "frescos" por 5 minutos
    fallbackData: [], // Evita que la UI se rompa si no hay nada
  });

  return { productos: data || [], isLoading, isError: error, mutate };
};