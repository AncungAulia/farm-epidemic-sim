"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { X, ChevronRight, Play, Pause, Square } from "lucide-react";
import { Drawer } from "vaul";
import Button from "@/src/components/elements/Button";
import SpeedControl from "@/src/components/elements/SpeedControl";
import { AnimalSprite } from "@/src/components/elements/AnimalDropdown";
import SimulationCanvas from "@/src/components/shared/SimulationCanvas";
import type { Agent, SEIRState } from "@/src/utils/agent";
import { DIRECTION } from "@/src/utils/constants";

const SEIR_STATES = [
  {
    key: "S",
    label: "Susceptible",
    color: "var(--seir-s)",
    desc: "Healthy animals that can still catch the disease.",
  },
  {
    key: "E",
    label: "Exposed",
    color: "var(--seir-e)",
    desc: "Infected but not yet contagious, still in incubation.",
  },
  {
    key: "I",
    label: "Infectious",
    color: "var(--seir-i)",
    desc: "Actively sick and spreading the disease.",
  },
  {
    key: "R",
    label: "Recovered",
    color: "var(--seir-r)",
    desc: "Immune and no longer contagious.",
  },
];

function ResultsDemo() {
  const agentsRef = useRef<Agent[]>([])
  const dayRef    = useRef(47)
  const [endStats, setEndStats] = useState<{ day: number; attackRate: number; peakI: number } | null>(null)

  useEffect(() => {
    const mk = (id: number, x: number, y: number, state: SEIRState): Agent => ({
      id, x, y, vx: 0, vy: 0, state,
      direction: DIRECTION.DOWN, frameIndex: 0, frameTimer: 0,
      daysInState: 0, isIdle: true, idleTimer: 9999,
    })
    const states: SEIRState[] = [
      'S','R','S','R','S','R','S','R','S','R',
      'S','R','R','R','R','S','R','R','R','S',
      'R','R','S','R','R',
    ]
    const MIN_DIST = 34
    const placed: { x: number; y: number }[] = []
    const rndPos  = () => ({ x: 28 + Math.random() * 320, y: 28 + Math.random() * 154 })
    agentsRef.current = states.map((state, id) => {
      let pos = rndPos()
      for (let i = 0; i < 50; i++) {
        const ok = placed.every(p => {
          const dx = p.x - pos.x, dy = p.y - pos.y
          return Math.sqrt(dx * dx + dy * dy) >= MIN_DIST
        })
        if (ok) break
        pos = rndPos()
      }
      placed.push(pos)
      return mk(id, pos.x, pos.y, state)
    })
    const t = setTimeout(() => setEndStats({ day: 47, attackRate: 83, peakI: 12 }), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <SimulationCanvas
      agentsRef={agentsRef}
      canvasWidth={380}
      canvasHeight={210}
      dayRef={dayRef}
      animal="sheep"
      simState={endStats ? 'idle' : 'running'}
      endStats={endStats}
    />
  )
}

function RunControls() {
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed]   = useState<1 | 2 | 5>(1)

  return (
    <div className="flex flex-col gap-2.5">
      {[
        {
          btn: <Button className="w-24 justify-center shrink-0"><Play size={13} /> Start</Button>,
          desc: 'Begin. Animals will appear and start moving.',
        },
        {
          btn: (
            <Button className="w-24 justify-center shrink-0" onClick={() => setPaused(p => !p)}>
              {paused ? <><Play size={15} /> Resume</> : <><Pause size={15} /> Pause</>}
            </Button>
          ),
          desc: 'Freeze the simulation to inspect the current state.',
        },
        {
          btn: <SpeedControl value={speed} onChange={setSpeed} className="shrink-0" />,
          desc: 'Speed up time, useful for long outbreaks.',
        },
        {
          btn: <Button variant="outline" className="w-24 justify-center shrink-0"><Square size={13} /> Stop</Button>,
          desc: 'Reset everything and return to idle.',
        },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          {item.btn}
          <span className="text-xs text-(--muted)">{item.desc}</span>
        </div>
      ))}
    </div>
  )
}

