# Project Context: Grade Matrix

**SYSTEM STATUS:** ACTIVE
**MISSION:** A high-fidelity, monochromatic academic performance analysis system utilizing terminal aesthetics and deep data insights.
**platform:** runs on PowerShell and Windows11.

## 1. Architecture & File Structure

**Important:** The backend directory is strictly named `Server/` (Capital S). On case-sensitive filesystems, maintain this exact casing.

```text
grade-matrix/
├── package.json               # Root scripts (orchestrates client & Server)
├── client/                    # Frontend (Vite + React)
│   ├── public/                # Static assets & Legacy locales
│   ├── src/
│   │   ├── components/        # UI Components (AnimatedSection, StatCard, DownloadWidget)
│   │   ├── pages/             # Views (Dashboard, Config)
│   │   ├── hooks/             # Logic Hooks (useFontLoader, useSomething)
│   │   ├── context/           # Global State (ConfigContext, Resource)
│   │   ├── fontConfig.js      # External Resource Config (Fonts/Assets)
│   │   ├── i18n.js            # Hardcoded Translation Dictionary
│   │   └── main.jsx           # Entry
│   ├── tailwind.config.js     # Design Tokens (Strict Monochrome)
│   └── dist/                  # Build output
└── Server/                    # Backend (Node + Express)
    ├── index.js               # Entrypoint & API routes (/api/*)
    ├── src/
    │   └── services/          # Business Logic (analysisEngine.js)
    ├── prisma/
    │   ├── schema.prisma      # DB Schema
    │   ├── seed.js            # Seed script
    │   └── dev.db             # SQLite Database
    └── sessions.db            # SQLite session store
```

## 2. Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Recharts, Three.js (`@react-three/fiber`), `i18next`, JSZip.
* **Backend:** Node.js (v22+), Express.js.
* **Database:** SQLite via **Prisma ORM**.
* **Testing:** Jest (Backend), ESLint (Frontend).

## 3. Development Workflow

### Build & Run Commands

* `npm run install-all`: Install dependencies for root, `client/`, and `Server/`.
* `npm run dev`: Run frontend and backend concurrently (Vite + nodemon).
* `npm run build`: Build frontend into `client/dist/`.
* `npm start`: Start backend only.
* `npm run lint --prefix client`: Run ESLint.
* `npm test --prefix Server`: Run backend tests (Jest).

### Database Operations (Prefix: `Server`)

* `npm run prisma:generate --prefix Server`
* `npm run prisma:push --prefix Server`
* `npm run seed --prefix Server`

## 4. Design System Guidelines (Strict)

### Visual Identity

* **Theme:** **Strict Monochrome** (Black `#000`, White `#fff`, Grays).
* *Rule:* No colors (Blue/Green/Red) allowed unless strictly semantic (e.g., download progress bar).


* **Aesthetic:** Cyberpunk / Terminal / Geek.
* **Layout:** "Console Window" style floating over a 3D particle background.
* **Typography:** `JetBrains Mono` (Code) > `Sarasa Term SC` (Data Grid) > System Monospace.

### UI Patterns

* **Entry:** Use `AnimatedSection` wrapper for cascaded fade-in effects.
* **Interaction:** Interactive elements (StatCards) use `framer-motion` for subtle lift (`y: -2`).
* **Feedback:** Use the custom `DownloadWidget` for async operations (font loading, large data).

## 5. Business Logic & Core Features

### A. Analysis Engine (`Server/src/services/analysisEngine.js`)

* **Discovery Phase (Grade 10):** Analyzes all 9 subjects to recommend combinations.
* **Focus Phase (Grade 11/12):** Filters to 6 core subjects (3 main + 3 selected).
* **Virtual Projection:** Back-casts Grade 10 scores into Grade 11 models (Solid line = Real, Dashed = Projected).
* **Metrics:** Main Sequence (Score vs Rank), Short Stave (Gap Analysis), Volatility Index (Standard Deviation).

### B. Async Resource Loader

* **Font System:** Loads large CJK fonts (`Sarasa Term SC`) via `JSZip`/Axios to avoid blocking render.
* **Fallback:** Checks `PRIMARY_FONT_URL` -> `FALLBACK_FONT_URL` (defined in `fontConfig.js`).

## 6. Coding Standards for CodeX

1. **Naming:**
* React components: `PascalCase` (e.g., `StatCard.jsx`).
* Hooks: `useCamelCase` under `client/src/hooks/`.
* Backend logic: Keep route handlers in `Server/index.js` thin; move logic to `Server/src/services/`.


2. **No Hardcoded Secrets:** Use config files or env vars for URLs and sensitive data.
3. **Error Handling:** Cover API edge cases (empty exams, missing subjects) and async loading failures.
4. **Testing:** Prefer adding `*.test.js` files under `Server/__tests__/` covering API behavior and analysis logic.
5. **Git/Commit:** Keep subjects brief. Scope with `client:` or `Server:`. Do not commit `node_modules/` or `dev.db` (unless intentional seed update).