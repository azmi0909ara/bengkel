'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const getTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard'
      case '/pelanggan':
        return 'Data Pelanggan'
      case '/kendaraan':
        return 'Data Kendaraan'
      default:
        return 'Admin Panel'
    }
  }

  const handleLogout = () => {
    // nanti sambung Firebase signOut
    router.push('/login')
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-gradient-to-r from-gray-900 via-gray-800 to-black border-b border-gray-800">
      
      {/* TITLE */}
      <div>
        <h1 className="text-lg font-semibold text-white tracking-wide">
          {getTitle()}
        </h1>
        <p className="text-xs text-gray-400">
          BengkelPro Management System
        </p>
      </div>

      {/* RIGHT ACTION */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-white font-medium">
            Admin
          </p>
          <p className="text-xs text-gray-400">
            admin@bengkel.com
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold shadow"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
