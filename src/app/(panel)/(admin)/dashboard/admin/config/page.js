'use client'
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';



export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState('pagos');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE DATOS ---
  const [vendedores, setVendedores] = useState([]);
  const [methods, setMethods] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [tasaActual, setTasaActual] = useState(0);
  const [tempTasa, setTempTasa] = useState(0);

  // --- ESTADOS DE MODALES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [isZonaModalOpen, setIsZonaModalOpen] = useState(false);
  const [editingZona, setEditingZona] = useState(null);

  // --- CARGA DE DATOS (FETCH) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Cargar Vendedores
      const { data: v } = await supabase.from('usuarios').select('id, nombre_completo').eq('rol', 'vendedor');
      setVendedores(v || []);

      // 2. Cargar Métodos de Pago
      const { data: m } = await supabase.from('configuracion_pagos').select('*').order('created_at', { ascending: false });
      setMethods(m || []);

      // 3. Cargar Zonas
      const { data: z } = await supabase.from('zonas_ventas').select('*').order('nombre', { ascending: true });
      setZonas(z || []);

      // 4. Cargar Tasa Actual
      const { data: t } = await supabase.from('configuracion_tasa').select('valor').order('fecha', { ascending: false }).limit(1).single();
      if (t) {
        setTasaActual(t.valor);
        setTempTasa(t.valor);
      }
    } catch (err) {
      console.error("Error cargando configuración:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- LÓGICA: MÉTODOS DE PAGO ---
  const handleSaveMethod = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const methodData = {
      banco: formData.get('banco'),
      tipo: formData.get('tipo'),
      moneda: formData.get('moneda'),
      detalles: {
        titular: formData.get('titular'),
        rif: formData.get('rif'),
        dato: formData.get('dato')
      }
    };

    const { error } = editingMethod
      ? await supabase.from('configuracion_pagos').update(methodData).eq('id', editingMethod.id)
      : await supabase.from('configuracion_pagos').insert([methodData]);

    if (!error) {
      setIsModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteMethod = async (id) => {
    if (confirm('¿Eliminar este método?')) {
      await supabase.from('configuracion_pagos').delete().eq('id', id);
      fetchData();
    }
  };

  // --- LÓGICA: ZONAS DE VENTAS ---
  const handleSaveZona = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Obtenemos el nombre directamente del select
    const nombreVendedor = formData.get('vendedor_nombre');

    const zonaData = {
      nombre: formData.get('nombre').toUpperCase(),
      sector: formData.get('sector'),
      vendedor_nombre: nombreVendedor
    };

    const { error } = editingZona
      ? await supabase.from('zonas_ventas').update(zonaData).eq('id', editingZona.id)
      : await supabase.from('zonas_ventas').insert([zonaData]);

    if (error) {
      console.error("Error al guardar:", error.message);
      alert("Error: " + error.message);
    } else {
      setIsZonaModalOpen(false);
      fetchData(); // Recargar la lista
    }
  };

  const deleteZona = async (id) => {
    // Eliminamos las líneas de FormData que estaban aquí por error
    if (confirm('¿Eliminar esta zona?')) {
      const { error } = await supabase.from('zonas_ventas').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  // --- LÓGICA: TASA DEL DÍA ---
  const updateTasa = async () => {
    const { error } = await supabase.from('configuracion_tasa').insert([{ valor: parseFloat(tempTasa) }]);
    if (!error) {
      setTasaActual(tempTasa);
      alert("Tasa actualizada globalmente.");
    }
  };


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
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
          <Link href="/dashboard/admin" className="text-xs font-bold uppercase hover:text-red-500 transition-colors">Volver</Link>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto py-8 px-4 lg:px-10">
        {/* TABS SELECTOR */}
        <div className="flex flex-wrap gap-2 mb-8 bg-[#111111] p-1 rounded-xl border border-gray-800">
          {['pagos', 'zonas', 'tasa'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase italic transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-800'}`}
            >
              {tab === 'pagos' ? 'Métodos de Pago' : tab === 'zonas' ? 'Zonas' : 'Tasa del día'}
            </button>
          ))}
        </div>

        {/* CONTENIDO SEGÚN TAB */}
        <div className="min-h-[400px]">
          {activeTab === 'pagos' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-black uppercase italic">Pagos</h3>
                <button onClick={() => { setEditingMethod(null); setIsModalOpen(true); }} className="bg-white text-black px-4 py-2 rounded font-black text-[10px] uppercase italic">Agregar Nuevo</button>
              </div>
              <div className="grid gap-4">
                {methods.map((m) => (
                  <div key={m.id} className="p-4 bg-[#111111] border border-gray-800 rounded-xl flex justify-between items-center group">
                    <div className="text-left">
                      <p className="font-bold text-sm italic uppercase">{m.banco} ({m.moneda})</p>
                      <p className="text-xs text-gray-500">{m.detalles.dato || m.detalles.cuenta || m.detalles.correo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingMethod(m); setIsModalOpen(true); }} className="p-2 hover:text-blue-500"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDeleteMethod(m.id)} className="p-2 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'zonas' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-black uppercase italic">Zonas y Vendedores</h3>
                <button onClick={() => { setEditingZona(null); setIsZonaModalOpen(true); }} className="bg-white text-black px-4 py-2 rounded font-black text-[10px] uppercase italic">Nueva Zona</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {zonas.map(z => (
                  <div key={z.id} className="p-5 bg-[#111111] border border-gray-800 rounded-2xl flex justify-between items-center">
                    <div className="text-left">
                      <h4 className="font-black text-sm uppercase italic text-red-600">{z.nombre}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{z.sector}</p>
                      <p className="text-[9px] text-blue-400 font-black mt-2">VENDEDOR: {z.vendedor_nombre || 'POR ASIGNAR'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingZona(z); setIsZonaModalOpen(true); }} className="p-2 hover:bg-gray-800 rounded"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button onClick={() => deleteZona(z.id)} className="p-2 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasa' && (
            <div className="max-w-md bg-[#111111] p-8 rounded-2xl border border-gray-800 shadow-2xl mx-auto text-center">
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Tasa BCV Actual</label>
              <div className="text-5xl font-black italic text-red-600 mb-6">{tasaActual} <span className="text-xs text-gray-500">VES</span></div>
              <input type="number" value={tempTasa} onChange={(e) => setTempTasa(e.target.value)} className="w-full bg-black border border-gray-800 rounded-xl px-5 py-4 text-2xl font-mono text-center outline-none focus:border-red-600 mb-4" />
              <button onClick={updateTasa} className="w-full bg-red-600 py-4 rounded-xl font-black uppercase italic hover:bg-red-700 transition-all">Actualizar para toda la App</button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL ZONAS */}
      {isZonaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#111111] border border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-5">
            <h3 className="font-black uppercase italic text-lg">{editingZona ? 'Editar Zona' : 'Nueva Zona'}</h3>

            <form onSubmit={handleSaveZona} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase">Nombre (Ciudad/Eje)</label>
                <input name="nombre" defaultValue={editingZona?.nombre} placeholder="Ej: VALENCIA" className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm" required />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase">Vendedor Responsable</label>
                <select
                  name="vendedor_nombre" // Nombre exacto de la columna
                  defaultValue={editingZona?.vendedor_nombre || ""}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm"
                  required
                >
                  <option value="" disabled>Seleccionar...</option>
                  {vendedores.map(v => (
                    <option key={v.id} value={v.nombre_completo}>
                      {v.nombre_completo.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase">Sectores Abarcados</label>
                <textarea name="sector" defaultValue={editingZona?.sector} placeholder="Ej: Naguanagua, San Diego..." className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm h-20" required />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsZonaModalOpen(false)} className="flex-1 py-3 bg-gray-800 rounded-xl font-bold text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-[2] py-3 bg-red-600 rounded-xl font-black text-xs uppercase italic">Guardar Zona</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* (Se mantiene el Modal de Pagos con la misma lógica de handleSaveMethod) */}
    </div>
  );
}