'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ClientService } from '@/services/clients';
import limpiarrif from '@/funciones/limpiarrif';
import validatePassword from '@/funciones/validatePassword';
import limpform from '@/funciones/limpform';

// --- SUB-COMPONENTE DE VALIDACIÓN ---
function ValidationItem({ label, isValid }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${isValid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-700'}`} />
      <span className={`text-[11px] font-medium transition-colors ${isValid ? 'text-gray-300' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // --- ESTADOS DE FLUJO ---
  const [phase, setPhase] = useState('form');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- ESTADO DE ZONAS (Desde DB) ---
  const [zonasDB, setZonasDB] = useState([]);

  // --- ESTADOS DE FORMULARIO ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [form, setForm] = useState({
    razon_social: '',
    rif: '',
    encargado: '',
    telefono: '',
    direccion: '',
    zona: ''
  });

  const [isCustomZona, setIsCustomZona] = useState(false);
  const [files, setFiles] = useState({ rif: null, fachada: null });
  const [previews, setPreviews] = useState({ rif: null, fachada: null });

  // Lógica de validación derivada
  const passwordIssues = validatePassword(password);
  const passwordsMatch = password.length > 0 && password === confirm;

  // --- CARGAR ZONAS ---
  useEffect(() => {
    const fetchZonas = async () => {
      const { data, error } = await supabase
        .from('zonas_ventas')
        .select('nombre')
        .order('nombre', { ascending: true });

      if (!error && data) {
        setZonasDB(data.map(z => z.nombre));
      }
    };
    fetchZonas();
  }, [supabase]);

  // Limpieza de URLs de memoria
  useEffect(() => {
    return () => {
      if (previews.rif) URL.revokeObjectURL(previews.rif);
      if (previews.fachada) URL.revokeObjectURL(previews.fachada);
    };
  }, [previews]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [type]: file });
      setPreviews({ ...previews, [type]: URL.createObjectURL(file) });
    }
  };

  const goStep2 = (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError('Ingresa tu correo.');
    if (passwordIssues.length > 0) return setError(`La contraseña no cumple los requisitos.`);
    if (!passwordsMatch) return setError('Las contraseñas no coinciden.');
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!files.rif || !files.fachada) return setError('Debes cargar ambas imágenes.');
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const sanitizedForm = limpform(form);
      const cleanRif = limpiarrif(sanitizedForm.rif);

      const metadataParaSupabase = {
        rol: 'cliente',
        nombre_completo: sanitizedForm.encargado,
        razon_social: sanitizedForm.razon_social,
        rif: cleanRif,
        zona: sanitizedForm.zona || 'No especificada',
        direccion: sanitizedForm.direccion,
        telefono: sanitizedForm.telefono,
      };

      // 1. Auth SignUp
      const { data: signData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: { data: metadataParaSupabase }
      });

      if (signUpError) throw signUpError;
      const userId = signData?.user?.id;
      if (!userId) throw new Error('Error al generar ID de usuario.');

      // 2. Client Service (Imágenes y Perfil)
      await ClientService.completeSelfRegistration(userId, metadataParaSupabase, files);

      // 3. Finalización
      await supabase.auth.signOut();
      setPhase('awaiting');

    } catch (err) {
      console.error("Error:", err);
      setError(err.message.includes('already registered') ? 'Este correo ya está registrado.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'awaiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4 text-center">
        <div className="max-w-md w-full bg-[#1a1a1a] p-10 rounded-[2.5rem] border border-gray-800 space-y-6 shadow-2xl">
          <span className="material-symbols-outlined text-6xl text-amber-500 animate-pulse">hourglass_top</span>
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter">Solicitud enviada</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Tu registro está en revisión por un administrador. Te notificaremos vía correo una vez seas aprobado.</p>
          <Link href="/login" className="block w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase italic hover:bg-blue-700 transition-all">Ir al Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 font-['Manrope']">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Royal <span className="text-red-600">Super</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">Nuevo Aliado Comercial</p>
        </header>

        {error && (
          <div className="max-w-md mx-auto bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-2xl text-center text-xs font-bold animate-shake">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={goStep2} className="max-w-md mx-auto bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-800 space-y-4 shadow-2xl">
            <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-[0.2em] mb-4 text-center">Paso 1: Seguridad</h3>

            <input
              type="email" required placeholder="Correo electrónico"
              className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-4 focus:border-blue-500 outline-none transition-all"
              value={email} onChange={e => setEmail(e.target.value)}
            />

            <div className="space-y-3">
              <input
                type="password" required placeholder="Contraseña"
                className={`w-full bg-[#0f0f0f] border ${password.length > 0 && passwordIssues.length > 0 ? 'border-amber-500/50' : 'border-gray-800'} rounded-xl px-4 py-4 focus:border-blue-500 outline-none transition-all`}
                value={password} onChange={e => setPassword(e.target.value)}
              />

              {password.length > 0 && (
                <div className="px-2 py-1 space-y-2 bg-[#0f0f0f]/50 rounded-xl border border-gray-800/50">
                  <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Seguridad:</p>
                  <div className="grid grid-cols-1 gap-1.5 pb-1">
                    <ValidationItem label="Mínimo 8 caracteres" isValid={!passwordIssues.includes('min')} />
                    <ValidationItem label="Al menos una mayúscula" isValid={!passwordIssues.includes('upper')} />
                    <ValidationItem label="Al menos un número" isValid={!passwordIssues.includes('number')} />
                    <ValidationItem label="Un carácter especial" isValid={!passwordIssues.includes('special')} />
                  </div>
                </div>
              )}

              <input
                type="password" required placeholder="Confirmar contraseña"
                className={`w-full bg-[#0f0f0f] border ${confirm.length > 0 && !passwordsMatch ? 'border-red-500/50' : 'border-gray-800'} rounded-xl px-4 py-4 focus:border-blue-500 outline-none transition-all`}
                value={confirm} onChange={e => setConfirm(e.target.value)}
              />

              {confirm.length > 0 && (
                <p className={`text-[10px] font-bold uppercase px-2 ${passwordsMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                  {passwordsMatch ? '✓ Las contraseñas coinciden' : '✕ Las contraseñas no coinciden'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordIssues.length > 0 || !passwordsMatch || !email}
              className="w-full py-4 bg-blue-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed font-black uppercase italic rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              Siguiente
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: Multimedia */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-gray-800 space-y-6">
                <h3 className="text-xs font-black uppercase text-blue-500 tracking-widest">Documentación Visual</h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Copia del RIF</label>
                  <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-800 hover:border-blue-500 overflow-hidden bg-[#0f0f0f] flex items-center justify-center group transition-all">
                    {previews.rif ? (
                      <img src={previews.rif} alt="Vista RIF" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-700 block">document_scanner</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase mt-2 block">Subir Archivo</span>
                      </div>
                    )}
                    <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'rif')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Fachada del Negocio</label>
                  <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-800 hover:border-blue-500 overflow-hidden bg-[#0f0f0f] flex items-center justify-center group transition-all">
                    {previews.fachada ? (
                      <img src={previews.fachada} alt="Vista Fachada" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-700 block">storefront</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase mt-2 block">Tomar Foto</span>
                      </div>
                    )}
                    <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'fachada')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario */}
            <div className="lg:col-span-7 bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Datos del Comercio</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">Nombre / Razón Social</label>
                  <input required className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none uppercase font-bold"
                    value={form.razon_social} onChange={e => setForm({ ...form, razon_social: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">RIF</label>
                  <input required className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                    placeholder="J-00000000-0" value={form.rif} onChange={e => setForm({ ...form, rif: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">Persona de Contacto</label>
                  <input required className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none uppercase font-bold"
                    value={form.encargado} onChange={e => setForm({ ...form, encargado: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">Teléfono</label>
                  <input required className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none"
                    placeholder="04141234567" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] text-blue-500 font-bold uppercase ml-1">Zona de Ventas</label>
                  <div className="flex gap-2">
                    {!isCustomZona ? (
                      <select
                        className="flex-1 bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none text-white font-bold"
                        value={form.zona}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setIsCustomZona(true);
                            setForm({ ...form, zona: '' });
                          } else {
                            setForm({ ...form, zona: e.target.value });
                          }
                        }}
                      >
                        <option value="">Selecciona zona (Opcional)</option>
                        {zonasDB.map(z => <option key={z} value={z}>{z}</option>)}
                        <option value="custom" className="text-blue-400 font-black">+ Escribir nueva zona</option>
                      </select>
                    ) : (
                      <div className="flex-1 flex gap-2">
                        <input
                          autoFocus
                          className="flex-1 bg-[#0f0f0f] border border-blue-600 rounded-xl px-4 py-3 text-sm outline-none uppercase font-bold"
                          placeholder="Nombre de la zona..."
                          value={form.zona}
                          onChange={e => setForm({ ...form, zona: e.target.value })}
                        />
                        <button type="button" onClick={() => { setIsCustomZona(false); setForm({ ...form, zona: '' }) }}
                          className="px-4 bg-gray-800 rounded-xl text-[10px] font-bold uppercase">Cerrar</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">Dirección Exacta</label>
                  <textarea required rows="2" className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none resize-none uppercase font-bold"
                    value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-800 rounded-2xl font-black uppercase italic text-xs hover:bg-white/5 transition-all">Atrás</button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-blue-600 rounded-2xl font-black uppercase italic shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95">
                  {loading ? 'Procesando...' : 'Enviar Registro'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}