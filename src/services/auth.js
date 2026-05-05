import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export const AuthService = {

  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('usuarios') // Verifica que el nombre de la tabla sea 'usuarios'
      .select('id, nombre_completo, rol')
      .eq('id', user.id)
      .maybeSingle(); // Usar maybeSingle es más seguro que .single()

    if (error) {
      console.error("Error en perfil:", error.message);
      return null;
    }
    return data;
  },

  async getCurrentProfileClient() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('clientes')
      .select('id, razon_social, rol, vendedor_id')
      .eq('id', user.id)
      .maybeSingle();

    if (error) return null;

    // REFUERZO: Si la fila existe pero el rol está vacío en la tabla, 
    // usamos el que vimos en tu JSON de metadata.
    if (data) {
      return {
        ...data,
        rol: user.user_metadata?.rol
      };
    }

    return null;
  },

  async signIn(email, password) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    if (error) throw error;

    // Retornamos 'data' directamente para que en el login 
    // siempre tengamos data.user disponible
    return data;

  },

  async signOut() {
    const supabase = createClient(); // Ejecutamos la función
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
}