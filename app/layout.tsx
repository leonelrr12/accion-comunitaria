import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acción Comunitaria | Sistema de Gestión",
  description: "Plataforma de gestión comunitaria y liderazgo político.",
  openGraph: {
    title: "Acción Comunitaria | Sistema de Gestión",
    description: "Plataforma de gestión comunitaria y liderazgo político.",
    url: 'http://147.93.145.67',
    siteName: 'Tu Red de influencia',
    images: [
      {
        url: 'http://147.93.145', // URL completa a tu imagen en /public
        width: 1200,
        height: 630,
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
