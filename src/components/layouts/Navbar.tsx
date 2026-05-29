'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { AnimalSprite } from '@/src/components/elements/AnimalDropdown'
import HowToSimulate from './HowToSimulate'

const NAV = [
  { href: '/',        label: 'Simulate' },
  { href: '/compare', label: 'Compare' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('fes-guide-seen')) setGuideOpen(true)
  }, [])

  const handleGuideClose = () => {
    localStorage.setItem('fes-guide-seen', '1')
    setGuideOpen(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-(--panel) border-b border-(--border) px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AnimalSprite animal="sheep" size={28} />
          <span className="text-[15px] font-semibold text-(--text) tracking-tight">Farm Epidemic Simulator</span>
        </div>
        <div className="flex items-center gap-1.5">
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
          <button
            onClick={() => setGuideOpen(true)}
            className="p-2 rounded text-(--muted) cursor-pointer hover:text-(--text) hover:bg-(--card) transition-all duration-150"
            aria-label="How to simulate"
          >
            <BookOpen size={18} />
          </button>
        </div>
      </nav>

      <HowToSimulate open={guideOpen} onClose={handleGuideClose} />
    </>
  )
}
