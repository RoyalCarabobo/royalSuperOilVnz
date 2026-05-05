'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientService } from '@/services/clients';

export default function AddClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState({ rif: null, fachada: null });
    const [previews, setPreviews] = useState({ rif: null, fachada: null });

    const [form, setForm] = useState({
        razon_social: '',
        rif: '',
        encargado: '',
        telefono: '',
        email: '',
        direccion: ''
    });

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles({ ...files, [type]: file });
            setPreviews({ ...previews, [type]: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ahora usamos ClientService en lugar de UserService
            await ClientService.create(form, files);
            alert("¡Aliado Comercial registrado con éxito!");
            router.push('/dashboard/admin/clients');
        } catch (error) {
            console.error(error);
            alert("Error al registrar cliente: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-['Manrope'] p-6">
            <header className="max-w-5xl mx-auto mb-10 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 bg-[#1a1a1a] rounded-full text-blue-500 hover:bg-gray-800 transition">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                    Nuevo <span className="text-blue-500">Aliado Comercial</span>
                </h1>
            </header>

            <main className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Documentación y Multimedia */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-gray-800 space-y-6">
                            <h3 className="text-xs font-black uppercase text-blue-500 tracking-widest">Documentación Visual</h3>

                            {/* Foto RIF */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Copia del RIF</label>
                                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-800 hover:border-blue-500 overflow-hidden bg-[#0f0f0f] flex items-center justify-center group transition-all">
                                    {previews.rif ? (
                                        <img src={previews.rif} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-gray-700">document_scanner</span>
                                    )}
                                    <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'rif')} />
                                </div>
                            </div>

                            {/* Foto Fachada */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Fachada del Negocio</label>
                                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-800 hover:border-blue-500 overflow-hidden bg-[#0f0f0f] flex items-center justify-center group transition-all">
                                    {previews.fachada ? (
                                        <img src={previews.fachada} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-gray-700">storefront</span>
                                    )}
                                    <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'fachada')} />
                                </div>
                            </div>
                        </div>
                    </div>

                        {/* Datos del Cliente */}
                    <div className="lg:col-span-7 space-y-4 md:space-y-6">
                        <div className="bg-[#1a1a1a] p-5 md:p-8 rounded-[2rem] md:rounded-3xl border border-gray-800 shadow-2xl space-y-5 md:space-y-6">
                            
                            <h3 className="text-[10px] md:text-xs font-black uppercase text-blue-500 tracking-widest">
                                Información de Registro
                            </h3>
                    
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Nombre Comercial - Siempre full width */}
                                <div className="col-span-1 md:col-span-2 space-y-1.5">
                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase ml-1">
                                        Nombre Comercial / Razón Social
                                    </label>
                                    <input 
                                        required 
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-blue-500 outline-none transition-all text-white"
                                        placeholder="Ej. Distribuidora Royal"
                                        onChange={(e) => setForm({ ...form, razon_social: e.target.value })} 
                                    />
                                </div>
                    
                                {/* RIF */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase ml-1">
                                        RIF (J-00000000-0)
                                    </label>
                                    <input 
                                        required 
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-blue-500 outline-none transition-all text-white"
                                        placeholder="J-12345678-9"
                                        onChange={(e) => setForm({ ...form, rif: e.target.value })} 
                                    />
                                </div>
                    
                                {/* Persona a Cargo */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase ml-1">
                                        Persona a Cargo
                                    </label>
                                    <input 
                                        required 
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-blue-500 outline-none transition-all text-white"
                                        placeholder="Nombre del encargado"
                                        onChange={(e) => setForm({ ...form, encargado: e.target.value })} 
                                    />
                                </div>
                    
                                {/* Teléfono */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase ml-1">
                                        Teléfono
                                    </label>
                                    <input 
                                        required 
                                        type="tel" 
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-blue-500 outline-none transition-all text-white"
                                        placeholder="0412-0000000"
                                        onChange={(e) => setForm({ ...form, telefono: e.target.value })} 
                                    />
                                </div>
                    
                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase ml-1">
                                        Email Corporativo
                                    </label>
                                    <input 
                                        required 
                                        type="email" 
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-blue-500 outline-none transition-all text-white"
                                        placeholder="contacto@empresa.com"
                                        onChange={(e) => setForm({ ...form, email: e.target.value })} 
                                    />
                                </div>
                    
                                {/* Dirección - Siempre full width */}
                                <div className="col-span-1 md:col-span-2 space-y-1.5">
                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase ml-1">
                                        Dirección Física Exacta
                                    </label>
                                    <textarea 
                                        required 
                                        rows="3" 
                                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3.5 text-sm focus:border-blue-500 outline-none transition-all resize-none text-white"
                                        placeholder="Calle, Local, Punto de referencia..."
                                        onChange={(e) => setForm({ ...form, direccion: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]">
                                {loading ? 'REGISTRANDO...' : 'REGISTRAR CLIENTE'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
