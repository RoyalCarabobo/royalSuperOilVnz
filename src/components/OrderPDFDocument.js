'use client'
import { TasaOficial } from '@/services/tasa';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { useEffect, useState } from 'react';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#fff',
        fontFamily: 'Helvetica',
        position: 'relative'
    },
    // Cabecera Principal
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 2,
        borderColor: '#000',
        paddingBottom: 20,
        marginBottom: 20,
    },
    // Recuadro del Logo (Igual a la vista previa con borde)
    logoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        padding: 8,
        gap: 10,
    },
    logoBlack: {
        backgroundColor: '#000',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    logoText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    companyInfo: {
        flexDirection: 'column',
    },
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    companySub: {
        fontSize: 8,
        color: '#000',
        fontWeight: 'bold',
        marginTop: 2,
    },
    // Datos de Control (Derecha)
    controlBox: {
        textAlign: 'right',
    },
    docTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2563eb', // blue-600
        fontStyle: 'italic',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    controlText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    controlValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Info Cliente/Vendedor (Recuadros Grid)
    clientVendedorContainer: {
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
    },
    clientBox: {

        padding: 10,
    },
    vendedorBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#000',
        borderbottomWidth: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        padding: 8,
        backgroundColor: '#fff',
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2563eb',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 4,
    },
    // Tabla
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#000',
        padding: 10,
    },
    tableHeaderText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
        padding: 10,
    },
    cellDesc: { flex: 3, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    cellQty: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 'bold' },
    cellPrice: { flex: 1, textAlign: 'right', fontSize: 10, fontWeight: 'bold' },
    cellTotal: { flex: 1, textAlign: 'right', fontSize: 10, fontWeight: 'bold' },
    // Footer
    footer: {
        marginTop: 'auto',
        borderTopWidth: 2,
        borderColor: '#000',
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    condicionesLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2563eb',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    condicionesText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2563eb',
        fontStyle: 'italic',
    },
    qrBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    watermarkLateral: {
        position: 'absolute',
        left: 20,          // Ajustado para que no tape el texto principal
        top: '50%',         // Centrado verticalmente en la zona de la tabla
        width: '100%',      // Ocupa el ancho para permitir la rotación central
        fontSize: 40,       // Tamaño similar al '5xl'
        color: '#D1D5DB',   // Equivalente a gray-300
        opacity: 0.5,       // Equivalente al /60 de opacidad
        fontFamily: 'Helvetica-BoldOblique', // Para el estilo 'italic' y 'black'
        textTransform: 'uppercase',
        letterSpacing: 4,   // Equivalente al tracking-[0.1em]

        // Rotación de -40 grados como el ejemplo de Tailwind
        transform: 'rotate(-40deg)',

        zIndex: -1
    }
});

