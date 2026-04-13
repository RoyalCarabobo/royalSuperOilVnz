import { createClient } from '@/utils/supabase/client';

export const AuthService = {

  async getCurrentProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, rol')
      .eq('id', user.id)
      .single();

      return error ? null: data;
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