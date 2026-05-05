import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Distribuidora Super Carabobo | Lubricantes de Alta Calidad en valencia - Venezuela',

  description: 'Distribución al mayor de aceites y lubricantes para vehiculos en Valencia Carabobo. Calidad Proxil para tu vehículo.',
  
  keywords: ['lubricantes venezuela', 'aceite para motor valencia', 'royal super oil', 'proxil', 'Royal super carabobo', 'distribuidor de lubricantes', 'lubricantes para vehículos', 'aceites de alta calidad', 'lubricantes automotrices', 'valencia carabobo'],
 
  openGraph: {
    title: 'Royal Super Oil - Potencia y Protección',
    description: 'Expertos en lubricación automotriz.',
    images: ['/logo-royal.png'],
  },
}

// src/app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* Añadimos suppressHydrationWarning aquí */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <div className="min-h-screen">
          {children}
        </div>
        
        <Footer />
      </body>
    </html>
  );
}
