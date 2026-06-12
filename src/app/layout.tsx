import type { Metadata, Viewport } from "next";
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
  title: "Brain OS — Sistema de Agencia",
  description: "Plataforma gamificada de gestión de agencia creativa.",
};

export const viewport: Viewport = {
  themeColor: "#07070f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} bg-[#07070f] h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#07070f] text-slate-100">
        {children}
      </body>
    </html>
  );
}
