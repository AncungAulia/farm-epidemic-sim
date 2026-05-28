import {
  Agent, SEIRState,
  createAgent, getDirection, getSpeedMultiplier, sampleExponential,
} from './agent'
import {
  CONTACT_RADIUS, AGENT_SPEED,
  IDLE_CHANCE_PER_FRAME, IDLE_MIN_FRAMES, IDLE_MAX_FRAMES,
} from './constants'
import { DIRECTION } from './constants'

export interface SimParams {
  N:     number
  I0:    number
  beta:  number
  sigma: number
  gamma: number
}

export interface SEIRSnapshot {
  day: number
  S:   number
  E:   number
  I:   number
  R:   number
}

export function initAgents(
  params: SimParams,
  canvasWidth: number,
  canvasHeight: number,
): Agent[] {
  const { N, I0, sigma, gamma } = params
  const agents: Agent[] = []

  for (let i = 0; i < N; i++) {
    const state: SEIRState = i < I0 ? 'I' : 'S'
    agents.push(createAgent(i, state, canvasWidth, canvasHeight, sigma, gamma))
  }

  return agents
}

export function countSEIR(agents: Agent[]) {
  let S = 0, E = 0, I = 0, R = 0
  for (const a of agents) {
    if (a.state === 'S') S++
    else if (a.state === 'E') E++
    else if (a.state === 'I') I++
    else R++
  }
  return { S, E, I, R }
}

export function isOutbreakOver(agents: Agent[]): boolean {
  const { E, I } = countSEIR(agents)
  return E === 0 && I === 0
}

// ── Visual Tick: move agents (called every frame) ──────────────────────────
export function visualTick(
  agents: Agent[],
  canvasWidth: number,
  canvasHeight: number,
  FRAMES_PER_ANIM = 10,
  simSpeed = 1,
): void {
  for (const a of agents) {

    // ── Idle state: berhenti dan tengok kiri/kanan ───────────────────────
    if (a.isIdle) {
      a.idleTimer--
      a.frameTimer = (a.frameTimer + 1) % (FRAMES_PER_ANIM * 2)  // idle lebih lambat
      if (a.frameTimer === 0) {
        a.frameIndex = (a.frameIndex + 1) % 4  // idle: 4 frames
      }
      if (a.idleTimer <= 0) {
        a.isIdle    = false
        a.frameIndex = 0
        // Resume dengan salah satu cardinal baru secara random
        const spd       = AGENT_SPEED * (0.8 + Math.random() * 0.4)
        const dirs      = [[1,0],[-1,0],[0,1],[0,-1]] as const
        const [dx, dy]  = dirs[Math.floor(Math.random() * 4)]
        a.vx = dx * spd
        a.vy = dy * spd
      }
      continue
    }

    // ── Random chance jadi idle ──────────────────────────────────────────
    if (Math.random() < IDLE_CHANCE_PER_FRAME) {
      a.isIdle    = true
      a.idleTimer = IDLE_MIN_FRAMES + Math.floor(Math.random() * (IDLE_MAX_FRAMES - IDLE_MIN_FRAMES))
      // Tengok kiri atau kanan secara random
      a.direction = Math.random() < 0.5 ? DIRECTION.LEFT : DIRECTION.RIGHT
      continue
    }

    // ── Normal movement ──────────────────────────────────────────────────
    const speed = AGENT_SPEED * getSpeedMultiplier(a.state)

    a.x += a.vx * speed * simSpeed
    a.y += a.vy * speed * simSpeed

    // Bounce off walls — balik arah cardinal yang berlawanan
    const margin = 20
    if (a.x < margin)                { a.x = margin;                a.vx =  Math.abs(a.vx); a.vy = 0 }
    if (a.x > canvasWidth  - margin) { a.x = canvasWidth  - margin; a.vx = -Math.abs(a.vx); a.vy = 0 }
    if (a.y < margin)                { a.y = margin;                a.vy =  Math.abs(a.vy); a.vx = 0 }
    if (a.y > canvasHeight - margin) { a.y = canvasHeight - margin; a.vy = -Math.abs(a.vy); a.vx = 0 }

    // Random direction change — pilih cardinal baru secara acak
    if (Math.random() < 0.006) {
      const spd      = AGENT_SPEED * (0.8 + Math.random() * 0.4) * getSpeedMultiplier(a.state)
      const cardinals = [[1,0],[-1,0],[0,1],[0,-1]] as const
      const [dx, dy] = cardinals[Math.floor(Math.random() * 4)]
      a.vx = dx * spd
      a.vy = dy * spd
    }

    // Pastikan selalu cardinal (salah satu axis = 0)
    if (a.vx !== 0 && a.vy !== 0) {
      if (Math.abs(a.vx) >= Math.abs(a.vy)) a.vy = 0
      else a.vx = 0
    }

    // Update direction dan animasi walk (6 frame cycle)
    a.direction  = getDirection(a.vx, a.vy)
    a.frameTimer = (a.frameTimer + simSpeed) % FRAMES_PER_ANIM
    if (a.frameTimer < simSpeed) {
      a.frameIndex = (a.frameIndex + 1) % 6  // walk: 6 frames
    }
  }

  // ── Separation: dorong agen yang tumpuk hingga tidak overlap ────────────
  const SEP_DIST    = 32
  const SEP_DIST_SQ = SEP_DIST * SEP_DIST

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i]
    for (let j = i + 1; j < agents.length; j++) {
      const b = agents[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const distSq = dx * dx + dy * dy
      if (distSq < SEP_DIST_SQ && distSq > 0) {
        const dist    = Math.sqrt(distSq)
        const overlap = (SEP_DIST - dist) * 0.5
        const nx = dx / dist
        const ny = dy / dist
        if (!a.isIdle) { a.x += nx * overlap; a.y += ny * overlap }
        if (!b.isIdle) { b.x -= nx * overlap; b.y -= ny * overlap }
      }
    }
  }
}

