import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentamos obtener la tasa de una fuente confiable
    // Nota: Para Venezuela, podrías usar una API que provea datos del BCV
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 3600 } // Cache dinámico de Next.js por 1 hora
    });
    
    const data = await res.json();
    const tasa = data.rates.VES;

    if (!tasa) throw new Error("Tasa no encontrada");

    return NextResponse.json({ rate: tasa });
  } catch (error) {
    console.error("Error en API de tasa:", error);
    // Si todo falla, devolvemos la última tasa conocida manualmente
    return NextResponse.json({ rate: 36.50, isBackup: true });
  }
}