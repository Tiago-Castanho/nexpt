import "./globals.css";

export const metadata = {
  title: "NexPT - Transportes em Tempo Real",
  description: "Acompanha comboios e autocarros em Portugal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}