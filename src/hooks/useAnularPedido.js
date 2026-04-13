import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAnularPedido(onSuccess) {
    const [isAnulando, setIsAnulando] = useState(false);

    const anular = async (pedidoId) => {
        const confirmacion = window.confirm("¿Deseas anular este pedido? No afectará las estadísticas de venta.");
        if (!confirmacion) return;

        setIsAnulando(true);
        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ status_pago: 'anulado', status_logistico: 'anulado' })
                .eq('id', pedidoId);

            if (error) throw error;

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error al anular pedido:", err.message);
            alert("Error al procesar la anulación.");
        } finally {
            setIsAnulando(false);
        }
    };

    return { anular, isAnulando };
}