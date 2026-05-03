# PLAN.md — WEBTE2 Zadanie č.4: Kam na dovolenku?

> **Autor:** xbagins (Sam)
> **Predmet:** WEBTE2, LS 2025/2026
> **Deadline:** 23:59:59 deň pred cvičením
> **VPS:** node22.webte.fei.stuba.sk
> **Subpath:** `/z4/`
> **Design system:** Anthropic-inspired (warm cream + terracotta + soft pill shapes)

---

## 1. Architektúra a technológie

### 1.1 Stack

| Vrstva | Technológia | Dôvod |
|---|---|---|
| Backend | **Laravel 11** (PHP 8.2+) | Požiadavka zo zadania |
| Frontend | **React 18 + Vite + TypeScript** | SPA, moderný DX |
| UI knižnica | **shadcn/ui + Tailwind CSS v3** | Konzistentný dizajn, prístupnosť |
| Routing (FE) | **react-router-dom v6** | Klient-side routing pre SPA |
| Data fetching | **TanStack Query (React Query)** | Caching, loading/error states |
| Forms | **React Hook Form + Zod** | Validácia, typová bezpečnosť |
| Charts | **Recharts** | Štatistiky (denná doba, preferencie) |
| Tabuľky | **TanStack Table** | Sortovateľné stĺpce v štatistikách |
| Ikony | **Lucide React** | Konzistentné stroke-width SVG |
| Databáza | **MariaDB 10.x** | Rovnaké ako z1, vieme nasadiť |
| Server | **Nginx** + PHP-FPM 8.2 | VPS prostredie |
| LLM | **Anthropic Claude API** (claude-haiku-4-5) | "Prečo práve teraz" texty |
| Externé API | Open-Meteo, Frankfurter, REST Countries | Bez API kľúčov, zadarmo |

### 1.2 Adresárová štruktúra

```
xbagins_baginsky_z4/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── DestinationController.php
│   │   │   │   ├── SearchController.php
│   │   │   │   ├── CompareController.php
│   │   │   │   ├── StatsController.php
│   │   │   │   └── VisitController.php
│   │   │   ├── Requests/        # FormRequest validácia
│   │   │   └── Middleware/
│   │   │       └── TrackVisit.php
│   │   ├── Models/
│   │   │   ├── Destination.php
│   │   │   ├── DestinationType.php
│   │   │   ├── MonthlyClimate.php
│   │   │   ├── Country.php
│   │   │   ├── Search.php
│   │   │   ├── SearchResult.php
│   │   │   └── Visit.php
│   │   └── Services/
│   │       ├── WeatherService.php       # Open-Meteo
│   │       ├── CurrencyService.php      # Frankfurter
│   │       ├── CountryService.php       # REST Countries
│   │       ├── LlmService.php           # Claude API
│   │       ├── ScoringService.php       # Algoritmus skórovania
│   │       └── StatsService.php
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   │   ├── DestinationSeeder.php    # ~40 destinácií
│   │   │   └── ClimateSeeder.php        # 12 mesiacov × 40 destinácií
│   │   └── dump.sql                     # Export DB
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php                      # SPA fallback
│   ├── public/                          # Laravel public + React build v public/app/
│   ├── composer.json
│   └── .env.example
├── frontend/                   # React SPA (zdrojáky)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui komponenty (Button, Card, Input...)
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchForm.tsx
│   │   │   │   ├── TripTypeChips.tsx
│   │   │   │   └── DateRangePicker.tsx
│   │   │   ├── results/
│   │   │   │   ├── ResultCard.tsx
│   │   │   │   ├── MatchReasons.tsx
│   │   │   │   └── CompareBar.tsx
│   │   │   ├── detail/
│   │   │   │   ├── WeatherCard.tsx
│   │   │   │   ├── CurrencyCard.tsx
│   │   │   │   └── WhyNowCard.tsx
│   │   │   └── stats/
│   │   │       ├── VisitsCard.tsx
│   │   │       ├── HourlyChart.tsx
│   │   │       ├── SearchTable.tsx
│   │   │       └── PreferencesChart.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   ├── DetailPage.tsx
│   │   │   ├── ComparePage.tsx
│   │   │   └── StatsPage.tsx
│   │   ├── api/
│   │   │   └── client.ts        # axios + base URL
│   │   ├── hooks/
│   │   │   ├── useTrackVisit.ts
│   │   │   └── useCompareSelection.ts
│   │   ├── lib/
│   │   │   ├── utils.ts         # cn() helper
│   │   │   └── format.ts
│   │   ├── styles/
│   │   │   └── globals.css      # Tailwind + design tokens
│   │   ├── types/
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── nginx/
│   └── z4.conf                  # Nginx config pre VPS
├── README.txt                   # Technická správa
└── .gitignore
```

### 1.3 Routing

**Frontend (React Router):**
- `/z4/` → HomePage (formulár)
- `/z4/results` → ResultsPage (výsledky vyhľadávania)
- `/z4/destination/:id` → DetailPage (karta destinácie)
- `/z4/compare?ids=1,2` → ComparePage (porovnanie 2 destinácií)
- `/z4/stats` → StatsPage (štatistiky)

