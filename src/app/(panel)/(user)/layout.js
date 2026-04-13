'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function UserLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard/vendedor', icon: 'dashboard' },
    { name: 'Ventas', href: '/dashboard/vendedor/ventas', icon: 'sell' },
    { name: 'Clientes', href: '/dashboard/vendedor/clients', icon: 'person' },
    { name: 'Catalogo', href: '/dashboard/vendedor/catalogo', icon: 'menu_book' },
    { name: 'Pagos', href: '/dashboard/vendedor/pagos', icon: 'payments' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <div className="flex h-auto min-h-screen w-full flex-col bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* --- HEADER / TOP BAR --- */}
      <header className="flex items-center justify-between border-b border-white/5 bg-[#111111]/80 backdrop-blur-md px-6 lg:px-10 h-20 sticky top-0 z-50">

        <div className="flex items-center gap-10">

          <Link href="/dashboard/vendedor" className="flex items-center gap-5">
            <div className="size-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
              <span className="material-symbols-outlined text-xl font-bold">oil_barrel</span>
            </div>

            <h2 className="text-white text-xl font-black italic uppercase tracking-tighter">
              Royal<span className="text-red-600">Super</span>
              <span className="hidden sm:inline ml-1 text-gray-500 text-[10px] italic font-medium tracking-widest">OIL</span>
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive(link.href)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button className="hidden sm:flex p-2 text-gray-500 hover:text-blue-500 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <div className="hidden md:block h-6 w-px bg-white/10"></div>

          {/* Botón Salir Desktop */}
          <button
            onClick={handleSignOut}
            className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 hover:border-red-600/50 text-gray-400 hover:text-red-500 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            SALIR
          </button>

          {/* Botón Menú Mobile (Trigger Hamburguesa) */}
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden size-11 flex items-center justify-center text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-xl active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Avatar (Opcional en mobile) */}
          <div className="hidden sm:block size-9 rounded-full border-2 border-blue-600/30 p-0.5">
            <div
              className="w-full h-full rounded-full bg-gray-800 bg-cover bg-center"
              style={{ backgroundImage: 'url("https://ui-avatars.com/api/?name=Vendedor&background=1d4ed8&color=fff")' }}
            ></div>
          </div>
        </div>
      </header>

      {/* --- MOBILE NAV (Hamburguesa Estilo Slide-out) --- */}
      <div className={`fixed inset-0 z-[100] lg:hidden ${isOpen ? 'visible' : 'invisible'} transition-all duration-300`}>

        {/* Fondo oscuro (Backdrop) */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        ></div>

        {/* Panel lateral */}
        <nav className={`absolute right-0 top-0 h-full w-[280px] bg-[#0f0f0f] border-l border-white/10 shadow-2xl p-6 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Header del menú móvil */}
          <div className="flex items-center justify-between mb-10 pt-2">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">oil_barrel</span>
              </div>
              <span className="text-white font-black italic uppercase tracking-tighter text-lg">Menu</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="size-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 active:scale-90"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Listado de Links */}
          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 px-4">Navegación</p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isActive(link.href)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="material-symbols-outlined text-lg opacity-70">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Footer del Menú */}
          <div className="mt-auto pb-6 border-t border-white/5 pt-6">
            <div className="bg-white/5 p-4 rounded-2xl mb-6 flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center font-black italic text-xs">V</div>
              <div>
                <p className="text-[10px] font-black uppercase text-white">Vendedor Activo</p>
                <p className="text-[9px] font-bold text-gray-500 italic">Sesión Segura</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 bg-red-600/10 border border-red-500/20 text-red-500 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 hover:bg-red-600 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 py-10 bg-[#0a0a0a] text-center">
        <p className="text-gray-700 text-[9px] font-black uppercase tracking-[0.4em] italic">
          © 2026 ROYAL SUPER OIL VENEZUELA. DISTRIBUCIÓN LARA.
        </p>
      </footer>
    </div>
  );
}