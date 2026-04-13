import { createClient } from '@/utils/supabase/client';


const supabase = createClient();

export const UserService = {

  // Obtener todos los clientes (rol 'cliente')
  async getAllUsers() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, rol, status, fecha_creacion')
      .order('nombre_completo', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Gestión de permisos específica de usuarios
  async toggleCustomerCreation(userId, currentStatus) {
    const { error } = await supabase
      .from('usuarios')
      .update({
        can_create_customers: !currentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  // Actualizar estado de acceso (Activo/Inactivo)
  async updateAccountStatus(id, newStatus) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        status: newStatus,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cambiar estado o rol si fuera necesario
  async updateStatus(id, newRole) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ role: newRole })
      .eq('id', id);

    if (error) throw error;
    return data;
  }
};
