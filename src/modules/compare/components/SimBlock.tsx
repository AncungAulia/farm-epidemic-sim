"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, Square, ChevronUp, ChevronDown, Check } from "lucide-react";
import SimulationCanvas from "@/src/components/shared/SimulationCanvas";
import ControlPanel from "@/src/components/shared/ControlPanel";
import SEIRCounter from "@/src/components/elements/SEIRCounter";
import Button from "@/src/components/elements/Button";
import {
  initAgents,
  visualTick,
  logicTick,
  countSEIR,
  isOutbreakOver,
  type SimParams,
  type SEIRSnapshot,
} from "@/src/utils/simulation-engine";
import {
  DEFAULT_PARAMS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FRAMES_PER_DAY,
  COMPARE_MAX_AGENTS,
  type AnimalType,
} from "@/src/utils/constants";

type Speed = 1 | 2 | 5

interface SimBlockProps {
  index: number;
  color: string;
  onUpdate: (index: number, snapshots: SEIRSnapshot[], peakI: number) => void;
  onRemove: (index: number) => void;
  onFinish?: (index: number, done: boolean) => void;
  startTrigger?: number;
  stopTrigger?: number;
  speed?: Speed;
}

type SimState = "idle" | "running" | "paused";

export default function SimBlock({
  index,
  color,
  onUpdate,
  onRemove,
  onFinish,
  startTrigger = 0,
  stopTrigger = 0,
  speed = 1,
}: SimBlockProps) {
  const [params, setParams] = useState<SimParams>({ ...DEFAULT_PARAMS, N: 100 });
  const [animal, setAnimal] = useState<AnimalType>('sheep');
  const [simState, setSimState] = useState<SimState>("idle");
  const [finished, setFinished] = useState(false);
  const [endStats, setEndStats] = useState<{ day: number; attackRate: number; peakI: number } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [day, setDay] = useState(0);
  const [counts, setCounts] = useState<{
    S: number;
    E: number;
    I: number;
    R: number;
  }>({
    S: COMPARE_MAX_AGENTS - DEFAULT_PARAMS.I0,
    E: 0,
    I: DEFAULT_PARAMS.I0,
    R: 0,
  });

  const agentsRef = useRef<ReturnType<typeof initAgents>>([]);
  const frameRef = useRef(0);
  const dayRef = useRef(0);
  const simStateRef = useRef<SimState>("idle");
  const paramsRef = useRef<SimParams>(params);
  const snapshotsRef = useRef<SEIRSnapshot[]>([]);
  const peakIRef = useRef(0);
  const rafRef = useRef<number>(0);

  simStateRef.current = simState;
  paramsRef.current = params;

  const speedRef = useRef<Speed>(1)
  speedRef.current = speed

  const loop = useCallback(() => {
    if (simStateRef.current !== "running") return;

    visualTick(agentsRef.current, CANVAS_WIDTH, CANVAS_HEIGHT, undefined, speedRef.current);

    frameRef.current++;

    const framesPerDay = Math.floor(FRAMES_PER_DAY / speedRef.current)
    if (frameRef.current % framesPerDay === 0) {
      logicTick(agentsRef.current, paramsRef.current);
      dayRef.current++;
      const c = countSEIR(agentsRef.current);
      setCounts(c);
      setDay(dayRef.current);

      if (c.I > peakIRef.current) peakIRef.current = c.I;
      snapshotsRef.current.push({ day: dayRef.current, ...c });
      onUpdate(index, snapshotsRef.current, peakIRef.current);

      if (isOutbreakOver(agentsRef.current)) {
        setFinished(true);
        onFinish?.(index, true);
        setEndStats({
          day:        dayRef.current,
          attackRate: Math.round((c.R / paramsRef.current.N) * 100),
          peakI:      peakIRef.current,
        });
        setSimState("idle");
        return;
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [index, onUpdate]);

  useEffect(() => {
    if (simState === "running") {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [simState, loop]);

  useEffect(() => {
    if (startTrigger > 0) handleStart();
  }, [startTrigger]);
  useEffect(() => {
    if (stopTrigger > 0) handleStop();
  }, [stopTrigger]);

  const handleStart = () => {
    agentsRef.current = initAgents(
      paramsRef.current,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );
    frameRef.current = 0;
    dayRef.current = 0;
    peakIRef.current = paramsRef.current.I0;
    snapshotsRef.current = [{ day: 0, ...countSEIR(agentsRef.current) }];
    setDay(0);
    setFinished(false);
    setEndStats(null);
    onFinish?.(index, false);
    setCounts(countSEIR(agentsRef.current));
    onUpdate(index, snapshotsRef.current, peakIRef.current);
    setSimState("running");
  };

  const handlePauseResume = () =>
    setSimState((prev) => (prev === "running" ? "paused" : "running"));

  const handleStop = () => {
    cancelAnimationFrame(rafRef.current);
    agentsRef.current = [];
    dayRef.current = 0;
    setFinished(false);
    setEndStats(null);
    onFinish?.(index, false);
    setSimState("idle");
    setDay(0);
    setCounts({ S: params.N - params.I0, E: 0, I: params.I0, R: 0 });
  };

  const primaryBtn =
    simState === "idle"
      ? {
          label: (
            <>
              <Play size={14} /> Start
            </>
          ),
          fn: handleStart,
        }
      : simState === "running"
        ? {
            label: (
              <>
                <Pause size={14} /> Pause
              </>
            ),
            fn: handlePauseResume,
          }
        : {
            label: (
              <>
                <Play size={14} /> Resume
              </>
            ),
            fn: handlePauseResume,
          };

  return (
    <div
      className="bg-(--card) border border-(--border) rounded-xl p-4"
      style={{ borderColor: color }}
    >
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronDown size={14} style={{ color }} />
          ) : (
            <ChevronUp size={14} style={{ color }} />
          )}
          <span
            className="font-(family-name:--font-jetbrains-mono) text-sm font-semibold"
            style={{ color }}
          >
            Simulation #{index + 1}
          </span>
          {simState === 'running' && (
            <span className="flex items-center gap-1 text-[10px] font-(family-name:--font-jetbrains-mono) uppercase tracking-widest" style={{ color: 'var(--seir-r)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--seir-r)' }} />
              Running
            </span>
          )}
          {simState === 'paused' && (
            <span className="flex items-center gap-1 text-[10px] font-(family-name:--font-jetbrains-mono) uppercase tracking-widest text-(--muted)">
              <Pause size={10} /> Paused
            </span>
          )}
          {finished && simState === 'idle' && (
            <span className="flex items-center gap-1 text-[10px] font-(family-name:--font-jetbrains-mono) uppercase tracking-widest" style={{ color: 'var(--seir-r)' }}>
              <Check size={10} /> Done
            </span>
          )}
        </div>
        <span className="font-(family-name:--font-jetbrains-mono) text-xs text-(--muted)">
          day {String(day).padStart(3, "0")} / n={params.N}
        </span>
      </div>

      <div className="collapsible-grid" data-open={String(!collapsed)}>
        <div className="collapsible-inner">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-3 mt-3 mb-3">
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
              running={simState !== "idle"}
              onChange={(key, val) =>
                setParams((prev) => {
                  const next = { ...prev, [key]: val }
                  if (key === 'N' && next.I0 >= val) next.I0 = Math.max(1, val - 1)
                  return next
                })
              }
              maxN={COMPARE_MAX_AGENTS}
              animal={animal}
              onAnimalChange={setAnimal}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 pt-3 border-t border-(--border)">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1 sm:flex-wrap">
              {(["S", "E", "I", "R"] as const).map((s) => (
                <SEIRCounter key={s} state={s} count={counts[s]} />
              ))}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button className="flex-1" onClick={primaryBtn.fn}>{primaryBtn.label}</Button>
              <Button className="flex-1" variant="outline" onClick={handleStop} disabled={simState === "idle"}><Square size={14} /> Stop</Button>
              <Button variant="ghost" onClick={() => onRemove(index)}>✕</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
