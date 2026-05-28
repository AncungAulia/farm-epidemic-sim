'use client'

import { Info } from 'lucide-react'
import { SEIR_COLORS } from '@/src/utils/constants'
import type { SEIRState } from '@/src/utils/agent'
import Tooltip from './Tooltip'

interface SEIRCounterProps {
  state: SEIRState
  count: number
  mini?: boolean
}

const LABELS: Record<SEIRState, string> = {
  S: 'Susceptible',
  E: 'Exposed',
  I: 'Infectious',
  R: 'Recovered',
}

const TOOLTIPS: Record<SEIRState, string> = {
  S: 'Healthy animals that have not yet been exposed to the disease.',
  E: 'Animals that have been infected but are not yet contagious. Still in the incubation period.',
  I: 'Animals actively carrying and spreading the disease.',
  R: 'Animals that have recovered and are now immune.',
}

export default function SEIRCounter({ state, count, mini = false }: SEIRCounterProps) {
  const color = SEIR_COLORS[state]

  if (mini) {
    return (
      <div className="flex items-center gap-1.5 font-(family-name:--font-jetbrains-mono) text-xs font-semibold">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="text-(--muted)">{state}:</span>
        <span style={{ color }}>{count}</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center gap-2.5 bg-(--card) border border-(--border) rounded-lg px-3 py-2 min-w-20">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-(--muted)">
            {LABELS[state]}
          </span>
          <Tooltip content={TOOLTIPS[state]}>
            <span className="cursor-help text-(--muted) hover:text-(--text) transition-colors">
              <Info size={10} />
            </span>
          </Tooltip>
        </div>
        <span
          className="font-(family-name:--font-jetbrains-mono) text-lg font-bold leading-tight"
          style={{ color }}
        >
          {count}
        </span>
      </div>
    </div>
  )
}
