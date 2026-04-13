'use client';
import { useState, useEffect } from 'react';
import { ProductService } from '@/services/products';

export default function EditProductModal({ product, isOpen, onClose, onUpdate }) {
    // Sincronizamos con los nombres de las columnas en español de la BD
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio_contado: '',
        precio_credito: '',
        stock: '',
        foto_producto_url: '', 
        categoria: '',
    });
    
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre, // Cambiado de 'name'
                descripcion: product.descripcion || '',
                precio_contado: product.precio_contado,
                precio_credito: product.precio_credito,
                stock: product.stock || 0,
                foto_producto_url: product.foto_producto_url,
                categoria: product.categoria
            });
            setPreview(product.foto_producto_url);
        }
    }, [product]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // El servicio ya se encarga de parsear y subir la imagen
            const result = await ProductService.update(product.id, formData, imageFile);

            if (result) {
                onUpdate(); // Refresca la tabla de inventario
                onClose();  // Cierra el modal
            }
        } catch (error) {
            console.error("Error al actualizar producto:", error.message);
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] text-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-gray-800">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#222]">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">
                        Editar <span className="text-blue-500">Producto</span>
                    </h2>
                    <button onClick={onClose} className="p-2 bg-[#0f0f0f] rounded-full text-gray-500 hover:text-white transition">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    
                    {/* Media Selector */}
                    <div className="flex gap-5 items-center p-4 bg-[#0f0f0f] rounded-2xl border border-gray-800">
                        <div className="relative size-24 shrink-0 rounded-xl overflow-hidden border border-gray-700">
                            <img src={preview || '/placeholder-oil.jpg'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Cambiar Imagen</label>
                            <input 
                                type="file" 
                                onChange={handleImageChange} 
                                className="text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-bold hover:file:bg-blue-700 cursor-pointer" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Nombre */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nombre Comercial</label>
                            <input 
                                type="text" 
                                className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 focus:border-blue-500 outline-none text-sm transition-all"
                                value={formData.nombre} 
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                                required 
                            />
                        </div>

                        {/* Descripción */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Descripción Técnica</label>
                            <textarea 
                                rows="2" 
                                className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 focus:border-blue-500 outline-none text-sm resize-none transition-all"
                                value={formData.descripcion} 
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                            />
                        </div>

                        {/* Precios y Stock */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">P. Contado</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 focus:border-blue-500 outline-none text-sm font-bold"
                                    value={formData.precio_contado} 
                                    onChange={(e) => setFormData({ ...formData, precio_contado: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">P. Crédito</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 focus:border-blue-500 outline-none text-sm font-bold"
                                    value={formData.precio_credito} 
                                    onChange={(e) => setFormData({ ...formData, precio_credito: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Existencia</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 focus:border-blue-500 outline-none text-sm font-bold text-blue-400"
                                    value={formData.stock} 
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Categoría */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Categoría</label>
                            <select
                                className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 focus:border-blue-500 outline-none text-sm appearance-none"
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            >
                              <option value="atf">ATF</option>
                              <option value="diesel">Diesel</option>
                              <option value="frenos">Frenos</option>
                              <option value="refrigerantes">Refrigerantes</option>
                              <option value="fuera borda">Fuera Borda</option>
                              <option value="gasolina">Gasolina</option>
                              <option value="hidraulico">Hidraulico</option>
                              <option value="motocicleta">Motocicleta</option>
                              <option value="valvulina">Valvulina</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-blue-600 text-white font-black uppercase py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Sincronizando con la nube...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
