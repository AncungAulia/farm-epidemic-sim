"use client";

import { useRef, useEffect, useCallback, memo } from "react";
import type { Agent } from "@/src/utils/agent";
import {
  SPRITE,
  SEIR_COLORS,
  DIRECTION,
  ANIMAL_CONFIGS,
  type AnimalType,
} from "@/src/utils/constants";
import Button from "@/src/components/elements/Button";
import { Pause } from "lucide-react";

interface EndStats {
  day: number;
  attackRate: number;
  peakI: number;
}

interface SimulationCanvasProps {
  agentsRef: React.RefObject<Agent[]>;
  canvasWidth: number;
  canvasHeight: number;
  dayRef: React.RefObject<number>;
  animal?: AnimalType;
  simState?: "idle" | "running" | "paused";
  endStats?: EndStats | null;
  onClear?: () => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function SimulationCanvas({
  agentsRef,
  canvasWidth,
  canvasHeight,
  dayRef,
  animal = "sheep",
  simState,
  endStats,
  onClear,
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetRef = useRef<HTMLImageElement | null>(null);
  const grassRef = useRef<HTMLImageElement | null>(null);
  const patternRef = useRef<CanvasPattern | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cfg = ANIMAL_CONFIGS[animal];
    sheetRef.current = null; // invalidate while loading
    Promise.all([loadImage(cfg.sheet), loadImage("/assets/grass.png")])
      .then(([sheet, grass]) => {
        sheetRef.current = sheet;
        grassRef.current = grass;
        patternRef.current = null;
      })
      .catch(() => {});
  }, [animal]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      rafRef.current = requestAnimationFrame(render);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(render);
      return;
    }

    const W = canvasWidth;
    const H = canvasHeight;

    // ── Clear + Background ───────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);
    if (grassRef.current) {
      if (!patternRef.current) {
        const p = ctx.createPattern(grassRef.current, "repeat");
        if (p) patternRef.current = p;
      }
      ctx.fillStyle = patternRef.current ?? "#2d4a1e";
    } else {
      ctx.fillStyle = "#2d4a1e";
    }
    ctx.fillRect(0, 0, W, H);

    // ── Draw agents ──────────────────────────────────────────────────────
    const agents = agentsRef.current;
    const sheet = sheetRef.current;

    const { frameW, frameH } = ANIMAL_CONFIGS[animal];

    for (let i = 0; i < agents.length; i++) {
      const { x, y, state, direction, frameIndex } = agents[i];
      const color = SEIR_COLORS[state];
      const footY = y + 10;

      // ── SEIR indicator: oval di kaki ─────────────────────────────────
      const [r, g, b] = hexToRgb(color);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.ellipse(x, footY, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // ── Sprite — row mapping sesuai layout craftpix ─────────────────
      if (sheet) {
        const isIdle = agents[i].isIdle;
        const maxCol = isIdle ? SPRITE.IDLE_COLS : SPRITE.WALK_COLS;
        const col = Math.min(Math.max(frameIndex, 0), maxCol - 1);
        const srcX = col * frameW;

        let row: number;
        if (isIdle) {
          row =
            direction === DIRECTION.DOWN
              ? SPRITE.ROW_IDLE_DOWN
              : direction === DIRECTION.UP
                ? SPRITE.ROW_IDLE_UP
                : direction === DIRECTION.LEFT
                  ? SPRITE.ROW_IDLE_LEFT
                  : SPRITE.ROW_IDLE_RIGHT;
        } else {
          row =
            direction === DIRECTION.DOWN
              ? SPRITE.ROW_WALK_DOWN
              : direction === DIRECTION.UP
                ? SPRITE.ROW_WALK_UP
                : direction === DIRECTION.LEFT
                  ? SPRITE.ROW_WALK_LEFT
                  : SPRITE.ROW_WALK_RIGHT;
        }

        const srcY = row * frameH;
        ctx.drawImage(
          sheet,
          srcX,
          srcY,
          frameW,
          frameH,
          Math.round(x - frameW / 2),
          Math.round(y - frameH / 2),
          frameW,
          frameH,
        );
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    rafRef.current = requestAnimationFrame(render);
  }, [canvasWidth, canvasHeight, agentsRef, animal]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  return (
    <div
      className="relative rounded-lg overflow-hidden border border-(--border)"
      style={{ aspectRatio: `${canvasWidth}/${canvasHeight}` }}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="w-full h-full block"
      />

      {simState === "paused" && (
        <div
          className="fade-in absolute inset-0 flex flex-row items-center justify-center gap-1"
          style={{ background: "rgba(13,17,23,0.72)" }}
        >
          <Pause size={18} className="text-(--accent)" />
          <span className="font-(family-name:--font-jetbrains-mono) text-base font-bold tracking-widest text-(--accent)">
            PAUSED
          </span>
        </div>
      )}

      {simState === "idle" && endStats && (
        <div
          className="fade-in absolute inset-0 flex flex-col items-center justify-center gap-4"
          style={{ background: "rgba(13,17,23,0.82)" }}
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-bold text-base tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              Simulation Ended
            </span>
            <span className="font-(family-name:--font-jetbrains-mono) text-xs text-(--muted)">
              Day {endStats.day}
            </span>
          </div>

          <div className="flex gap-6 font-(family-name:--font-jetbrains-mono) text-xs">
            <div className="flex flex-col items-center gap-0.5">
              <span className="uppercase tracking-widest text-[10px] text-(--muted)">
                Attack Rate
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--seir-i)" }}
              >
                {endStats.attackRate}%
              </span>
            </div>
            <div className="w-px bg-(--border)" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="uppercase tracking-widest text-[10px] text-(--muted)">
                Peak Infectious
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--seir-i)" }}
              >
                {endStats.peakI}
              </span>
            </div>
          </div>

          {onClear && (
            <Button variant="outline" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(SimulationCanvas);
