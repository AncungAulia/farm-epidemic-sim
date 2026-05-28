'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { SEIR_COLORS } from '@/src/utils/constants'
import type { SEIRSnapshot } from '@/src/utils/simulation-engine'

interface SEIRChartProps {
  data: SEIRSnapshot[]
}

export default function SEIRChart({ data }: SEIRChartProps) {
  return (
    <div className="bg-(--card) border border-(--border) rounded-lg p-5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-(--muted) mb-4">
        SEIR Dynamics
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Day', position: 'insideBottomRight', offset: -4, fill: '#8b949e', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: '#8b949e', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                fontFamily: 'var(--font-jetbrains-mono)',
                fontSize: 12,
              }}
              labelStyle={{ color: '#8b949e' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-inter)', paddingTop: 8 }}
            />
            <Line type="monotone" dataKey="S" stroke={SEIR_COLORS.S} dot={false} strokeWidth={2} name="Susceptible" />
            <Line type="monotone" dataKey="E" stroke={SEIR_COLORS.E} dot={false} strokeWidth={2} name="Exposed" />
            <Line type="monotone" dataKey="I" stroke={SEIR_COLORS.I} dot={false} strokeWidth={2} name="Infectious" />
            <Line type="monotone" dataKey="R" stroke={SEIR_COLORS.R} dot={false} strokeWidth={2} name="Recovered" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
