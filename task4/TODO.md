# TODO.md — WEBTE2 z4: Implementačný checklist

> Sledovanie progresu po fázach. Postupuj zhora dolu — fázy sú zoradené tak, aby ďalšia stavala na predchádzajúcej.

---

---

## 🏗 Phase 1 — Setup projektu

### Backend (Laravel)
- [x] `composer create-project laravel/laravel backend`
- [x] Nakonfigurovať `.env` (DB, APP_URL, OPENAI_API_KEY)
- [x] Pridať balíčky:
  - [x] `composer require guzzlehttp/guzzle` (HTTP client pre external API)
- [x] Konfigurácia CORS (`config/cors.php`) — povoliť FE origin pre dev (`localhost:5173`)
- [x] Nastaviť API routes prefix `/api`
- [x] Otestovať: `php artisan serve` → http://localhost:8000

### Frontend (React + Vite)
- [x] `npm create vite@latest frontend -- --template react-ts`
- [x] `cd frontend && npm install`
- [x] Nainštalovať závislosti:
  - [x] `npm install react-router-dom`
  - [x] `npm install @tanstack/react-query @tanstack/react-table`
  - [x] `npm install react-hook-form @hookform/resolvers zod`
  - [x] `npm install axios`
  - [x] `npm install recharts`
  - [x] `npm install date-fns`
  - [x] `npm install lucide-react`
  - [x] `npm install class-variance-authority clsx tailwind-merge`
- [x] Vite config: `base: '/z4/'`, proxy `/api` → `http://localhost:8000` pre dev
- [x] Otestovať dev server: `npm run dev` → http://localhost:5173

---

## 🎨 Phase 2 — Design system setup ⭐

> **DÔLEŽITÉ:** Všetko musí byť v design tokenoch hneď od začiatku. Nikdy nepoužívaj raw hex farby v komponentoch — vždy cez `bg-card`, `text-foreground`, atď.

### Tailwind & globals
- [x] Setup Tailwind CSS v3:
  - [x] `npm install -D tailwindcss@3 postcss autoprefixer`
  - [x] `npm install -D tailwindcss-animate`
  - [x] `npx tailwindcss init -p`
- [x] Nakonfigurovať `tailwind.config.ts`:
  - [x] Mapovať CSS variables na Tailwind colors (background, card, accent, primary, foreground, muted, border, ring, destructive — viď PLAN.md sekcia 2.1)
  - [x] Custom font families: sans (Inter), display (Fraunces), mono (JetBrains Mono)
  - [x] Custom container max-widths
  - [x] Border radius extensions (xl: 12px je už default)
  - [x] Plugin: `tailwindcss-animate`
- [x] Vytvoriť `src/styles/globals.css`:
  - [x] Import Google Fonts (Inter, Fraunces, JetBrains Mono) — `<link>` v index.html alebo @import
  - [x] Tailwind base/components/utilities
  - [x] CSS custom properties pre `:root` (light mode tokens — viď PLAN.md)
  - [x] CSS custom properties pre `.dark` (dark mode tokens)
  - [x] Reduced motion media query block
  - [x] `--scroll-mt: 9.5rem` pre sticky header offset
- [x] Vytvoriť `src/lib/utils.ts` s `cn()` helper (clsx + tailwind-merge)
- [x] Update `src/main.tsx`: import globals.css

### shadcn/ui setup
- [x] `npx shadcn@latest init`
  - [x] Style: New York
  - [x] Base color: Neutral (preferiér nemusíme — máme custom)
  - [x] CSS variables: yes
- [x] Override `components.json` aby sedel s našou structúrou (paths, alias `@/`)
- [x] Nainštalovať komponenty:
  - [x] `npx shadcn@latest add button card input label select radio-group checkbox calendar popover form table badge progress skeleton sonner tabs separator`
- [x] **Customizovať shadcn komponenty na náš design system:**
  - [x] `Button.tsx`:
    - [x] Variant `default` → primary dark pill (bg-primary text-primary-foreground rounded-xl)
    - [x] Variant `secondary` → cream pill with shadow (bg-card shadow-sm rounded-xl)
    - [x] Variant `accent` (NEW) → terracotta CTA (bg-accent text-accent-foreground rounded-xl)
    - [x] Variant `ghost` → transparent (text-muted-foreground hover:bg-muted)
    - [x] Variant `outline` → bg-transparent border border-border rounded-xl
    - [x] Sizes: default h-10, sm h-9, lg h-12, icon h-10 w-10 (44px touch min)
  - [x] `Card.tsx`: bg-card rounded-2xl border border-border (NIE shadow)
  - [x] `Input.tsx`: h-10 rounded-xl bg-card
  - [x] `Badge.tsx`: rounded-full pre tags, rounded-lg pre chips
