'use client'

import ParameterSlider  from '@/src/components/elements/ParameterSlider'
import AnimalDropdown   from '@/src/components/elements/AnimalDropdown'
import Tooltip          from '@/src/components/elements/Tooltip'
import { Info }         from 'lucide-react'
import { PARAM_RANGES, type AnimalType } from '@/src/utils/constants'
import type { SimParams } from '@/src/utils/simulation-engine'

interface ControlPanelProps {
  params:          SimParams
  running:         boolean
  onChange:        (key: keyof SimParams, value: number) => void
  mini?:           boolean
  maxN?:           number
  animal?:         AnimalType
  onAnimalChange?: (a: AnimalType) => void
}

function formatDisplay(key: keyof SimParams, value: number): string {
  if (key === 'N' || key === 'I0') return String(Math.round(value))
  if (key === 'beta') return value.toFixed(2)
  return `${Math.round(1 / value)} days`
}

const SLIDERS: { key: keyof SimParams; label: string; symbol: string }[] = [
  { key: 'N',     label: 'Total Population', symbol: 'N'    },
  { key: 'I0',    label: 'Initial Cases',    symbol: 'I₀'   },
  { key: 'beta',  label: 'Transmission',     symbol: 'β'    },
  { key: 'sigma', label: 'Incubation',       symbol: '1/σ'  },
  { key: 'gamma', label: 'Recovery',         symbol: '1/γ'  },
]

const PARAM_TOOLTIP = (
  <ul className="flex flex-col gap-1.5">
    <li><span className="text-(--text) font-semibold">N</span> — Total number of animals in the population.</li>
    <li><span className="text-(--text) font-semibold">I₀</span> — Animals that start as Infectious on day 0.</li>
    <li><span className="text-(--text) font-semibold">β</span> — Transmission probability per contact per day.</li>
    <li><span className="text-(--text) font-semibold">1/σ</span> — Average incubation period in days.</li>
    <li><span className="text-(--text) font-semibold">1/γ</span> — Average recovery period in days.</li>
  </ul>
)

export default function ControlPanel({ params, running, onChange, mini = false, maxN, animal = 'sheep', onAnimalChange }: ControlPanelProps) {
  const r0      = params.beta / params.gamma
  const r0Color = r0 > 1 ? 'var(--seir-i)' : 'var(--seir-r)'
  const r0Hint  = r0 >= 1
    ? `1 infected → ~${Math.round(r0)} new cases`
    : '1 infected → <1 new case'

  return (
    <div className={`bg-(--card) border border-(--border) rounded-lg flex flex-col gap-3 ${mini ? 'p-3' : 'p-4'}`}>
      {!mini && (
        <div className="flex items-center justify-between border-b border-(--border) pb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-(--muted)">Parameters</p>
          <Tooltip content={PARAM_TOOLTIP}>
            <span className="cursor-help text-(--muted) hover:text-(--text) transition-colors">
              <Info size={13} />
            </span>
          </Tooltip>
        </div>
      )}
      {SLIDERS.map(({ key, label, symbol }) => {
        const range  = PARAM_RANGES[key]
        const max    = key === 'N' && maxN !== undefined ? maxN : range.max
        const locked = running && (key === 'N' || key === 'I0')
        return (
          <ParameterSlider
            key={key}
            label={mini ? symbol : label}
            symbol={mini ? undefined : symbol}
            value={params[key]}
            min={range.min}
            max={max}
            step={range.step}
            display={formatDisplay(key, params[key])}
            disabled={locked}
            onChange={v => onChange(key, v)}
          />
        )
      })}

      <div className="flex flex-col gap-0.5 pt-2 border-t border-(--border)">
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-(--text)">R₀ =</span>
          <span className="font-(family-name:--font-jetbrains-mono) text-sm font-bold" style={{ color: r0Color }}>
            {r0.toFixed(2)}
          </span>
        </div>
        <span className="text-[11px] text-(--muted)">{r0Hint}</span>
      </div>

      {onAnimalChange && (
        <>
          <div className="flex items-center justify-between border-b border-(--border) pb-2 mt-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-(--muted)">Animal</p>
            <Tooltip content="Different animals don't affect simulation characteristics. They only provide more visual variety :)">
              <span className="cursor-help text-(--muted) hover:text-(--text) transition-colors">
                <Info size={13} />
              </span>
            </Tooltip>
          </div>
          <AnimalDropdown value={animal} onChange={onAnimalChange} />
        </>
      )}
    </div>
  )
}
