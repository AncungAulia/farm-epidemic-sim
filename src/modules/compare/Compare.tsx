'use client'

import { useState, useCallback } from 'react'
import { Play, Square } from 'lucide-react'
import SimBlock      from './components/SimBlock'
import CompareCharts from './components/CompareCharts'
import Button        from '@/src/components/elements/Button'
import SpeedControl  from '@/src/components/elements/SpeedControl'
import { COMPARE_MAX_BLOCKS, COMPARE_BLOCK_COLORS } from '@/src/utils/constants'
import type { SEIRSnapshot } from '@/src/utils/simulation-engine'

type Speed = 1 | 2 | 5

interface BlockResult {
  index:     number
  snapshots: SEIRSnapshot[]
  peakI:     number
}

interface BlockEntry {
  id: number
}

let nextId = 0

export default function Compare() {
  const [blocks, setBlocks]       = useState<BlockEntry[]>([{ id: nextId++ }])
  const [results, setResults]     = useState<BlockResult[]>([])
  const [startAll, setStartAll]   = useState(0)
  const [stopAll,  setStopAll]    = useState(0)
  const [speed, setSpeed]         = useState<Speed>(1)
  const [removing, setRemoving]   = useState<Set<number>>(new Set())

  const handleUpdate = useCallback((index: number, snapshots: SEIRSnapshot[], peakI: number) => {
    setResults(prev => {
      const next = prev.filter(r => r.index !== index)
      return [...next, { index, snapshots, peakI }].sort((a, b) => a.index - b.index)
    })
  }, [])

  const handleRemove = useCallback((index: number) => {
    setRemoving(prev => new Set(prev).add(index))
    setTimeout(() => {
      setBlocks(prev => prev.filter((_, i) => i !== index))
      setResults(prev => prev.filter(r => r.index !== index))
      setRemoving(prev => { const s = new Set(prev); s.delete(index); return s })
    }, 250)
  }, [])

  const handleAdd = () => {
    if (blocks.length >= COMPARE_MAX_BLOCKS) return
    setBlocks(prev => [...prev, { id: nextId++ }])
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-5 max-w-310">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-(--text)">Comparative Analysis</h1>
          <p className="text-sm text-(--muted) mt-1">
            Add multiple simulations with different parameters and compare the results.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse sm:items-center sm:shrink-0">
          <div className="w-full sm:w-auto">
            <SpeedControl value={speed} onChange={setSpeed} className="w-full [&>button]:flex-1 sm:w-auto sm:[&>button]:flex-none" />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 sm:flex-none" onClick={() => setStartAll(n => n + 1)}><Play size={14} /> Run All</Button>
            <Button className="flex-1 sm:flex-none" variant="outline" onClick={() => setStopAll(n => n + 1)}><Square size={14} /> Stop All</Button>
          </div>
        </div>
      </div>

      {/* Simulation Blocks */}
      <div className="flex flex-col gap-4 mb-4">
        {blocks.map((block, index) => (
          <div key={block.id} className={removing.has(index) ? 'page-exit' : 'page-enter'}>
            <SimBlock
              index={index}
              color={COMPARE_BLOCK_COLORS[index % COMPARE_BLOCK_COLORS.length]}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              startTrigger={startAll}
              stopTrigger={stopAll}
              speed={speed}
            />
          </div>
        ))}
      </div>

      {/* Add button */}
      {blocks.length < COMPARE_MAX_BLOCKS && (
        <button
          onClick={handleAdd}
          className="w-full py-3 border-2 border-dashed border-(--border) rounded-xl text-sm font-semibold text-(--muted) hover:border-(--accent) hover:text-(--accent) transition-all duration-150 cursor-pointer"
        >
          + Add Simulation
        </button>
      )}
      {blocks.length >= COMPARE_MAX_BLOCKS && (
        <p className="text-center text-xs text-(--muted) py-2">Maximum {COMPARE_MAX_BLOCKS} simulations</p>
      )}

      {/* Comparative charts */}
      <CompareCharts results={results} />

    </main>
  )
}
