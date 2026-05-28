export const CANVAS_WIDTH  = 800
export const CANVAS_HEIGHT = 500


export const CONTACT_RADIUS = 48
export const AGENT_SPEED    = 0.55
export const AGENT_SIZE     = 32

export const IDLE_CHANCE_PER_FRAME = 0.003  // ~0.3% per frame → avg tiap ~5 detik
export const IDLE_MIN_FRAMES       = 60     // 1 detik
export const IDLE_MAX_FRAMES       = 180    // 3 detik

export const FRAMES_PER_DAY = 60

export type AnimalType = 'sheep' | 'lamb' | 'piglet' | 'bull' | 'calf'

export const ANIMAL_CONFIGS: Record<AnimalType, { label: string; sheet: string; frameW: number; frameH: number }> = {
  sheep:  { label: 'Sheep',  sheet: '/assets/sheep.png',  frameW: 32, frameH: 32 },
  lamb:   { label: 'Lamb',   sheet: '/assets/lamb.png',   frameW: 32, frameH: 32 },
  piglet: { label: 'Piglet', sheet: '/assets/piglet.png', frameW: 32, frameH: 32 },
  bull:   { label: 'Bull',   sheet: '/assets/bull.png',   frameW: 64, frameH: 64 },
  calf:   { label: 'Calf',   sheet: '/assets/calf.png',   frameW: 64, frameH: 64 },
} as const

export const SPRITE = {
  WALK_COLS:    6,
  IDLE_COLS:    4,
  FRAME_WIDTH:  32,
  FRAME_HEIGHT: 32,
  SHEET:        '/assets/sheep.png',

  // Row index di spritesheet
  ROW_WALK_DOWN:  0,
  ROW_WALK_UP:    1,
  ROW_WALK_LEFT:  2,
  ROW_WALK_RIGHT: 3,
  ROW_IDLE_DOWN:  4,
  ROW_IDLE_UP:    5,
  ROW_IDLE_LEFT:  6,
  ROW_IDLE_RIGHT: 7,
}

export const DIRECTION = {
  DOWN:  0,
  LEFT:  1,
  RIGHT: 2,
  UP:    3,
} as const

export const SEIR_COLORS = {
  S: '#79c0ff',
  E: '#d29922',
  I: '#f85149',
  R: '#56d364',
} as const

export const SEIR_AURA_ALPHA = {
  S: 0.30,
  E: 0.40,
  I: 0.45,
  R: 0.35,
} as const

export const AURA_RADIUS = {
  S: 18,
  E: 20,
  I: 24,
  R: 18,
} as const

export const DEFAULT_PARAMS = {
  N:     200,
  I0:    3,
  beta:  0.30,
  sigma: 1 / 5,
  gamma: 1 / 10,
} as const

export const PARAM_RANGES = {
  N:     { min: 50,   max: 500, step: 1    },
  I0:    { min: 1,    max: 20,  step: 1    },
  beta:  { min: 0,    max: 1,   step: 0.01 },
  sigma: { min: 1/14, max: 1,   step: 0.01 },
  gamma: { min: 1/30, max: 1,   step: 0.01 },
} as const

export const COMPARE_MAX_BLOCKS   = 5
export const COMPARE_MAX_AGENTS   = 300
export const COMPARE_BLOCK_COLORS = [
  '#79c0ff',
  '#f85149',
  '#56d364',
  '#d29922',
  '#d2a8ff',
] as const
