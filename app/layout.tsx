import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LiveTagus v2 | Painel de Partidas",
  description: "Monitorização em tempo real da Estação do Pragal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="dark">
      <body className={`${inter.className} bg-[#020617] antialiased`}>
        {children}
      </body>
    </html>
  );
}