**Backend (Laravel API):**
- `POST /z4/api/search` → vyhľadávanie destinácií
- `GET /z4/api/destinations/{id}?month=N` → detail destinácie + počasie + kurz
- `GET /z4/api/destinations/{id}/why-now?month=N` → LLM-generovaný text
- `GET /z4/api/compare?ids=1,2&month=N` → porovnanie
- `GET /z4/api/stats/visits` → návštevnosť (total + unique)
- `GET /z4/api/stats/hourly` → návštevnosť po časových pásmach
- `GET /z4/api/stats/searches?sort=...&order=...` → vyhľadávané destinácie (sortovateľné)
- `GET /z4/api/stats/preferences` → preferencie (typy + teploty)
- `POST /z4/api/visits/track` → zaznamenanie návštevy

---

## 2. 🎨 DESIGN SYSTEM

> **Inšpirácia:** Claude Code Docs (Anthropic) — warm editorial/publishing aesthetic. Cream background, terracotta brand accent, soft 12px pill shapes, restrained motion, serif headings.
>
> **UI/UX skill:** Aplikujeme priority 1-10 z `ui-ux-pro-max` (accessibility CRITICAL, touch targets ≥44px, semantic color tokens, 4.5:1 contrast, no emojis as icons, 150ms ease-in-out default).

### 2.1 Color Palette

**Brand identita:** Warm off-white base + terracotta coral accent + near-black primary. Light-mode-first s podporou dark mode cez CSS custom properties swap na `:root` úrovni.

#### Core tokens (HSL channel values pre `hsl(var(--token))` consumption)

```css
:root {
  /* === BACKGROUNDS === */
  --bg-page:           48 33% 96%;     /* #FDFDF7 — main warm cream page */
  --bg-page-alt:       45 25% 94%;     /* #F0EFEA — slightly deeper cream */
  --bg-card:           48 33% 97%;     /* #FAF9F5 — card/panel fill */
  --bg-elevated:       0 0% 100%;      /* #FFFFFF — elevated surfaces */
  --bg-muted:          53 28% 94%;     /* #F2F0EB — hover backgrounds */
  --bg-subtle:         48 25% 92%;     /* #EBE9E3 — dividers, code blocks */
  --bg-manilla:        40 20% 92%;     /* #ECE8E0 — warm manila tint */

  /* === BRAND ACCENT (terracotta/coral) === */
  --accent:            15 63% 60%;     /* #D4713A — primary brand */
  --accent-hover:      15 60% 55%;
  --accent-soft:       15 55% 88%;     /* soft tint for backgrounds */
  --accent-fg:         0 0% 100%;      /* text on accent */

  /* === SECONDARY (blue, used sparingly for links) === */
  --link:              210 74% 40%;    /* #1A72C7 */
  --link-hover:        210 71% 52%;    /* #3F8FD9 */

  /* === PRIMARY (CTA dark pill) === */
  --primary:           60 3% 8%;       /* #141413 — near-black */
  --primary-fg:        0 0% 100%;      /* white text */

  /* === TEXT === */
  --text:              60 3% 8%;       /* #141413 — primary body */
  --text-secondary:    60 2% 23%;      /* #3D3C39 — secondary */
  --text-muted:        51 3% 44%;      /* #737170 — muted/placeholder */

  /* === BORDERS === */
  --border:            48 10% 87%;     /* #DEDEDE — default borders */
  --border-strong:     48 10% 80%;
  --border-input:      48 10% 87%;

  /* === SEMANTIC === */
  --success:           150 50% 40%;
  --warning:           35 90% 50%;
  --danger:            0 59% 34%;      /* #8B2D2D */
  --danger-fg:         0 0% 100%;

  /* === DECORATIVE === */
  --copper-glow:       28 51% 66%;     /* #D4A27F — warm copper for hero glow */

  /* === RING (focus states) === */
  --ring:              15 63% 60%;     /* matches accent */
}

.dark {
  --bg-page:           240 6% 10%;     /* #1A1A1F — dark warm */
  --bg-page-alt:       240 5% 12%;
  --bg-card:           240 5% 14%;
  --bg-elevated:       240 5% 16%;
  --bg-muted:          240 4% 18%;
  --bg-subtle:         240 4% 20%;
  --text:              0 0% 95%;
  --text-secondary:    0 0% 75%;
  --text-muted:        0 0% 60%;
  --border:            240 4% 22%;
  --border-strong:     240 4% 28%;
  --primary:           0 0% 95%;       /* invert: light pill on dark bg */
  --primary-fg:        60 3% 8%;
  --accent:            15 70% 65%;     /* slightly desaturated/lighter */
  --accent-soft:       15 30% 25%;
  --copper-glow:       28 40% 50%;
}
```

#### Tailwind config mapping

```ts
// tailwind.config.ts
colors: {
  background: 'hsl(var(--bg-page))',
  card: {
    DEFAULT: 'hsl(var(--bg-card))',
    elevated: 'hsl(var(--bg-elevated))',
    muted: 'hsl(var(--bg-muted))',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    hover: 'hsl(var(--accent-hover))',
    soft: 'hsl(var(--accent-soft))',
    foreground: 'hsl(var(--accent-fg))',
  },
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-fg))',
  },
  foreground: 'hsl(var(--text))',
  muted: {
    DEFAULT: 'hsl(var(--bg-muted))',
    foreground: 'hsl(var(--text-muted))',
  },
  border: 'hsl(var(--border))',
  input: 'hsl(var(--border-input))',
  ring: 'hsl(var(--ring))',
  destructive: {
    DEFAULT: 'hsl(var(--danger))',
    foreground: 'hsl(var(--danger-fg))',
  },
}
```

