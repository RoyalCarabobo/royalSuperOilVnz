'use client';
import { useEffect, useState } from 'react';
import { ClientService } from '@/services/clients'; // Corregido: Importar el servicio correcto
import Link from 'next/link';

export default function UserClientsPage() {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            
            const data = await ClientService.getMyClients(); 
            setClients(data);
        } catch (error) {
            console.error("Error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filtro corregido para usar 'business_name' y 'rif'
    const filteredClients = clients.filter(c =>
        c.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rif?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <div className="text-blue-500 animate-pulse font-black uppercase tracking-widest">
                Sincronizando Cartera de Aliados...
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-10 font-['Manrope']">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                        Mis <span className="text-blue-500">Aliados</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Cartera de clientes asignada</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-80">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por negocio o RIF..."
                            className="w-full bg-[#1a1a1a] border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Link href="/dashboard/vendedor/clients/new-client">
                        <button className="flex items-center justify-center rounded-2xl h-12 px-6 bg-red-600 text-white gap-3 text-xs font-black uppercase italic shadow-xl shadow-red-900/30 hover:bg-red-700 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            Nuevo Aliado
                        </button>
                    </Link>
                </div>
            </div>

            {/* Tabla */}
            <div className="max-w-7xl mx-auto bg-[#1a1a1a] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#222] border-b border-gray-800">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Negocio</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">RIF</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-800/50">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-blue-500/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl overflow-hidden border border-gray-800 bg-[#0f0f0f]">
                                                <img 
                                                    src={client.foto_fachada_url || '/placeholder.jpg'} 
                                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" 
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                                    {client.razon_social}
                                                </p>
                                                <p className="text-[11px] text-gray-500">{client.encargado}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-mono text-blue-500">
                                            {client.rif}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                            client.status === 'habilitado' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                                        }`}>
                                            {client.status}
                                        </span>
                                    </td>

                                    <td className="px-8 py-6 text-right">
                                        <Link href={`/dashboard/vendedor/clients/${client.id}`} className="p-2 inline-block hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredClients.length === 0 && (
                        <div className="p-20 text-center text-gray-600 uppercase font-black text-xs tracking-widest">
                            No tienes aliados registrados aún
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
