import Link from 'next/link';
import Navbar from "@/components/Navbar";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* El Navbar siempre estará arriba */}
      <Navbar />
      
      {/* Contenido dinámico de cada página */}
      <div className="pb-20 lg:pb-0"> 
        {/* pb-20 es para que el contenido no quede tapado 
            por la barra inferior en móviles */}
        {children}
      </div>
    </div>
  );
}