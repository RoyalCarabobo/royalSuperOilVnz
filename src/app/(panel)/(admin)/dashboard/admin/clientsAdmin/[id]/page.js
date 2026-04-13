
'use client'
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ClientService } from "@/services/clients";
import { createClient } from '@/utils/supabase/client';

export default function ClientDetailPage({ params: paramsPromise }) {

  // 1. Fetch de la data del cliente usando params.id
  const params = use(paramsPromise);
  const supabase = createClient();
  const router = useRouter();

  // 2. Estados para edición y carga
  const [client, setClients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [vendedores, setVendedores] = useState([]);


  useEffect(() => {
    fetchClient();

  }, [params.id]);

  useEffect(() => {
    // Carga los vendedores cuando el componente monte
    async function loadVendedores() {
      const { data } = await supabase
        .from('usuarios')
        .select('id, nombre_completo')
        .eq('rol', 'vendedor')
        .eq('status', 'habilitado')
      setVendedores(data || []);
    }
    loadVendedores();
  }, []);

  const fetchClient = async () => {
    try {
      setLoading(true);

      const data = await ClientService.getById(params.id);
      setClients(data);

      // inicializamos fomrulario con la data actual
      setFormData(data);
    } catch (error) {
      console.error('Error al cargar cliente', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      // Limpiamos el formData para no enviar objetos anidados (como 'vendedor')
      const { vendedor, ...datatoUpdate } = formData;
      await ClientService.update(client.id, datatoUpdate);
      setIsEditing(false);
      fetchClient();
      alert('datos actualizados correctamente.');
    } catch (error) {
      alert('Error al actualizar:' + error.message);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    const confirmMsg = newStatus === 'habilitado' ? "¿Confirmar aprobación del aliado comercial?" : "¿Desea suspender a este cliente?";

    if (!confirm(confirmMsg)) return;

    try {
      // Obtenemos el ID del admin actual para el registro de auditoría
      const { data: { user } } = await supabase.auth.getUser();
      await ClientService.updateStatus(client.id, newStatus);
      fetchClient();
    } catch (error) {
      alert('Error al cambiar de estado' + error.message);
    };
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f0f0f0f] flex items-center text-blue-500 italic animate-pulse ">
      CARGANDO eXPEDIENTE...
    </div>
  );

  if (!client) return <div className="p-10 text-white">Cliente no encontrado</div>;

  return (
    <main className="min-h-screen bg-[#f0f0f0f] text-white p-6 md:p-10 font-['Manrope']">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header con Acciones */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1a1a] p-6 rounded-[2rem] border border-gray-800 shadow-xl">
          <div className="flex items-center gap-4">

            <button onClick={() => router.back()} className="p-2 bg-[#0f0f0f] rounded-full text-gray-400 hover:text-white transition">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>

            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                {client.razon_social}
              </h1>

              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${client.status === 'habilitado' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-orange-500/30 text-orange-500 bg-orange-500/5'
                }`}>
                Estado: {client.status}
              </span>
            </div>

          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {/* Caso 1: Nuevo registro esperando validación */}
            {client.status === 'pendiente' && (
              <button
                onClick={() => handleChangeStatus('habilitado')}
                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-green-900/20"
              >
                Aprobar Aliado
              </button>
            )}

            {/* Caso 2: Cliente activo que se desea sancionar/pausar */}
            {client.status === 'habilitado' && (
              <button
                onClick={() => handleChangeStatus('deshabilitado')}
                className="flex-1 md:flex-none bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all"
              >
                Suspender Aliado
              </button>
            )}

            {/* Caso 3: Cliente castigado que se desea reactivar */}
            {client.status === 'deshabilitado' && (
              <button
                onClick={() => handleChangeStatus('habilitado')}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-blue-900/20"
              >
                Habilitar Aliado
              </button>
            )}
          </div>

        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna Izquierda: Formulario de Datos */}
          <div className="lg:col-span-2 bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h3 className="text-blue-500 font-black uppercase text-xs tracking-widest">Información de Perfil</h3>
              <button
                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                className="text-[10px] font-black uppercase bg-gray-800 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isEditing ? 'Guardar Cambios' : 'Editar Datos'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {[
                { label: 'Razón Social', key: 'razon_social' },
                { label: 'Número de RIF', key: 'rif' },
                { label: 'Persona de Contacto', key: 'encargado' },
                { label: 'Teléfono', key: 'telefono' },
                { label: 'Email', key: 'email' },
              ].map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">{field.label}</label>
                  <input
                    disabled={!isEditing}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  />
                </div>
              ))}

              {/* Campo Especial: Selector de Vendedor */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Vendedor Asignado</label>
                <select
                  disabled={!isEditing}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all disabled:opacity-50 appearance-none"
                  value={formData.vendedor_id || ''}
                  onChange={(e) => setFormData({ ...formData, vendedor_id: e.target.value })}
                >
                  <option value="">Seleccionar Vendedor</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>


              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Dirección de Entrega</label>
                <textarea
                  disabled={!isEditing}
                  rows="3"
                  className="w-full bg-[#0f0f0f] border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all resize-none disabled:opacity-50"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Documentación Visual */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-gray-800 text-center">
              <p className="text-gray-500 font-black text-[10px] uppercase mb-4 tracking-tighter text-left">Documentación RIF</p>
              <a href={client.foto_rif_url} target="_blank" className="group relative block overflow-hidden rounded-2xl border border-gray-800">
                <img src={client.foto_rif_url} className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white">zoom_in</span>
                </div>
              </a>
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-gray-800">
              <p className="text-gray-500 font-black text-[10px] uppercase mb-4 tracking-tighter">Fotografía de Fachada</p>
              <a href={client.foto_fachada_url} target="_blank" className="group relative block overflow-hidden rounded-2xl border border-gray-800">
                <img src={client.foto_fachada_url || '/placeholder.jpg'} className="w-full aspect-square object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white">fullscreen</span>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>
    </main >
  );
}