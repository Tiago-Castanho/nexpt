export const metadata = {
  title: 'Fertagus Monitor',
  description: 'Painel de circulação de comboios',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        {/* O children é onde a tua page.js vai ser injetada */}
        {children}
      </body>
    </html>
  )
}