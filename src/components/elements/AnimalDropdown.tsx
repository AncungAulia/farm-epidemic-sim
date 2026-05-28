'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { ANIMAL_CONFIGS, type AnimalType } from '@/src/utils/constants'

export function AnimalSprite({ animal, size = 32 }: { animal: AnimalType; size?: number }) {
  const cfg   = ANIMAL_CONFIGS[animal]
  const scale = size / cfg.frameW
  return (
    <div
      style={{
        width:              size,
        height:             size,
        backgroundImage:    `url(${cfg.sheet})`,
        backgroundSize:     `${cfg.frameW * 6 * scale}px ${cfg.frameH * 8 * scale}px`,
        backgroundPosition: `0px -${size * 3}px`,
        imageRendering:     'pixelated',
        flexShrink:         0,
      }}
    />
  )
}

interface AnimalDropdownProps {
  value:    AnimalType
  onChange: (a: AnimalType) => void
}

export default function AnimalDropdown({ value, onChange }: AnimalDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 border border-(--border) rounded-md px-3 py-2 hover:border-(--accent) transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <AnimalSprite animal={value} size={24} />
          <span className="font-(family-name:--font-jetbrains-mono) text-xs font-semibold text-(--text)">
            {ANIMAL_CONFIGS[value].label}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-(--muted) transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Options */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-(--card) border border-(--border) rounded-md overflow-hidden z-20 shadow-lg">
          {(Object.entries(ANIMAL_CONFIGS) as [AnimalType, typeof ANIMAL_CONFIGS[AnimalType]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2 transition-colors cursor-pointer
                ${value === key
                  ? 'bg-(--bg) text-(--text)'
                  : 'text-(--muted) hover:bg-(--bg) hover:text-(--text)'}`}
            >
              <span className="font-(family-name:--font-jetbrains-mono) text-xs font-semibold">
                {cfg.label}
              </span>
              <AnimalSprite animal={key} size={28} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