- [x] Theme provider:
  - [x] Vytvoriť `ThemeProvider.tsx` s context pre light/dark/system
  - [x] Persist v localStorage
  - [x] Toggle button v header s Sun/Moon ikonou (Lucide)

### Layout shell
- [x] `Header.tsx`:
  - [x] Sticky top-0, h-14, bg-page/80 backdrop-blur, border-b
  - [x] Layout: [Logo: Plane icon + "Kam na dovolenku?" v Fraunces] [flex-1] [Štatistiky link] [Theme toggle]
  - [x] Mobile: hamburger menu pre nav links (md breakpoint)
- [x] `Layout.tsx`:
  - [x] Header + main + Toaster (sonner)
  - [x] `useTrackVisit` hook volaný v useEffect
- [x] `Footer.tsx` (voliteľne — minimalistický)

### Reusable design components
- [x] `MatchProgress.tsx` — animated progress bar s accent farbou
- [x] `WeatherIcon.tsx` — mapa Open-Meteo weather code → Lucide icon
- [x] `CountryFlag.tsx` — img tag s geonames URL + alt text + onError fallback
- [x] `Skeleton` shimmer cards pre loading states

### Verification
- [ ] Otvoriť dev server v prehliadači — stránka má warm cream background
- [ ] Skontrolovať že fonty sa loadujú (Inter pre body, Fraunces pre headings)
- [ ] Toggle theme funguje, color tokens sa swappujú
- [ ] DevTools: skontrolovať že inspect element zobrazuje `hsl(var(--token))` resolved hodnoty
- [ ] Lighthouse / axe DevTools: žiadne contrast errory

---

## 🗄 Phase 3 — Databáza a seed

### Migrácie
- [x] `php artisan make:migration create_countries_table`
  - [x] Stĺpce: id, iso_code (CHAR(2), UNIQUE), name_sk, capital, currency_code (CHAR(3))
- [x] `php artisan make:migration create_destination_types_table`
  - [x] code (UNIQUE), name_sk
- [x] `php artisan make:migration create_destinations_table`
  - [x] name, country_id (FK), latitude, longitude, flight_hours_from_vienna, description_sk, image_url nullable
- [x] `php artisan make:migration create_destination_destination_type_table` (pivot)
- [x] `php artisan make:migration create_monthly_climates_table`
  - [x] destination_id (FK), month (1-12), temp_avg, temp_min, temp_max
  - [x] UNIQUE(destination_id, month)
- [x] `php artisan make:migration create_searches_table`
  - [x] trip_types JSON, temperature_pref, max_flight_hours nullable, start_date, end_date, month
- [x] `php artisan make:migration create_search_results_table`
  - [x] search_id FK, destination_id FK, match_score
- [x] `php artisan make:migration create_visits_table`
  - [x] ip_hash CHAR(64), visited_at, INDEX(visited_at, ip_hash)

### Modely + vzťahy
- [x] `Country` (hasMany destinations)
- [x] `Destination` (belongsTo country, belongsToMany types, hasMany monthlyClimates)
- [x] `DestinationType` (belongsToMany destinations)
- [x] `MonthlyClimate` (belongsTo destination)
- [x] `Search` (hasMany results)
- [x] `SearchResult` (belongsTo search, belongsTo destination)
- [x] `Visit`

### Seedy
- [x] `DestinationTypeSeeder` — 5 typov:
  - sea_beach → "More a pláž"
  - mountains → "Hory a príroda"
  - historic → "Historické mestá"
  - city_break → "Mestský výlet"
  - adventure → "Aktivity a dobrodružstvo"
- [x] `CountrySeeder` — krajiny pre všetkých ~40 destinácií (~25 unikátnych krajín)
- [x] `DestinationSeeder` — pripraviť JSON/PHP array s 40 destináciami:
  - **More & pláž (8):** Barcelona, Palma de Mallorca, Nice, Split, Mykonos, Antalya, Hurghada, Dubrovník
  - **Hory & príroda (7):** Innsbruck, Chamonix, Zermatt, Reykjavík, Bergen, Tatranská Lomnica, Garmisch-Partenkirchen
  - **Historické mestá (8):** Rím, Atény, Praha, Krakov, Istanbul, Budapešť, Edinburgh, Lisabon
  - **Mestský výlet (8):** Paríž, Londýn, Amsterdam, Berlín, Viedeň, Kodaň, Štokholm, Dublin
  - **Aktivity & dobrodružstvo (5):** Marrákeš, Petra (Wadi Musa), Madeira (Funchal), Tenerife (Costa Adeje), Kapadócia (Goreme)
  - **Crossover/extra (4):** ďalšie destinácie alebo viac typov pre niektoré z hore
  - Pre každú: lat/lon, flight_hours, description_sk, types[], image_url
