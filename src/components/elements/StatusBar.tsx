'use client'

import SpeedControl from './SpeedControl'

type Speed = 1 | 2 | 5

interface StatusBarProps {
  day:      number
  total:    number
  speed:    Speed
  onSpeed:  (s: Speed) => void
}

export default function StatusBar({ day, total, speed, onSpeed }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between bg-(--card) border border-(--border) rounded-lg px-4 py-2.5 mb-3">
      <span className="font-(family-name:--font-jetbrains-mono) text-sm font-semibold text-(--text)">
        day&nbsp;
        <span className="text-(--accent)">{String(day).padStart(3, '0')}</span>
        &nbsp;&nbsp;/&nbsp;&nbsp;n=
        <span className="text-(--accent)">{total}</span>
      </span>
      <SpeedControl value={speed} onChange={onSpeed} />
    </div>
  )
}