### 2.2 Typography

**Dvojzdrojová typografia:**
- **Body / UI:** Inter (free, Google Fonts) — náhrada za proprietárny "Anthropic Sans"
- **Display headings:** Fraunces (serif s charakterom) — pre h1, h2 IBA
- **Code / mono:** JetBrains Mono

```css
/* Font loading via Google Fonts v src/index.html alebo main.tsx */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
}

html { font-family: var(--font-sans); }
h1, h2 { font-family: var(--font-display); font-feature-settings: 'ss01'; }
code, pre { font-family: var(--font-mono); }
```

#### Type scale

| Element | Tailwind | Size | Weight | Line-Height | Letter-Spacing | Font |
|---|---|---|---|---|---|---|
| h1 (display hero) | `text-4xl lg:text-5xl` | 36-48px | 500 | 1.1 | -0.75px | Fraunces |
| h1 (page) | `text-3xl` | 30px | 500 | 1.2 | -0.75px | Fraunces |
| h2 | `text-2xl` | 24px | 500 | 1.33 | -0.6px | Fraunces |
| h3 | `text-xl` | 20px | 600 | 1.5 | normal | Inter |
| h4 | `text-lg` | 18px | 600 | 1.45 | normal | Inter |
| body large | `text-base` | 16px | 400 | 1.65 | normal | Inter |
| body | `text-sm` | 14px | 400 | 1.5 | normal | Inter |
| label | `text-sm font-medium` | 14px | 500 | 1.43 | normal | Inter |
| small / caption | `text-xs` | 12px | 500 | 1.33 | normal | Inter |
| code | `font-mono text-sm` | 14px | 400 | 1.7 | normal | JetBrains Mono |

> **Kľúčové pravidlo:** serif Fraunces sa používa **iba** na h1 a h2. Všetko ostatné je v Inter. Headings majú jemný negatívny letter-spacing (-0.6 až -0.75px) pre optické zúženie.

### 2.3 Spacing system

**4px micro-grid, 8px primary base.** 16px je dominantná hodnota (Tailwind `*-4`).

```
4px   — 1   (tight)
6px   — 1.5 (badges, chips)
8px   — 2   (component gap)
12px  — 3   (medium)
16px  — 4   ⭐ DOMINANT (card padding, section padding)
20px  — 5   (panel inner)
24px  — 6   (section spacing)
32px  — 8   (large section)
48px  — 12  (page outer padding desktop)
64px  — 16  (hero spacing)
96px  — 24  (large hero)
```

**Pravidlá:**
- Card padding: `p-5` (20px) alebo `p-6` (24px)
- Form gap: `space-y-4` (16px) alebo `space-y-6` (24px)
- Section padding (desktop): `px-12 py-16` (48/64px)
- Sticky header height: 56px (`h-14`)
- Scroll offset (header): `--scroll-mt: 9.5rem` = `scroll-margin-top: 9.5rem`

### 2.4 Border radius — **soft pill language**

**12px je dominantná hodnota.** Vytvára konzistentné "soft pill" character.

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 4px | Minor UI |
| `rounded-md` | 6px | Inline code |
| `rounded-lg` | 8px | Tags, chips |
| `rounded-xl` | **12px** ⭐ | Search inputs, buttons, cards, nav items |
| `rounded-2xl` | 16px | Large cards |
| `rounded-full` | 9999px | Avatars, circular badges |

> **Pravidlo:** Vždy preferuj `rounded-xl` (12px) pre interaktívne prvky. Iba veľké content cards môžu mať `rounded-2xl`.

### 2.5 Shadows — **minimal & ring-based**

**Žiadne dekoratívne tiene na content kartách.** Tiene iba na interactive UI chrome (inputs, buttons, modals).

```css
/* Ring-style border (search bar, secondary buttons) */
--shadow-ring: 0 0 0 1px hsl(var(--border));

/* Subtle elevation (button hover) */
--shadow-sm: 0 0 0 1px hsl(var(--border)), 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Modal / popover */
--shadow-md: 0 0 0 1px hsl(var(--border)), 0 4px 12px 0 rgb(0 0 0 / 0.08);

/* Modal scrim — 50% black */
--scrim: rgb(0 0 0 / 0.5);
```

**Tailwind utilities:**
- `shadow-sm` — secondary buttons
- `shadow-md` — popovers, dropdowns
- `shadow-lg` — modals only
- Pre cards: **NIE shadow** — len `border` + `bg-card`

### 2.6 Buttons — 4 varianty

#### Primary CTA — "dark pill"
```tsx
className="
  inline-flex items-center justify-center gap-2
  bg-primary text-primary-foreground
  rounded-xl px-4 py-1.5 h-9
  text-sm font-medium
  hover:opacity-90 active:opacity-95
  transition-opacity duration-150
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

#### Secondary — "cream pill with ring"
```tsx
className="
  inline-flex items-center gap-2
  bg-card text-foreground
  rounded-xl px-3 h-9
  text-sm font-normal
  shadow-sm
  hover:bg-muted
  transition-colors duration-150