- [x] `ClimateSeeder` — 12 mesiacov × 40 destinácií = 480 záznamov
  - Zdroj: `php artisan climate:fetch` (viď nižšie)
- [x] Spustiť `php artisan migrate:fresh --seed` a overiť dáta

### Climate fetch command (helper)
- [x] `php artisan make:command FetchClimates`
- [x] Pre každú destináciu: stiahni `archive-api.open-meteo.com/v1/archive` za posledných 5 rokov
- [x] Agreguj po mesiacoch: avg/min/max temperature_2m
- [x] Insert do `monthly_climates` (use updateOrCreate aby bolo idempotentné)

---

## 🔌 Phase 4 — Backend API + scoring

### Services
- [x] `app/Services/ScoringService.php`
  - [x] `score(Destination $d, array $userPrefs, int $month): float`
  - [x] `getMatchReasons(Destination $d, array $userPrefs, int $month): array<string>` — vráti list dôvodov pre UI
- [x] `app/Services/StatsService.php`
  - [x] `getVisits(): array{total: int, unique: int}`
  - [x] `getHourlyDistribution(): array<string, int>`
  - [x] `getSearchedDestinations(string $sort, string $order): Collection`
  - [x] `getPreferenceStats(): array{types, temperatures}`

### Controllers + Routes
- [x] `php artisan make:controller Api/SearchController` → `POST /api/search`
  - [x] FormRequest validácia
  - [x] Volanie ScoringService pre každú destináciu
  - [x] Filter: flight_hours, aspoň 1 typ match
  - [x] Sort + limit 20
  - [x] Insert do `searches` + `search_results`
  - [x] Response: array s match_score, reasons[], destination data
- [x] `php artisan make:controller Api/DestinationController` → `GET /api/destinations/{id}?month=N`
  - [x] Vráti destination + country (s flag URL) + monthly_climate(month) + currency rate + current weather
- [x] `php artisan make:controller Api/CompareController` → `GET /api/compare?ids=1,2&month=N`
  - [x] Validácia: presne 2 ids
  - [x] Vráti dáta pre obe destinácie
- [x] `php artisan make:controller Api/StatsController`
  - [x] `GET /api/stats/visits`
  - [x] `GET /api/stats/hourly`
  - [x] `GET /api/stats/searches?sort=name|country|count&order=asc|desc`
  - [x] `GET /api/stats/preferences`
- [x] `php artisan make:controller Api/VisitController` → `POST /api/visits/track`

### Middleware
- [x] `php artisan make:middleware TrackVisit`
  - [x] Hash IP (SHA-256 + APP_KEY salt)
  - [x] Insert do `visits`
  - [x] Registrovať na web routes alebo volať z FE

### Validácia (FormRequests)
- [x] `SearchRequest` — trip_types (array, min 1), temperature_pref (in:hot,warm,mild,any), distance, dates
- [x] `CompareRequest` — ids (array, size 2), month (1-12)

---

## 🌐 Phase 5 — Externé API integrácia

- [x] `app/Services/WeatherService.php`
  - [x] `getCurrent(float $lat, float $lon): array` (s cache 1h)
  - [x] Mapa Open-Meteo weather_code → ikona name + popis (slovenský)
  - [x] Fallback na najbližšie hub mesto (Madrid/Rím/Atény/Istanbul/Dubaj)
- [x] `app/Services/CurrencyService.php`
  - [x] `getRateFromEur(string $currency): ?float` (s cache 6h)
  - [x] Vráti null pre EUR
  - [x] Bulk fetch pre všetky meny v DB pri prvom volaní
- [x] `app/Services/CountryService.php`
  - [x] (Voliteľné) doplňujúce info z REST Countries
- [x] `app/Services/LlmService.php`
  - [x] `generateWhyNow(Destination $d, int $month, MonthlyClimate $climate): string`
  - [x] Cache 24h podľa kľúča `why_now:{id}:{month}`
  - [x] OpenAI SDK alebo Guzzle direct call na `/v1/responses`
  - [x] Model: `gpt-5.4-mini`
  - [x] Max tokens: 200
  - [x] Fallback šablonový text pri chybe / chýbajúcom API key
- [x] Endpoint `GET /api/destinations/{id}/why-now?month=N` — volá LlmService

### Test
- [x] Zavolať každý service jednotlivo cez tinker / route
- [x] Skontrolovať cache funkciu — druhé volanie rovnaké by malo byť instant
- [x] Skontrolovať fallback — disable internet a zavolať

---

## 🎨 Phase 6 — Frontend: Home + Results + Detail

