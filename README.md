# Guilds: Era of Prosperity

**A playable two-player strategy-game prototype that adds asymmetric Guild abilities and a new late-game progression system to a familiar resource-and-building game loop.**

[**▶ PLAY DEMO**](https://jeps0n.github.io/guilds-era-of-prosperity/) · [**View Source**](https://github.com/jeps0n/guilds-era-of-prosperity)

## What if Colonist had RPG classes?

I started thinking about the traditional RPG class triangle — knight, archer, mage — and wondered what that kind of system could look like in a game like Colonist.

The appeal of those systems is the rock-paper-scissors dynamic: different classes have different strengths, weaknesses, and strategic tradeoffs.

That led to the idea of three thematic classes — the Guilds:

**Builder · Explorer · Merchant**

From there, the question became what their abilities could actually do, how they could interact with the existing game, and how a full variant built around those differences might work.

**That idea became Guilds: Era of Prosperity.**

## The Guilds

| Guild | Focus | Passive | Super |
| --- | --- | --- | --- |
| 🔨 **Builder** | Settlements & Cities | **Construct** — pay 1 less required resource to build a Settlement or City | **Master Builder** — build 1 free Settlement or City |
| 🧭 **Explorer** | Roads & Expansion | **Explore** — pay 1 less required resource to build a Road | **Grand Expedition** — build up to 3 free Roads |
| 📜 **Merchant** | Development & Trade | **Barter** — pay 1 less required resource to make a Bank Trade or buy a Development Card | **Market Insight** — gain 2 free Development Cards |

The passives are intentionally narrow: they alter costs or ratios used by existing systems instead of replacing those systems with separate Guild-specific versions.

Supers are larger multi-step actions, so they are routed through a dedicated Guild layer and then reuse the normal building, road, or development-card flows.

## Era of Prosperity

The Guild system expands in the second half of the game.

When a player reaches **6 Victory Points**, the **Era of Prosperity** begins. During Prosperity, players gain a secondary **1D6 Prosperity roll**. Each player tracks the unique results they have collected.

Collecting all six results — **1 through 6** — unlocks that player's Guild Super.

This creates a second progression track alongside the board state: players continue pursuing Victory Points while also working toward their Guild's strongest ability.

The game ends when a player reaches **15 Victory Points**.

## Core Game Systems

The Guild layer sits on top of a functional two-player game implementation that includes:

- randomized turn and Guild-selection order
- initial settlement and road placement
- resource production from dice rolls
- road, settlement, and city construction
- bank trading and trade ratios
- development-card purchasing and play
- Knight, Road Building, Year of Plenty, Monopoly, and Victory Point cards
- robber movement, resource discarding, and stealing
- Longest Road and Largest Army
- event/game log
- Victory Point progression and game-over state
- phase checkpoints for restoring key game states

## Engineering Approach

The main design goal was to add asymmetric Guild rules without duplicating the underlying game.

```text
                         GAME STATE
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
      TURN FLOW         BOARD RULES        PROGRESSION
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
                        BASE SYSTEMS
                 Build / Trade / Develop
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
           GUILD PASSIVES           GUILD SUPERS
          cost / ratio mods          orchestration
                 │                       │
                 └───────────┬───────────┘
                             ▼
                         GAME STATE
```

### Passive abilities

Passive abilities modify values the base systems already understand.

```text
Player Action
     │
     ▼
  Base Cost
     │
     ▼
Guild Modifier
     │
     ▼
Effective Cost
     │
     ▼
Base Resolution
```

This pattern is used for Builder construction costs, Explorer road costs, Merchant development-card costs, and Merchant trade ratios.

### Super abilities

Supers require more orchestration because they can involve player choices and multiple game actions.

A central `SuperOrchestrator` routes activation to the appropriate Guild implementation:

```text
                  Super Activation
                         │
                         ▼
                  SuperOrchestrator
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Builder        Explorer       Merchant
          │              │              │
          ▼              ▼              ▼
      Existing        Existing       Existing
      Building        Road Flow      Dev-Card Flow
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                     Game State
```

That keeps the Guild features connected to the same rules used by ordinary gameplay.

## Project Structure

The codebase separates reusable game rules from React presentation components.

```text
src/
├── components/                  # Board, controls, menus, player/game UI
│   ├── layout/
│   └── ui/
├── game/
│   ├── data/                    # Board, Guild, card, and layout data
│   ├── domain/                  # Core domain models
│   ├── engine/                  # Game state, initialization, validation
│   ├── guilds/
│   │   ├── builder/
│   │   ├── explorer/
│   │   ├── merchant/
│   │   ├── prosperity/
│   │   └── shared/
│   ├── systems/
│   │   ├── achievements/
│   │   ├── actions/
│   │   ├── building/
│   │   ├── developmentCards/
│   │   ├── initialPlacement/
│   │   ├── milestones/
│   │   ├── resources/
│   │   ├── trading/
│   │   ├── turn/
│   │   └── validation/
│   └── utils/
├── store/                       # Phase checkpoint / restore support
├── App.tsx                      # Application orchestration
└── main.tsx
```

## Demo Controls

The prototype includes keyboard controls intended to make feature evaluation faster during a demo.

- **R** — roll dice
- **E** — end turn
- **T** — restore the saved phase checkpoint
- Resource/debug shortcuts are also implemented to accelerate specific game states during development and demonstration

These controls are supplemental; the game can be played through the normal interface.

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **CSS**
- **ESLint**
- **GitHub Pages**

The board and interface are implemented directly in the React application without an external game engine.

## Run Locally

```bash
git clone https://github.com/jeps0n/guilds-era-of-prosperity.git
cd guilds-era-of-prosperity
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Why I Built It

This project began as an exploration of asymmetric player abilities in a strategy game I already understood well. Building the idea as a playable prototype forced the feature design to interact with real turn flow, validation, resources, board state, development cards, achievements, progression, and victory conditions.

That was the useful engineering challenge: not simply designing three abilities, but integrating them into a working game while keeping the new rules identifiable as their own layer.

---

*Guilds: Era of Prosperity is an independent portfolio prototype and is not affiliated with Colonist.*
