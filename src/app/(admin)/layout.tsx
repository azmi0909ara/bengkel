import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