"
```

#### Accent — "terracotta CTA" (pre hlavné akcie ako Hľadať)
```tsx
className="
  inline-flex items-center justify-center gap-2
  bg-accent text-accent-foreground
  rounded-xl px-5 h-10
  text-sm font-medium
  hover:bg-accent-hover
  transition-colors duration-150
"
```

#### Ghost / Icon
```tsx
className="
  inline-flex items-center justify-center
  text-muted-foreground
  rounded-md p-2 min-w-11 min-h-11
  hover:bg-muted hover:text-foreground
  transition-colors duration-150
"
```

### 2.7 Layout patterns

**Page shell:**
```
[Sticky Header — 56px, full-width, px-6 lg:px-12, border-b border-border, bg-page/80 backdrop-blur]
  Layout: [Logo: ✈️ + "Kam na dovolenku?" v Fraunces] [flex-1 spacer] [Stats link] [Theme toggle]

[Main content — max-w-6xl mx-auto px-6 lg:px-12 py-12]
```

**Container widths:**
- Page max-width: `max-w-6xl` (1152px) pre formuláre a content
- Wide layout: `max-w-7xl` (1280px) pre Results grid
- Narrow content: `max-w-3xl` (768px) pre dlhý text (DetailPage description)

**Common flex patterns:**
- `flex items-center gap-2` — icon + label everywhere
- `flex flex-col gap-1` — vertical lists in nav
- `hidden lg:flex` — desktop-only items

### 2.8 Transitions & animations

**Tailwind ease-in-out (`cubic-bezier(0.4, 0, 0.2, 1)`) je house standard.**

| Duration | Properties | Použitie |
|---|---|---|
| 75ms | colors | micro-interactions, code highlighting |
| **150ms** ⭐ | colors, opacity, transform | **default** — buttons, nav, cards |
| 200ms | shadow, border | inputs focus |
| 300ms | height, max-height | accordions, expand panels |
| 500ms | colors (root) | dark mode toggle global crossfade |

**Reduced motion (REQUIRED):**
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Loading states **cez skeleton komponenty, nie spinners** (zarovnané s dizajnom Anthropic docs).

### 2.9 Breakpoints

| Name | px | Použitie |
|---|---|---|
| `sm` | 640px | Tailwind default |
| `md` | 768px | Tablet |
| **`lg`** | **1024px** ⭐ | **Primary** — sidebar, full nav appears |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

> `lg` (1024px) je najdôležitejší breakpoint — desktop nav cez `hidden lg:flex`, sidebar v Stats, atď.

### 2.10 Z-index scale

```
-10  — decorative bg elements (copper glow behind hero)
0    — default content
10   — sticky header / nav lifted items
20   — sidebar overlay
30   — dropdowns / floating UI
50   — sticky toasts
100  — modals / sheets backdrop
101  — modal content
```

### 2.11 Icon system

**100% Lucide React (inline SVG).** Žiadne emojis ako structural ikony, žiadne icon fonts.

```tsx
import { Search, MapPin, Calendar, Sun, Cloud, Plane, ArrowRight, Check, X } from 'lucide-react';
```

**Pravidlá:**
- Stroke-width: **1.5** (Lucide default) konzistentne
- Sizes: `size={16}` (small), `size={20}` (default), `size={24}` (large)
- Coloring: cez `text-foreground` / `text-muted-foreground` (currentColor)
- Konzistentnosť: jeden style per hierarchy level (nemixovať filled + outline)
- Touch target: ikona-only button má `min-w-11 min-h-11` (44px)

### 2.12 Form components

Všetky form elementy budú konzistentné so soft-pill jazykom:

**Input:**
```tsx
className="
  w-full h-10
  bg-card border border-input rounded-xl
  px-3 text-sm
  placeholder:text-muted-foreground
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent
  disabled:opacity-50
  transition-colors duration-150
"
```

**Checkbox cards (pre trip types):**
```tsx
// default state
"bg-card border border-border rounded-xl p-4 min-h-14 cursor-pointer"
// hover
"hover:bg-muted hover:border-border-strong"
// selected
"bg-accent-soft border-accent ring-1 ring-accent text-foreground"
// transition
"transition-all duration-150"
```

### 2.13 Hero / decorative elements

**Copper glow** — jemný radial gradient za hero textom (decoratívne, -z-10):

```tsx
<div className="relative">
  {/* Decorative copper glow — POZOR: aria-hidden, pointer-events-none */}
  <div
    aria-hidden="true"
    className="absolute inset-0 -z-10 opacity-30 blur-3xl pointer-events-none"
    style={{
      background: 'radial-gradient(circle at 50% 30%, hsl(var(--copper-glow)) 0%, transparent 60%)'
    }}
  />
  <h1 className="font-display text-4xl lg:text-5xl">Kam na dovolenku?</h1>
