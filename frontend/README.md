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
- **Footprints.** On the public pages the mouse leaves bare footprints on the
  background, left and right in turn every `STRIDE` pixels, fading after
  ~2 s (`useFootprints`, drawn by `components/layout/Footprints.tsx` behind
  the content, above the contour lines). A print lands only where the pointer
  and the whole print, toe to heel, rest on the empty background
  (`utils/isFloor.ts`: no text, control or media, and no surface with a
  background or border around it), so none slips under a card. Every print
  shown counts towards the _Level Up_ figurine. Mouse only; off under reduced
  motion.
- **Home.** Flippable character card (full-art portrait on the front, with
  the level = calendar years since the first job's `start`; skills and
  description on the back; 3D turn, instant under reduced motion; leans
  toward the mouse pointer, the foil sheen sliding after it) + quest log +
  stats + side quests + figurine collection. The quest log has two tabs built
  from the CV copy in the locale files (`about.experience` /
  `about.education`, each with `start`/`end` months and a `quest` block:
  guild, objective, final boss, rewards). Entries without an `end` are
  _Active Quests_ and show every detail; the rest are _Completed Quests_
  (guild and dates, newest first). Each row carries the domain symbol (work, study) and links to its
  entry on the About page timeline (`/about-me#work-2020-11`); the "next
  quest" slot links to the contacts page. The cards of a tab share one height
  (a grid of equal rows) that stays put when the language changes: minimum
  heights in `components/quests/questCardLayout.ts` come from a line budget
  with clamped text from `sm`, and from the tallest card of either language on
  phones (re-measure them when the quest copy changes).
- **Stats and side quests.** Side by side from `lg`, stacked on phones.
  _Stats_ plots the six CV skill groups on a radar (`utils/radarGeometry.ts`),
  the same groups and order as the About page skills (`SKILL_GROUPS` in
  `types/stat.ts`), with their levels in `utils/statLevels.ts`. Each point
  shows the group's level and tools on hover, focus or tap; from `lg` a list
  of the levels alone sits beside the chart, and the stats box stretches to
  the height of the side quests beside it. _Side Quests_ deals
  the published projects as a fanned deck, oldest first and numbered
  `SQ: 01/NN`, closed by a face-down card that links to the contacts page.
  Drag the top card away (or press ←/→ on the deck) to flip through it
  (`useCardDeck`, poses in `utils/deckPose.ts`); a project without a cover
  gets one drawn for its area.
- **Projects.** The API returns light cards for lists (`ProjectSummary`) and
  the full project for its page (`Project`), see `types/project.ts`. A project
  has one to three areas, all shown as chips on its cards and page, grouped
  in three colour families; the first sets the card's frame
  (`components/projects/areaStyles.ts`: build = frontend, backend, cloud;
  data; intelligence = ML, DL, AI). It also has a context. The Projects page
  filters by area, context, technology and text (`utils/filterProjects.ts`). The admin form edits the card, the page and
  the optional lab; lists of objects (metrics, topics, gallery, lab) are
  edited as JSON and validated by the API, and editing loads the full
  project first (`ProjectFormLoader`).
- **Project page.** `components/projects/detail/`: the side quest number,
  a hero (classification chips, description, the license every project
  states, the lab and the main links as buttons, the cover in its area's
  foil frame), the quest brief and key numbers, the markdown long read
  beside a side column (contents built from its `##` headings, with the
  ids the renderer gives them through the shared `remarkHeadingIds`, the stack
  grouped by the technologies' registry category, topics, resources and the
  CV quest the project was born in), the gallery, the optional lab last, and
  the previous and next side quests. The lab (`components/projects/lab/`)
  compares a sample's base image with a layer through a divider dragged
  across the image; its handle is a slider for the keyboard (arrows, Home,
  End) and screen readers.
  Project images ship in `public/images/projects/<slug>/` and are referenced
  by path (`utils/safeUrl.ts` `safeMediaUrl`).
- **About timeline.** Every experience and education entry is a card with
  its dot on a rail (`components/about/Timeline.tsx`). A scroll-spy
  (`useScrollSpy`) lights up the entry crossing a reading line at 35% of the
  viewport: its dot glows and its card is outlined. The rail segment from
  one dot to the next fills as that line travels between the two entries
  (`useSegmentFill`), so it reaches the next dot just as that entry lights
  up; an entry reached from a quest lands just above the line and stays lit,
  with the rail filled up to it, until the reader scrolls. Education cards
  also describe the course (department, summary, class or level, duration,
  credits, language, areas of study and a link to the official page), from
  `about.education` in the locale files; an entry may add its study plan
  (`plan`, folded under the course count) and a certification earned along
  the way (`certificate`, linked to the issuer's public verification page).
- **Game mode.** Always on. Seven figurines unlocked by exploring (first
  visit, card flip, 3 projects, language switch, theme switch, contact
  message, 1000 footprints), shown in the Home _Collection_ with
  their hint from the start, a counter on those earned with a goal
  (`utils/achievements.ts`) and a toast on each unlock. Progress (figurines,
  projects opened, footprints shown) lives in the `game` Redux slice,
  persisted to `localStorage` only (never sent to the backend).
- **Header.** On phones the language and theme switches live in the menu
  panel, next to the navigation.
- **Learning.** Hidden until an article is published: the menu leaves it out
  and `/learning` pages answer with the 404 page (`useLearningOpen`,
  `routes/LearningGate.tsx`; drafts, which admins also get, do not count).

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
│   ├── projects/    # ProjectCard, ProjectFilters, AreaChip, AreaArt, detail/, lab/
│   ├── learning/    # ArticleCard
│   └── contact/     # ContactForm (with honeypot anti-spam)
├── pages/           # Route-level components (+ pages/admin/ for the panel)
├── hooks/           # useAuth (admin-group check), useLanguage, useMediaUpload
├── services/        # RTK Query base api + domain endpoints, OIDC UserManager/session
├── store/           # Redux store factory
├── i18n/            # i18next init + locales/{en,it}.json
├── types/           # Interfaces mirroring backend schemas + enums
├── utils/           # cn, formatDate, env, getAccessToken, markdown helpers
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
4. When the API rejects a token (401), the base layer renews it with a silent
   refresh-token grant and retries. Requests rejected at the same time share
   one refresh. If no new token is available, the session is ended through
   the shared `UserManager` (`services/userManager.ts`), so the auth context
   signs out and `ProtectedRoute` asks to sign in again. The request is then
   retried anonymously, so public pages keep working.
5. The `?code=&state=` exchange runs only on the redirect URI's path
   (`/admin/callback`), never on public pages.

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
  routes plus published project/learning pages, with `/learning` itself only
  once an article is published (run automatically by `npm run build`).
