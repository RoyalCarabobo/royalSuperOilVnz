'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Buttom from "./Buttom.js";
import Link from "next/link.js";

export default function Carrusel() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const supabase = createClient();

    useEffect(() => {
        async function fetchLatestProducts() {
            try {
                const { data, error } = await supabase
                    .from('productos')
                    .select('*')
                    .order('creado_en', { ascending: false })
                    .limit(5);

                if (error) throw error;
                setProducts(data || []);
            } catch (error) {
                console.log("error cargando carrusel:", error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchLatestProducts();
    }, [])

    const handleNext = () => setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    const handlePrevious = () => setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));

    useEffect(() => {
        if (products.length === 0) return;
        const interval = setInterval(handleNext, 5000);
        return () => clearInterval(interval);
    }, [currentIndex, products]);

    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) handleNext();
        if (distance < -50) handlePrevious();
    };

    if (loading) return (
        <div className="w-full h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-100">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={30} />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Cargando Stock...</p>
        </div>
    );

    if (products.length === 0) return null;

    return (
        <div className="relative w-full max-w-6xl mx-auto px-4 group">
            <div
                className="relative bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Altura ajustada: h-[450px] para que sea compacto */}
                <div className="relative h-[480px] md:h-[400px] w-full overflow-hidden">
                    <div
                        className="w-full h-full flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {products.map((item, index) => (
                            <div key={item.id} className="min-w-full h-full flex flex-col md:flex-row items-center px-6 md:px-16">

                                {/* LADO TEXTO */}
                                <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left order-2 md:order-1 pt-6 md:pt-0">
                                    <span className="text-blue-600 font-black text-[15px] uppercase tracking-[0.4em] mb-2">
                                        Novedad Royal Super
                                    </span>
                                    <h2 className="font-black text-slate-900 text-3xl md:text-5xl mb-3 uppercase italic tracking-tighter leading-tight">
                                        {item.nombre}
                                    </h2>
                                    <p className="text-slate-700 text-sm md:text-base mb-6 line-clamp-2 max-w-sm mx-auto md:mx-0">
                                        {item.descripcion}
                                    </p>
                                    <Link href="/catalogo">
                                        <div className="flex justify-center md:justify-start">
                                            <Buttom label="Ver Detalles" />
                                        </div>
                                    </Link>
                                </div>

                                {/* LADO IMAGEN - Optimizada para resaltar el envase */}
                                <div className="w-full md:w-1/2 h-[220px] md:h-full relative order-1 md:order-2 flex items-center justify-center">
                                    <div className="relative w-full h-[85%] transition-transform duration-500 hover:scale-105">
                                        <Image
                                            src={item.foto_producto_url || "/placeholder-oil.png"}
                                            alt={item.nombre}
                                            fill
                                            className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] mix-blend-multiply"
                                            priority={index === 0}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flechas integradas en el borde para que se vean más modernas */}
                <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-900 hover:bg-blue-600 hover:text-white transition-all hidden md:block"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-900 hover:bg-blue-600 hover:text-white transition-all hidden md:block"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Indicadores (Dots) ajustados */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
                {products.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 
                        ${currentIndex === index ? 'bg-blue-600 w-8' : 'bg-slate-200 w-2'}`}
                    />
                ))}
            </div>
        </div>
    );
}
