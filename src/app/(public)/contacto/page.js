'use client';
import { useState } from 'react';
import Image from 'next/image';
import { blackLogo } from '@/assets/index'; // Importamos tu logo

const ContactoPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    ciudad: '',
    interes: 'Minorista / Repuestera',
    mensaje: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const enviarWhatsApp = (e) => {
    e.preventDefault();
    const telefono = "+5804145174722"; 
    
    const texto = `*SOLICITUD DE INFORMACIÓN - ROYAL SUPER OIL*%0A` +
                  `--------------------------------------------%0A` +
                  `👤 *Nombre:* ${formData.nombre}%0A` +
                  `🏢 *Empresa:* ${formData.empresa || 'N/A'}%0A` +
                  `📍 *Ciudad:* ${formData.ciudad}%0A` +
                  `🎯 *Interés:* ${formData.interes}%0A` +
                  `💬 *Mensaje:* ${formData.mensaje}`;
    
    const url = `https://wa.me/${telefono}?text=${texto}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-4 flex items-center justify-center">
      <div className="max-w-5xl w-full bg-[#111111] rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-gray-800 overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado Izquierdo: Branding e Info */}
        <div className="md:w-2/5 bg-gradient-to-br from-slate-900 via-black to-slate-900 p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10 text-center md:text-left">
            <div className="bg-white p-6 rounded-3xl shadow-xl mb-8 inline-block transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image 
                src={blackLogo} 
                alt="Royal Super Logo" 
                width={200} 
                height={100}
                className="mx-auto"
              />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">
              Impulsa tu <span className="text-blue-600 text-stroke">Negocio</span>
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed mb-8">
              Únete a la red de distribución con tecnología de los Emiratos Árabes. Estamos en Valencia para mover a toda Venezuela.
            </p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4 group">
              <div className="size-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <p className="text-sm font-bold uppercase italic text-gray-300 tracking-widest">Valencia, Carabobo</p>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="size-10 rounded-xl bg-royal-gold/20 flex items-center justify-center text-royal-gold group-hover:bg-royal-gold group-hover:text-black transition-all">
                <span className="material-symbols-outlined">call</span>
              </div>
              <p className="text-sm font-bold uppercase italic text-gray-300 tracking-widest">+58 414-5174722</p>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario Estilizado */}
        <form onSubmit={enviarWhatsApp} className="md:w-3/5 p-10 bg-[#161616] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Nombre Completo</label>
              <input 
                required 
                name="nombre" 
                onChange={handleChange} 
                placeholder="Ej. Juan Pérez"
                type="text" 
                className="w-full bg-black border border-gray-800 text-white rounded-2xl p-4 outline-none focus:border-blue-600 transition-all placeholder:text-gray-700 font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Empresa / Negocio</label>
              <input 
                name="empresa" 
                onChange={handleChange} 
                placeholder="Repuestera Royal"
                type="text" 
                className="w-full bg-black border border-gray-800 text-white rounded-2xl p-4 outline-none focus:border-blue-600 transition-all placeholder:text-gray-700 font-medium" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Ubicación</label>
              <input 
                required 
                name="ciudad" 
                onChange={handleChange} 
                placeholder="Valencia, Edo. Carabobo"
                type="text" 
                className="w-full bg-black border border-gray-800 text-white rounded-2xl p-4 outline-none focus:border-blue-600 transition-all placeholder:text-gray-700 font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Tipo de Cliente</label>
              <select 
                name="interes" 
                onChange={handleChange} 
                className="w-full bg-black border border-gray-800 text-white rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-bold text-xs uppercase cursor-pointer"
              >
                <option value="Minorista / Repuestera">Minorista / Repuestera</option>
                <option value="Flota de Transporte">Flota de Transporte</option>
                <option value="Consumidor Final">Consumidor Final</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Mensaje o Pedido Especial</label>
            <textarea 
              required 
              name="mensaje" 
              onChange={handleChange} 
              rows="3" 
              placeholder="¿En qué podemos ayudarte?"
              className="w-full bg-black border border-gray-800 text-white rounded-2xl p-4 outline-none focus:border-blue-600 transition-all placeholder:text-gray-700 font-medium resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase italic shadow-lg shadow-green-900/20 active:scale-95"
          >
            <span className="material-symbols-outlined font-bold">send</span>
            Iniciar Consulta vía WhatsApp
          </button>
          
          <p className="text-center text-[9px] text-gray-600 uppercase font-black tracking-[0.2em]">
            Atención Inmediata de Lunes a Sábado
          </p>
        </form>

      </div>
    </div>
  );
};

export default ContactoPage;