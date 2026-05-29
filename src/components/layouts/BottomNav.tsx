'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Scale } from 'lucide-react'

const NAV = [
  { href: '/',        label: 'Simulate', icon: Activity },
  { href: '/compare', label: 'Compare',  icon: Scale    },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-(--panel) border-t border-(--border) flex">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-semibold transition-colors duration-150
              ${active ? 'text-(--text)' : 'text-(--muted) hover:text-(--text)'}`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