</div>
```

---

## 3. Dátový model

### 3.1 Tabuľky

#### `countries`
| stĺpec | typ | popis |
|---|---|---|
| id | BIGINT PK | |
| iso_code | CHAR(2) UNIQUE | dvojpísmenný ISO kód (napr. "ES") |
| name_sk | VARCHAR(100) | Slovenský názov ("Španielsko") |
| capital | VARCHAR(100) | Hlavné mesto |
| currency_code | CHAR(3) | ISO 4217 (napr. "EUR", "USD") |

#### `destinations`
| stĺpec | typ | popis |
|---|---|---|
| id | BIGINT PK | |
| name | VARCHAR(150) | Názov mesta/lokality |
| country_id | FK countries | |
| latitude | DECIMAL(9,6) | Pre weather API |
| longitude | DECIMAL(9,6) | |
| flight_hours_from_vienna | DECIMAL(3,1) | 1.5, 3.0, ... |
| description_sk | TEXT | Krátky popis (kontext pre LLM) |
| image_url | VARCHAR(500) NULL | URL na obrázok (Unsplash/picsum) |
| created_at, updated_at | TIMESTAMP | |

#### `destination_types`
| stĺpec | typ | popis |
|---|---|---|
| id | BIGINT PK | |
| code | VARCHAR(30) UNIQUE | sea_beach, mountains, historic, city_break, adventure |
| name_sk | VARCHAR(100) | "More a pláž", ... |

#### `destination_destination_type` (M:N pivot)
| destination_id | destination_type_id |

#### `monthly_climates`
| stĺpec | typ | popis |
|---|---|---|
| id | BIGINT PK | |
| destination_id | FK | |
| month | TINYINT (1-12) | |
| temp_avg | DECIMAL(4,1) | priemerná teplota °C |
| temp_min | DECIMAL(4,1) | priemerné minimum |
| temp_max | DECIMAL(4,1) | priemerné maximum |
| UNIQUE (destination_id, month) | | |

#### `searches` (1 záznam per submit)
| id | trip_types JSON | temperature_pref | max_flight_hours nullable | start_date | end_date | month | created_at |

#### `search_results` (N záznamov per submit)
| id | search_id FK | destination_id FK | match_score DECIMAL |

#### `visits`
| stĺpec | typ | popis |
|---|---|---|
| id | BIGINT PK | |
| ip_hash | CHAR(64) | SHA-256 hash IP — **IP sa NEUKLADÁ** |
| visited_at | TIMESTAMP | |

### 3.2 Indexy

- `destinations(country_id)`
- `monthly_climates(destination_id, month)` UNIQUE
- `visits(visited_at, ip_hash)` — pre rýchle dotazy unique-per-60min
- `search_results(destination_id)` — pre štatistiku vyhľadávaní
- `searches(created_at)` — pre časové analýzy

---

## 4. Logika kľúčových funkcií

### 4.1 Algoritmus skórovania (ScoringService)

Vstup: `{trip_types[], temperature_pref, max_flight_hours, month}`

Pre každú destináciu vypočítame `match_score ∈ [0, 100]`:

```
score = 0
weights = { type: 40, temp: 35, distance: 25 }

# 1) Typ dovolenky (40%)
matching_types = intersection(user_types, destination.types)
type_score = (count(matching_types) / count(user_types)) * weights.type
# alebo 0 ak nezhoduje sa žiadny → destinácia sa nezobrazí

# 2) Teplota v zvolenom mesiaci (35%)
avg_temp = destination.monthly_climates[month].temp_avg
match temperature_pref:
  "hot"      (30+)    → ideal_range = [28, 40]
  "warm"     (20-29)  → ideal_range = [20, 29]
  "mild"     (10-19)  → ideal_range = [10, 19]
  "any"                → temp_score = weights.temp (max)

ak avg_temp v ideal_range:
  temp_score = weights.temp
inak:
  distance_outside = min(|avg_temp - range_low|, |avg_temp - range_high|)
  temp_score = max(0, weights.temp - distance_outside * 3)

# 3) Vzdialenosť (25%)
ak max_flight_hours == null (anywhere):
  dist_score = weights.distance
inak:
  ak destination.flight_hours <= max_flight_hours:
    dist_score = weights.distance
  inak:
    dist_score = 0   # tvrdý filter — vyhodíme

total = type_score + temp_score + dist_score
```

**Filtre vs. soft scoring:**
- `max_flight_hours` je tvrdý filter
- `trip_types` ak nie je žiadna zhoda → destinácia sa nezobrazí
- Teplota je soft — ak user vybral "hot" v Januári, ukáže sa Tenerife (najteplejšie čo je dostupné)

**Top N výsledkov:** zoradené podľa `match_score DESC`, limit 20.

**"Prečo ju aplikácia odporúča" výpis pri každom výsledku:**
- Bullet list zhodných typov: "✓ More a pláž", "✓ Mestský výlet"
- Indikátor teploty: "✓ V júli priemerne 28°C — zodpovedá tvojej preferencii (teplo)"
- Indikátor vzdialenosti: "✓ 2.5 hod letu z Viedne"

### 4.2 LLM — "Prečo práve teraz"

**Endpoint:** `GET /z4/api/destinations/{id}/why-now?month=7`

**Prompt template (Slovak):**
```
Si odporúčač cestovných destinácií. Pre danú destináciu a mesiac napíš stručný
text (2-3 vety, max 60 slov) v slovenčine, ktorý vysvetlí, prečo sa práve tento
mesiac oplatí navštíviť dané miesto. Vychádzaj výhradne z poskytnutých dát.

Destinácia: {name}, {country_name}
Mesiac: {month_name}
Priemerná teplota: {temp_avg}°C (min {temp_min}, max {temp_max})
Typ dovolenky: {types}
Krátky popis: {description}

