'use client'
import CatalogoBase from '@/components/CatalogoBase';
import { useProducts } from '@/hooks/useProducts';

export default function PublicPage() {
  const { productos, isLoading } = useProducts();

  return (
    <div>
       {/* Hero Publicitario */}
       <div className="bg-[#0f0f0f] py-20 text-center border-b-4 border-red-600">
         <h1 className="text-white text-3xl font-black italic uppercase">Catálogo Distribuidora <span className="text-foreground">Super Carabobo</span></h1>
       </div>
       
       <CatalogoBase 
         productos={productos} 
         isLoading={isLoading} 
         showPrivateData={false} 
       />
    </div>
  );
}