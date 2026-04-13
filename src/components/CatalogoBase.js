'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Loader2, Search, FilterX, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CatalogoBase({ productos = [], isLoading, showPrivateData = false }) {

  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const categorias = [
    { id: 'todos', label: 'Todos' },
    { id: 'atf', label: 'ATF' },
    { id: 'diesel', label: 'Diesel' },
    { id: 'frenos', label: 'Frenos' },
    { id: 'refrigerantes', label: 'refrigerantes' },
    { id: 'fuera borda', label: 'Fuera Borda' },
    { id: 'gasolina', label: 'Gasolina' },
    { id: 'grasa', label: 'Grasas' },
    { id: 'hidraulico', label: 'Hidraulico'},
    { id: 'motocicleta', label: 'Moto' },  
    { id: 'valvulina', label: 'Valvulina' }
  ];

  const filteredProductos = useMemo(() => {
    if (!productos) return [];

    return productos.filter(p => {
      // Normalizamos para una búsqueda más precisa en lubricantes
      const nombre = p.nombre?.toLowerCase() || '';
      const desc = p.descripcion?.toLowerCase() || '';
      const cat = p.categoria?.toLowerCase() || '';
      const busqueda = searchTerm.toLowerCase();

      const matchCategory = activeCategory === 'todos' || cat === activeCategory;
      const matchSearch = nombre.includes(busqueda) || desc.includes(busqueda);

      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchTerm, productos]);

  if (isLoading) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-red-600" size={40} />
      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Sincronizando con Royal Super Oil...</p>
    </div>
  );

  return (
    <div className="bg-[#fcfcfc] min-h-screen">

      {/* Buscador*/}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por viscosidad o nombre (ej. 20W50, Diesel...)"
            className="w-full bg-white border border-gray-200 rounded-2xl py-5 pl-14 pr-8 text-gray-900 focus:border-red-600 outline-none transition-all shadow-sm font-bold text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 py-8">

        {/* Chips de Categoría */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all
                ${activeCategory === cat.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-white text-gray-900 border border-gray-100 hover:bg-gray-50'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredProductos.length > 0 ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProductos.map((producto) => (

              <div key={producto.id} className="group bg-white rounded-[1.5rem] p-4 border border-secundary shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">

                {/* Visualización del Producto */}
                <div className="relative h-64 w-full bg-gray-50  overflow-hidden p-4 rounded-t-[2rem]">
                  <Image
                    src={producto.foto_producto_url || '/placeholder-oil.png'}
                    alt={producto.nombre}
                    fill
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Etiqueta de Stock (Solo Vendedores) */}
                  {showPrivateData && (
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border backdrop-blur-md ${producto.stock > 0
                          ? 'bg-green-500/10 border-green-500/20 text-green-600'
                          : 'bg-red-500/10 border-red-500/20 text-red-600'
                        }`}>
                        {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[12px] font-black text-red-600 uppercase tracking-widest mb-1">
                    {producto.categoria}
                  </span>
                  <h3 className="text-[#0f0f0f] font-black text-[20px] leading-tight uppercase italic mb-2 line-clamp-2">
                    {producto.nombre}
                  </h3>

                  <p className="text-gray-800 text-[17px] leading-relaxed line-clamp-2 mb-6">
                    {producto.descripcion}
                  </p>

                  {/* Precios (Solo Vendedores) */}
                  {showPrivateData ? (
                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-end">
                      <div>
                        <p className="text-[7px] text-gray-400 font-black uppercase">Precio Contado</p>
                        <p className="text-lg font-black text-gray-900">${producto.precio_contado}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] text-gray-400 font-black uppercase">precio_credito</p>
                        <p className="text-md font-black text-blue-600">${producto.precio_credito}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto">
                      <Link href={'/login'}>
                        <button className="w-full py-3 bg-foreground text-black rounded-xl text-[15px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 group-hover:gap-3">
                          Consultar <ChevronRight size={18} />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <FilterX size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No hay coincidencias en el inventario</p>
          </div>
        )}
      </main>
    </div>
  );
}
