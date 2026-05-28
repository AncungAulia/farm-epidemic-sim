'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimalSprite } from '@/src/components/elements/AnimalDropdown'


const NAV = [
  { href: '/',        label: 'Simulation' },
  { href: '/compare', label: 'Comparative Analysis' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-(--panel) border-b border-(--border) px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AnimalSprite animal="sheep" size={28} />
        <span className="text-[15px] font-semibold text-(--text) tracking-tight">Farm Epidemic Simulator</span>
      </div>
      <div className="hidden sm:flex gap-1.5">
        {NAV.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`
                px-4 py-1.5 text-[13px] font-medium rounded transition-all duration-150
                ${active
                  ? 'bg-(--card) text-(--text) border border-(--border)'
                  : 'text-(--muted) hover:text-(--text) border border-transparent hover:border-(--border)'}
              `}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
