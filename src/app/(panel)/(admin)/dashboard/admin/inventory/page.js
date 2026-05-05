'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import EditProductModal from '@/components/modal/EditProductModal';

export default function InventarioPage() {
    const [productos, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const fetchProducts = useCallback(async () => {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('creado_en', { ascending: true });

        if (error) console.error("Error cargando productos:", error);
        else setProducts(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {

        fetchProducts();

        // realtime
        const channel = supabase
        .channel('real-time-inventory') // nombre del canal
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'productos' },
            (payload) => {
                console.log('Cambio detectado en productos:', payload);
                fetchProducts(); // refresca la lista de productos al detectar cambios
            }
        )
        .subscribe();
        // Limpieza al desmontar el componente
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProducts   ]);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-10 text-center animate-bounce text-primary font-bold">Cargando Inventario Royal Super...</div>;

    return (
        <main className="flex-1 px-4 md:px-10 py-8 bg-[#f8f5f5] min-h-screen">
            {/* Encabezado Dinámico */}
            <div className="flex flex-wrap justify-between items-center mb-8">
                <div>
                    <h1 className="text-[#1c0d0d] text-3xl font-black">Inventario de Productos</h1>
                    <p className="text-[#9c4949] text-sm">Gestiona tus existencias y precios en USD/VES</p>
                </div>
                <Link href="/dashboard/admin/inventory/new-product" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                    + Nuevo Producto
                </Link>
            </div>

            {/* Tabla Adaptada a tus columnas */}
            <div className="bg-white rounded-xl border border-[#e8cece] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-[#e8cece]">
                                <th className="px-6 py-4 text-xs font-black uppercase text-[#9c4949]">Imagen</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-[#9c4949]">Detalles</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-[#9c4949]">Precio Contado</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-[#9c4949]">Precio Credito</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-[#9c4949]">Stock</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-[#9c4949] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8cece]">
                            {productos.map((p) => (
                                <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <img
                                            src={p.foto_producto_url || 'https://via.placeholder.com/80'}
                                            alt={p.nombre}
                                            className="size-14 rounded-lg object-cover border border-[#e8cece]"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#1c0d0d]">{p.nombre}</span>
                                            <span className="text-xs text-[#9c4949] truncate max-w-[200px]">{p.descripcion}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">${Number(p.precio_contado).toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">
                                                ${Number(p.precio_credito || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Si no tienes columna stock, mostramos un indicador por defecto */}
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${(p.stock || 0) > 5 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {p.stock ?? 0} unidades
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3 text-[#9c4949]">
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="hover:text-primary transition-transform active:scale-90"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button className="hover:text-primary"><span className="material-symbols-outlined">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <EditProductModal
                product={editingProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchProducts} // Pasamos la función de carga para asegurar sincronía manual también
            />
        </main>
    );
}