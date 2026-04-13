import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

export default function ButtomAnular({ pedidoId, status, onAction }) {
    // Si ya está anulado, no mostramos el botón o lo mostramos deshabilitado
    if (status === 'anulado') return null;

    return (
        <button
            onClick={() => onAction(pedidoId)}
            className="group flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/20 rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300"
            title="Anular Pedido"
        >
            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase italic">Anular</span>
        </button>
    );
}