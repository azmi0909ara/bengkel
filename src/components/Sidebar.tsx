'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Car, BoxIcon, ToolCaseIcon, HistoryIcon } from 'lucide-react'

const menu = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Pelanggan',
    href: '/pelanggan',
    icon: Users,
  },
  {
    label: 'Kendaraan',
    href: '/kendaraan',
    icon: Car,
  },
  {
    label: 'Stok Part',
    href: '/stok',
    icon: BoxIcon,
  },
  {
    label: 'Service',
    href: '/service',
    icon: ToolCaseIcon,
  },
  {
    label: 'Invoice',
    href: '/invoice',
    icon: HistoryIcon,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white border-r border-gray-800 flex flex-col">
      
      {/* LOGO */}
      <div className="px-6 py-8 border-b border-gray-800">
        <h1 className="text-2xl font-extrabold tracking-widest">
          BENGKEL<span className="text-red-500">PRO</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Automotive Admin System
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menu.map(item => {
          const active = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  active
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon
                size={20}
                className={active ? 'text-white' : 'text-gray-400'}
              />
              <span className="font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500">
        © 2025 BengkelPro
      </div>
    </aside>
  )
}
