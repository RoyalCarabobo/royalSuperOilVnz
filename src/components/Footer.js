'use client'

import Image from "next/image";
import Link from "next/link";
import { logo } from '../assets/index.js'

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900">
            {/* Sección Principal */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">

                    {/* Columna 1: Empresa */}
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <div className="flex items-center gap-2">
                            <Image
                                src={logo}
                                alt="Logo Royal Venezuela"
                                width={50}
                                height={50}
                                className="rounded-full bg-white p-1"
                            />
                            <span className="text-xl font-black text-foregound tracking-tighter leading-none uppercase italic">
                                Royal<span className="text-blue-600">Super</span>
                            </span>
                            <span className="text-[10px] mt-1.5 font-bold text-fourth tracking-[0.2em] uppercase">Venezuela</span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">
                            Soluciones de calidad para tu negocio. Comprometidos con el crecimiento y la excelencia en todo el país.
                        </p>
                    </div>

                    {/* Columna 2: Productos */}
                    <div>
                        <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Productos</h2>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/catalogo" className="hover:text-blue-400 transition-colors">Catálogo</Link></li>
                        </ul>
                    </div>

                    {/* Columna 3: Horario */}
                    <div>
                        <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Horario de Atención</h2>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-center md:justify-start gap-2">
                                <span className="text-blue-500 font-medium">Lun - Vie:</span> 8:00 AM - 5:00 PM
                            </li>
                            <li className="flex justify-center md:justify-start gap-2">
                                <span className="text-blue-500 font-medium">Sáb:</span> 9:00 AM - 1:00 PM
                            </li>
                            <li className="text-gray-500 italic mt-2 text-xs">Domingos cerrados</li>
                        </ul>
                    </div>

                    {/* Columna 4: Contacto */}
                    <div>
                        <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contacto</h2>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center justify-center md:justify-start gap-2 italic">
                                📍 Valencia, Venezuela
                            </li>
                            <li className="flex items-center justify-center md:justify-start gap-2 font-medium text-blue-400">
                                ✉️ distribuidorasupercarabobo@gmail.com
                            </li>
                            <li className="pt-2">
                                <Link href="/soporte" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all text-xs border border-gray-700">
                                    Centro de Ayuda
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Línea Divisoria */}
                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>© {currentYear} Royal Venezuela. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
                        <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}