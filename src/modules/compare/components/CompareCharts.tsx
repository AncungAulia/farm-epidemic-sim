'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { COMPARE_BLOCK_COLORS } from '@/src/utils/constants'
import type { SEIRSnapshot } from '@/src/utils/simulation-engine'

interface BlockResult {
  index:     number
  snapshots: SEIRSnapshot[]
  peakI:     number
}

interface CompareChartsProps {
  results: BlockResult[]
}

const TOOLTIP_STYLE = {
  background: '#161b22',
  border: '1px solid #30363d',
  borderRadius: '6px',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: 12,
}

export default function CompareCharts({ results }: CompareChartsProps) {
  // Merge all snapshots into one array keyed by day for the line chart
  const maxDay = results.length > 0 ? Math.max(...results.map(r => r.snapshots.at(-1)?.day ?? 0)) : 0
  const lineData: Record<number, Record<string, number>> = {}
  for (let d = 0; d <= maxDay; d++) lineData[d] = { day: d }
  results.forEach((r, i) => {
    r.snapshots.forEach(s => {
      if (!lineData[s.day]) lineData[s.day] = { day: s.day }
      lineData[s.day][`sim${i + 1}`] = s.I
    })
  })
  const lineChartData = Object.values(lineData).sort((a, b) => a.day - b.day)

  // Bar chart data
  const barData = results.map((r, i) => ({
    name:  `Sim #${i + 1}`,
    peak:  r.peakI,
    color: COMPARE_BLOCK_COLORS[i],
  }))

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-(--text) mb-4 pb-3 border-b border-(--border)">
        Comparative Analysis
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Infectious Over Time overlay */}
        <div className="bg-(--card) border border-(--border) rounded-lg p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-(--muted) mb-4">
            Infectious Over Time
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#8b949e' }} />
                {results.map((_, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={`sim${i + 1}`}
                    stroke={COMPARE_BLOCK_COLORS[i]}
                    dot={false}
                    strokeWidth={2}
                    name={`Sim #${i + 1}`}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Infections bar chart */}
        <div className="bg-(--card) border border-(--border) rounded-lg p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-(--muted) mb-4">
            Peak Infections per Simulation
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#8b949e' }} />
                <Bar dataKey="peak" name="Peak Infectious" radius={[4, 4, 0, 0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