### HomePage
- [x] `SearchForm.tsx` (React Hook Form + Zod schema)
- [x] **Hero sekcia:**
  - [x] Decorative copper glow div (aria-hidden, -z-10, blur-3xl)
  - [x] h1 "Kam na dovolenku?" v font-display (Fraunces)
  - [x] Sub-text v text-muted-foreground
- [x] **Form card** (max-w-3xl bg-card rounded-2xl border p-6 lg:p-8 space-y-6):
  - [x] Toggle Mesiac vs. Rozsah dátumov (shadcn Tabs)
  - [x] Mesiac: shadcn Select s 12 možnosťami
  - [x] Rozsah: shadcn Calendar v Popover (mode="range")
  - [x] Počet dní: number input s +/- buttons (custom NumberInput.tsx)
  - [x] Typy dovolenky: 5× toggleable card v grid grid-cols-2 lg:grid-cols-3
    - [x] `TripTypeCard.tsx` — toggleable, accent-soft when selected
    - [x] Lucide ikony pre každý typ (Waves, Mountain, Building, Coffee, Compass)
  - [x] Teplota: segmented `RadioGroup` (4 možnosti)
  - [x] Vzdialenosť: segmented `RadioGroup` (3 možnosti)
- [x] Submit button (accent variant, h-12, w-full lg:w-auto)
- [x] Validácia: aspoň 1 typ dovolenky required, dátumy korektné
- [x] Submit → `navigate('/results?...')` s query stringom

### ResultsPage
- [x] Parsovanie query params → search request body
- [x] `useQuery` na `POST /api/search` (mutácia ako query)
- [x] **Sticky filter bar** (top-14 z-10 backdrop-blur):
  - [x] "← Späť na hľadanie"
  - [x] "Vybrané: X/2" + "Porovnať →" button (disabled until 2)
- [x] **Grid kariet** (`ResultCard.tsx`):
  - [x] Image (aspect-[4/3] object-cover) — picsum.photos seed alebo destination.image_url
  - [x] Header row: flag + name + country small text
  - [x] Match progress bar + "X% zhoda" label
  - [x] **MatchReasons.tsx** — bullet list s Check ikonami
  - [x] Footer: Compare checkbox + Detail link
  - [x] Card hover: border-accent transition
- [x] Empty state ak žiadne výsledky (Lucide SearchX icon + CTA)
- [x] Loading state (skeleton kariet — 6 placeholderov)

### DetailPage
- [x] `useQuery` na `GET /api/destinations/:id?month=N`
- [x] **Hero** — full-bleed image (h-64 lg:h-80) s gradient overlay
  - [x] Title overlay bottom-left v Fraunces, white text
  - [x] Back button top-left, ghost on dark
- [x] **Main column (lg:col-span-2):**
  - [x] h2 "O destinácii" + description text
  - [x] **WhyNowCard.tsx** — separátny `useQuery` na `/why-now`
    - [x] Card s `border-l-4 border-accent`
    - [x] Skeleton shimmer počas načítavania
  - [x] **WeatherCard.tsx** — sekcia "Počasie v {month}"
    - [x] 3 stat cards: Avg / Min / Max
    - [x] Číslo v font-display 3xl tabular-nums
  - [x] **Aktuálne počasie** — card s WeatherIcon + popis
    - [x] Indicator chip "Z najbližšieho mesta {X}" ak fallback
- [x] **Sidebar (lg:col-span-1) — sticky top-20:**
  - [x] Country card: flag (32px) + name + capital
  - [x] **CurrencyCard.tsx**: "1 EUR = X CZK" alebo "Používa sa euro"
  - [x] Trip types badges (rounded-full)
  - [x] Letové hodiny s Plane icon
  - [x] "Pridať do porovnania" accent button (full width)

---

## 🃏 Phase 7 — Frontend: Compare + Stats

### ComparePage
- [ ] Query params: `?ids=1,2&month=N`
- [ ] `useQuery` na `GET /api/compare`
- [ ] Header s 2 hero kartami (image + name + flag side by side)
- [ ] Comparison table (mobile: stacked):
  - [ ] Krajina + flag
  - [ ] Hlavné mesto
  - [ ] Mena + kurz
  - [ ] Typy dovolenky (badges)
  - [ ] Priemerná teplota v zvolenom mesiaci
  - [ ] Min / max teplota
  - [ ] Aktuálne počasie + ikona
  - [ ] Letové hodiny z Viedne
- [ ] Vizuálne odlíšenie zhôd: jemný `bg-accent-soft` highlight + Check icon (nie len color)
- [ ] State pre výber 2 destinácií — `useCompareSelection.ts` hook (sessionStorage)

### StatsPage
- [ ] Layout: max-w-7xl, h1 "Štatistiky portálu" v Fraunces
- [ ] Grid lg:grid-cols-12 gap-6:

