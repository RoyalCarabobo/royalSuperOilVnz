'use client'
import React from 'react';
import Image from 'next/image';
import { andRoyal, misionRoyal, blackLogo } from '@/assets/index'

const AdnRoyalPage = () => {
    const products = [
        { title: 'Línea Pesada (Diesel)', description: 'SAE 50, 60 y 70. Máxima protección contra el hollín y desgaste extremo.', icon: '🚛' },
        { title: 'Línea Automotriz (Gasolina)', description: '15W-40 y 20W-50. Ingeniería para optimización de combustible y limpieza activa.', icon: '🚗' },
        { title: 'Ligas de Freno', description: 'DOT 3 y DOT 4. Seguridad crítica con alto punto de ebullición.', icon: '🛑' },
        { title: 'Especialidades & Fluidos', description: 'Transmisión, Hidráulico y Refrigerantes de alto control térmico.', icon: '⚙️' },
        { title: 'Motos & Fuera de Borda', description: '2T, 4T y Náutico. Protección contra la corrosión y máxima aceleración.', icon: '🛵' },
    ];

    return (
        <div className="bg-white text-slate-900 font-sans overflow-hidden">

            {/* 1. TRAYECTORIA: Valencia en el ADN */}
            <section className="relative py-20 md:py-28 bg-gradient-to-b from-gray-100 to-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 z-10">
                            <h4 className="text-royal-gold font-bold uppercase tracking-[0.2em] mb-3 text-xs">Orgullo Carabobeño</h4>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 text-slate-900 leading-tight italic">
                                Nuestra Huella en la <br/> 
                                <span className="text-blue-600">Ciudad Industrial</span>
                            </h1>
                            <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-royal-gold pl-6 max-w-xl">
                                <span className="font-bold text-slate-900">Desde hace más de 2 años</span>, Royal Super echó raíces en la Zona Industrial de Valencia. Nacimos con una misión clara: ofrecer una alternativa de lubricación de clase mundial que soporte el rigor de las rutas venezolanas.
                            </p>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="relative p-3 bg-slate-900 rounded-[2rem] shadow-2xl transform md:rotate-3 hover:rotate-0 transition-all duration-700 ease-in-out group">
                                <Image
                                    src={andRoyal}
                                    alt='Huella Royal Valencia'
                                    className="rounded-[1.5rem] object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    width={700}
                                    height={450}
                                    priority
                                />
                                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl hidden md:block">
                                    <p className="text-3xl font-black italic">+2</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest">Años en Valencia</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. MISIÓN: Compromiso Técnico */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl md:text-5xl font-black mb-8 text-slate-900 italic uppercase tracking-tighter">
                                Misión: <span className="text-blue-600">Potencia</span> en Movimiento
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed mb-10 font-medium">
                                "Garantizar la continuidad del movimiento en Venezuela, suministrando tecnología emiratí que supere las exigencias de nuestras carreteras. Protegemos el patrimonio de cada conductor."
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-blue-600 transition-colors cursor-default">
                                    <span className="material-symbols-outlined text-royal-gold">local_shipping</span>
                                    <span className="text-xs font-black uppercase italic tracking-widest">Despacho Inmediato</span>
                                </div>
                                <div className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl shadow-lg hover:border-blue-600 transition-colors cursor-default">
                                    <span className="material-symbols-outlined text-blue-600">support_agent</span>
                                    <span className="text-xs font-black uppercase italic tracking-widest">Soporte Directo</span>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <div className="relative p-2 bg-gray-100 rounded-[2.5rem] shadow-inner overflow-hidden group">
                                <Image
                                    src={misionRoyal}
                                    alt='Mision Royal Super'
                                    className="rounded-[2.2rem] transform group-hover:scale-105 transition-transform duration-1000"
                                    width={700}
                                    height={450}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. VISIÓN: El Sello de Confianza (LOGO SECTION) */}
            <section className="py-24 bg-slate-900 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2 text-white">
                            <h2 className="text-3xl md:text-5xl font-black mb-8 italic uppercase tracking-tighter">
                                Visión: El <span className="text-blue-500">Estándar</span> Global
                            </h2>
                            <p className="text-xl text-slate-300 leading-relaxed mb-8">
                                Proyectamos a Royal Super como la marca de referencia indiscutible en Venezuela, transformando la excelencia de los Emiratos Árabes en la tranquilidad diaria del conductor.
                            </p>
                            <blockquote className="border-l-4 border-blue-500 pl-6 py-2">
                                <p className="text-2xl font-black italic text-white uppercase tracking-tight">
                                    "Cada gota es rendimiento imparable."
                                </p>
                            </blockquote>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <div className="relative p-8 bg-white rounded-[3rem] shadow-[0_0_50px_rgba(37,99,235,0.3)] transform md:-rotate-3 hover:rotate-0 transition-all duration-500 ease-out group">
                                <Image
                                    src={blackLogo}
                                    alt='Logo Royal Super Oficial'
                                    className="rounded-2xl brightness-110 group-hover:scale-105 transition-transform"
                                    width={500}
                                    height={300}
                                />
                                <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 rounded-[3rem] pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Elementos decorativos de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full"></div>
            </section>

            {/* 4. INGENIERÍA: Portafolio */}
            <section className="py-28 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 text-slate-900 uppercase italic tracking-tighter">
                        Ingeniería <span className="text-blue-600 text-stroke">Maestra</span>
                    </h2>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-sm mb-20">Catálogo de Alto Desempeño</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.map((product, index) => (
                            <div key={index} className="group relative bg-gray-50 p-12 rounded-[2.5rem] border border-gray-100 hover:border-blue-600/30 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors"></div>
                                <div className="text-6xl mb-8 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">{product.icon}</div>
                                <h3 className="text-2xl font-black mb-4 text-slate-900 uppercase italic">{product.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium text-sm">{product.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdnRoyalPage;