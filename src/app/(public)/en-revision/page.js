'use client';
import React from 'react';
import Link from 'next/link';

export default function EnRevision() {
  return (
    <div className="bg-backgroundSecundary min-h-screen flex flex-col font-display transition-colors duration-300">

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">

        <div className="max-w-[840px] w-full bg-white  border border-gray-800  shadow-xl rounded-xl overflow-hidden">
          
          {/* Header Image Area */}
          <div className="w-full bg-primary/5 dark:bg-primary/10 py-12 flex justify-center items-center relative overflow-hidden">
          
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full filter blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-[80px] translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="relative z-10 w-full max-w-[400px] flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 dark:border-white/10">
                <span className="material-symbols-outlined text-primary text-6xl">fact_check</span>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-primary/20 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-primary/40 rounded-full animate-pulse delay-75"></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Content Area */}
          <div className="p-8 lg:p-12 text-center">
            <h1 className="text-primary text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 uppercase">Perfil en Revisión</h1>
            <p className="text-black text-lg max-w-xl mx-auto leading-relaxed mb-10">
              Estamos validando tu RIF y los datos de tu empresa. Este proceso suele tomar entre <strong className='text-foreground'>24 y 48 horas hábiles</strong>. Te notificaremos por correo una vez finalizado.
            </p>

            {/* Horizontal Timeline */}
            <div className="max-w-2xl mx-auto mb-16 px-4">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-white/10 rounded-full z-0"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[75%] h-1 bg-primary/40 rounded-full z-0"></div>
                
                {/* Steps */}
                {[
                  { label: 'Cuenta Creada', status: 'Completado', icon: 'check', active: true },
                  { label: 'Datos Enviados', status: 'Completado', icon: 'check', active: true },
                  { label: 'Verificación', status: 'En curso', icon: 'hourglass_empty', active: false, current: true }
                ].map((step, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                      step.active 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-gray-800 border-2 border-primary text-primary animate-pulse'
                    }`}>
                      <span className="material-symbols-outlined text-sm font-bold">{step.icon}</span>
                    </div>
                    <div className="absolute top-12 whitespace-nowrap">
                      <p className={`text-sm font-bold ${step.current ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{step.label}</p>
                      <p className={`text-xs font-medium ${step.active ? 'text-green-600 text-[15px]' : 'text-primary/70'}`}>{step.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-20">
              <Link href="/catalogo" className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-primary/20 text-primary font-bold text-base hover:bg-primary/5 transition-all group">
                <span className="material-symbols-outlined mr-2 transition-transform group-hover:-translate-x-1">shopping_bag</span>
                Visitar Catálogo
              </Link>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Puedes explorar nuestros productos mientras esperas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Support Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 group">
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-xl border border-gray-100 dark:border-white/10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          <p className="text-sm font-bold text-gray-800 dark:text-white">¿Necesitas ayuda?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Soporte por WhatsApp</p>
        </div>
        <a 
          href="https://wa.me/tu_numero" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      </div>

      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© 2024 CheryPoint. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}