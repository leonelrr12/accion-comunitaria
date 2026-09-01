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
  metadataBase: new URL("https://ac.sosaalcalde.com"),
  title: {
    default: "Acción Comunitaria | Sistema de Gestión",
    template: "%s | Acción Comunitaria",
  },
  description: "Plataforma de gestión comunitaria y liderazgo.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Acción Comunitaria | Sistema de Gestión",
    description: "Plataforma de gestión comunitaria y liderazgo.",
    url: "https://ac.sosaalcalde.com",
    siteName: "Acción Comunitaria",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_PA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acción Comunitaria | Sistema de Gestión",
    description: "Plataforma de gestión comunitaria y liderazgo.",
    images: ["/og-image.png"],
  },
};

import { Toaster } from "sonner";
import SessionProvider from "../components/SessionProvider";

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
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
