'use client';
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { companyData } from '@/constants/company';
import OrderPDFDocument from './OrderPDFDocument';
import { TasaOficial } from '@/services/tasa';


// DocumentPreview es el componente visual para la pantalla (Tailwind)
const DocumentPreview = ({ order }) => {

  const isApproved = ['aprobado', 'despachado'].includes(order?.status_logistico);

  const [fechaImpresion, setFechaImpresion] = useState(null);

  const [rate, setRate] = useState(36.50);

  useEffect(() => {
    TasaOficial.obtener().then(t => setRate(t));
  }, []);

  useEffect(() => { setFechaImpresion(new Date()); }, []);

  return (
    <div className="mx-auto bg-white text-black p-10 shadow-2xl min-h-[1000px] w-full max-w-[800px] flex flex-col relative overflow-hidden">
      {/* Sello de Pagado
             {order?.status_pago === 'pagado' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 rotate-[-35deg] pointer-events-none">
                    <div className="border-[15px] border-green-600 text-green-600 text-8xl font-black p-10 rounded-full">PAGADO</div>
                </div>
            )} */}

      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div className="flex gap-4 items-center border p-2 rounded-lg">

          <div className="bg-black p-2 rounded-lg">
            <span className="text-white font-black italic text-xl px-2">ROYAL</span>
          </div>

          <div>
            <h1 className="font-black text-lg uppercase tracking-tighter leading-none">{companyData.name}</h1>
            <p className="text-[10px] text-black font-bold mt-1">RIF: {companyData.rif}</p>
            <p className="text-[9px] leading-tight max-w-[200px] text-black">{companyData.address}</p>
            <p className="text-[9px] leading-tight max-w-[200px] text-black">{companyData.phone}</p>
          </div>

        </div>

        <div className="text-right">
          <h2 className="text-[15px] font-black uppercase text-blue-600 italic">{isApproved ? "Nota de Entrega" : "Orden de Pedido"}</h2>
          <span className="text-[15px] font-black text-left uppercase block">N° Control :
            <span className="text-[17px] ml-2 font-black text-right">

              {order?.numero_control || `TEMP-${order?.id?.toString().slice(-4)}`}
            </span>
          </span>

          <span className="text-[12px] text-left font-black uppercase block">Fecha Emisión:
            <span className='text-[13px] ml-2 font-black uppercase'>
              {new Date(order?.fecha_pedido).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }).replace('.', '')}
            </span>

          </span>

          <span className="text-[12px] text-left font-black uppercase tracking-tighter"> Fecha de Impresión:
            <span className="text-[15px] ml-2 font-black tracking-widest">
              {fechaImpresion ? fechaImpresion.toLocaleDateString('es-VE') : '---'}
            </span>
          </span>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-10  border p-1 rounded-t-lg">

        <div>

          <span className="text-[12px] font-black text-blue-600 block uppercase mb-1 flex block">Cliente:
            <p className="font-black ml-2 text-[15px] text-black uppercase">{order?.clientes?.razon_social}</p>
          </span>

          <span className="text-[12px] flex font-black text-blue-600 block uppercase mb-1">Rif:
            <p className="text-sm ml-2  font-bold text-black">{order?.clientes?.rif}</p>
          </span>

          <span className="text-[12px] flex font-black text-blue-600 block uppercase mb-1">Dirección:
            <p className="text-sm ml-2  font-bold text-black">{order?.clientes?.direccion}</p>
          </span>

          <span className="text-[12px] flex font-black text-blue-600 block uppercase mb-1">Telefono:
            <p className="text-sm ml-2  font-bold text-black">{order?.clientes?.telefono}</p>
          </span>
        </div>
      </div>

      <div className=" flex justify-between gap-5 border p-1 mb-10 rounded-b-lg justify">
        <span className="text-[10px] font-black text-blue-600 block uppercase mb-1">Condicion Pago: <span className="font-bold uppercase">{order.dias_credito}</span></span>
        <span className="text-[10px] font-black text-blue-600 block uppercase mb-1">Vencimiento: <span className="font-bold uppercase">
          {order?.fecha_vencimiento
            ? new Date(order.fecha_vencimiento).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }).replace('.', '')
            : 'N/A'}</span></span>
        <span className="text-[10px] font-black text-blue-600 block uppercase mb-1">Vendedor: <span className="font-bold uppercase">{order?.usuarios?.nombre_completo}</span></span>

      </div>


      {/* MARCA DE AGUA LATERAL IZQUIERDA */}
      <div className="absolute left-[-30px] top-30 bottom-0 flex items-center justify-center pointer-events-none z-0 overflow-visible w-full h-full">
        <span className="text-gray-300/60 text-5xl font-black italic uppercase tracking-[0.1em] whitespace-nowrap -rotate-40 origin-center select-none">
          Royal Super Oil
        </span>
      </div>
      <table className="w-full mb-10 z-10">
        <thead className="bg-black text-white text-[10px] uppercase">
          <tr>
            <th className="p-3 text-left">Descripción</th>
            <th className="p-3 text-center">Cant</th>
            <th className="p-3 text-right">Precio</th>
            <th className="p-3 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {order?.items?.map((item, idx) => (
            <tr key={idx} className="text-sm">
              <td className="p-3 font-bold uppercase">{item.productos?.nombre}</td>
              <td className="p-3 text-center font-black">{item.cantidad}</td>
              <td className="p-3 text-right font-mono">${item.precio_historico?.toFixed(2)}</td>
              <td className="p-3 text-right font-black">${(item.cantidad * item.precio_historico).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-auto border-t-2 border-black pt-6 flex justify-between items-end">
        <div className="text-xs space-y-1">
          <p className="font-black text-blue-600 uppercase">Condiciones</p>
          <p className="font-bold">Tasa: {rate.toFixed(2)} Bs/$</p>
          <p className="text-gray-400 italic">Fecha Impresión: {fechaImpresion?.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-blue-600 italic">${order?.monto_total?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default function OrderDocument({ order, rate, onBack }) {
  const [qrImage, setQrImage] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        const svg = document.querySelector(".qr-container svg");
        if (svg) {
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
          };
          img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isClient, order?.id]);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/consultar/${order?.id}` : '';

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-10 flex flex-col items-center">

      <div className="w-full max-w-5xl flex justify-between items-center mb-10">

        <button onClick={onBack} className="text-gray-500 hover:text-white font-black uppercase text-[10px] flex items-center gap-2 tracking-widest">
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="flex gap-4">
          <PDFDownloadLink
            document={<OrderPDFDocument order={order} rate={rate} showBS={false} companyData={companyData} qrCodeDataUri={qrImage} />}
            fileName={`Royal_USD_${order.clientes?.razon_social}_${order?.id}.pdf`}
            className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2"
          >
            <Download size={14} /> Nota USD
          </PDFDownloadLink>

          <PDFDownloadLink
            document={<OrderPDFDocument order={order} rate={rate} showBS={true} companyData={companyData} qrCodeDataUri={qrImage} />}
            fileName={`Royal_BS_${order.clientes?.razon_social}_${order?.id}.pdf`}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2"
          >
            <FileText size={14} /> Nota BS
          </PDFDownloadLink>
        </div>

      </div>

      <DocumentPreview order={order} rate={rate} shareUrl={shareUrl} />

      <div className="qr-container hidden">
        <QRCodeSVG value={shareUrl} size={100} />
      </div>
    </div>
  );
}