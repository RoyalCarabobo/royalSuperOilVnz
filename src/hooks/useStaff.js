import useSWR from 'swr'
import { UserService } from '@/services/profile'

export function useStaff() {
  const { data, error, mutate, isLoading } = useSWR('staff_list', UserService.getAllUsers, {
    revalidateOnFocus: false, // No recarga si el admin cambia de pestaña
    dedupingInterval: 300000, // Los datos se consideran "frescos" por 5 minutos
  })

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate // Esto lo usaremos para actualizar la UI rápido
  }
}