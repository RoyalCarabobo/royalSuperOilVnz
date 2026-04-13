'use client'
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ClientService } from "@/services/clients";

export default function VendedorClientDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.clt) {
      fetchClientData();
    }
  }, [params.clt]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      // El servicio debe validar que el cliente pertenezca al vendedor autenticado
      const data = await ClientService.getById(params.clt);
      setClient(data);
    } catch (error) {
      console.error('Error al cargar expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-blue-500 font-black italic">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="tracking-widest uppercase text-[10px]">Consultando Cartera...</p>
    </div>
  );

  if (!client) return <div className="p-10 text-white bg-[#0f0f0f] min-h-screen">No tienes acceso a este expediente o no existe.</div>;

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-10 font-['Manrope']">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Simplificado (Sin acciones de Admin) */}
        <header className="flex items-center gap-6 bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
          <button onClick={() => router.back()} className="p-3 bg-[#0f0f0f] rounded-full text-gray-400 hover:text-white transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-1">
              {client.razon_social}
            </h1>
            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border ${
              client.status === 'habilitado' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-orange-500/30 text-orange-500 bg-orange-500/5'
            }`}>
              {client.status}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información en modo Solo Lectura */}
          <div className="lg:col-span-2 bg-[#1a1a1a] p-10 rounded-[3rem] border border-gray-800 space-y-8">
            <h3 className="text-blue-500 font-black uppercase text-xs tracking-widest border-b border-gray-800 pb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span> Datos de Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'RIF', value: client.rif },
                { label: 'Encargado', value: client.encargado },
                { label: 'Teléfono', value: client.telefono },
                { label: 'Email', value: client.email },
              ].map((item) => (
                <div key={item.label} className="group">
                  <p className="text-[9px] font-black text-gray-600 uppercase mb-1 tracking-widest">{item.label}</p>
                  <p className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{item.value || 'N/A'}</p>
                </div>
              ))}

              <div className="md:col-span-2">
                <p className="text-[9px] font-black text-gray-600 uppercase mb-1 tracking-widest">Dirección de Despacho</p>
                <p className="text-sm font-medium text-gray-400 leading-relaxed italic">
                  "{client.direccion || 'Sin dirección especificada'}"
                </p>
              </div>
            </div>
          </div>

          {/* Documentación (Solo Visualización) */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-gray-800">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-4 text-center">Fachada Registrada</p>
              <div className="rounded-2xl overflow-hidden border border-gray-800 aspect-square">
                <img 
                  src={client.foto_fachada_url || '/placeholder.jpg'} 
                  className="w-full h-full object-cover opacity-70"
                  alt="Fachada"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}