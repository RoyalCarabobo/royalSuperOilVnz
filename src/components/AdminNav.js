'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthService } from '@/services/auth';

export default function AdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard/admin' },
    { name: 'Inventario', icon: 'inventory_2', path: '/dashboard/admin/inventory' },
    { name: 'Ventas', icon: 'sell', path: '/dashboard/admin/sales' },
    { name: 'Usuarios', icon: 'group', path: '/dashboard/admin/config/users' },
    { name: 'Clientes', icon: 'person', path: '/dashboard/admin/clientsAdmin' },
    { name: 'Configuración', icon: 'settings', path: '/dashboard/admin/config' },
    
  ];

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* --- TOP BAR (Desktop & Mobile) --- */}
      <nav className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-gray-800 px-4 md:px-8 h-16 flex items-center justify-between">

        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="size-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/40">
            <span className="material-symbols-outlined text-white text-xl font-bold">bolt</span>
          </div>
          <span className="hidden md:block font-black text-yellow-300 tracking-tighter uppercase italic">
            Royal<span className="text-blue-500">Super</span> <span className="text-xs text-red-500 ml-1 font-bold">Admin</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive(item.path)
                  ? 'bg-red-600/10 text-red-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <div className="h-8 w-px bg-gray-800 mx-1"></div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-white bg-gray-800 rounded-lg active:scale-95"
          >
            <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
          </button>

          <button
            onClick={() => AuthService.signOut()}
            className="hidden md:flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-red-600 text-gray-300 hover:text-red-500 px-4 py-2 rounded-xl text-xs font-black transition-all"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            SALIR
          </button>
        </div>
      </nav>

      {/* --- MOBILE OVERLAY MENU (Rojo & Negro) --- */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-[#1a1a1a] border-l border-gray-800 p-6 flex flex-col shadow-2xl">
          <div className="mb-10 mt-15">
            <p className="text-[18px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Panel de Control</p>
            <h2 className="text-2xl font-black text-white italic">MENU</h2>
          </div>

          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl text-base font-bold transition-all ${isActive(item.path)
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                    : 'text-gray-400 border border-transparent hover:border-gray-700'
                  }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-800">
            <button
              onClick={() => AuthService.signOut()}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-red-600/10 text-red-500 p-4 rounded-2xl font-black text-sm transition-all border border-red-900/20"
            >
              <span className="material-symbols-outlined">logout</span>
              CERRAR SESIÓN
            </button>
          </div>
        </div>
      </div>     
    </>
  );
}
