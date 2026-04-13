'use client';
import { useState } from 'react';
import { AuthService } from '@/services/auth';
import { useRouter } from 'next/navigation'; // Cambiamos location.href por router

export default function LoginPage() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {

      // 1. Intentamos el login
      const result = await AuthService.signIn(email, password);

      // 2. Extraemos data con seguridad
      const userData = result?.user || result?.data?.user;

      if (!userData) {
        if (!userData) {
          // Si llegamos aquí, es que AuthService devolvió algo inesperado
          throw new Error("Sesión iniciada, pero no se recibieron datos del perfil.");
        }
      }

      // Verificamos el rol desde metadatos
      const userRole = result.user?.user_metadata?.role;

      if (!userRole) {
        setError("Tu cuenta no tiene un rol asignado. Contacta al soporte.");
        setLoading(false);
        return;
      }



      // 4. Redirección 
      router.push(`/dashboard/${userRole.toLowerCase()}`);

      //  delay antes de refrescar ayuda a Turbopack
      setTimeout(() => {
        router.refresh();
      }, 100);


    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message || "Credenciales incorrectas");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#111111] p-10 rounded-[2.5rem] shadow-2xl border border-gray-800">
        <div className="text-center">
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">
            Royal <span className="text-red-600">Super</span>
          </h2>
          <p className="mt-4 text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
            Panel de Acceso Staff
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-900/20 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-900/30 text-center uppercase">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="email"
              required
              className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-4 text-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-700 font-medium"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-4 text-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-700 font-medium"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 text-sm font-black uppercase italic rounded-2xl text-white transition-all shadow-lg ${loading ? 'bg-gray-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-900/20'
              }`}
          >
            {loading ? 'Sincronizando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}