Odpoveď: iba samotný text bez úvodu/záveru.
```

**Cache:** výstup ulož do cache (Laravel cache) s kľúčom `why_now:{dest_id}:{month}` na 24h.

**Fallback:** ak LLM API zlyhá → šablonovaný text:
```
"V {month_name} má {name} priemernú teplotu {temp_avg}°C — ideálne pre {types}.
{description_short}"
```

### 4.3 Počasie

**Aktuálna predpoveď:** Open-Meteo `/v1/forecast?latitude=X&longitude=Y&current=temperature_2m,weather_code&daily=...`
- Cache 1 hodina

**Historický priemer pre mesiac:** uložený v DB (`monthly_climates`).

**Fallback "najbližšie mesto":** ak Open-Meteo vráti chybu → skús najbližšie veľké mesto.

### 4.4 Kurz meny

- Frankfurter API: `https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,...`
- Cache 6 hodín všetky meny z DB.
- Ak `country.currency_code == 'EUR'` → kurz sa nezobrazuje.

### 4.5 Návštevnosť

**Middleware `TrackVisit`:**
- Hash IP (SHA-256 + APP_KEY salt)
- INSERT do `visits` na každú návštevu
- IP sa NEUKLADÁ (zadanie zakazuje)

**Štatistiky:**
- Total = `COUNT(*)` cez všetky záznamy
- Unique = `COUNT(DISTINCT ip_hash) WHERE visited_at > NOW() - INTERVAL 60 MINUTE`
- Časové pásma: `HOUR(visited_at)` → bucket 0-6, 6-15, 15-21, 21-24

### 4.6 Štatistiky — preferencie

- "Čo ľudia hľadajú": JOIN `search_results` × `destinations` × `countries`, GROUP BY destination_id, COUNT
- Sortovanie podľa štátu: `ORDER BY country.name_sk ASC, destination.name ASC`
- Preferencie: agregovať `searches.trip_types` (JSON_EXTRACT) a `searches.temperature_pref`

---

## 5. Externé API — zoznam a účel

| API | Endpoint | Účel | Cache |
|---|---|---|---|
| **Open-Meteo Forecast** | `api.open-meteo.com/v1/forecast` | Aktuálna predpoveď počasia | 1h |
| **Open-Meteo Archive** | `archive-api.open-meteo.com/v1/archive` | (Pri seedingu) historické teploty | trvalo (DB) |
| **Frankfurter** | `api.frankfurter.app/latest` | Kurzy mien voči EUR | 6h |
| **REST Countries** | `restcountries.com/v3.1/alpha/{iso}` | Doplňujúce info o krajine | 24h / DB |
| **GeoNames flagy** | `geonames.org/flags/x/{iso}.gif` | Vlajky (img tag) | browser cache |
| **Anthropic Claude** | `api.anthropic.com/v1/messages` | "Prečo práve teraz" text | 24h |

> **API kľúče:** iba Anthropic. Uložený v `.env` na backende, nikdy sa neposiela do FE.

---

## 6. UI/UX — kľúčové obrazovky

### 6.1 HomePage (formulár)

**Layout:**
```
[Sticky Header]

[Hero section — relative, py-16 lg:py-24]
  - Decorative copper glow background (radial gradient, blur-3xl, opacity-30, -z-10)
  - h1 v Fraunces serif (36px → 48px lg, letter-spacing -0.75)
    "Kam na dovolenku?"
  - p text v Inter text-lg text-muted-foreground:
    "Povedz nám, čo hľadáš, a my ti odporučíme."

[Search form card]
  - max-w-3xl mx-auto
  - bg-card rounded-2xl border border-border p-6 lg:p-8
  - Žiadny shadow — len jemný border
  - space-y-6:

  Pole 1: "Kedy chceš cestovať?"
    - Tabs: [Mesiac] [Konkrétny dátum]
    - Mesiac: shadcn Select s 12 možnosťami
    - Dátum: shadcn Calendar v Popover (mode="range")

  Pole 2: "Ako dlho?"
    - Number input s +/- buttons (custom)
    - h-10 rounded-xl

  Pole 3: "Čo hľadáš?" (multi-select chips)
    - Grid grid-cols-2 lg:grid-cols-3 gap-3
    - Toggleable cards: každý so 5 typmi dovolenky
    - Default: bg-card border-border
    - Selected: bg-accent-soft border-accent ring-1 ring-accent
    - Min height 56px (touch-friendly)
    - Icon + text vo flex layoute

  Pole 4: "Preferovaná teplota?" (radio group, segmented)
    - 4 možnosti: Horúco | Teplo | Príjemne | Jedno mi to
    - Active: bg-primary text-primary-foreground

  Pole 5: "Vzdialenosť?" (radio group, segmented)
    - 3 segmented: Do 3h | Do 5h | Kdekoľvek

  Submit button:
    - Accent variant (terracotta), w-full lg:w-auto
    - "Hľadať destinácie" + ArrowRight icon
    - h-12 (44px+ touch target)
```

### 6.2 ResultsPage

**Layout:**
```
[Sticky Header]

[Sticky filter bar — top-14 z-10, bg-page/80 backdrop-blur border-b]
  - max-w-7xl mx-auto px-6 py-3
  - flex items-center justify-between
  - [< Späť na hľadanie] [Vybrané: 0/2 · Porovnať →]