// ── Logic Tick: SEIR transitions (called every FRAMES_PER_DAY frames) ─────
export function logicTick(agents: Agent[], params: SimParams): void {
  const { beta, sigma, gamma } = params

  // 1. Contact detection — O(N²), only run once per day
  for (let i = 0; i < agents.length; i++) {
    const a = agents[i]
    if (a.state !== 'S') continue

    for (let j = 0; j < agents.length; j++) {
      if (i === j) continue
      const b = agents[j]
      if (b.state !== 'I') continue

      const dx = a.x - b.x
      const dy = a.y - b.y
      if (dx * dx + dy * dy <= CONTACT_RADIUS * CONTACT_RADIUS) {
        if (Math.random() < beta) {
          a.state       = 'E'
          a.daysInState = sampleExponential(sigma)
          break
        }
      }
    }
  }

  // 2. Countdown timers & state transitions
  for (const a of agents) {
    if (a.state === 'E') {
      a.daysInState -= 1
      if (a.daysInState <= 0) {
        a.state       = 'I'
        a.daysInState = sampleExponential(gamma)
      }
    } else if (a.state === 'I') {
      a.daysInState -= 1
      if (a.daysInState <= 0) {
        a.state       = 'R'
        a.daysInState = 0
      }
    }
  }
}

// ── Headless simulation for sensitivity analysis ───────────────────────────
export function runHeadless(
  params: SimParams,
  canvasWidth: number,
  canvasHeight: number,
  maxDays = 365,
): { snapshots: SEIRSnapshot[]; peakI: number } {
  const agents    = initAgents(params, canvasWidth, canvasHeight)
  const snapshots: SEIRSnapshot[] = []
  let peakI = 0

  for (let day = 0; day <= maxDays; day++) {
    const counts = countSEIR(agents)
    snapshots.push({ day, ...counts })
    if (counts.I > peakI) peakI = counts.I
    if (counts.E === 0 && counts.I === 0) break
    logicTick(agents, params)
  }

  return { snapshots, peakI }
}
