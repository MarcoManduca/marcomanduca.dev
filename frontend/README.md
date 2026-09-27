# marcomanduca.dev — Frontend

React SPA for the personal portfolio website: public bilingual (IT/EN) pages
plus a protected admin panel backed by the FastAPI REST API (`/api/v1`).

## Stack

| Concern    | Technology                                                         |
| ---------- | ------------------------------------------------------------------ |
| Framework  | React 18 + Vite + TypeScript                                       |
| Styling    | Tailwind CSS (dark/light themes via CSS variables, `cn()`)         |
| State/Data | Redux Toolkit + RTK Query (single injected API slice)              |
| Routing    | React Router                                                       |
| Animations | Tailwind keyframes, `motion-safe:` only (reduced-motion aware)     |
| i18n       | i18next + react-i18next + browser language detector                |
| Auth       | react-oidc-context (OIDC against AWS Cognito hosted UI)            |
| Markdown   | react-markdown + rehype-highlight + remark-math/rehype-katex       |
| SEO        | react-helmet-async                                                 |
| Fonts      | @fontsource Barlow, Barlow Condensed, JetBrains Mono (self-hosted) |
| Tests      | Vitest + React Testing Library + MSW (jsdom)                       |

No dependencies beyond the agreed list. `oidc-client-ts` is the peer
dependency required by `react-oidc-context`; `highlight.js` and `katex` are
only pulled in for their CSS themes (the rehype plugins already depend on
them at runtime).

## Design

"Quest Log · Trading Card": the CV presented as a collectible card game.

- **Themes.** Semantic colours (`background`, `surface`, `accent`, `warm`,
  `highlight`, …) are RGB-channel CSS variables defined per `data-theme` in
  `src/index.css` and mapped in `tailwind.config.js`. Dark ("Trading Card",
  night teal) is the default; light uses the "Adventurers' Guild" parchment
  palette. `public/theme-init.js` applies the stored or OS theme before first
  paint (external script, as the CSP forbids inline ones); `useTheme` toggles
  and persists it. `brand.*` colours are fixed across themes (card foil).
- **Fonts.** Barlow Condensed for headings/labels (`font-display`), Barlow for
  body text, JetBrains Mono for code.
- **Home.** Flippable character card (full-art portrait on the front; skills
  and description on the back; 3D turn, instant under reduced motion) + quest log + skill "energies" +
  figurines. The quest log has two tabs built from the CV copy in the locale
  files (`about.experience` / `about.education`, each with `start`/`end` months
  and a `quest` block: guild, objective, final boss, rewards); projects will
  get a section of their own. Entries without an `end` are _Active Quests_ and
  show every detail; the rest are _Completed Quests_ (guild and dates, newest
  first). Each row carries the domain symbol (work, study) and links to its
  entry on the About page timeline (`/about-me#work-2020-11`); the "next
  quest" slot links to the contacts page. Cards have fixed heights from a line
  budget (`components/quests/questCardLayout.ts`) with clamped text, so every
  card of a tab matches and nothing moves when the language changes.
- **About timeline.** A scroll-spy (`useScrollSpy`) lights up the entry
  crossing a reading line at 35% of the viewport; an entry reached from a
  quest lands just above that line and stays lit until the reader scrolls.
- **Game mode.** Seven figurines unlocked by exploring (first visit, card flip, 3 projects,
  an article, language switch, theme switch, contact message). Progress lives
  in the `game` Redux slice, persisted to `localStorage` only (never sent to
  the backend); the header switch hides all gamified UI.

## Scripts

```bash
npm run dev               # Vite dev server (proxies /api to localhost:8000)
npm run build             # Type-check (tsc -b) + production build
npm run preview           # Preview the production build
npm test                  # Run all tests once
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage (v8, 80% line threshold)
npm run lint              # ESLint (flat config + typescript-eslint)
npm run format            # Prettier
npm run generate:sitemap  # Write public/sitemap.xml (static routes)
```

## Environment variables

Copy `.env.example` to `.env` (never committed):

| Variable                    | Description                                   |
| --------------------------- | --------------------------------------------- |
| `VITE_API_BASE_URL`         | Backend REST API base URL (default `/api/v1`) |
| `VITE_COGNITO_AUTHORITY`    | Cognito user-pool OIDC issuer URL             |
| `VITE_COGNITO_CLIENT_ID`    | Cognito app client id                         |
| `VITE_COGNITO_REDIRECT_URI` | Redirect URI after login (e.g. `/admin`)      |
| `VITE_COGNITO_DOMAIN`       | Cognito hosted UI origin (sign-out redirect)  |

