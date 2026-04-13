import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importación directa de la función

export const exportToPDF = (orders, periodLabel) => {
    const doc = new jsPDF();
    const totalMonto = orders.reduce((sum, o) => sum + (Number(o.monto_total) || 0), 0);

    // Encabezado Estilo Premium
    doc.setFillColor(37, 99, 235); // Azul Royal
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('ROYAL SUPER OIL', 14, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`REPORTE DE VENTAS - ${periodLabel.toUpperCase()}`, 14, 33);

    // Resumen de Totales
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Total Pedidos: ${orders.length}`, 14, 50);
    doc.text(`Monto Total Facturado: $${totalMonto.toLocaleString()}`, 100, 50);

    const tableRows = orders.map(order => [
        new Date(order.fecha_pedido).toLocaleDateString(),
        order.clientes?.razon_social || 'N/A',
        order.usuarios?.nombre_completo || 'Sistema',
        order.status_pago?.toUpperCase() || 'PENDIENTE',
        `$${Number(order.monto_total).toLocaleString()}`
    ]);

    // CAMBIO CLAVE AQUÍ: 
    // Usamos autoTable(doc, { ... }) en lugar de doc.autoTable({ ... })
    autoTable(doc, {
        startY: 60,
        head: [['Fecha', 'Cliente', 'Vendedor', 'Pago', 'Monto']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], fontSize: 9, halign: 'center' },
        columnStyles: {
            4: { halign: 'right', fontStyle: 'bold' }
        },
        styles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 250, 255] },
    });

    doc.save(`Reporte_Royal_${periodLabel.replace(/\s+/g, '_')}.pdf`);
};