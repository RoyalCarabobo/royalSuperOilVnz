'use client';
import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, bg, description, trend, onClick }) => (
  <div
    onClick={() => onClick(label)}
    className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-gray-800 hover:border-blue-500/30 transition-all shadow-xl group cursor-pointer relative overflow-hidden"
  >
    {/* Decoración de fondo al hacer hover */}
    <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
        <Icon size={120} />
    </div>

    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`${bg} ${color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>

      {/* TENDENCIA AUTOMÁTICA */}
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${trend >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>

    <div className="relative z-10">
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <h3 className="text-4xl font-black italic text-white tracking-tighter">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      {description && (
        <p className="text-[9px] text-gray-500 font-bold mt-2 uppercase flex items-center gap-2">
          <span className={`w-1 h-1 rounded-full ${color.replace('text', 'bg')}`}></span>
          {description}
        </p>
      )}
      <p className="text-[10px] text-blue-500 font-black mt-4 opacity-0 group-hover:opacity-100 transition-opacity uppercase italic">
        Ver detalles →
      </p>
    </div>
  </div>
);

export default function VentasStatsGrid({ data, onCardClick }) {
  const statsConfig = [
    {
      label: 'Pedidos Totales',
      value: data.totalPedidos || 0,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      description: 'Volumen total registrado',
      trend: data.trendPedidos // Valor automático desde el padre
    },
    {
      label: 'Por Confirmar',
      value: data.porConfirmar || 0,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      description: 'Esperando aprobación admin',
      trend: null
    },
    {
      label: 'Por Cobrar',
      value: data.porCobrar || 0,
      icon: CheckCircle2,
      color: 'text-indigo-500', // Cambiado a Indigo para diferenciar de Entregado
      bg: 'bg-indigo-500/10',
      description: 'Cuentas activas en calle',
      trend: data.trendCobros
    },
    {
      label: 'Morosos',
      value: data.morosos || 0, // Asegúrate de que el padre envíe este cálculo
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      description: 'Créditos fuera de fecha',
      trend: data.trendMorosos
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <StatCard key={index} {...stat} onClick={onCardClick}/>
      ))}
    </div>
  );
}