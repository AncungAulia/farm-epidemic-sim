import { AGENT_SPEED, DIRECTION } from './constants'

export type SEIRState = 'S' | 'E' | 'I' | 'R'
export type Direction = typeof DIRECTION[keyof typeof DIRECTION]

export interface Agent {
  id:          number
  x:           number
  y:           number
  vx:          number
  vy:          number
  state:       SEIRState
  direction:   Direction
  frameIndex:  number
  frameTimer:  number
  daysInState: number
  isIdle:      boolean
  idleTimer:   number
}

export function sampleExponential(rate: number): number {
  return -Math.log(Math.random()) / rate
}

function randomVelocity(): { vx: number; vy: number } {
  // Hanya 4 arah cardinal — sesuai dengan 4-directional sprite
  const cardinals = [[1,0],[-1,0],[0,1],[0,-1]] as const
  const [dx, dy]  = cardinals[Math.floor(Math.random() * 4)]
  const speed     = AGENT_SPEED * (0.8 + Math.random() * 0.4)
  return { vx: dx * speed, vy: dy * speed }
}

export function createAgent(
  id: number,
  state: SEIRState,
  canvasWidth: number,
  canvasHeight: number,
  sigma: number,
  gamma: number,
): Agent {
  const { vx, vy } = randomVelocity()

  let daysInState = 0
  if (state === 'E') daysInState = sampleExponential(sigma)
  if (state === 'I') daysInState = sampleExponential(gamma)

  return {
    id,
    x: 20 + Math.random() * (canvasWidth  - 40),
    y: 20 + Math.random() * (canvasHeight - 40),
    vx,
    vy,
    state,
    direction:   DIRECTION.DOWN,
    frameIndex:  Math.floor(Math.random() * 4),
    frameTimer:  0,
    daysInState,
    isIdle:      false,
    idleTimer:   0,
  }
}

export function getDirection(vx: number, vy: number): Direction {
  if (Math.abs(vx) > Math.abs(vy)) {
    return vx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT
  }
  return vy > 0 ? DIRECTION.DOWN : DIRECTION.UP
}

export function getSpeedMultiplier(state: SEIRState): number {
  return state === 'I' ? 0.6 : 1.0
}