[Results grid]
  - max-w-7xl mx-auto px-6 py-8
  - grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

  ResultCard (každá):
    [Image — aspect-[4/3] rounded-t-xl object-cover]
    [Card body p-5]
      - Header row: [Flag 24px] + [name] + [country small text]
      - h3 destinácia name v Inter 600
      - Match score progress bar (h-1.5 rounded-full bg-muted, fill bg-accent)
      - "85% zhoda" label v text-xs font-medium
      - Match reasons (bullet list with Check icons z Lucide):
        - <Check size={14} className="text-accent" /> More a pláž
        - <Check size={14} /> V júli priemerne 28°C
        - <Check size={14} /> 2.5 hod letu z Viedne
      - Footer row: [Compare checkbox] [Detail → button]
    - Card: bg-card border border-border rounded-xl overflow-hidden
    - Hover: border-accent transition-colors duration-150
```

### 6.3 DetailPage

**Layout:**
```
[Sticky Header]

[Hero — full bleed image]
  - h-64 lg:h-80
  - position relative
  - Image cover with overlay gradient (from-black/0 via-black/20 to-black/60)
  - Title overlay: bottom-6 left-6, white text, Fraunces serif
  - Back button: top-6 left-6, ghost style on dark bg

[Content max-w-5xl mx-auto px-6 py-8]
  Grid lg:grid-cols-3 gap-6:

  Main column (lg:col-span-2):
    - h2 "O destinácii" v Fraunces serif
    - Description text v Inter text-base text-foreground

    - Section: "Prečo práve teraz?"
      - Card v elevated style
      - bg-card border-l-4 border-accent rounded-xl p-5
      - LLM text v Inter italic
      - Skeleton loader počas načítavania (shimmer)

    - Section: "Počasie v {mesiaci}"
      - Grid grid-cols-3 gap-3 stat cards:
        - Card: bg-card border rounded-xl p-4
        - Label v text-xs text-muted (Priemer / Min / Max)
        - Value: text-3xl font-display tabular-nums
        - Unit °C v text-sm text-muted

    - Section: "Aktuálne počasie"
      - Card s ikonou (Lucide Sun/Cloud) + teplotou + popisom
      - Indicator chip "Z najbližšieho mesta {X}" ak fallback

  Sidebar (lg:col-span-1):
    - Sticky info card (top-20)
    - bg-card rounded-2xl border p-6
    - Krajina + flag (img 32px) + capital
    - Mena: "1 EUR = 25.5 CZK" alebo "Používa sa euro"
    - Typy dovolenky (badges v rounded-full)
    - Letové hodiny z Viedne s Plane icon
    - "Pridať do porovnania" accent button (full width)
```

### 6.4 ComparePage

**Layout:**
```
[max-w-6xl mx-auto px-6 py-8]
  - h1 "Porovnanie destinácií" v Fraunces

  Grid grid-cols-2 gap-6 (mobile: stack vertically):

  Each side (Card):
    - Hero card s obrázkom, name, flag, country
    - Comparison rows (table layout):

  Comparison table (full width pod kartami):
    [Field name col]   [Destinácia A]   [Destinácia B]
    Krajina            ...              ...
    Hlavné mesto       ...              ...
    Mena               ...              ...
    Typy               <badges>         <badges>
    Avg teplota        28°C             22°C
    Min/Max teplota    24/32            18/26
    Aktuálne počasie   ☀ 26°C          ☁ 19°C
    Letové hodiny      2.5h             3.5h

  - Pri zhodách: jemný highlight bg-accent-soft (accessibility: aj icon ✓)
  - Tabular numbers pre čísla
```

### 6.5 StatsPage

**Layout:**
```
[max-w-7xl mx-auto px-6 py-8]
  - h1 "Štatistiky portálu" v Fraunces
  - Sub-text v Inter text-muted

  Grid lg:grid-cols-12 gap-6:

  - VisitsCard (col-span-12 lg:col-span-6)
    - 2 veľké čísla side-by-side: Total / Unique
    - Číslo v Fraunces 48px font-medium tabular-nums
    - Label v Inter text-sm text-muted-foreground
    - Refresh každých 30s (React Query)

  - HourlyChart (col-span-12 lg:col-span-6)
    - Recharts BarChart
    - 4 stĺpce (6-15, 15-21, 21-24, 0-6)
    - Custom theme: bars color = hsl(var(--accent))
    - Tooltips, axis labels v slovenčine

  - SearchTable (col-span-12)
    - Card s p-6
    - h3 "Čo ľudia hľadajú"
    - TanStack Table:
      - Columns: Destinácia | Štát | Vyhľadávaní
      - Sortable: chevron up/down
      - Sort štát → secondary by destination name
      - aria-sort="ascending|descending"

  - PreferencesChart (col-span-12 lg:col-span-12)
    - Grid 2 columns: Bar (typy) + Pie (teploty)
    - Recharts s accent colors palette
