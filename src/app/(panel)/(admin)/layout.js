import AdminNav from '@/components/AdminNav';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* El Navbar siempre estará arriba */}
      <AdminNav />
      
      {/* Contenido dinámico de cada página */}
      <main className="pb-20 lg:pb-0"> 
        {/* pb-20 es para que el contenido no quede tapado 
            por la barra inferior en móviles */}
        {children}
      </main>
    </div>
  );
}