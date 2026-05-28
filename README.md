# Farm Epidemic Simulator

An interactive, stochastic SEIR disease outbreak simulator for a closed farm ecosystem. Built as a final project for Teknik Pemodelan Stokastik (TPS), Semester 4.

Live agents (sheep, lambs, piglets, bulls, or calves) move around a canvas in real time. Disease spreads probabilistically through proximity contact, and the SEIR dynamics are tracked live on a chart. A separate Comparative Analysis page lets you run up to 5 simulations side-by-side with different parameters to study sensitivity.

---

## The SEIR Model

The simulation uses a **stochastic agent-based SEIR model** — each animal is an individual agent with its own state, position, and timers, rather than a population-level differential equation.

```
S (Susceptible) ──β──▶ E (Exposed) ──σ──▶ I (Infectious) ──γ──▶ R (Recovered)
```

| State | Color | Meaning |
|-------|-------|---------|
| **S** Susceptible | Blue `#79c0ff` | Healthy, can contract the disease |
| **E** Exposed | Amber `#d29922` | Infected but not yet contagious (incubation) |
| **I** Infectious | Red `#f85149` | Actively spreading the disease |
| **R** Recovered | Green `#56d364` | Immune, no longer contagious |

### How transmission works

Each simulation tick represents one day. On every day:

1. Every S agent checks its distance to every I agent.
2. If distance ≤ 48 px (contact radius), a Bernoulli trial with probability β is drawn.
3. If the trial succeeds, S → E. Incubation duration is sampled from **Exponential(σ)**.
4. When the incubation timer expires, E → I. Infectious duration is sampled from **Exponential(γ)**.
5. When the infectious timer expires, I → R.

The simulation ends when **E = 0 AND I = 0** — the outbreak is truly over only when no latent cases remain.

---

## Parameters

| Parameter | Symbol | Default | Range | Description |
|-----------|--------|---------|-------|-------------|
| Total Population | N | 200 | 50–500 | Number of animals in the closed farm |
| Initial Cases | I₀ | 3 | 1–20 | Animals that start as Infectious on day 0 |
| Transmission | β | 0.30 | 0–1 | Probability of transmission per contact per day |
| Incubation | 1/σ | 5 days | 1–14 days | Average incubation period (E → I) |
| Recovery | 1/γ | 10 days | 1–30 days | Average recovery period (I → R) |

All numeric badges in the control panel are **clickable** — tap or click to type an exact value. Values outside the valid range are automatically clamped.

---

## Features

- **Real-time canvas simulation** — agents walk, idle, and bounce off walls at 60 fps with pixel-art sprites
- **5 animal types** — Sheep, Lamb, Piglet, Bull, Calf (visual only; does not affect model dynamics)
- **Speed control** — 1×, 2×, 5× fast-forward affecting both visual movement and simulation time
- **Comparative Analysis page** — run up to 5 independent simulations with different parameters; overlay Infectious curves and peak infection bar chart
- **Collapsible simulation blocks** — collapse individual blocks to save screen space
- **Run All / Stop All** — start or stop every comparative simulation at once
- **Responsive design** — desktop two-column layout, mobile bottom navigation with full-width controls
- **Informational tooltips** — hover or tap the ⓘ icons next to parameter labels and SEIR counters for definitions
- **Page transition animations** — slide-up fade-in when navigating between pages

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Canvas | HTML5 Canvas 2D API |
| Charts | Recharts 3 |
| Tooltips | Radix UI Tooltip |
| Icons | Lucide React |
| Sprites | Craftpix top-down farm pixel art |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build
npm run start
```

---

## Project Structure

```
src/
├── utils/
│   ├── agent.ts              # Agent interface and factory
│   ├── simulation-engine.ts  # Core SEIR logic: visualTick, logicTick, runHeadless
│   └── constants.ts          # Parameters, colors, animal configs
├── components/
│   ├── elements/
│   │   ├── ParameterSlider.tsx   # Slider with click-to-type precision input
│   │   ├── SEIRCounter.tsx       # Live S/E/I/R count cards with tooltips
│   │   ├── AnimalDropdown.tsx    # Animal picker with sprite preview
│   │   ├── SpeedControl.tsx      # 1×/2×/5× toggle
│   │   └── Tooltip.tsx           # Radix UI wrapper (hover + tap support)
│   ├── shared/
│   │   ├── SimulationCanvas.tsx  # Canvas renderer (memoized, RAF loop)
│   │   └── ControlPanel.tsx      # Parameter sliders + animal selector
│   └── layouts/
│       ├── Navbar.tsx
│       ├── BottomNav.tsx         # Mobile bottom navigation
│       └── PageTransition.tsx    # Slide-up animation on route change
└── modules/
    ├── simulation/
    │   ├── Simulation.tsx        # Main page state machine (idle/running/paused)
    │   └── components/SEIRChart.tsx
    └── compare/
        ├── Compare.tsx           # Comparative analysis page
        └── components/
            ├── SimBlock.tsx      # Individual collapsible simulation block
            └── CompareCharts.tsx # Overlay line chart + peak bar chart
```

---

## How the Simulation Loop Works

The engine uses a **hybrid game loop** to keep animations smooth while keeping SEIR logic discrete.

**Visual tick** (every frame, ~60 fps):
- Updates agent positions via cardinal random walk with wall bounce
- Handles idle state (agents stop and look around)
- Applies speed multiplier to movement
- Renders canvas: grass tile background, SEIR aura oval, pixel-art sprite

**Logic tick** (every 60 frames = 1 simulation day):
- O(N²) contact detection between S and I agents
- Bernoulli transmission trials (probability β per contact)
- Exponential timer countdown for E → I and I → R transitions
- SEIR snapshot recorded for the live chart
- Outbreak-over check (E = 0 AND I = 0)

The speed multiplier (1×/2×/5×) scales `FRAMES_PER_DAY` so logic ticks fire more often, and scales agent movement proportionally so both feel faster.

---

## License

Sprite assets from [Craftpix.net](https://craftpix.net) — free top-down farm pixel art pack (craftpix-net-291971).
