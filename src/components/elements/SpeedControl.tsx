'use client'

const SPEEDS = [1, 2, 5] as const
type Speed = typeof SPEEDS[number]

interface SpeedControlProps {
  value:     Speed
  onChange:  (speed: Speed) => void
  className?: string
}

export default function SpeedControl({ value, onChange, className = '' }: SpeedControlProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {SPEEDS.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`
            px-3 py-1 text-xs font-semibold rounded font-(family-name:--font-jetbrains-mono)
            border transition-all duration-150 cursor-pointer
            ${value === s
              ? 'bg-(--accent) text-(--bg) border-(--accent)'
              : 'bg-(--card) text-(--muted) border-(--border) hover:text-(--text) hover:border-(--muted)'}
          `}
        >
          {s}×
        </button>
      ))}
    </div>
  )
}