export default function OrderPDFDocument({ order, showBS, companyData, qrCodeDataUri }) {
    const isApproved = ['aprobado', 'despachado', 'entregado'].includes(order?.status_logistico);
    const documentTitle = isApproved ? "Nota de Entrega" : "Orden de Pedido";
    const [rate, setRate] = useState(471.71)
    const totalUSD = order.monto_total || 0;
    const displayTotal = showBS ? (totalUSD * rate) : totalUSD;
    const currency = showBS ? 'Bs.' : '$';

    useEffect(() => {
        TasaOficial.obtener().then(t => setRate(t));
    }, []);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Cabecera */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <View style={styles.logoBlack}>
                            <Text style={styles.logoText}>ROYAL</Text>
                        </View>
                        <View style={styles.companyInfo}>
                            <Text style={styles.companyName}>{companyData.name}</Text>
                            <Text style={styles.companySub}>RIF: {companyData.rif}</Text>
                            <Text style={[styles.companySub, { maxWidth: 180 }]}>{companyData.address}</Text>
                            <Text style={styles.companySub}>{companyData.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.controlBox}>
                        <Text style={styles.docTitle}>{documentTitle}</Text>
                        <Text style={styles.controlText}>N° Control: <Text style={styles.controlValue}>{order.numero_control || order.id}</Text></Text>
                        <Text style={styles.controlText}>Emisión: <Text style={styles.controlValue}>{new Date(order.fecha_pedido).toLocaleDateString('es-VE')}</Text></Text>
                        <Text style={styles.controlText}>Impresión: <Text style={styles.controlValue}>{new Date().toLocaleDateString('es-VE')}</Text></Text>
                    </View>
                </View>

                {/* Bloque Cliente / Vendedor (Igual a la vista previa) */}
                <View style={styles.clientVendedorContainer}>

                    <View style={styles.clientBox}>
                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                            <Text style={styles.infoLabel}>Cliente:</Text>
                            <Text style={styles.infoValue}>{order.clientes?.razon_social}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                            <Text style={styles.infoLabel}>Rif:</Text>
                            <Text style={styles.infoValue}>{order.clientes?.rif}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                            <Text style={styles.infoLabel}>Dirección:</Text>
                            <Text style={styles.infoValue}>{order.clientes?.direccion}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.infoLabel}>Teléfono:</Text>
                            <Text style={styles.infoValue}>{order.clientes?.telefono}</Text>
                        </View>
                    </View>
                    <View style={styles.vendedorBox}>
                        <Text style={styles.infoLabel}>Condicion Pago: <Text style={{ color: '#000' }}>{order.dias_credito}</Text></Text>
                        <Text style={styles.infoLabel}>Fecha Vencimiento: <Text style={{ color: '#000' }}>{order?.fecha_vencimiento
                            ? new Date(order.fecha_vencimiento).toLocaleDateString('es-VE', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            }).replace('.', '')
                            : 'N/A'}</Text></Text>
                        <Text style={styles.infoLabel}>Vendedor: <Text style={{ color: '#000' }}>{order?.usuarios?.nombre_completo}</Text></Text>

                    </View>
                </View>

                {/* Tabla */}

                <Text style={styles.watermarkLateral}>
                    ROYAL SUPER OIL
                </Text>
                <View style={styles.tableHeader}>
                    <Text style={[styles.cellDesc, { color: '#fff' }]}>Descripción</Text>
                    <Text style={[styles.cellQty, { color: '#fff' }]}>Cant</Text>
                    <Text style={[styles.cellPrice, { color: '#fff' }]}>Precio</Text>
                    <Text style={[styles.cellTotal, { color: '#fff' }]}>Subtotal</Text>
                </View>

                {order?.items?.map((item, i) => {
                    const precioUnitario = showBS
                        ? (item.precio_historico * rate)
                        : item.precio_historico;

                    const subtotalFila = item.cantidad * precioUnitario;
                    return (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.cellDesc}>{item.productos?.nombre}</Text>
                            <Text style={styles.cellQty}>{item.cantidad}</Text>
                            <Text style={styles.cellPrice}>$ {currency} {precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </Text>
                            <Text style={styles.cellTotal}>$ {currency} {subtotalFila.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </Text>
                        </View>
                    );
                })}

                {/* Footer Totales */}
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.condicionesLabel}>Condiciones de Pago</Text>
                        <Text style={styles.condicionesText}>Referencia Tasa: {rate.toFixed(2)} Bs/$</Text>
                        {showBS && (
                            <Text style={[styles.condicionesText, { marginTop: 2, color: '#666' }]}>
                                Precios convertidos a tasa oficial.
                            </Text>
                        )}
                        <Text style={[styles.condicionesText, { color: '#9ca3af', marginTop: 4 }]}>
                            Plazo: {order.dias_credito || 0} Días
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                        <Text style={styles.totalLabel}>TOTAL:</Text>
                        <Text style={styles.totalAmount}>
                            {currency} {displayTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {/* QR y Footer Técnico */}
                <View style={styles.qrBox}>
                    {qrCodeDataUri && <Image src={qrCodeDataUri} style={{ width: 50, height: 50 }} />}
                    <View style={{ textAlign: 'right' }}>
                        <Text style={{ fontSize: 6, color: '#d1d5db', textTransform: 'uppercase' }}>Carabobo - Venezuela</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}