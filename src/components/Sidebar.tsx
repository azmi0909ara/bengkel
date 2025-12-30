'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench
} from 'lucide-react'

const menu = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Pelanggan',
    href: '/pelanggan',
    icon: Users,
  },
  {
    name: 'Kendaraan',
    href: '/kendaraan',
    icon: Car,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
      {/* LOGO */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wrench className="text-orange-500" />
          Bengkel Admin
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Sistem Manajemen Bengkel
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map(item => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
                ${active
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-zinc-800 text-xs text-zinc-500">
        © 2025 Bengkel System
      </div>
    </aside>
  )
}
