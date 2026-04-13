const metodosPago = [
  {
    id: 1,
    banco: 'Banco Industrial de Venezuela',
    tipo: 'Transferencia',
    moneda: 'Bs',
    detalles: { cuenta: '0102-0000-00-0000000000', rif: 'J-00000000-0', titular: 'CheryPoint C.A.' }
  },
  {
    id: 2,
    banco: 'Banesco',
    tipo: 'Pago Móvil',
    moneda: 'Bs',
    detalles: { telefono: '0412-1234567', rif: 'J-00000000-0' }
  },
  {
    id: 3,
    banco: 'Zelle',
    tipo: 'Divisas',
    moneda: 'USD',
    detalles: { correo: 'pagos@cherypoint.com', titular: 'CheryPoint Industrial' }
  }
];

export { metodosPago };