```

### 6.6 Dizajn principles checklist (pre delivery)

- [ ] Všetky interaktívne prvky majú min 44×44px touch target
- [ ] Focus rings všade (accent color ring 2px ring-offset-2)
- [ ] Žiadne emoji ako ikony — len Lucide
- [ ] Konzistentný 12px rounded-xl jazyk
- [ ] Žiadne dekoratívne tiene na content
- [ ] Loading states cez skeleton (nie spinners)
- [ ] Empty states s ilustráciou + CTA
- [ ] Reduced motion support cez @media query
- [ ] Dark mode tested separately (not just inferred from light)
- [ ] Konzistentné stroke-width 1.5 na ikonách
- [ ] Body text contrast ≥4.5:1 (test cez tool)
- [ ] Sentence case konzistentne (nie All Caps)
- [ ] Slovenské texty s diakritikou všade
- [ ] Tabular numbers pre čísla v štatistikách (`font-variant-numeric: tabular-nums`)
- [ ] Sortable columns majú aria-sort
- [ ] Form fields majú visible labels (nie placeholder-only)
- [ ] Error messages near field, role="alert"

---

## 7. README.txt — povinný obsah

Podľa zadania README MUSÍ obsahovať:
1. **Zoznam externých API + popis účelu**
2. **Postup nasadenia krok za krokom**
3. **Popis dátového modelu** (tabuľky, vzťahy, kľúčové stĺpce)

**Plus rozumne pridať:**
- Použité technológie (stack)
- Štruktúra projektu
- Spustenie lokálne (dev)
- Build pre produkciu
- Premenné prostredia (`.env` template)
- Známe obmedzenia / poznámky
- Autor a kontakt

> Detailný outline README → viď samostatná sekcia v TODO.md (Phase 11).

---

## 8. Deployment — VPS

### 8.1 Build flow

**Lokálne:**
```bash
# 1) Frontend build
cd frontend
npm install
npm run build               # → frontend/dist/

# 2) Skopírovať build do Laravel public
mkdir -p backend/public/app
cp -r frontend/dist/* backend/public/app/

# 3) Backend deps
cd ../backend
composer install --no-dev --optimize-autoloader
```

### 8.2 Nginx config (z4.conf)

```nginx
location /z4/ {
    alias /var/www/xbagins/z4/backend/public/;
    try_files $uri $uri/ @z4_laravel;

    # SPA fallback pre React routes
    location ~ ^/z4/(results|destination|compare|stats) {
        try_files /app/index.html =404;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

location @z4_laravel {
    rewrite /z4/(.*)$ /z4/index.php?/$1 last;
}
```

### 8.3 Environment

Na VPS v `backend/.env`:
```
APP_URL=https://node22.webte.fei.stuba.sk/z4
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_DATABASE=xbagins_z4
DB_USERNAME=xbagins
DB_PASSWORD=...
ANTHROPIC_API_KEY=sk-ant-...
```

### 8.4 Deploy postup
1. `composer install --no-dev` na VPS
2. `npm install && npm run build` lokálne, dist skopírovať
3. SQL dump cez mysqldump → import na VPS
4. `php artisan migrate` (ak nepoužívame dump) alebo skip ak importujeme dump
5. `php artisan db:seed` (ak migrate)
6. `php artisan config:cache && php artisan route:cache`
7. Nastaviť permissions: `chmod -R 775 storage bootstrap/cache`
8. Otestovať `https://node22.webte.fei.stuba.sk/z4/`

---

## 9. ZIP odovzdanie — checklist

Názov: `xbagins_baginsky_z4.zip` (formát z čl. 1: `idStudenta_priezvisko_z3.zip` — pravdepodobne preklep, použijeme `xbagins_baginsky_z4.zip`).

Obsah:
- ✅ Všetky zdrojáky (PHP, TSX, CSS, HTML)
- ✅ `composer.json`, `package.json`
- ❌ NIE `vendor/`, `node_modules/`, `dist/`
- ✅ SQL dump (`backend/database/dump.sql`)
- ✅ Nginx config (`nginx/z4.conf`)
- ✅ `README.txt`
- ✅ Odkaz na funkčné zadanie na VPS (v README)

---

## 10. Riziká a mitigation

| Riziko | Pravdepodobnosť | Mitigation |
|---|---|---|
| LLM API rate limit / down | Stredné | Cache + fallback šablóna |
| Open-Meteo down | Nízke | Fallback na uložené historické dáta |
| Frankfurter zmena formátu | Nízke | Defenzívne parsovanie + cache |
| VPS PHP < 8.2 | Stredné | Skontrolovať `php -v` na node22 hneď v Phase 0 |
| Nginx subpath alias issues | Stredné | Konzultovať s adminom / cvičiacim |
| Custom fonts pomaly loadnu | Nízke | font-display: swap + preload critical |
| Sortovanie tabuľky pri veľkom dataset | Nízke | Server-side cez query params |

---

## 11. Časový odhad

| Fáza | Hodiny |
|---|---|
| Phase 0 — Príprava | 1 |
| Phase 1 — Setup (Laravel, React, DB schéma) | 4 |
| Phase 2 — Design system setup (tokens, Tailwind, shadcn) | 3 |
| Phase 3 — Seedy (40 destinácií + 480 climate záznamov) | 4 |
| Phase 4 — API endpointy + ScoringService | 6 |
| Phase 5 — Externé API integrácia (weather, currency, LLM) | 4 |
| Phase 6 — Frontend: Home + Results + Detail | 7 |
| Phase 7 — Frontend: Compare + Stats | 4 |
| Phase 8 — Visit tracking + štatistiky | 3 |
| Phase 9 — Polish, dark mode, error handling | 4 |
| Phase 10 — VPS deploy + ladenie | 3 |
| Phase 11 — README + ZIP + finálny test | 2 |
| **SPOLU** | **~45 hod** |
