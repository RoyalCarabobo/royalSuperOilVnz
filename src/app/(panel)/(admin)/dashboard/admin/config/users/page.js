'use client'
import React, { useEffect, useState } from 'react';
import { UserService } from '@/services/profiles';
import Link from 'next/link';

export default function UserManagementPage() {
  const [usuarios, setUsers] = useState([]); // 'usuarios' es tu estado local de la tabla profiles
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  

  // 1. Cargar desde Supabase al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await UserService.getAllUsers();
      setUsers(data || []); // Nos aseguramos de que siempre sea un array
    } catch (error) {
      console.error("Error al cargar perfiles:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // 2. Toggle con actualización optimista (cambia en pantalla antes que en DB)
  const handlePermissionToggle = async (userId, currentStatus) => {
    // Guardamos el estado anterior por si falla la DB
    const previousUsers = [...usuarios];

    // Actualización rápida en UI
    setUsers(usuarios.map(u =>
      u.id === userId ? { ...u, can_create_customers: !currentStatus } : u
    ));

    try {
      await UserService.togglePermission(userId, currentStatus);
    } catch (error) {
      console.error("Error en DB:", error.message);
      alert("Error de conexión con Supabase");
      setUsers(previousUsers); // Revertimos si falla
    }
  };

  // 3. Filtro inteligente (Busca por nombre o correo)
  const filteredUsers = usuarios.filter(u =>
    u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 lg:p-10">
      {/* Header de Sección */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Staff <span className="text-blue-600">&</span> <span className="text-red-600">Permisos</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Panel central de administración de accesos Royal Super.</p>
          </div>

          <Link href="/dashboard/admin/config/users/new-user"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase italic transition-all hover:scale-105 shadow-xl shadow-red-900/20 flex items-center gap-2">
            <span className="material-symbols-outlined">person_add</span>
            Registrar Nuevo
          </Link>
        </div>

        {/* Barra de Búsqueda Estilizada */}
        <div className="relative mb-8 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 group-focus-within:text-blue-500 transition-colors">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o cargo..."
            className="w-full bg-[#111111] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 transition-all text-lg font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabla / Grid de Usuarios */}
        <div className="bg-[#111111] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 text-center text-gray-500 font-bold animate-pulse uppercase tracking-widest">
              Sincronizando con la base de datos...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#161616] border-b border-gray-800">
                  <tr>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Usuario</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Rol</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Permiso Ventas</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Estado</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800/50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-600/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-full bg-gradient-to-br from-blue-600 to-red-600 p-[2px]">
                            <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-black text-sm uppercase italic">
                              {user.nombre_completo?.substring(0, 2) || 'RS'}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{user.nombre_completo || 'Sin Nombre'}</div>
                            <div className="text-xs text-gray-500 font-medium">{user.correo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase italic border ${user.rol === 'admin' ? 'bg-red-600/10 text-red-500 border-red-600/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'
                          }`}>
                          {user.rol}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <button
                          onClick={() => handlePermissionToggle(user.id, user.can_create_customers)}
                          className={`material-symbols-outlined text-3xl transition-colors ${user.can_create_customers ? 'text-blue-500' : 'text-gray-700 hover:text-gray-500'
                            }`}>
                          {user.can_create_customers ? 'toggle_on' : 'toggle_off'}
                        </button>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-xs font-bold text-gray-400 uppercase">Activo</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button className="text-gray-600 hover:text-white transition-colors">
                          <span className="material-symbols-outlined">settings</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}