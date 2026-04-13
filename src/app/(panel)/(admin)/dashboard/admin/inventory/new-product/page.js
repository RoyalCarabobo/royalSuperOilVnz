'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductService } from '@/services/products';

export default function NuevoProductoPage() {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [form, setForm] = useState({
    name: '',
    descripcion: '',
    precio_contado: '',
    precio_credito: '',
    stock: '',
    categoria: '',
  });

  // Manejo de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await ProductService.create(form, imageFile);
      router.push('/dashboard/admin/inventory');
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-['Manrope']">

      {/* Header Estilo Dark Profecional */}
      <header className="border-b border-gray-800 bg-[#1a1a1a] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-blue-500">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-black uppercase tracking-tighter">
              Añadir <span className="text-blue-500">Producto</span>
            </h1>
          </div>

        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Columna Izquierda: Media Assets (Azul & Negro) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-yellow-300 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">image</span> Fotografía del Producto
              </h3>

              <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer group relative overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center p-6">
                    <span className="material-symbols-outlined text-5xl text-gray-600 group-hover:text-blue-500 transition-colors">add_a_photo</span>
                    <p className="mt-4 text-sm font-bold text-gray-500 group-hover:text-gray-300">Cargar imagen principal</p>
                    <p className="text-[10px] text-gray-600 mt-1 uppercase">Soporta PNG, JPG (Max 5MB)</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>

              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                <span className="material-symbols-outlined text-blue-500">lightbulb</span>
                <p className="text-[11px] text-gray-400 leading-tight">
                  <b className="text-blue-400">Tip Pro:</b> Use un fondo blanco y buena iluminación.
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-xl space-y-6">

              {/* Sección Información */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-yellow-300 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-m">description</span> Datos Generales
                </h3>

                <div className="grid grid-cols-1 gap-4">

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nombre del Producto</label>
                    <input
                      required
                      className="w-full bg-[#0f0f0f] border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all outline-none"
                      placeholder="Ej: 20W50 Mineral 1L"
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />

                    {/* Descripción */}
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Descripción Detallada</label>
                        <span className="text-[9px] text-gray-600 uppercase font-bold">{form.descripcion.length} / 700</span>
                      </div>
                      <textarea
                        required
                        rows="4"
                        maxLength="700"
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                        placeholder="Indique viscosidad, beneficios, normativas API y aplicaciones..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      />

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Categoría</label>
                        <select
                          className="w-full bg-[#0f0f0f] border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-red-600 outline-none"
                          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="atf">ATF</option>
                          <option value="diesel">Diesel</option>
                          <option value="frenos">Frenos</option>
                          <option value="refrigerantes">Refrigerantes</option>
                          <option value="fuera borda">Fuera Borda</option>
                          <option value="gasolina">Gasolina</option>
                          <option value="grasa">Grasas</option>
                          <option value="hidraulico">Hidraulico</option>
                          <option value="motocicleta">Motocicleta</option>
                          <option value="valvulina">Valvulina</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección Precios */}
                <div className="pt-6 border-t border-gray-800 space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-blue-500 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">payments</span> Precio e Inventario
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Precio Contado (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          required
                          type="number"
                          step="0.01"
                          className="w-full bg-[#0f0f0f] border-gray-800 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                          placeholder="0.00"
                          onChange={(e) => setForm({ ...form, precio_contado: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Precio Credito (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          required
                          type="number"
                          step="0.01"
                          className="w-full bg-[#0f0f0f] border-gray-800 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500"
                          placeholder="0.00"
                          onChange={(e) => setForm({ ...form, precio_credito: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Stock Inicial</label>
                      <input
                        required
                        type="number"
                        className="w-full bg-[#0f0f0f] border-gray-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                        placeholder="0"
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Acciones Finales */}
                <div className="pt-8 flex flex-col md:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-800 disabled:bg-gray-700 text-white font-black py-4 rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">publish</span>
                    {loading ? 'Subiendo...' : 'PUBLICAR PRODUCTO'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
