'use client';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, icon: Icon }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-[#141414] border border-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                
                {/* Botón Cerrar Superior */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Encabezado */}
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    {Icon && <Icon size={24} />}
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">
                        {title}
                    </h2>
                </div>
                
                {/* Contenido Dinámico */}
                <div className="mt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}