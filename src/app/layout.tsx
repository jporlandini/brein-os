import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brain OS — Sistema de Agencia",
  description:
    "Plataforma gamificada de gestión de agencia creativa. Gestiona proyectos, clientes y equipos con el Guardian Agent.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07070f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} bg-[#07070f] h-full`}
    >
      <body className="min-h-full font-sans bg-[#07070f] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
