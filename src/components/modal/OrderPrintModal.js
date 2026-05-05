'use client';
import React, { useState, useEffect } from 'react';
import { X,  Package, Hash } from 'lucide-center';
import { QRCodeSVG } from 'qrcode.react';

export default function OrderPrintModal({ order, isOpen, onClose }) {
    const [qrImage, setQrImage] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [isReady, setIsReady] = useState(false);


    useEffect(() => { setIsClient(true); }, []);

    useEffect(() => {
        if (isClient && order && isOpen) {
            const timer = setTimeout(() => {
                const svg = document.querySelector(".modal-qr-hidden svg");
                if (svg) {
                    try {
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        const img = new window.Image();
                        img.onload = () => {
                            canvas.width = img.width * 4;
                            canvas.height = img.height * 4;
                            ctx.fillStyle = "white";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.scale(4, 4);
                            ctx.drawImage(img, 0, 0);
                            setQrImage(canvas.toDataURL("image/png", 1.0));
                            setIsReady(true);
                        };
                        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
                    } catch (err) { setIsReady(true); }
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isClient, order, isOpen]);

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
            <div className="modal-qr-hidden hidden">
                <QRCodeSVG value={`${window.location.origin}/consultar/${order.id}`} size={100} />
            </div>

            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                {/* Header Royal */}
                <div className="bg-[#1c1b1b] p-8 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#ffd80d] p-3 rounded-xl rotate-3 shadow-lg shadow-yellow-500/20">
                            <Package className="text-black" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Detalle de Pedido</h2>
                            <p className="text-[#ffd80d] text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Hash size={10} /> Control: {order.numero_control || order.id}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <X size={28} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Aliado Comercial</p>
                            <p className="font-black text-[#1c1b1b] uppercase italic text-lg leading-tight">{order.clientes?.razon_social}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Total</p>
                            <p className="text-4xl font-black italic text-[#1c1b1b]">${order.monto_total?.toFixed(2)}</p>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}