#### VisitsCard (col-span-12 lg:col-span-6)
- [ ] 2 veľké čísla: Total / Unique
- [ ] font-display 5xl font-medium tabular-nums
- [ ] Label v text-sm text-muted-foreground
- [ ] `useQuery` s `refetchInterval: 30000`

#### HourlyChart (col-span-12 lg:col-span-6)
- [ ] Recharts BarChart, 4 stĺpce
- [ ] Custom theme: bars `fill="hsl(var(--accent))"`
- [ ] Tooltips, axis labels v slovenčine
- [ ] Responsive container

#### SearchTable (col-span-12)
- [ ] TanStack Table + shadcn Table komponent
- [ ] Stĺpce: Destinácia | Štát | Počet vyhľadávaní
- [ ] Sortovateľné (chevron up/down indicators)
- [ ] Server-side sort cez query params (alebo client-side ak <500 rows)
- [ ] Sort štát → secondary sort by destination name (handled v API)
- [ ] aria-sort na <th> (accessibility)
- [ ] Empty state ak žiadne searches

#### PreferencesChart (col-span-12)
- [ ] Grid 2 columns: Bar (typy) + Pie (teploty)
- [ ] Recharts s accent palette (variations of terracotta)
- [ ] Legends visible, tooltips

---

## 👀 Phase 8 — Visit tracking + kvality

- [ ] Implementovať middleware/endpoint na trackovanie
- [ ] Hash IP + APP_KEY (defenzívne)
- [ ] `useTrackVisit.ts` hook v Layout (volá `/api/visits/track` raz za session)
  - [ ] sessionStorage flag aby sa nevolalo viackrát na page reload
- [ ] Logika pre unique-per-60min (StatsService)
- [ ] **Test:** spustiť pár requestov z toho istého IP rýchlo za sebou → Total++, Unique nezvyšuje sa pre 60 min

---

## 💎 Phase 9 — Polish, dark mode, error handling

### Dizajn dotiahnutie
- [ ] Theme toggle v header funguje plynule (500ms colors transition)
- [ ] Dark mode test celej aplikácie:
  - [ ] HomePage hero čitateľný
  - [ ] ResultCard s obrázkami vyzerá dobre
  - [ ] DetailPage charts a cards
  - [ ] Stats charts farby v dark mode
- [ ] Empty states všade kde môžu byť — ilustrácie (SVG) + CTA
- [ ] Skeleton loaders všade kde sa fetchuje (nie spinners)
- [ ] Animácie:
  - [ ] Subtle fade-in pri navigácii (cez React Router transitions alebo CSS)
  - [ ] Hover states na cards (border-accent)
  - [ ] Reduced motion respect

### UX
- [ ] Toaster (sonner) pre potvrdenia/chyby
- [ ] Validačné error messages v slovenčine
- [ ] Form errors near field (NIE iba na top)
- [ ] Accessible: aria-labels, focus rings, keyboard navigation
  - [ ] Skip link "Preskočiť na obsah"
  - [ ] All buttons majú accessible name
  - [ ] aria-live na toaster
  - [ ] aria-sort na sortable columns
- [ ] Sentence case konzistentne (nie All Caps)
- [ ] Slovenské texty s diakritikou všade (ť, š, č, ž, ý, á, í, é, ú, ô, ä, ľ)
- [ ] Tabular nums pre čísla v štatistikách

### Error handling
- [ ] React Error Boundary v Layout (vlastný fallback UI)
- [ ] Try/catch v services backend
- [ ] User-friendly error messages (nie raw API errors)
- [ ] Retry mechanizmus v React Query (default: 3× s exp backoff)
- [ ] LlmService fallback funguje (otestovať s neplatným API key)

### Performance
- [ ] Lazy loading routes (`React.lazy`)
- [ ] Image lazy loading (`loading="lazy"` všetky <img>)
- [ ] Vite production build optimizations (manualChunks)
- [ ] Font loading: preload Inter + Fraunces
- [ ] Lighthouse audit: Performance ≥85, Accessibility 100

### Testing
- [ ] Manual test cez všetky obrazovky a flows
- [ ] Test responzivity: mobile (375px), tablet (768px), desktop (1280px)
- [ ] Browser test: Chrome + Firefox (zadanie vyžaduje)
- [ ] Test bez JS (graceful degradation? alebo aspoň meaningful error)
- [ ] axe DevTools: žiadne accessibility errory

---

## 🚀 Phase 10 — Deployment na VPS

### Príprava
- [ ] Lokálne: `cd frontend && npm run build` → `frontend/dist/`
- [ ] Skopírovať: `mkdir -p ../backend/public/app && cp -r dist/* ../backend/public/app/`
- [ ] V Vite config `base: '/z4/app/'` ak servuje z subpath, alebo `'/z4/'` ak z root subpath
- [ ] `cd backend && composer install --no-dev --optimize-autoloader`
- [ ] Vygenerovať SQL dump: `mysqldump -u root -p xbagins_z4 > backend/database/dump.sql`

