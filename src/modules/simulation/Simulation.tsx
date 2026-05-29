'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, Square } from 'lucide-react'
import SimulationCanvas from '@/src/components/shared/SimulationCanvas'
import ControlPanel     from '@/src/components/shared/ControlPanel'
import StatusBar        from '@/src/components/elements/StatusBar'
import SEIRCounter      from '@/src/components/elements/SEIRCounter'
import Button           from '@/src/components/elements/Button'
import SEIRChart        from './components/SEIRChart'
import {
  initAgents, visualTick, logicTick, countSEIR,
  isOutbreakOver, type SimParams, type SEIRSnapshot,
} from '@/src/utils/simulation-engine'
import { DEFAULT_PARAMS, CANVAS_WIDTH, CANVAS_HEIGHT, FRAMES_PER_DAY, type AnimalType } from '@/src/utils/constants'
import type { Agent } from '@/src/utils/agent'

type SimState = 'idle' | 'running' | 'paused'
type Speed    = 1 | 2 | 5

export default function Simulation() {
  const [params, setParams]       = useState<SimParams>(DEFAULT_PARAMS)
  const [animal, setAnimal]       = useState<AnimalType>('sheep')
  const [simState, setSimState]   = useState<SimState>('idle')
  const [speed, setSpeed]         = useState<Speed>(1)
  const [day, setDay]             = useState(0)
  const [counts, setCounts]       = useState<{ S: number; E: number; I: number; R: number }>({ S: DEFAULT_PARAMS.N - DEFAULT_PARAMS.I0, E: 0, I: DEFAULT_PARAMS.I0, R: 0 })
  const [chartData, setChartData] = useState<SEIRSnapshot[]>([])
  const [endStats, setEndStats]   = useState<{ day: number; attackRate: number; peakI: number } | null>(null)

  const agentsRef   = useRef<Agent[]>([])
  const frameRef    = useRef(0)
  const dayRef      = useRef(0)
  const peakIRef    = useRef(0)
  const simStateRef = useRef<SimState>('idle')
  const speedRef    = useRef<Speed>(1)
  const paramsRef   = useRef<SimParams>(DEFAULT_PARAMS)
  const rafRef      = useRef<number>(0)

  simStateRef.current = simState
  speedRef.current    = speed
  paramsRef.current   = params

  const loop = useCallback(() => {
    if (simStateRef.current !== 'running') return

    const framesPerDay = Math.floor(FRAMES_PER_DAY / speedRef.current)

    // Visual tick setiap frame — canvas baca langsung dari agentsRef
    visualTick(agentsRef.current, CANVAS_WIDTH, CANVAS_HEIGHT, undefined, speedRef.current)

    frameRef.current++

    // Logic tick setiap N frame = 1 hari
    if (frameRef.current % framesPerDay === 0) {
      logicTick(agentsRef.current, paramsRef.current)

      dayRef.current++
      const c = countSEIR(agentsRef.current)
      if (c.I > peakIRef.current) peakIRef.current = c.I
      setCounts(c)
      setDay(dayRef.current)
      setChartData(prev => [...prev, { day: dayRef.current, ...c }])

      if (isOutbreakOver(agentsRef.current)) {
        setEndStats({
          day:        dayRef.current,
          attackRate: Math.round((c.R / paramsRef.current.N) * 100),
          peakI:      peakIRef.current,
        })
        setSimState('idle')
        return
      }
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [])

  useEffect(() => {
    if (simState === 'running') {
      rafRef.current = requestAnimationFrame(loop)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [simState, loop])

  const handleStart = () => {
    agentsRef.current = initAgents(params, CANVAS_WIDTH, CANVAS_HEIGHT)
    frameRef.current  = 0
    dayRef.current    = 0
    peakIRef.current  = params.I0
    setEndStats(null)
    setDay(0)
    setChartData([{ day: 0, ...countSEIR(agentsRef.current) }])
    setCounts(countSEIR(agentsRef.current))
    setSimState('running')
  }

  const handlePauseResume = () =>
    setSimState(prev => prev === 'running' ? 'paused' : 'running')

  const handleStop = () => {
    cancelAnimationFrame(rafRef.current)
    agentsRef.current = []
    dayRef.current    = 0
    setEndStats(null)
    setSimState('idle')
    setDay(0)
    setChartData([])
    setCounts({ S: params.N - params.I0, E: 0, I: params.I0, R: 0 })
  }

  const primaryBtn = simState === 'idle'    ? { label: <><Play   size={14} /> Start</>,  onClick: handleStart }
                   : simState === 'running' ? { label: <><Pause  size={14} /> Pause</>,  onClick: handlePauseResume }
                   :                          { label: <><Play   size={14} /> Resume</>, onClick: handlePauseResume }

  return (
    <main className="container mx-auto px-4 md:px-6 py-4 flex flex-col gap-3 max-w-310">

      <div className="mb-2">
        <h1 className="text-xl font-bold text-(--text)">Simulate</h1>
        <p className="text-sm text-(--muted) mt-1">
          Run a stochastic SEIR simulation and observe how an epidemic spreads through a closed farm population.
        </p>
      </div>

      <StatusBar day={day} total={params.N} speed={speed} onSpeed={setSpeed} />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-3">
        <SimulationCanvas
          agentsRef={agentsRef}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          dayRef={dayRef}
          animal={animal}
          simState={simState}
          endStats={endStats}
          onClear={handleStop}
        />
        <ControlPanel
          params={params}
          running={simState !== 'idle'}
          onChange={(k, v) => setParams(p => ({ ...p, [k]: v }))}
          animal={animal}
          onAnimalChange={setAnimal}
        />
      </div>

      {/* Mobile only: tombol langsung di bawah canvas */}
      <div className="flex gap-2 sm:hidden">
        <Button className="flex-1" onClick={primaryBtn.onClick}>{primaryBtn.label}</Button>
        <Button className="flex-1" variant="outline" onClick={handleStop} disabled={simState === 'idle'}><Square size={14} /> Stop</Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1 sm:flex-wrap">
          {(['S', 'E', 'I', 'R'] as const).map(s => (
            <SEIRCounter key={s} state={s} count={counts[s]} />
          ))}
        </div>
        {/* Desktop only: tombol di samping counter */}
        <div className="hidden sm:flex gap-2 shrink-0">
          <Button onClick={primaryBtn.onClick}>{primaryBtn.label}</Button>
          <Button variant="outline" onClick={handleStop} disabled={simState === 'idle'}><Square size={14} /> Stop</Button>
        </div>
      </div>

      <SEIRChart data={chartData} />

    </main>
  )
}
