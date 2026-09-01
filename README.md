# Guilds: Era of Prosperity

## What if Colonist had RPG classes?

I've spent a lot of time playing 1v1 games on Colonist. One day I started thinking about the traditional RPG class triangle — knight, archer, mage — and wondered what that kind of system could look like in a game like Colonist.

The appeal of those systems has always been the rock-paper-scissors dynamic: different classes have different strengths, weaknesses, and strategic tradeoffs.

That turned into an idea for three thematic classes — the Guilds:

**Builder · Explorer · Merchant**

Then I started thinking about what their abilities could actually do, how they could interact with the existing game, and how a full variant might work.

Around the same time, I saw that Colonist was hiring a Product Engineer.

That became a good reason to stop wondering about the idea and bring it to life.

<br>

**[PLAY THE GAME] ▶ [Guilds: Era of Prosperity](https://jeps0n.github.io/guilds-era-of-prosperity/)** · *Hosted on GitHub Pages*

---

## The Idea

Guilds started with a simple question:

> What happens when you take a familiar strategy game and give players different ways to approach it?

The three Guilds each emphasize a different part of the game:

- **Builder** — construction and improvement (settlements and cities)
- **Explorer** — expansion and mobility (roads)
- **Merchant** — development and trading (development cards and trade)

The idea was not to completely replace the base game.

It was to put a new creative spin on it.

The familiar actions are still there — roll, build, trade, develop, expand — but the player's Guild changes the gameplay around those actions.

From that initial idea, the prototype grew into Guild-specific passive abilities, powerful Super abilities, and a progression mechanic within a new thematic phase called the **Prosperity Era**.

---

## Building the Prototype

The original goal was a proof of concept for the Guilds idea.

I quickly realized I couldn't just build the new abilities and put them on some static mock-ups. If the underlying game didn't feel recognizable and coherent, there would be no real way to evaluate whether the Guilds concept actually worked.

If I wanted to properly evaluate the idea, I needed a working game underneath it. So I built a simplified but functional version of the core game loop from end to end.

The next question was how to build on that foundation without compromising it.

---

## Engineering the Guild Layer

The central engineering challenge was adding a layer of new rules without turning the base code into a collection of Guild-specific conditionals.

I treated Guilds as two kinds of extensions:

### Passives
*Modify existing game calculations.*



| Guild | Passive | Effect |
|---|---|---|
| 🔨 Builder | **Construct** | Pay 1 less required resource when building a Settlement or City. |
| 🧭 Explorer | **Explore** | Pay 1 less required resource when building a Road. |
| 📜 Merchant | **Barter** | Pay 1 less required resource when making a Bank Trade or buying a Development Card. |

### Supers
*Orchestrate larger Guild-specific actions.*

Supers can be activated before the roll. When activating a Super, the player chooses any 3 available resources to use for the action.

| Guild | Super | Effect |
|---|---|---|
| 🔨 Builder | **Master Builder** | Build 1 free Settlement or City. |
| 🧭 Explorer | **Grand Expedition** | Build up to 3 free Roads. |
| 📜 Merchant | **Market Insight** | Receive 2 free Development Cards. |


From an engineering perspective, this distinction gave the Guilds layer defined places to influence the game while keeping the base systems relatively independent.



````text
                         ┌──────────────────┐
                         │    GAME STATE    │
                         │    GameState     │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        ┌───────────┐      ┌─────────────┐     ┌─────────────┐
        │    TURN   │      │ VALIDATION  │     │ PROGRESSION │
        │   SYSTEM  │      │ BOARD RULES │     │   VP / ERA  │
        └─────┬─────┘      └──────┬──────┘     └──────┬──────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │  BASE SYSTEMS  │
                         │                │
                         │ Build / Trade  │
                         │ Development    │
                         │ Roll           │
                         └───────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌──────────────┐         ┌──────────────────┐
             │    GUILD     │         │   GUILD SUPERS   │
             │   PASSIVES   │         │                  │
             │              │         │ SuperOrchestrator│
             │ Cost / Ratio │         │        │         │
             │  Modifiers   │         │   Guild Super    │
             └──────────────┘         └────────┬─────────┘
                                               │
                                               ▼
                                          GAME STATE
````

### Passives

A Guild passive generally doesn't replace a base action. Instead, it modifies a value that the existing system already knows how to use.

```text
Build Settlement
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
 Payment / Resolution
```

This pattern is used for:

- Builder settlement and city costs
- Explorer road costs
- Merchant development-card costs
- Merchant trading ratios

The base systems don't need to know why a value changed. They simply operate on the effective value.

### Supers

Supers are different because they can involve player choices, validation, resource handling, and interaction with existing game systems.

A central `SuperOrchestrator` determines which Super belongs to the current Guild and routes the interaction to its implementation.

```text
                 Super Activation
                        │
                        ▼
                SuperOrchestrator
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Master         Grand        Market
       Builder      Expedition     Insight
          │             │             │
          ▼             ▼             ▼
       Existing      Existing      Existing
        Build         Road         Dev Card
        Flow          Flow          Flow
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                    Game State
```

This allowed the Supers to feel like meaningful Guild abilities while reusing the existing game rules rather than duplicating them.

---

## Why I Built It This Way

The important part wasn't just making the Guilds work. I wanted to minimize how much Guild-specific logic had to be introduced into the core functions, keeping it limited to places where it was necessary.

Instead of repeatedly asking:

```ts
if (player.guild === "builder") ...
if (player.guild === "explorer") ...
if (player.guild === "merchant") ...
```

the Guild layer has defined places where it can influence the game.

That separation made the system easier to reason about and gave me room to add or change Guild mechanics without continually modifying the underlying rules.

For a prototype built under a tight timeline, that balance mattered: enough structure to move quickly, without building more architecture than the problem required.

---

## What's in the Prototype

The prototype is built around a complete 1v1 game flow.

Players select a Guild, progress through the familiar cycle of rolling, collecting resources, building, trading, and developing, and compete for achievements on their way toward victory.

On top of that foundation, the Guilds layer introduces the Builder, Explorer, and Merchant identities, each with its own passive and Super abilities. Reaching the Prosperity Era adds another layer of progression, including secondary dice rolls that unlock Supers. Together, these systems are designed to create additional strategic decisions without losing the familiar feel of the core experience.

I also built the supporting flows needed to make the experience feel like a real game rather than a collection of isolated mechanics — initial placement, validation, pending actions, game-state transitions, achievement tracking, winner detection, and dev/demo controls for testing different scenarios.

The result is a functional prototype rather than a full production recreation, with some deliberate simplifications to keep the focus on the Guilds concept.

---

## Coming Back to Programming

I hadn't coded seriously in about four years.

Before that, I worked professionally as a developer at Accenture, progressing from Senior Developer to Lead Developer.

Coming back to hands-on development after that gap meant getting back up to speed with modern tooling, current tech stacks, and the way software is being built today.

I made a deliberate decision to use ChatGPT heavily throughout the project. It accelerated the process dramatically and helped me get productive again much faster than I could have on my own after such a long hiatus.

I treated it as a development partner rather than a replacement for engineering judgment. I directed the work, made the architectural decisions, reviewed generated code, debugged problems, tested behavior, and changed or rejected approaches when they weren't right.

For me, learning to work this way is part of the story of this project.

AI-assisted development is already part of modern software engineering, and I wanted to learn how to work effectively in that environment. This project gave me the opportunity to put that into practice while drawing on the engineering experience I'd already built.

---

## What I Learned — and What I'm Proud Of

The thing I'm most proud of is pretty simple:

**I had an idea, and I actually made it real.**

It started as a thought experiment about RPG classes. Then it became three Guilds. Then the mechanics started taking shape. Eventually, I wanted to put the idea into practice and see what it could become.

That was the moment I thought, **"well, here we go."**

What started as a small proof of concept turned into building a functional version of the entire game loop, figuring out how all of those systems fit together, and then finding a way to layer the idea on top without making the underlying architecture a mess.

There were plenty of moments where the scope felt a little ridiculous. But there was also something satisfying about solving each problem as it came up and watching the thing gradually become a game.

The biggest lesson for me was that good ideas don't necessarily need an entirely new set of mechanics to feel new.

**A little creativity can go a long way.**

Familiar actions — building, trading, expanding, developing — can take on different strategic meanings, making the same board feel different depending on whether you're playing as a Builder, Explorer, or Merchant.

That, more than anything, is what I really like about the project. It's not simply a collection of new features that I wanted to demonstrate; it's an attempt to answer a gameplay question by turning an idea into something tangible and actually playable.

And after four years away from hands-on development, getting from *"I wonder what this would be like?"* to a working game sitting at a URL is something I'm genuinely proud of.

Anyway, that's how **Guilds: Era of Prosperity** came to exist.

---

## Project Structure

```text
src/
├── components/
├── game/
│   ├── data/
│   ├── domain/
│   ├── engine/
│   ├── guilds/
│   │   ├── builder/
│   │   │   ├── passive/
│   │   │   └── super/
│   │   ├── explorer/
│   │   │   ├── passive/
│   │   │   └── super/
│   │   ├── merchant/
│   │   │   ├── passive/
│   │   │   └── super/
│   │   ├── prosperity/
│   │   ├── shared/
│   │   ├── SuperOrchestrator.ts
│   │   └── resolveSuper.ts
│   ├── systems/
│   └── utils/
├── store/
├── App.tsx
├── index.css
└── main.tsx
```

The project separates game-domain concepts, game rules, Guild-specific behavior, state management, and UI components.

---

## Development / Demo Controls

The game can be played normally from start to finish, with keyboard shortcuts available to quickly test different game states and demonstrate the Guilds mechanics.

### Game Controls

| Key | Action |
|---|---|
| `R` | Roll dice |
| `E` | End turn |
| `T` | Restore checkpoint |

### Modifier Controls

| Modifier | Key | Action |
|---|---|---|
| `+` / `=` | `1–5` | Add a resource |
| `-` | `1–5` | Remove a resource |
| `+` / `=` | `D` | Add a development card |
| `-` | `D` | Remove the last development card |
| `+` / `=` | `S` | Add secondary rolls / unlock Super |
| `-` | `S` | Remove secondary rolls / lock Super |
| `+` / `=` | `V` | Add a Victory Point |
| `-` | `V` | Remove a Victory Point |

**Resources:** `1` Brick · `2` Lumber · `3` Wheat · `4` Sheep · `5` Ore

**Limitations:**

- `R` and `E` are disabled while certain board or Super actions are pending.
- `+` / `-` + `S` only works while the secondary-roll menu is open.
- Demo controls are disabled during initial placement and after the game ends.
- Resource, development card, secondary-roll, and VP changes affect the current player only.

---

## Built With

**React · TypeScript · Vite · CSS · GitHub Actions · GitHub Pages**

The game logic, state management, board interactions, validation, and Guild systems are implemented within the application rather than relying on a game engine or board-game framework.

---

## Run Locally

```bash
git clone https://github.com/jeps0n/guilds-era-of-prosperity.git
cd guilds-era-of-prosperity
npm install
npm run dev
```

### Useful commands

```bash
npm run build
npm run lint
npm run preview
```

---

## Deployment

The project is deployed through **GitHub Actions → GitHub Pages**.

Pushing to `master` builds the Vite production bundle and deploys the resulting `dist` directory.

---

<br>

**[PLAY THE GAME] ▶ [Guilds: Era of Prosperity](https://jeps0n.github.io/guilds-era-of-prosperity/)** · *Hosted on GitHub Pages*
