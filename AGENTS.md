# AGENTS.md — Codebase Guide for AI Coding Agents

## Project Overview

Singer Competition Semifinal Visualization System. Real-time admin + display panel for a multi-round singer competition (30 contestants). Two sub-apps served from one React app:
- `/admin` — Admin control panel (score entry, state transitions, player management)
- `/screen` — Stage display screen (audience-facing)

Architecture: React+Vite+TailwindCSS v4 frontend (`client/`) + Node.js+Express+Socket.io backend (`server/`). No database — all state is persisted to `server/data.json` and broadcast to all clients via Socket.io.

---

## Repo Structure

```
/
├── client/                  # React frontend (Vite + TailwindCSS v4)
│   ├── src/
│   │   ├── App.jsx              # Root router (BrowserRouter)
│   │   ├── components/          # Feature components (AdminRound1, PlayerManager, etc.)
│   │   ├── hooks/
│   │   │   └── useGameState.js  # Central Socket.io state hook
│   │   ├── pages/               # Route-level page components (Admin, Screen)
│   │   └── utils/
│   │       └── avatar.js        # getFullAvatarUrl helper
│   ├── eslint.config.js         # ESLint v9 flat config
│   ├── vite.config.js           # Vite + @tailwindcss/vite + @vitejs/plugin-react
│   └── package.json
├── server/
│   ├── index.js                 # Express + Socket.io server — monolithic (CommonJS)
│   ├── data.json                # Persisted game state (auto-generated at startup)
│   └── package.json
└── README.md
```

---

## Build / Dev Commands

### Client (run from `client/`)
```bash
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # ESLint on all .js/.jsx files
```

### Server (run from `server/`)
```bash
node index.js      # Start on port 3001
```

### Testing
**No test framework is configured.** The server `package.json` has a placeholder `test` script that exits 1. Do not add or run tests unless explicitly asked.

---

## Language & Module System

- **Client**: ES Modules (`type: module`). Use `import`/`export` exclusively.
- **Server**: CommonJS (no `type` field). Use `require()`/`module.exports` exclusively.
- **No TypeScript** — all files use `.js` or `.jsx`. Do not introduce TypeScript.

---

## Code Style Guidelines

### General
- **Indentation**: 4 spaces (no tabs)
- **Quotes**: Single quotes for JS string literals; double quotes in JSX attributes
- **Semicolons**: Always
- **No TypeScript generics, interfaces, or type annotations** — plain JS throughout

### React Components
- Functional components only — no class components
- Use **named `export default function`** pattern:
  ```jsx
  export default function AdminRound1({ gameState, updateState }) {
      // ...
  }
  ```
- Props are destructured directly in the function signature
- `import React from 'react'` at the top of every `.jsx` file (required by the Babel-based JSX transform)
- Component files named in **PascalCase**: `AdminRound1.jsx`, `PlayerManager.jsx`

### Event Handlers
- Arrow functions assigned to `const`, prefixed with `handle`:
  ```js
  const handleSelect = (player) => { ... };
  const handleSubmitScore = () => { ... };
  ```

### Hooks & State
- Custom hooks live in `client/src/hooks/`, named `useXxx.js`
- The `useGameState()` hook is the single source of truth — never duplicate `gameState` in local component state; always read from this hook
- Optimistic updates: call `updateState(newState)` — it both emits the socket event and updates local state immediately
- Always pass the **full `gameState` object** to `updateState()` — the server replaces state wholesale, not patch-style

### Utilities
- Pure utility functions in `client/src/utils/`
- Prefer `const arrowFn = () => {}` style for exported utility functions

### Server (CommonJS)
- Keep all server logic in `server/index.js` — do not split unless explicitly asked
- Socket.io event names: camelCase (`requestState`, `stateSync`, `updateState`)
- State mutations: always clone the state, then call `saveData()` and `io.emit('stateSync', gameState)` together

---

## Styling

