import './globals.css'

export const metadata = {
  title: 'Admin Bengkel',
  description: 'Sistem Manajemen Bengkel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
