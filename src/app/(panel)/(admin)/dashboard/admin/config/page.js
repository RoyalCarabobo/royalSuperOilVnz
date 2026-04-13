'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Importa tu cliente de supabase (ajusta la ruta según tu proyecto)
import { supabase } from '@/lib/supabase';
// Imports de constantes
import { metodosPago as initialMethods } from '@/constants/paymentMethods';
import { zonaVentas as initialZonas } from '@/constants/zonasVentas';
import { tasaDias as initialTasa } from '@/constants/tasaDias';

export default function ConfigPage() {
  // --- ESTADOS GENERALES ---
  const [activeTab, setActiveTab] = useState('pagos');

  // --- ESTADOS: VENDEDORES (Desde DB) ---
  const [vendedores, setVendedores] = useState([]);

  // --- ESTADOS: MÉTODOS DE PAGO ---
  const [methods, setMethods] = useState(initialMethods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  // --- ESTADOS: ZONAS DE VENTAS ---
  const [zonas, setZonas] = useState(initialZonas);
  const [isZonaModalOpen, setIsZonaModalOpen] = useState(false);
  const [editingZona, setEditingZona] = useState(null);

  // --- ESTADOS: TASA DEL DÍA ---
  const [tasaActual, setTasaActual] = useState(initialTasa);
  const [tempTasa, setTempTasa] = useState(initialTasa);

  // --- CARGAR VENDEDORES AL INICIAR ---
  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre_completo, rol')
          .eq('rol', 'vendedor') // Filtramos solo los que son vendedores
          .order('nombre_completo', { ascending: true });

        if (error) throw error;
        setVendedores(data || []);
      } catch (error) {
        console.error('Error cargando vendedores:', error.message);
      }
    };

    fetchVendedores();
  }, []);

  // --- LÓGICA: MÉTODOS DE PAGO ---
  const handleDeleteMethod = (id) => {
    if (confirm('¿Eliminar este método de pago?')) {
      setMethods(methods.filter(m => m.id !== id));
    }
  };

  const handleSaveMethod = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tipo = formData.get('tipo');
    const newMethod = {
      id: editingMethod ? editingMethod.id : Date.now(),
      banco: formData.get('banco'),
      tipo: tipo,
      moneda: formData.get('moneda'),
      detalles: {
        titular: formData.get('titular'),
        rif: formData.get('rif'),
        ...(tipo === 'Pago Móvil' && { telefono: formData.get('dato') }),
        ...(tipo === 'Zelle' && { correo: formData.get('dato') }),
        ...(tipo === 'Transferencia' && { cuenta: formData.get('dato') }),
      }
    };
    if (editingMethod) {
      setMethods(methods.map(m => m.id === editingMethod.id ? newMethod : m));
    } else {
      setMethods([...methods, newMethod]);
    }
    setIsModalOpen(false);
  };

  // --- LÓGICA: ZONAS DE VENTAS ---
  const handleSaveZona = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newZona = {
      id: editingZona ? editingZona.id : Date.now(),
      nombre: formData.get('nombre'),
      sector: formData.get('sector'),
      vendedor: formData.get('vendedor')
    };
    if (editingZona) {
      setZonas(zonas.map(z => z.id === editingZona.id ? newZona : z));
    } else {
      setZonas([...zonas, newZona]);
    }
    setIsZonaModalOpen(false);
  };

  const deleteZona = (id) => {
    if (confirm('¿Eliminar esta zona de ventas?')) {
      setZonas(zonas.filter(z => z.id !== id));
    }
  };

  // --- LÓGICA: TASA DEL DÍA ---
  const updateTasa = () => {
    setTasaActual(tempTasa);
    alert(`Tasa actualizada a: ${tempTasa} VES`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#111111] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-900/40">
              <span className="material-symbols-outlined text-white text-sm">settings</span>
            </div>
            <h2 className="text-lg font-black tracking-tighter uppercase italic">
              Royal<span className="text-red-600">Super</span> Config
            </h2>
          </div>
          <Link href="/dashboard/admin" className="text-xs font-bold uppercase hover:text-red-500 transition-colors">
            Volver al Panel
          </Link>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto py-8 px-4 lg:px-10">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-[#111111] p-1 rounded-xl border border-gray-800 shadow-xl">
          {['pagos', 'zonas', 'tasa'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase italic transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' : 'hover:bg-gray-800 text-gray-500'}`}
            >
              <span className="material-symbols-outlined text-sm">
                {tab === 'pagos' ? 'payments' : tab === 'zonas' ? 'map' : 'currency_exchange'}
              </span>
              {tab.replace('pagos', 'Métodos de Pago').replace('zonas', 'Zonas').replace('tasa', 'Tasa')}
            </button>
          ))}
        </div>

        {/* --- CONTENIDO DINÁMICO --- */}
        <div className="min-h-[400px]">

          {/* SECCIÓN: PAGOS */}
          {activeTab === 'pagos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase italic">Métodos de Pago</h3>
                  <p className="text-gray-500 text-sm italic font-bold">Gestión de cuentas bancarias y divisas.</p>
                </div>
                <button onClick={() => { setEditingMethod(null); setIsModalOpen(true); }} className="bg-white text-black px-4 py-2 rounded font-black text-[10px] uppercase italic hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm font-black">add</span> Agregar Nuevo
                </button>
              </div>
              <div className="grid gap-4">
                {methods.map((metodo) => (
                  <div key={metodo.id} className="p-4 bg-[#111111] border border-gray-800 rounded-xl flex justify-between items-center group hover:border-gray-600 transition-all">
                    <div className="flex items-center gap-4 text-left">
                      <div className="size-10 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800 group-hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">{metodo.moneda === 'USD' ? 'monetization_on' : 'account_balance'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold uppercase text-sm italic">{metodo.tipo} - {metodo.banco}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black ${metodo.moneda === 'Bs' ? 'border-blue-500 text-blue-500' : 'border-green-500 text-green-500'}`}>{metodo.moneda}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono italic">{metodo.detalles.cuenta || metodo.detalles.telefono || metodo.detalles.correo}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingMethod(metodo); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDeleteMethod(metodo.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN: ZONAS */}
          {activeTab === 'zonas' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase italic">Zonas de Ventas</h3>
                  <p className="text-gray-500 text-sm italic font-bold">Distribución territorial y asignación de vendedores.</p>
                </div>
                <button onClick={() => { setEditingZona(null); setIsZonaModalOpen(true); }} className="bg-white text-black px-4 py-2 rounded font-black text-[10px] uppercase italic hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm font-black">add_location</span> Nueva Zona
                </button>
              </div>

              {zonas.length === 0 ? (
                <div className="bg-[#111111] border border-gray-800 rounded-2xl p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-800 mb-4 font-light">map_search</span>
                  <p className="text-gray-400 text-xs italic font-bold uppercase">No has registrado zonas todavía</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zonas.map(z => (
                    <div key={z.id} className="p-5 bg-[#111111] border border-gray-800 rounded-2xl flex justify-between items-center group hover:border-red-600/30 transition-all">
                      <div className="flex items-center gap-4 text-left">
                        <div className="size-12 rounded bg-red-600/10 flex items-center justify-center text-red-600 border border-red-600/20 shadow-inner">
                          <span className="material-symbols-outlined">distance</span>
                        </div>
                        <div>
                          <h4 className="font-black text-sm uppercase italic tracking-tighter">{z.nombre}</h4>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{z.sector}</p>
                          <div className="flex items-center gap-1.5 bg-blue-600/10 border border-blue-600/20 px-2 py-0.5 rounded-md w-fit">
                            <span className="material-symbols-outlined text-[12px] text-blue-500 font-black">person_tag</span>
                            <span className="text-[9px] font-black uppercase text-blue-400 italic">Vendedor: {z.vendedor || 'Sin Asignar'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingZona(z); setIsZonaModalOpen(true); }} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => deleteZona(z.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/10 rounded-lg transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN: TASA */}
          {activeTab === 'tasa' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-black uppercase italic mb-1">Tasa de Cambio</h3>
              <p className="text-gray-500 text-sm italic font-bold mb-6">Valor actual para cálculos de facturación.</p>
              <div className="max-w-md bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-7xl">trending_up</span>
                </div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-4 tracking-[0.2em]">Tasa BCV (Bs. / USD)</label>
                <div className="space-y-6 relative text-left">
                  <div className="text-5xl font-black italic text-red-600 tracking-tighter mb-4">
                    {tasaActual} <span className="text-xs text-gray-600 not-italic uppercase tracking-widest font-black">VES</span>
                  </div>
                  <input
                    type="number"
                    value={tempTasa}
                    onChange={(e) => setTempTasa(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl px-5 py-4 text-2xl font-mono focus:border-red-600 outline-none transition-all"
                  />
                  <button onClick={updateTasa} className="w-full bg-red-600 py-4 rounded-xl font-black uppercase italic text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/40 active:scale-95">
                    Actualizar Tasa Ahora
                  </button>
                </div>
                <p className="mt-6 text-[10px] text-gray-600 italic uppercase font-bold text-center border-t border-gray-800 pt-4">Última actualización: Hoy, 12:30 PM</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: MÉTODOS DE PAGO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
              <h3 className="font-black uppercase italic text-lg">{editingMethod ? 'Editar Método' : 'Nuevo Método'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSaveMethod} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Banco</label>
                  <input name="banco" placeholder="Ej: Banesco" defaultValue={editingMethod?.banco} className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-red-600 outline-none uppercase font-bold" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Moneda</label>
                  <select name="moneda" defaultValue={editingMethod?.moneda || 'Bs'} className="w-full bg-black border border-gray-800 rounded p-3 text-sm outline-none font-bold">
                    <option value="Bs">VES (Bs)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Tipo de Instrumento</label>
                <select name="tipo" defaultValue={editingMethod?.tipo || 'Pago Móvil'} className="w-full bg-black border border-gray-800 rounded p-3 text-sm outline-none font-bold">
                  <option value="Transferencia">Transferencia</option>
                  <option value="Pago Móvil">Pago Móvil</option>
                  <option value="Zelle">Zelle</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Datos de Pago</label>
                <input name="dato" placeholder="Cuenta / Teléfono / Correo" defaultValue={editingMethod?.detalles.cuenta || editingMethod?.detalles.telefono || editingMethod?.detalles.correo} className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-red-600 outline-none font-mono" required />
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">RIF / ID</label>
                  <input name="rif" placeholder="J-00000000-0" defaultValue={editingMethod?.detalles.rif} className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-red-600 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Titular</label>
                  <input name="titular" placeholder="Nombre Completo" defaultValue={editingMethod?.detalles.titular} className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-red-600 outline-none uppercase font-bold" required />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-red-600 rounded-lg font-black text-xs uppercase italic hover:bg-red-700 transition-all">Guardar Método de Pago</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ZONAS ACTUALIZADO CON SELECT DE VENDEDORES */}
      {isZonaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
              <h3 className="font-black uppercase italic text-lg">{editingZona ? 'Editar Zona' : 'Añadir Zona'}</h3>
              <button onClick={() => setIsZonaModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSaveZona} className="p-6 space-y-5 text-left">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 italic tracking-widest">Nombre de la Zona</label>
                <input name="nombre" placeholder="Ej: San Diego" defaultValue={editingZona?.nombre} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm focus:border-red-600 outline-none uppercase font-black italic tracking-tighter" required />
              </div>

              <div>
                <label className="block text-[10px] font-black text-blue-500 uppercase mb-2 italic tracking-widest">Seleccionar Vendedor</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">badge</span>
                  <select
                    name="vendedor"
                    defaultValue={editingZona?.vendedor || ""}
                    className="w-full bg-black border border-gray-800 rounded-xl p-4 pl-12 text-sm focus:border-blue-600 outline-none uppercase font-bold text-white shadow-inner appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Seleccione un vendedor...</option>
                    {vendedores.map(v => (
                      <option key={v.id} value={v.nombre_completo}>
                        {v.nombre_completo.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 italic tracking-widest">Sectores / Municipios</label>
                <textarea name="sector" placeholder="Ej: Naguanagua" defaultValue={editingZona?.sector} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm focus:border-red-600 outline-none h-20 resize-none uppercase font-bold text-gray-400" required />
              </div>

              <button type="submit" className="w-full py-4 bg-red-600 rounded-xl font-black text-xs uppercase italic hover:bg-red-700 transition-all shadow-lg shadow-red-900/40">
                Confirmar y Asignar
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="py-10 border-t border-gray-900 mt-12 text-center">
        <p className="text-xs text-gray-600 font-bold tracking-widest uppercase italic">
          © 2026 ROYAL<span className="text-red-600">SUPER</span> VENEZUELA - PANEL DE CONTROL
        </p>
      </footer>
    </div>
  );
}