### Upload na VPS
- [ ] FileZilla / SFTP: nahrať `backend/` (bez `vendor/`) do `/var/www/xbagins/z4/`
- [ ] Na VPS: `cd /var/www/xbagins/z4 && composer install --no-dev`
- [ ] Vytvoriť `.env` s production hodnotami (NIE commitnúť)
- [ ] `php artisan key:generate`
- [ ] Importovať SQL dump: `mysql -u xbagins -p xbagins_z4 < database/dump.sql`
- [ ] `php artisan config:cache && php artisan route:cache && php artisan view:cache`
- [ ] `chmod -R 775 storage bootstrap/cache`
- [ ] (Ak treba root prístup) `chown -R www-data:www-data storage bootstrap/cache`

### Nginx
- [ ] Skopírovať `nginx/z4.conf` na VPS (alebo include do default)
- [ ] `nginx -t && sudo systemctl reload nginx`
- [ ] Otestovať: `curl https://node22.webte.fei.stuba.sk/z4/`
- [ ] Otestovať API: `curl https://node22.webte.fei.stuba.sk/z4/api/destinations/1`

### End-to-end test na produkcii
- [ ] Otvoriť https://node22.webte.fei.stuba.sk/z4/ v Chrome
- [ ] Vyplniť formulár → výsledky zobrazené
- [ ] Klik na destináciu → detail funguje, počasie sa načíta z Open-Meteo
- [ ] LLM "Why now" text sa generuje
- [ ] Porovnanie 2 destinácií
- [ ] Štatistiky zobrazia tracked visits + searches
- [ ] Skontrolovať console na FE (žiadne errory)
- [ ] Skontrolovať `storage/logs/laravel.log` na BE (žiadne errory)
- [ ] Test v Firefox

---

## 📝 Phase 11 — README + ZIP odovzdanie

### README.txt — povinné sekcie