## Structure

```
src/
├── components/
│   ├── ui/          # Atomic primitives: Button, Card, Badge, Tag, Input, ...
│   ├── layout/      # Header, NavBar, Footer, LanguageSwitcher, layouts
│   ├── markdown/    # MarkdownRenderer (highlight.js + KaTeX)
│   ├── seo/         # Seo (helmet meta + OpenGraph + canonical)
│   ├── home/        # Hero, PreviewSection
│   ├── projects/    # ProjectCard, ProjectFilters
│   ├── learning/    # ArticleCard
│   └── contact/     # ContactForm (with honeypot anti-spam)
├── pages/           # Route-level components (+ pages/admin/ for the panel)
├── hooks/           # useAuth (admin-group check), useLanguage, useMediaUpload
├── services/        # RTK Query: base api + injected domain endpoints
├── store/           # Redux store factory
├── i18n/            # i18next init + locales/{en,it}.json
├── types/           # Interfaces mirroring backend schemas + enums
├── utils/           # cn, formatDate, env, parseList, getAccessToken
├── routes/          # Route table + ProtectedRoute (Cognito admin guard)
└── test/            # Vitest setup, MSW server/handlers, render helpers
```

## i18n

- Languages: Italian and English, auto-detected from the browser
  (persisted in `localStorage`), fallback **EN**.
- All UI strings live in `src/i18n/locales/{en,it}.json`.
- Backend content fields are bilingual objects (`{ it, en }`); the
  `useLanguage().localize()` helper picks the current language with an
  English fallback.

## Auth

`/admin` routes are wrapped by `ProtectedRoute`:

1. Unauthenticated users are redirected to the Cognito hosted UI.
2. Authenticated users must belong to the **Administrators** Cognito group
   (`cognito:groups` claim); otherwise a forbidden message is shown.
3. The Cognito access token is attached as a `Bearer` header by the RTK
   Query base layer.

## Testing

- Tests are co-located with their source files (`Component.test.tsx`).
- API calls are mocked at the network level with **MSW** (never by patching
  `fetch`); handlers live in `src/test/mocks/handlers.ts`.
- Behavior-first queries (`getByRole`, `getByLabelText`) and `userEvent`.
- Coverage: v8 provider, 80% line threshold (`npm run test:coverage`).

## Docker

Multi-stage image: `node:24-slim` build → `nginxinc/nginx-unprivileged:1.27-alpine`
serve (non-root, listens on **8080**). nginx does the SPA fallback to
`index.html` and proxies `/api/` to the backend; the upstream is templated via
the `BACKEND_UPSTREAM` env var (default `http://backend:8000`), so it works out
of the box with compose. Security headers (CSP, Permissions-Policy,
Referrer-Policy, …) live in `nginx/security-headers.conf`, mirroring the
CloudFront policy.

Vite inlines `VITE_*` variables at build time, so they are build args
(`VITE_API_BASE_URL`, `VITE_COGNITO_AUTHORITY`, `VITE_COGNITO_CLIENT_ID`,
`VITE_COGNITO_REDIRECT_URI`, `VITE_COGNITO_DOMAIN`):

```bash
docker build -t marcomanduca-frontend \
  --build-arg VITE_COGNITO_CLIENT_ID=your-client-id .
docker run -p 8080:8080 -e BACKEND_UPSTREAM=http://backend:8000 marcomanduca-frontend
```

## SEO

- `index.html` ships static default meta (description, canonical, OpenGraph,
  Twitter card, `public/og-image.png`) for crawlers that do not run JS; they
  carry `data-rh` so `Seo` replaces rather than duplicates them.
- `Seo` component sets title, description, canonical, OpenGraph
  (`en_GB`/`it_IT` locales) and optional `noindex` per page; 404 pages are
  `noindex`. Detail pages use slug-based URLs.
- `public/robots.txt` allows everything except `/admin`.
- `npm run generate:sitemap` writes `public/sitemap.xml` for the static
  routes plus published project/learning pages (run automatically by
  `npm run build`).