const STEPS: { title: string; content: React.ReactNode }[] = [
  {
    title: "Welcome to Farm Epidemic Simulator",
    content: (
      <div className="flex flex-col items-center gap-4 text-center">
        <AnimalSprite animal="sheep" size={72} />
        <div className="flex flex-col gap-2">
          <p className="text-sm text-(--muted) leading-relaxed">
            This simulator lets you model how a disease spreads through a closed
            farm population using the{" "}
            <span className="text-(--text) font-semibold">SEIR</span> framework,
            a standard approach in epidemiology.
          </p>
          <p className="text-sm text-(--muted) leading-relaxed">
            Adjust parameters like transmission rate and recovery time, watch
            the outbreak unfold in real time, and compare different scenarios
            side by side.
          </p>
          <p className="text-xs text-(--muted) mt-1">
            This short guide will walk you through everything in 5 steps.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "What is SEIR?",
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-(--muted)">
          SEIR is a model for how disease spreads through a closed population.
          Every animal is always in one of four states:
        </p>
        <div className="flex items-center justify-between gap-1">
          {SEIR_STATES.map((s, i) => (
            <Fragment key={s.key}>
              {i > 0 && (
                <ChevronRight size={13} className="text-(--muted) shrink-0" />
              )}
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <div className="relative z-10">
                    <AnimalSprite animal="sheep" size={40} />
                  </div>
                  <div
                    className="absolute z-0"
                    style={{
                      width: "28px",
                      height: "11px",
                      borderRadius: "50%",
                      background: s.color,
                      opacity: 0.65,
                      bottom: "3px",
                      left: "50%",
                      transform: "translateX(-52%)",
                    }}
                  />
                </div>
                <span className="text-[9px] text-(--muted) text-center leading-tight">
                  {s.label}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {SEIR_STATES.map((s) => (
            <div key={s.key} className="flex items-start gap-2 text-xs">
              <span
                className="font-(family-name:--font-jetbrains-mono) font-bold shrink-0 w-4"
                style={{ color: s.color }}
              >
                {s.key}
              </span>
              <span className="text-(--muted)">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Configure Parameters",
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-(--muted)">
          Use the control panel on the right to shape how the outbreak evolves:
        </p>
        <div className="flex flex-col gap-2">
          {[
            { symbol: "N", desc: "Total animals in the farm" },
            { symbol: "I₀", desc: "Animals infectious on Day 0" },
            {
              symbol: "β",
              desc: "Spread probability per contact per day (0–1)",
            },
            { symbol: "1/σ", desc: "Average incubation period in days" },
            { symbol: "1/γ", desc: "Average recovery period in days" },
          ].map((p) => (
            <div key={p.symbol} className="flex items-start gap-3 text-xs">
              <span className="font-(family-name:--font-jetbrains-mono) font-bold text-(--accent) shrink-0 w-7 text-right">
                {p.symbol}
              </span>
              <span className="text-(--muted)">{p.desc}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-(--border) bg-(--card) px-3 py-2.5 flex flex-col gap-1">
          <span className="font-(family-name:--font-jetbrains-mono) text-xs font-bold text-(--text)">
            R₀ = β / γ
          </span>
          <span className="text-xs text-(--muted)">
            If R₀ &gt; 1 the outbreak will grow. If R₀ &lt; 1 it will fade
            naturally. Watch it update live as you adjust the sliders.
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Run the Simulation",
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-(--muted)">
          Once parameters are set, start the simulation and watch the outbreak
          unfold in real time on the canvas.
        </p>
        <RunControls />
      </div>
    ),
  },
  {
    title: "Read the Results",
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-(--muted)">
          When the outbreak ends, a summary appears directly on the canvas.
          Watch the overlay appear:
        </p>
        <ResultsDemo />
        <p className="text-xs text-(--muted)">
          The chart below the canvas tracks how each state evolved over the
          entire outbreak. Click <span className="text-(--text) font-semibold">Clear</span> on
          the overlay or <span className="text-(--text) font-semibold">Stop</span> to reset.
        </p>
      </div>
    ),
  },
  {
    title: "Compare Scenarios",
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-(--muted)">
          Head to <span className="font-semibold text-(--text)">Compare</span>{" "}
          to run up to 5 simulations side by side with different parameters.
        </p>
        <div className="flex gap-2">
          {[
            {
              color: "var(--seir-s)",
              label: "Sim #1",
              beta: "0.30",
              gamma: "10 days",
            },
            {
              color: "var(--seir-i)",
              label: "Sim #2",
              beta: "0.60",
              gamma: "10 days",
            },
            {
              color: "var(--seir-r)",
              label: "Sim #3",
              beta: "0.10",
              gamma: "10 days",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-lg border bg-(--bg) p-2.5 flex flex-col gap-1"
              style={{ borderColor: s.color + "80" }}
            >
              <span
                className="font-(family-name:--font-jetbrains-mono) text-[10px] font-bold"
                style={{ color: s.color }}
              >
                {s.label}
              </span>
              <span className="text-[9px] text-(--muted)">β = {s.beta}</span>
              <span className="text-[9px] text-(--muted)">1/γ = {s.gamma}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-(--muted)">
          Compare overlay charts and peak infection bars to understand how each
          parameter affects outbreak severity. Great for sensitivity analysis!
        </p>
      </div>
    ),
  },
];

interface ContentProps {
  step: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  showClose?: boolean;
}

function StepContent({
  step,
  total,
  onNext,
  onPrev,
  onClose,
  showClose = true,
}: ContentProps) {
  const isFirst = step === 0;
  const isLast = step === total - 1;

  return (
    <div className="flex flex-col gap-5">
      {/* X button — hanya desktop */}
      {showClose && (
        <div className="flex justify-end -mb-2">
          <button
            onClick={onClose}
            className="text-(--muted) hover:text-(--text) cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Title + content */}
      <div key={step} className="page-enter flex flex-col gap-3">
        <h2 className="text-base text-center font-bold text-(--text)">
          {STEPS[step].title}
        </h2>
        {STEPS[step].content}
      </div>

      {/* Bottom: dots (kiri, hidden mobile) + tombol (kanan) */}
      <div className="flex items-center justify-between gap-2">
        <div className="hidden sm:flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-200"
              style={{
                width: i === step ? "18px" : "6px",
                background: i === step ? "var(--accent)" : "var(--border)",
              }}
            />
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isFirst && (
            <Button
              variant="outline"
              onClick={onPrev}
              className="flex-1 sm:flex-none"
            >
              Prev
            </Button>
          )}
          <Button onClick={onNext} className="flex-1 sm:flex-none">
            {isLast ? "Got it!" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface HowToSimulateProps {
  open: boolean;
  onClose: () => void;
}

export default function HowToSimulate({ open, onClose }: HowToSimulateProps) {
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  const handleNext = () => {
    if (step === STEPS.length - 1) onClose();
    else setStep((s) => s + 1);
  };

  const handlePrev = () => setStep((s) => Math.max(0, s - 1));

  const contentProps: ContentProps = {
    step,
    total: STEPS.length,
    onNext: handleNext,
    onPrev: handlePrev,
    onClose,
  };

  if (isMobile) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={(v) => {
          if (!v) onClose();
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-(--border) outline-none overflow-hidden"
            style={{ background: "var(--panel)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-(--border)" />
            </div>
            <div className="px-6 pb-6 pt-2">
              <StepContent {...contentProps} showClose={false} />
            </div>
            {/* Progress bar tipis di paling bawah */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--border)">
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                  width: `${((step + 1) / STEPS.length) * 100}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="page-enter relative z-10 w-full max-w-md rounded-2xl border border-(--border) p-6 shadow-2xl"
        style={{ background: "var(--panel)" }}
      >
        <StepContent {...contentProps} />
      </div>
    </div>
  );
}
