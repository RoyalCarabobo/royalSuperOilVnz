export const companyData = {

  name: "Servicos Daller C.A",
  rif: "J-12345678-9", 
  address: "Zona Industrial II, Av. Principal, Barquisimeto, Edo. Lara, Venezuela.",
  phone: "+58 412-1234567",
  email: "ventas@royalsuperoil.com",
  web: "www.royalsuperoil.com",
  logo: "/logos/royal-logo-white.png", // Ruta a tu logo en la carpeta public
  
  // Datos para el pie de la Nota de Entrega
  terms: {
    validity: "3 días hábiles",
    currency: "USD / VES (Tasa BCV)",
    footer_note: "Esta Nota de Entrega no es una factura fiscal. Mercancía viaja por cuenta y riesgo del cliente."
  },

  // Cuentas Bancarias para "Reportar Pago"
  payment_methods: {
    zelle: {
      email: "pagos@royalsuperoil.com",
      holder: "Royal Super Oil Corp"
    },
    pago_movil: {
      bank: "Banesco",
      phone: "0412-1234567",
      rif: "J-12345678-9"
    },
    transferencia_bs: {
      bank: "Banco Mercantil",
      account_number: "0105-XXXX-XX-XXXXXXXXXX",
      holder: "Royal Super Oil, C.A."
    }
  }
};