```
WEBTE2 — Zadanie č.4: Kam na dovolenku?
Autor: Sam Bagiňský (xbagins)
Dátum: [vyplniť]
URL: https://node22.webte.fei.stuba.sk/z4/

═══════════════════════════════════════════════
1. POPIS APLIKÁCIE
═══════════════════════════════════════════════
[Krátky popis: čo aplikácia robí, technológie]

═══════════════════════════════════════════════
2. POUŽITÉ TECHNOLÓGIE
═══════════════════════════════════════════════
- Backend: Laravel 11, PHP 8.2
- Frontend: React 18, TypeScript, Vite
- UI: shadcn/ui + Tailwind CSS v3
- Databáza: MariaDB
- Server: Nginx + PHP-FPM
- Externé API: Open-Meteo, Frankfurter, REST Countries, OpenAI

═══════════════════════════════════════════════
3. EXTERNÉ API
═══════════════════════════════════════════════
3.1 Open-Meteo (https://open-meteo.com/)
    Účel: Aktuálna predpoveď počasia pre destinácie + (pri seedingu)
    historické priemerné teploty pre mesačné štatistiky.
    Endpoint: api.open-meteo.com/v1/forecast
              archive-api.open-meteo.com/v1/archive
    Autentifikácia: žiadna (free tier).

3.2 Frankfurter (https://www.frankfurter.app/)
    Účel: Kurzy mien voči EUR pre informáciu o cieľovej krajine.
    Endpoint: api.frankfurter.app/latest
    Autentifikácia: žiadna.

3.3 REST Countries (https://restcountries.com/)
    Účel: Doplňujúce metadata o krajinách (validácia ISO kódov,
    fallback informácie).
    Endpoint: restcountries.com/v3.1/alpha/{iso}
    Autentifikácia: žiadna.

3.4 GeoNames Flags (geonames.org/flags/)
    Účel: Vlajky krajín — priame img tagy.
    URL: https://www.geonames.org/flags/x/{iso}.gif
    Autentifikácia: žiadna.

3.5 OpenAI API (https://api.openai.com)
    Účel: Generovanie textu "Prečo práve teraz" pre detail destinácie
    na základe dát z databázy (mesiac, teploty, typ dovolenky).
    Endpoint: api.openai.com/v1/responses
    Model: gpt-5.4-mini
    Autentifikácia: API key v .env (OPENAI_API_KEY).
    Cache: 24 hodín pre každú kombináciu destinácia+mesiac.

═══════════════════════════════════════════════
4. ŠTRUKTÚRA PROJEKTU
═══════════════════════════════════════════════
backend/         — Laravel API + buildnutý React v public/app
  app/Models/    — Eloquent modely
  app/Services/  — biznis logika (scoring, weather, currency, LLM)
  app/Http/      — controllers, middleware, requests
  database/      — migrácie, seedy, dump.sql
frontend/        — React zdrojáky (Vite, TS)
  src/pages/     — stránky (Home, Results, Detail, Compare, Stats)
  src/components/— znovupoužiteľné komponenty
  src/styles/    — design tokens, globals.css
nginx/z4.conf    — konfigurácia Nginx serveru

═══════════════════════════════════════════════
5. POSTUP NASADENIA
═══════════════════════════════════════════════
PREDPOKLADY:
  - PHP 8.2+, Composer, Node.js 18+, MariaDB 10+
  - OpenAI API key (https://platform.openai.com/api-keys)

LOKÁLNE SPUSTENIE (DEV):
  1. Klonovať / rozbaliť ZIP
  2. cd backend && composer install
  3. cp .env.example .env && php artisan key:generate
  4. Upraviť .env: DB credentials, OPENAI_API_KEY
  5. php artisan migrate --seed
  6. (voliteľne) php artisan climate:fetch
       — stiahne historické teploty z Open-Meteo
  7. php artisan serve  # beží na :8000
  8. cd ../frontend && npm install && npm run dev
       # beží na :5173 s proxy na :8000

PRODUKČNÝ BUILD A NASADENIE:
  1. Frontend build:
     cd frontend && npm install && npm run build
     # výstup → frontend/dist/

  2. Skopírovať build do Laravel public:
     mkdir -p backend/public/app
     cp -r frontend/dist/* backend/public/app/

  3. Backend dependencies:
     cd backend
     composer install --no-dev --optimize-autoloader

  4. Vygenerovať DB dump pre nasadenie:
     mysqldump -u root -p xbagins_z4 > database/dump.sql

  5. Upload na VPS (cez SFTP / scp):
     - Celý priečinok backend/ → /var/www/xbagins/z4/
     - Bez vendor/ a node_modules/

  6. Na VPS:
     cd /var/www/xbagins/z4
     composer install --no-dev --optimize-autoloader
     cp .env.example .env
     # upraviť .env (DB, APP_URL, OPENAI_API_KEY)
     php artisan key:generate
     mysql -u xbagins -p xbagins_z4 < database/dump.sql
     php artisan config:cache
     php artisan route:cache
     chmod -R 775 storage bootstrap/cache

  7. Nginx konfigurácia:
     - Skopírovať nginx/z4.conf do /etc/nginx/sites-available/
     - Aktivovať: ln -s /etc/nginx/sites-available/z4.conf
                  /etc/nginx/sites-enabled/
     - nginx -t && systemctl reload nginx

  8. Otestovať: https://node22.webte.fei.stuba.sk/z4/

═══════════════════════════════════════════════
6. DÁTOVÝ MODEL
═══════════════════════════════════════════════

countries
  ─ id, iso_code (CHAR 2), name_sk, capital, currency_code (CHAR 3)
  ─ Vzťah: hasMany destinations

destinations
  ─ id, name, country_id, latitude, longitude,
    flight_hours_from_vienna, description_sk, image_url
  ─ Vzťah: belongsTo country, belongsToMany destination_types,
    hasMany monthly_climates

destination_types
  ─ id, code, name_sk
  ─ Hodnoty code: sea_beach / mountains / historic /
                  city_break / adventure
  ─ Vzťah: belongsToMany destinations

destination_destination_type (pivot M:N)
  ─ destination_id, destination_type_id

monthly_climates
  ─ id, destination_id, month (1-12),
    temp_avg, temp_min, temp_max
  ─ UNIQUE(destination_id, month)
  ─ Účel: historické priemerné teploty pre každý mesiac

searches
  ─ id, trip_types (JSON), temperature_pref,
    max_flight_hours nullable, start_date, end_date,
    month, created_at
  ─ Vzťah: hasMany search_results
  ─ Účel: log preferencií používateľa pre štatistiky

search_results
  ─ id, search_id, destination_id, match_score
  ─ Vzťah: belongsTo search, belongsTo destination
  ─ Účel: pre štatistiku "Čo ľudia hľadajú"

visits
  ─ id, ip_hash (SHA-256 + salt), visited_at
  ─ Index na (visited_at, ip_hash)
  ─ POZNÁMKA: IP adresa sa NEUKLADÁ, iba jej hash s app key salt.
  ─ Účel: počítadlo návštev (total / unique-per-60-min)

═══════════════════════════════════════════════
7. PREMENNÉ PROSTREDIA (.env)
═══════════════════════════════════════════════
APP_URL=https://node22.webte.fei.stuba.sk/z4
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=xbagins_z4
DB_USERNAME=xbagins
DB_PASSWORD=***
OPENAI_API_KEY=sk-***

═══════════════════════════════════════════════
8. POZNÁMKY A OBMEDZENIA
═══════════════════════════════════════════════
- "Prečo práve teraz" text vyžaduje OpenAI API key. Ak nie je
  nastavený, použije sa fallback šablónový text generovaný
  z dostupných dát.
- Historické teploty sú uložené v DB; aktuálne počasie sa načítava
  v reálnom čase z Open-Meteo (cache 1h).
- Vlajky sa načítavajú priamo z geonames.org cez img tag.
- Rotácia API kľúčov: zmeniť OPENAI_API_KEY v .env a urobiť
  php artisan config:cache.
- Aplikácia je optimalizovaná pre posledné verzie Chrome a Firefox.
- Counter unique návštev: jedna IP počas posledných 60 min sa počíta
  ako jedna unique návšteva (definícia podľa zadania).

═══════════════════════════════════════════════
9. DIZAJN
═══════════════════════════════════════════════
Aplikácia používa custom design system inšpirovaný Anthropic Claude
docs (warm cream + terracotta accent + soft pill shapes).
- Typografia: Inter (body) + Fraunces (display headings)
- Farby: warm off-white pozadie, terracotta brand accent
- Shape language: 12px rounded-xl pre všetky interaktívne prvky
- Motion: 150ms ease-in-out default, 500ms theme transition
- Dark mode: plne podporovaný cez CSS custom properties
- Accessibility: WCAG AA contrast, keyboard nav, reduced motion

═══════════════════════════════════════════════
10. KONTAKT
═══════════════════════════════════════════════
Autor: Sam Bagiňský
Username: xbagins
FEI STU Bratislava
```

