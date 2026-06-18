'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, RefreshCcw, ArrowLeftRight, BarChart3,
  Settings, Plug, LogOut, Package, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { IS_DEV_MODE, clearDevSession } from '@/lib/dev-auth'
import type { Merchant } from '@/types'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/dashboard/returns', icon: Package, label: 'Đổi trả' },
  { href: '/dashboard/exchanges', icon: ArrowLeftRight, label: 'Đổi hàng' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/workflows', icon: Zap, label: 'Workflows' },
  { href: '/dashboard/settings', icon: Settings, label: 'Cài đặt' },
  { href: '/dashboard/integrations', icon: Plug, label: 'Tích hợp' },
]

export default function DashboardNav({ merchant }: { merchant: Merchant }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    if (IS_DEV_MODE) {
      clearDevSession()
      router.push('/login')
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <RefreshCcw className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">{merchant.store_name}</div>
          <div className="text-xs text-gray-400 capitalize">{merchant.plan}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', active ? 'text-blue-600' : 'text-gray-400')} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-3">
        <Link
          href={`/portal/${merchant.store_slug}`}
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <Package className="h-4 w-4 text-gray-400" />
          Xem portal khách hàng
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
