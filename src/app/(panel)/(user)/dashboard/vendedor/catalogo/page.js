'use client';
import CatalogoBase from '@/components/CatalogoBase';
import { useProducts } from '@/hooks/useProducts';

export default function UserCatalogoPage() {

  const { productos, isLoading, isError } = useProducts();

  if (isError) return (
    <div className="p-10 text-center text-red-500 font-bold uppercase">
      Error al conectar con la base de datos de Royal Super Oil
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase">Catalogo Productos</h1>
        <p className="text-gray-500 text-xs font-bold">Consulta precios y existencias</p>
      </div>

      <CatalogoBase
        productos={productos}
        isLoading={isLoading}
        showPrivateData={true}
      />
    </div>
  );
}