### Final ZIP checklist
- [ ] Skontrolovať obsah ZIPu:
  - [ ] `backend/` — všetky src files
  - [ ] `backend/composer.json`
  - [ ] `backend/.env.example` (NIE `.env` so skutočnými credentials)
  - [ ] `backend/database/dump.sql`
  - [ ] `frontend/` — src files
  - [ ] `frontend/package.json`
  - [ ] `frontend/vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`
  - [ ] `frontend/src/styles/globals.css` (design tokens)
  - [ ] `nginx/z4.conf`
  - [ ] `README.txt`
- [ ] Skontrolovať že NIE JE v ZIPe:
  - [ ] `vendor/` priečinok
  - [ ] `node_modules/` priečinok
  - [ ] `dist/` priečinok (build)
  - [ ] `.env` so skutočnými credentials
  - [ ] `.git/` (voliteľné — môže byť)
  - [ ] `.DS_Store`, `Thumbs.db`
- [ ] Vytvoriť ZIP: `zip -r xbagins_baginsky_z4.zip xbagins_baginsky_z4/ -x '*node_modules*' -x '*vendor*' -x '*.git*' -x '*dist*'`
- [ ] **Otestovať:** rozbaliť ZIP do iného priečinku, prejsť postup z README — funguje?
- [ ] Upload na **MS Teams**
- [ ] Upload na **node11.webte.fei.stuba.sk**
- [ ] Skontrolovať že odkaz na node22 v README funguje a aplikácia beží

---

## ⚠️ Otvorené otázky / k vyjasneniu

- [ ] **ZIP názov**: zadanie hovorí `idStudenta_priezvisko_z3.zip` ale je to z4 — pravdepodobne preklep, použijeme `xbagins_baginsky_z4.zip`. Spýtať sa ak treba.
- [ ] **Unique návštevy interpretácia**: definícia "z jednej IP počas posledných 60 minút" — implementujeme ako `COUNT(DISTINCT ip_hash) WHERE visited_at > NOW() - INTERVAL 60 MIN`.
- [ ] **Climate dáta** — zdroj: Open-Meteo Archive (last 5y aggregated) cez `php artisan climate:fetch`.
- [ ] **Obrázky destinácií** — picsum.photos placeholder vs. vlastný image_url field. Začneme s picsum, ak bude čas → kuratovať lepšie.

---

## 📊 Progress tracker

| Phase | Status | Komentár |
|---|---|---|
| 0 — Príprava | ☐ | |
| 1 — Setup | ☐ | |
| 2 — Design system ⭐ | ☐ | Tokeny, Tailwind, shadcn customization |
| 3 — Databáza | ☐ | |
| 4 — Backend API | ☐ | |
| 5 — Externé API | ☐ | |
| 6 — FE Home/Results/Detail | ☐ | |
| 7 — FE Compare/Stats | ☐ | |
| 8 — Visit tracking | ☐ | |
| 9 — Polish + dark mode | ☐ | |
| 10 — Deploy | ☐ | |
| 11 — README + ZIP | ☐ | |