- **TailwindCSS v4** via `@tailwindcss/vite` Vite plugin — **no `tailwind.config.js`**
- Apply classes **inline on JSX elements** — no CSS modules, no styled-components, no CSS files
- Use `clsx` + `tailwind-merge` for conditional class composition:
  ```jsx
  import { clsx } from 'clsx';
  import { twMerge } from 'tailwind-merge';
  const cn = (...args) => twMerge(clsx(...args));
  ```
- Design palette in use: `slate-800/700/600` backgrounds, `teal-400` accents, `indigo`, `amber`, `red`, `green` status colors
- Animations via `framer-motion` (already installed)

---

## Routing

- React Router v7 (`react-router-dom`)
- All routes defined in `client/src/App.jsx`: `/admin`, `/screen`, `/`
- Add new routes by editing `App.jsx` — do not create a separate router config file

---

## Real-Time State Architecture

- Single socket (module-level singleton in `useGameState.js`) connects to `http://{window.location.hostname}:3001`
- **Client → Server**: `updateState(gameState)` event carries the full new state
- **Server → All Clients**: server saves to `data.json` then emits `stateSync(gameState)` to everyone
- **Initial load**: client emits `requestState`; server responds with `stateSync` to that socket only

---

## Key Data Shapes

```js
// Player object (30 players total)
{
    id: 1,
    name: 'Singer Name',
    avatar: 'filename.png',          // relative — use getFullAvatarUrl() for display
    group: 1,                         // group number for Round 1
    score: 0,
    status: 'active' | 'eliminated',
    pkAgainst: null | playerId
}

// Top-level gameState
{
    adminRound: 0 | 1 | 1.5 | 2 | 3 | 4,  // 1.5 = transition between rounds
    screenRound: ...,
    currentGroup: Number,
    pickingChallengerId: null | Number,
    players: Player[],                      // always 30 entries
    pkMatches: [{ p1, p2, winner }],
    demonKingScore: Number
}
```

---

## Naming Conventions

| Entity              | Convention              | Example                    |
|---------------------|-------------------------|----------------------------|
| React components    | PascalCase              | `AdminRound1`              |
| Component files     | PascalCase + `.jsx`     | `AdminRound1.jsx`          |
| Hook files          | camelCase `useXxx.js`   | `useGameState.js`          |
| Utility files       | camelCase + `.js`       | `avatar.js`                |
| Event handlers      | `handleXxx` arrow const | `handleSubmitScore`        |
| Socket event names  | camelCase               | `stateSync`, `updateState` |

---

## Error Handling

- Client validation: use `alert()` for user-facing errors (established pattern — stay consistent)
- No global React error boundary is configured
- Server errors: `console.error()` + `res.status(500).json({ error: '...' })`
- Wrap all async server operations in `try/catch`; never let unhandled promise rejections crash the server
- Score calculation pattern: `finalScore = judgeScore * 0.75 + publicScore * 0.25`

---

## ESLint Rules (client)

ESLint v9 flat config (`client/eslint.config.js`):
- `eslint:recommended` + `react/recommended` + `react-hooks/recommended`
- JSX Runtime rules enabled (no need to import React for JSX — but `import React from 'react'` is still used per existing files)
- `react-refresh/only-export-components` — warn (not error)
- `react/jsx-no-target-blank` — off
- Target: all `**/*.{js,jsx}` files

---

## What NOT to Do

- **No TypeScript** — do not add `.ts`/`.tsx` files or install `typescript`
- **No test framework** — do not add Jest, Vitest, or any testing library unless asked
- **Do not split `server/index.js`** into modules unless explicitly instructed
- **No `tailwind.config.js`** — TailwindCSS v4 is configured via the Vite plugin only
- **No CSS files or CSS modules** — use Tailwind inline classes exclusively
- **No global state store** (Redux, Zustand, Context API) — `useGameState` is the pattern
- **Do not use patches** when calling `updateState` — always send the full `gameState` object
- **Do not suppress lint errors** with `// eslint-disable` unless there is a documented reason
