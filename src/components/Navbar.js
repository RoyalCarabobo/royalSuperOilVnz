'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { logo } from '../assets/index.js'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  const linkStyle = (path) =>
    `block px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-colors ${pathname === path
      ? 'text-blue-600 bg-blue-50 md:bg-transparent'
      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 md:hover:bg-transparent'
    }`;

  return (
    <nav className="bg-gray-900 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20"> {/* Aumentado a h-20 para que el logo respire */}

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Contenedor de la Imagen: Ahora con relative y tamaño definido */}
              <div className="relative w-12 h-12 transition-transform group-hover:scale-110 ">
                <Image
                  src={logo}
                  alt="Logo Royal Super"
                  fill
                  className="object-contain rounded-full " // object-contain evita que se estire
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-foregound tracking-tighter leading-none uppercase italic">
                  Royal<span className="text-blue-600">Super</span>
                </span>
                <span className="text-[10px] font-bold text-fourth tracking-[0.2em] uppercase">Venezuela</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">

            <Link href="/" className={linkStyle('/')}>Inicio</Link>
            <Link href="/catalogo" className={linkStyle('/catalogo')}>Catálogo</Link>
            <Link href="/adn" className={linkStyle('/adn')}>ADN Royal</Link>
            <Link href="/contacto" className={linkStyle('/contacto')}>Contacto</Link>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Mobile Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white border-b border-gray-100`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          <Link href="/" onClick={closeMenu} className={linkStyle('/')}>Inicio</Link>
          <Link href="/catalogo" onClick={closeMenu} className={linkStyle('/catalogo')}>Catálogo</Link>
          <Link href="/adn" onClick={closeMenu} className={linkStyle('/adn')}>ADN Royal</Link>
          <Link href="/contacto" onClick={closeMenu} className={linkStyle('/contacto')}>Contacto</Link>

          <div className="pt-4">
            <Link
              href="/login"
              onClick={closeMenu}
              className="block w-full text-center bg-blue-600 text-white px-4 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-200"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}