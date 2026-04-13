'use client'; // Necesario porque usaremos estados y efectos
import { useEffect, useState } from 'react';
import { ProductService } from '@/services/products';

// AQUÍ ESTÁ EL TRUCO: Debe decir "export default function"
export default function ProductoPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await ProductService.getAll(); // Usando la función que ya teníamos
        setProducts(data);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) return <div className="p-20 text-center">Cargando catálogo...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Catálogo de Productos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg shadow">
            <img 
              src={product.image_url || '/placeholder.png'} 
              alt={product.name} 
              className="w-full h-48 object-cover mb-4"
            />
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-blue-600 font-bold">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}