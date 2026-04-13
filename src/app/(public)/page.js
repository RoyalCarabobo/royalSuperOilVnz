'use client';
import Link from 'next/link';
import Image from 'next/image';
import Carrusel from '@/components/Carrusel';
import { certifi } from '@/assets/index';

export default function Home() {

  return (
    // Agregamos w-full y overflow-x-hidden para evitar el scroll lateral
    <main className="min-h-screen bg-background flex flex-col items-center w-full overflow-x-hidden">

      {/* Ajuste: text-center para móvil, left para escritorio */}
      <section className='mt-8 mb-12 px-4 w-full max-w-7xl text-center md:text-left'>
        
        <h1 className='text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-gray-900 leading-none'>
          <span className='block text-[20px] md:text-base font-bold tracking-[0.3em] text-black italic mb-2'>
            Distribuidora Super Carabobo
          </span>
          Royal <span className='text-primary'>Super Oil</span>
          <span className='block md:inline-block md:ml-4 text-2xl md:text-4xl text-gray-900 font-light not-italic tracking-normal'>
            Venezuela
          </span>
        </h1>

        <p className='mt-4 max-w-2xl text-gray-600 font-medium md:text-lg mx-auto md:mx-0'>
          Distribución oficial de lubricantes premium para motores a gasolina y diesel.
          Calidad garantizada para el parque automotor venezolano.
        </p>
      </section>

      {/* 1. SECCIÓN HERO (Carrusel) */}
      {/* Ajuste: w-full para que no se pegue a la izquierda */}
      <section className="relative w-full flex justify-center">
        <Carrusel />
      </section>

      {/* 3. SECCIÓN INFORMATIVA 1 / CTA */}
      <section className="py-20 text-center px-4 w-full bg-whait">

        <div className="max-w-8xl mx-auto flex flex-col items-center">

          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-6">
            El mejor fabricante de aceite de motor y lubricantes en los Emiratos Árabes Unidos
          </h2>

          <p className="text-xl text-gray-600 mb-10 max-w-6xl mx-auto font-medium">
            Distribuidores del lubricantes de alto rendimiento para vehiculos motores a gasolina y aceite diesel, Lubricantes para Transmisiones, Ligas de Freno y mucho mas.
            A diferencia de otras marcas, Royal Super se enfoca en el sellado de los anillos del pistón y la protección de las partes móviles desde el encendido en frío, que es cuando ocurre el 75% del desgaste del motor.
          </p>

          <Image
            src={certifi}
            alt="certificado Royal"
            width={800}
            height={700}
            className="p-1"
          />

        </div>

        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Columna Izquierda: Local */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-tertiary">
                  Nuestra Huella en la Ciudad Industrial
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  "Nacidos en la zona industrial de Valencia, hemos crecido junto al parque automotor carabobeño, entendiendo las exigencias de sus rutas y el rigor de su industria. Hoy, esa experiencia nos permite distribuir calidad certificada desde el centro del país hacia cada rincón de Venezuela."
                </p>
                <div className="p-4 bg-gray-50 border-l-4 border-foreground">
                  <p className="italic text-sm text-gray-700">
                    Experiencia comprobada en las rutas más exigentes del país.
                  </p>
                </div>
              </div>

              {/* Columna Derecha: Global */}
              <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl">
                <h3 className="text-2xl font-semibold mb-4 text-royal-gold">
                  Fabricante Líder de Lubricantes
                </h3>
                <p className="text-slate-300 text-sm mb-6">
                  "Más que un aceite, somos un fabricante líder en los Emiratos Árabes Unidos. Con más de dos décadas de experiencia, fabricamos y exportamos lubricantes de alto rendimiento a nivel mundial. Como proveedores mayoristas con presencia en África y Asia, cumplimos con los más altos estándares internacionales."
                </p>

                {/* Grid de Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-700 p-3 rounded text-center">
                    <span className="block font-bold text-royal-gold">TECNOLOGÍA</span>
                    <span className="text-xs">ALEMANA</span>
                  </div>
                  <div className="border border-slate-700 p-3 rounded text-center">
                    <span className="block font-bold text-royal-gold">API & ISO</span>
                    <span className="text-xs">CERTIFIED</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN INFORMATIVA 2 / CTA */}
      <section className="py-20 text-center px-4 w-full bg-backgroundSecundary">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic mb-6">
            Calidad y confianza en <span className="text-primary text-outline">cada producto</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
            Somos líderes en distribución de Lubricantes y Aditivos para Vehiculos. Revisa nuestro catálogo actualizado y haz tu pedido hoy mismo.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="bg-tertiary text-primary px-10 py-4 rounded-2xl font-black text-lg hover:opacity-90 shadow-2xl transition-all hover:scale-105"
            >
              VER CATÁLOGO
            </Link>
            
            <a
              href="/contacto"
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              CONTACTAR VENTAS
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
