'use client'

import { useState } from 'react'

interface ParameterSliderProps {
  label:     string
  symbol?:   string
  value:     number
  min:       number
  max:       number
  step:      number
  display:   string
  disabled?: boolean
  onChange:  (value: number) => void
}

export default function ParameterSlider({
  label, symbol, value, min, max, step, display, disabled, onChange,
}: ParameterSliderProps) {
  const [editing,  setEditing]  = useState(false)
  const [inputVal, setInputVal] = useState('')

  // sigma/gamma ditampilkan sebagai "5 hr" (hari), bukan nilai aslinya (0.2)
  const isInverse   = display.endsWith(' hr')
  const editInitial = isInverse ? String(Math.round(1 / value)) : display

  const startEdit = () => {
    if (disabled) return
    setInputVal(editInitial)
    setEditing(true)
  }

  const commitEdit = () => {
    const num = parseFloat(inputVal)
    if (!isNaN(num) && num !== 0) {
      const actual  = isInverse ? 1 / num : num
      const clamped = Math.min(max, Math.max(min, actual))
      onChange(clamped)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[13px] font-medium text-(--text)">
          {label}{symbol && <span className="text-(--muted) ml-1 font-(family-name:--font-jetbrains-mono)">({symbol})</span>}
        </span>
        {editing ? (
          <input
            type="number"
            value={inputVal}
            autoFocus
            onChange={e => setInputVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="font-(family-name:--font-jetbrains-mono) text-[12px] font-semibold text-(--accent) bg-(--bg) px-2 py-0.5 rounded w-16 text-center border border-(--accent) outline-none"
          />
        ) : (
          <span
            onClick={startEdit}
            title={disabled ? undefined : 'Click to enter a value'}
            className={`font-(family-name:--font-jetbrains-mono) text-[12px] font-semibold text-(--accent) bg-(--bg) px-2 py-0.5 rounded min-w-12 text-center transition-all ${!disabled ? 'cursor-text hover:ring-1 hover:ring-(--accent)' : ''}`}
          >
            {display}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
          bg-(--border)
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-(--accent)
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-(--card)
          [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  )
}
