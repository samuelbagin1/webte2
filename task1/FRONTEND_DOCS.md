# Frontend File Documentation

## Project Structure Overview

This frontend is a React 19 SPA (Single Page Application) built with Vite, TypeScript, Tailwind CSS v4, and shadcn/ui components. It communicates with a PHP REST API backend for an Olympics athletes database with authentication, import, and Google OAuth.

**Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + shadcn/ui (radix-maia style) + React Router v7 + TanStack React Table v8 + React Hook Form + Zod + Axios + Sonner

---

## Configuration Files

### `package.json`

**Dependencies:**

| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | React 19 SPA |
| `react-router-dom` v7 | Client-side routing, protected routes |
| `axios` | HTTP client for API calls |
| `@tanstack/react-table` v8 | Table — sorting, pagination, filtering |
| `react-hook-form` + `zod` + `@hookform/resolvers` | Form state + validation |
| `@react-oauth/google` | Google OAuth2 button |
| `sonner` | Toast notifications (NO alert/confirm!) |
| `lucide-react` | Icons |
| `@hugeicons/react` + `@hugeicons/core-free-icons` | Additional icons (shadcn default) |
| `js-cookie` | Cookie consent management |
| `next-themes` | Dark/light mode theming |
| `radix-ui` | Accessible UI primitives (used by shadcn/ui) |
| `class-variance-authority` + `clsx` + `tailwind-merge` | Utility classname merging |
| `@fontsource-variable/figtree` | Custom font |

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### `components.json` (shadcn/ui config)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-maia",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "hugeicons",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### `tsconfig.json` — Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> All imports use `@/` prefix — e.g. `import { Button } from "@/components/ui/button"`

---

## Project File Structure

```
frontend/src/
├── main.tsx                          # Entry point — renders App with providers
├── App.tsx                           # Root component — Router + Providers
├── index.css                         # Tailwind CSS + shadcn/ui theme variables
├── App.css                           # Custom global styles (minimal)
│
├── api/
│   └── client.ts                     # Axios instance (baseURL, withCredentials, interceptors)
│
├── context/
│   └── AuthContext.tsx                # Auth state provider (user, isLoggedIn, login/logout)
│
├── hooks/
│   ├── useAuth.ts                    # Shorthand for useContext(AuthContext)
│   └── useAthletes.ts               # Fetch athletes with filters/sort/pagination
│
├── router/
│   ├── routes.tsx                    # React Router v7 route definitions
│   └── ProtectedRoute.tsx           # Redirect to /login if not authenticated
│
├── pages/
│   ├── HomePage.tsx                  # Public — athletes table with filters
│   ├── AthleteDetailPage.tsx         # Public — full athlete detail
│   ├── LoginPage.tsx                 # Auth — local + Google login
│   ├── RegisterPage.tsx              # Auth — registration form
│   ├── TwoFactorSetupPage.tsx        # Auth — QR code display after registration
│   ├── DashboardPage.tsx             # Private — welcome + user info
│   ├── ProfilePage.tsx               # Private — edit name/surname + change password
│   ├── LoginHistoryPage.tsx          # Private — login history table
│   └── ImportPage.tsx                # Private — file upload + delete data
│
├── components/
│   ├── ui/                           # shadcn/ui auto-generated (DO NOT EDIT MANUALLY)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── tabs.tsx
│   │   └── table.tsx
│   ├── layout/
│   │   ├── Navbar.tsx                # Top navigation + logged-in user info
│   │   ├── Footer.tsx                # Footer
│   │   └── Layout.tsx                # Navbar + <Outlet /> + Footer wrapper
│   ├── athletes/
│   │   ├── AthleteTable.tsx          # TanStack Table with sorting + pagination
│   │   └── AthleteFilters.tsx        # Year + discipline dropdown filters
│   ├── auth/
│   │   ├── LoginForm.tsx             # Email + password + TOTP form
│   │   ├── RegisterForm.tsx          # Registration form with validation
│   │   └── GoogleLoginButton.tsx     # "Prihlásiť sa cez Google" button
│   ├── profile/
│   │   ├── EditProfileForm.tsx       # Edit first_name, last_name
│   │   └── ChangePasswordForm.tsx    # Change password form
│   ├── import/
│   │   ├── FileUpload.tsx            # File input + import button
│   │   └── DeleteDataButton.tsx      # Delete all olympic data button
│   └── common/
│       ├── CookieConsent.tsx         # Cookie consent banner (first visit)
│       └── LoadingSpinner.tsx        # Loading state component
│
└── lib/
    └── utils.ts                      # cn() helper for classnames
```

---

## Entry Point

### `src/main.tsx`

**Purpose:** Mount the React app into the DOM with all required providers.

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

---

### `src/App.tsx`

**Purpose:** Root component that renders the router and cookie consent.

```tsx
import { AppRoutes } from "@/router/routes";
import { CookieConsent } from "@/components/common/CookieConsent";

function App() {
  return (
    <>
      <AppRoutes />
      <CookieConsent />
    </>
  );
}

export default App;
```

---

## API Client

### `src/api/client.ts`

**Purpose:** Axios instance with base URL, credentials, and response interceptor for 401 handling.

**Key points:**
- `withCredentials: true` — sends session cookies with every request
- 401 interceptor — clears auth state when session expires
- Base URL configurable for dev vs production

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true, // CRITICAL: sends PHP session cookie
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Response interceptor — handle expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired — redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Usage in components:**
```typescript
import api from "@/api/client";

// GET
const { data } = await api.get("/athletes", { params: { page: 1, limit: 10 } });

// POST
const { data } = await api.post("/auth/login", { email, password, totp });

// PUT
await api.put("/user/profile", { first_name, last_name });

// DELETE
await api.delete("/import/data");

// File upload (multipart/form-data)
const formData = new FormData();
formData.append("file", file);
await api.post("/import/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

---

## Auth Context

### `src/context/AuthContext.tsx`

**Purpose:** Global auth state — stores logged-in user info, provides login/logout functions. Persists across page navigations. Checks session on mount via `/api/auth/me`.

```tsx
import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "@/api/client";

interface User {
  full_name: string;
  email: string;
  login_type: "LOCAL" | "OAUTH";
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser({
        full_name: data.full_name,
        email: data.email,
        login_type: data.login_type,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

---

### `src/hooks/useAuth.ts`

**Purpose:** Shorthand hook for consuming AuthContext.

```typescript
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

---

## Hooks

### `src/hooks/useAthletes.ts`

**Purpose:** Fetch athletes from the API with server-side filtering, sorting, and pagination (BONUS).

**API call:** `GET /api/athletes?page=1&limit=10&sort=surname&order=ASC&year=2024&discipline=3`

```typescript
import { useState, useEffect, useCallback } from "react";
import api from "@/api/client";

interface AthleteRecord {
  id: number;
  name: string;
  surname: string;
  year: number;
  type: string;
  city: string;
  country: string;
  discipline: string;
  placing: number;
}

interface UseAthletesParams {
  page: number;
  limit: number;
  sort: string;
  order: "ASC" | "DESC" | "";
  year?: number | null;
  discipline?: number | null;
}

interface UseAthletesResult {
  data: AthleteRecord[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAthletes(params: UseAthletesParams): UseAthletesResult {
  const [data, setData] = useState<AthleteRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: Record<string, string | number> = {
        page: params.page,
        limit: params.limit,
      };
      if (params.sort && params.order) {
        queryParams.sort = params.sort;
        queryParams.order = params.order;
      }
      if (params.year) queryParams.year = params.year;
      if (params.discipline) queryParams.discipline = params.discipline;

      const { data: response } = await api.get("/athletes", {
        params: queryParams,
      });
      setData(response.data);
      setTotal(response.total);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Nepodarilo sa načítať dáta";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.sort, params.order, params.year, params.discipline]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  return { data, total, loading, error, refetch: fetchAthletes };
}
```

---

## Router

### `src/router/routes.tsx`

**Purpose:** All route definitions — public, auth, and protected routes wrapped in Layout.

```tsx
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/router/ProtectedRoute";

import { HomePage } from "@/pages/HomePage";
import { AthleteDetailPage } from "@/pages/AthleteDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TwoFactorSetupPage } from "@/pages/TwoFactorSetupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { LoginHistoryPage } from "@/pages/LoginHistoryPage";
import { ImportPage } from "@/pages/ImportPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/athlete/:id" element={<AthleteDetailPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/2fa-setup" element={<TwoFactorSetupPage />} />

        {/* Protected routes — require login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login-history" element={<LoginHistoryPage />} />
          <Route path="/import" element={<ImportPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

---

### `src/router/ProtectedRoute.tsx`

**Purpose:** Wrapper that redirects unauthenticated users to `/login`. Shows loading skeleton while checking session.

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

---

## Layout Components

### `src/components/layout/Layout.tsx`

**Purpose:** Wraps all pages — Navbar + content area + Footer. Uses `<Outlet />` for nested routing.

```tsx
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

---

### `src/components/layout/Navbar.tsx`

**Purpose:** Top navigation bar. Shows different links based on auth state. Always displays logged-in user info (requirement #6).

**Key requirements:**
- Show user info (name, account type) on every page when logged in
- Show login/register links when not logged in
- Logout button that calls `POST /api/auth/logout`

```tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { User, LogOut, History, Settings, Upload } from "lucide-react";

export function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Boli ste úspešne odhlásený");
      navigate("/login");
    } catch {
      toast.error("Chyba pri odhlasovaní");
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl font-bold">
          Slovenskí olympionici
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost">Domov</Button>
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>

              {/* User dropdown with info — always visible when logged in */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    {user?.full_name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-medium">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.login_type === "OAUTH" ? "Google účet" : "Lokálny účet"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/login-history")}>
                    <History className="mr-2 h-4 w-4" />
                    História prihlásení
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/import")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import dát
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Odhlásiť sa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Prihlásenie</Button>
              </Link>
              <Link to="/register">
                <Button>Registrácia</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

---

### `src/components/layout/Footer.tsx`

**Purpose:** Simple footer with copyright.

```tsx
export function Footer() {
  return (
    <footer className="border-t bg-background py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Slovenskí olympionici — WEBTE2 Zadanie č.1</p>
      </div>
    </footer>
  );
}
```

---

## Pages

### `src/pages/HomePage.tsx`

**Purpose:** Public page — athletes table with year/discipline dropdown filters, 3-state column sorting (ASC → DESC → default), clickable name → detail, pagination (10/20/all). **BONUS:** server-side pagination and sorting via SQL LIMIT/OFFSET + ORDER BY.

**Requirements covered:** #3, #4 (table + filters + sorting + pagination)

**Behavior:**
- Two dropdown filters above table: **Rok** (year) and **Kategória** (discipline)
- When a filter is active, its corresponding column is HIDDEN from the table
- Column headers "Priezvisko", "Rok", "Kategória" are clickable for 3-state sorting (ASC → DESC → none)
- Clicking athlete name navigates to `/athlete/:id`
- Pagination: 10, 20, or all records per page

```tsx
import { useState, useEffect } from "react";
import { AthleteTable } from "@/components/athletes/AthleteTable";
import { AthleteFilters } from "@/components/athletes/AthleteFilters";
import { useAthletes } from "@/hooks/useAthletes";
import api from "@/api/client";

interface FilterOption {
  id: number;
  name: string;
}

export function HomePage() {
  // Filter state
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);

  // Sorting state: 3-state cycle (ASC → DESC → "" meaning default/none)
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<"ASC" | "DESC" | "">("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter options (fetched once)
  const [years, setYears] = useState<number[]>([]);
  const [disciplines, setDisciplines] = useState<FilterOption[]>([]);

  // Fetch filter options on mount
  useEffect(() => {
    api.get("/filters/years").then((res) => setYears(res.data));
    api.get("/filters/disciplines").then((res) => setDisciplines(res.data));
  }, []);

  // Fetch athletes with current params (server-side = BONUS)
  const { data, total, loading } = useAthletes({
    page,
    limit,
    sort,
    order,
    year: selectedYear,
    discipline: selectedDiscipline,
  });

  // 3-state sort cycle handler
  const handleSort = (column: string) => {
    if (sort !== column) {
      // New column — start with ASC
      setSort(column);
      setOrder("ASC");
    } else if (order === "ASC") {
      setOrder("DESC");
    } else if (order === "DESC") {
      // Reset — no sorting
      setSort("");
      setOrder("");
    }
    setPage(1); // reset page on sort change
  };

  // Reset page when filters change
  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
    setPage(1);
  };

  const handleDisciplineChange = (discipline: number | null) => {
    setSelectedDiscipline(discipline);
    setPage(1);
  };

  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Prehľad slovenských olympionikov</h1>

      {/* Filters */}
      <AthleteFilters
        years={years}
        disciplines={disciplines}
        selectedYear={selectedYear}
        selectedDiscipline={selectedDiscipline}
        onYearChange={handleYearChange}
        onDisciplineChange={handleDisciplineChange}
      />

      {/* Table */}
      <AthleteTable
        data={data}
        loading={loading}
        sort={sort}
        order={order}
        onSort={handleSort}
        hideYear={selectedYear !== null}
        hideDiscipline={selectedDiscipline !== null}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Záznamov na stránku:</span>
          {[10, 20, 0].map((l) => (
            <Button
              key={l}
              variant={limit === l ? "default" : "outline"}
              size="sm"
              onClick={() => { setLimit(l); setPage(1); }}
            >
              {l === 0 ? "Všetky" : l}
            </Button>
          ))}
        </div>

        {limit > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Predchádzajúca
            </Button>
            <span className="text-sm">
              Strana {page} z {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Nasledujúca
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

> **Note:** Import `Button` from `@/components/ui/button` (omitted from imports above for brevity — add it).

---

### `src/pages/AthleteDetailPage.tsx`

**Purpose:** Detail page for a single athlete — shows ALL data from the provided file (personal info + all Olympic records). Must have navigation back to the athletes list.

**Requirements covered:** #4 (click name → detail with all data, back navigation)

**API call:** `GET /api/athletes/:id` — returns athlete info + records (joined with olympics, discipline, country)

```tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

interface AthleteDetail {
  id: number;
  name: string;
  surname: string;
  birth_date: string;
  birth_place: string;
  birth_country: string;
  death_date: string | null;
  death_place: string | null;
  death_country: string | null;
  records: {
    year: number;
    type: string;
    city: string;
    host_country: string;
    discipline: string;
    placing: number;
  }[];
}

export function AthleteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthlete = async () => {
      try {
        const { data } = await api.get(`/athletes/${id}`);
        setAthlete(data);
      } catch {
        setAthlete(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAthlete();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Olympionik nebol nájdený.</p>
        <Link to="/">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na zoznam
          </Button>
        </Link>
      </div>
    );
  }

  const placingLabel = (placing: number) => {
    switch (placing) {
      case 1: return "Zlato";
      case 2: return "Striebro";
      case 3: return "Bronz";
      default: return `${placing}. miesto`;
    }
  };

  const placingVariant = (placing: number) => {
    switch (placing) {
      case 1: return "default";
      case 2: return "secondary";
      case 3: return "outline";
      default: return "ghost";
    }
  };

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link to="/">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Späť na zoznam
        </Button>
      </Link>

      {/* Personal info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {athlete.name} {athlete.surname}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Dátum narodenia</p>
            <p className="font-medium">
              {new Date(athlete.birth_date).toLocaleDateString("sk-SK")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Miesto narodenia</p>
            <p className="font-medium">
              {athlete.birth_place}, {athlete.birth_country}
            </p>
          </div>
          {athlete.death_date && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Dátum úmrtia</p>
                <p className="font-medium">
                  {new Date(athlete.death_date).toLocaleDateString("sk-SK")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Miesto úmrtia</p>
                <p className="font-medium">
                  {athlete.death_place}
                  {athlete.death_country ? `, ${athlete.death_country}` : ""}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Olympic records table */}
      <Card>
        <CardHeader>
          <CardTitle>Olympijské záznamy</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rok</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Mesto</TableHead>
                <TableHead>Krajina</TableHead>
                <TableHead>Disciplína</TableHead>
                <TableHead>Umiestnenie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {athlete.records.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.year}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.type}</Badge>
                  </TableCell>
                  <TableCell>{record.city}</TableCell>
                  <TableCell>{record.host_country}</TableCell>
                  <TableCell>{record.discipline}</TableCell>
                  <TableCell>
                    <Badge variant={placingVariant(record.placing)}>
                      {placingLabel(record.placing)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### `src/pages/LoginPage.tsx`

**Purpose:** Login page with two auth methods: local (email + password + TOTP 2FA code) and Google OAuth2. NO alert()/confirm() — uses Sonner toast instead.

**Requirements covered:** #5 (local auth with 2FA + Google OAuth2), #9 (validation)

**API calls:**
- `POST /api/auth/login` — `{ email, password, totp }` → `{ message, user }`
- `GET /api/auth/google` — → `{ url }` → redirect to Google

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/auth/LoginForm";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Prihlásenie</CardTitle>
          <CardDescription>
            Prihláste sa lokálnym účtom alebo cez Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Local login form */}
          <LoginForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">alebo</span>
            </div>
          </div>

          {/* Google OAuth */}
          <GoogleLoginButton />

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground">
            Nemáte účet?{" "}
            <Link to="/register" className="underline font-medium text-primary">
              Zaregistrujte sa
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### `src/pages/RegisterPage.tsx`

**Purpose:** Registration form — first_name, last_name, email, password, password_repeat. After success → navigate to 2FA setup page to display QR code.

**Requirements covered:** #5 (registration + 2FA setup), #9 (frontend + backend validation)

**API call:** `POST /api/auth/register` — `{ first_name, last_name, email, password, password_repeat }` → `{ message, tfa_secret, qr_code }`

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registrácia</CardTitle>
          <CardDescription>
            Vytvorte si nový účet pre prístup do privátnej zóny
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RegisterForm />

          <p className="text-center text-sm text-muted-foreground">
            Už máte účet?{" "}
            <Link to="/login" className="underline font-medium text-primary">
              Prihláste sa
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### `src/pages/TwoFactorSetupPage.tsx`

**Purpose:** After registration — displays the QR code for Google Authenticator and the secret key for manual entry. User must scan this before they can log in.

**Requirements covered:** #5 (2FA setup after registration)

**Data source:** Passed via `useLocation().state` from RegisterForm after successful registration.

```tsx
import { useLocation, Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TwoFactorSetupPage() {
  const location = useLocation();
  const { qr_code, tfa_secret } = (location.state as {
    qr_code?: string;
    tfa_secret?: string;
  }) || {};

  // Redirect if no QR data (direct URL access)
  if (!qr_code || !tfa_secret) {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Nastavenie 2FA</CardTitle>
          <CardDescription>
            Naskenujte QR kód v aplikácii Google Authenticator alebo zadajte kód manuálne
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code image */}
          <div className="flex justify-center">
            <img
              src={qr_code}
              alt="2FA QR kód"
              className="rounded-lg border p-2"
              width={200}
              height={200}
            />
          </div>

          {/* Manual secret */}
          <div className="space-y-2">
            <Label>Manuálny kód</Label>
            <Input value={tfa_secret} readOnly className="font-mono text-center" />
            <p className="text-xs text-muted-foreground text-center">
              Ak nemôžete naskenovať QR kód, zadajte tento kód manuálne do vašej autentifikačnej aplikácie.
            </p>
          </div>

          {/* Navigate to login */}
          <Link to="/login" className="block">
            <Button className="w-full">Pokračovať na prihlásenie</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### `src/pages/DashboardPage.tsx`

**Purpose:** Private zone landing page — welcome message, user info (who is logged in, which account type), navigation to profile/history/import sections.

**Requirements covered:** #6 (show who is logged in, account type, welcome message)

```tsx
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, History, Upload } from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Vitajte, {user?.full_name}!
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Prihlásený ako {user?.email}
            <Badge variant="outline">
              {user?.login_type === "OAUTH" ? "Google účet" : "Lokálny účet"}
            </Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick actions grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Profil
            </CardTitle>
            <CardDescription>
              Zmeniť meno, priezvisko alebo heslo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/profile">
              <Button variant="outline" className="w-full">Upraviť profil</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              História prihlásení
            </CardTitle>
            <CardDescription>
              Zobraziť históriu prihlásení pre váš účet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login-history">
              <Button variant="outline" className="w-full">Zobraziť históriu</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Import dát
            </CardTitle>
            <CardDescription>
              Importovať nové dáta zo súboru XLSX/CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/import">
              <Button variant="outline" className="w-full">Importovať</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### `src/pages/ProfilePage.tsx`

**Purpose:** Edit user profile — change first_name/last_name (pre-filled from DB), change password. Uses Tabs to separate the two forms.

**Requirements covered:** #7 (edit name/surname pre-filled, change password)

**API calls:**
- `PUT /api/user/profile` — `{ first_name, last_name }`
- `PUT /api/user/password` — `{ current_password, new_password, new_password_repeat }`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { useAuth } from "@/hooks/useAuth";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Nastavenia profilu</h1>

      <Card>
        <CardHeader>
          <CardTitle>Váš profil</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Osobné údaje</TabsTrigger>
              {/* Only show password change for local accounts */}
              {user?.login_type === "LOCAL" && (
                <TabsTrigger value="password">Zmena hesla</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile" className="mt-4">
              <EditProfileForm />
            </TabsContent>

            {user?.login_type === "LOCAL" && (
              <TabsContent value="password" className="mt-4">
                <ChangePasswordForm />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### `src/pages/LoginHistoryPage.tsx`

**Purpose:** Display login history table for the current user — shows date/time, login method (local/Google).

**Requirements covered:** #5 (store login history), #7 (view login history)

**API call:** `GET /api/user/login-history` → `[{ id, login_type, created_at }]`

```tsx
import { useState, useEffect } from "react";
import api from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LoginEntry {
  id: number;
  login_type: "LOCAL" | "OAUTH";
  created_at: string;
}

export function LoginHistoryPage() {
  const [history, setHistory] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/user/login-history");
        setHistory(data);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">História prihlásení</h1>

      <Card>
        <CardHeader>
          <CardTitle>Posledné prihlásenia</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dátum a čas</TableHead>
                <TableHead>Spôsob prihlásenia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    Žiadne záznamy o prihlásení.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleString("sk-SK")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.login_type === "OAUTH" ? "secondary" : "default"}>
                        {entry.login_type === "OAUTH" ? "Google" : "Lokálne"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### `src/pages/ImportPage.tsx`

**Purpose:** Private zone — file upload input for XLSX/CSV + import button, delete data button. After delete, import must still work.

**Requirements covered:** #2 (file upload + import), #8 (import + delete data)

**API calls:**
- `POST /api/import/upload` — multipart/form-data with `file` field
- `DELETE /api/import/data` — delete all Olympic data

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/import/FileUpload";
import { DeleteDataButton } from "@/components/import/DeleteDataButton";

export function ImportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Správa dát</h1>

      {/* File upload section */}
      <Card>
        <CardHeader>
          <CardTitle>Import dát</CardTitle>
          <CardDescription>
            Nahrajte súbor vo formáte XLSX alebo CSV s dátami olympionikov.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload />
        </CardContent>
      </Card>

      <Separator />

      {/* Delete data section */}
      <Card>
        <CardHeader>
          <CardTitle>Vymazanie dát</CardTitle>
          <CardDescription>
            Vymazať všetky olympijské dáta z databázy. Po vymazaní je možné dáta znova importovať.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteDataButton />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Components

### `src/components/athletes/AthleteFilters.tsx`

**Purpose:** Two dropdown (Select) filters above the table — Year and Discipline/Category. Uses shadcn/ui Select.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  id: number;
  name: string;
}

interface AthleteFiltersProps {
  years: number[];
  disciplines: FilterOption[];
  selectedYear: number | null;
  selectedDiscipline: number | null;
  onYearChange: (year: number | null) => void;
  onDisciplineChange: (discipline: number | null) => void;
}

export function AthleteFilters({
  years,
  disciplines,
  selectedYear,
  selectedDiscipline,
  onYearChange,
  onDisciplineChange,
}: AthleteFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Year filter */}
      <div className="w-48">
        <Select
          value={selectedYear?.toString() ?? "all"}
          onValueChange={(val) => onYearChange(val === "all" ? null : Number(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Rok" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky roky</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Discipline/Category filter */}
      <div className="w-64">
        <Select
          value={selectedDiscipline?.toString() ?? "all"}
          onValueChange={(val) => onDisciplineChange(val === "all" ? null : Number(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky kategórie</SelectItem>
            {disciplines.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

---

### `src/components/athletes/AthleteTable.tsx`

**Purpose:** Main data table using shadcn/ui Table + TanStack React Table. Supports:
- 3-state column sorting on "Priezvisko", "Rok", "Kategória" (ASC → DESC → none)
- Hiding columns when filter is active
- Clickable name → athlete detail page
- Loading skeleton state

```tsx
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface AthleteRecord {
  id: number;
  name: string;
  surname: string;
  year: number;
  type: string;
  city: string;
  country: string;
  discipline: string;
  placing: number;
}

interface AthleteTableProps {
  data: AthleteRecord[];
  loading: boolean;
  sort: string;
  order: "ASC" | "DESC" | "";
  onSort: (column: string) => void;
  hideYear: boolean;
  hideDiscipline: boolean;
}

export function AthleteTable({
  data,
  loading,
  sort,
  order,
  onSort,
  hideYear,
  hideDiscipline,
}: AthleteTableProps) {
  // Sort indicator icon
  const SortIcon = ({ column }: { column: string }) => {
    if (sort !== column) return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
    if (order === "ASC") return <ArrowUp className="ml-1 h-4 w-4 inline" />;
    if (order === "DESC") return <ArrowDown className="ml-1 h-4 w-4 inline" />;
    return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
  };

  // Sortable header cell
  const SortableHead = ({ column, label }: { column: string; label: string }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => onSort(column)}
    >
      {label}
      <SortIcon column={column} />
    </TableHead>
  );

  const placingLabel = (placing: number) => {
    switch (placing) {
      case 1: return "Zlato";
      case 2: return "Striebro";
      case 3: return "Bronz";
      default: return `${placing}. miesto`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Žiadne záznamy na zobrazenie.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Meno</TableHead>
            {/* "Priezvisko" — sortable */}
            <SortableHead column="surname" label="Priezvisko" />
            {/* "Rok" — sortable, hidden when year filter active */}
            {!hideYear && <SortableHead column="year" label="Rok" />}
            {/* Type (LOH/ZOH) */}
            <TableHead>Typ</TableHead>
            {/* Country */}
            <TableHead>Krajina</TableHead>
            {/* "Kategória" — sortable, hidden when discipline filter active */}
            {!hideDiscipline && <SortableHead column="discipline" label="Kategória" />}
            {/* Placing */}
            <TableHead>Umiestnenie</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((athlete, index) => (
            <TableRow key={`${athlete.id}-${index}`}>
              {/* Clickable name → detail page */}
              <TableCell>
                <Link
                  to={`/athlete/${athlete.id}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {athlete.name}
                </Link>
              </TableCell>
              <TableCell>{athlete.surname}</TableCell>
              {!hideYear && <TableCell>{athlete.year}</TableCell>}
              <TableCell>
                <Badge variant="outline">{athlete.type}</Badge>
              </TableCell>
              <TableCell>{athlete.country}</TableCell>
              {!hideDiscipline && <TableCell>{athlete.discipline}</TableCell>}
              <TableCell>
                <Badge variant={athlete.placing <= 3 ? "default" : "secondary"}>
                  {placingLabel(athlete.placing)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### `src/components/auth/LoginForm.tsx`

**Purpose:** Local login form — email + password + TOTP 2FA code. Uses react-hook-form + zod for validation. On success → sets auth context + navigates to dashboard.

**Validation (onBlur):**
- Email: valid format
- Password: not empty
- TOTP: exactly 6 digits

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Neplatný formát e-mailu"),
  password: z.string().min(1, "Heslo je povinné"),
  totp: z
    .string()
    .length(6, "TOTP kód musí mať 6 číslic")
    .regex(/^\d{6}$/, "TOTP kód musí obsahovať iba číslice"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // validate on field blur (requirement #9)
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", values);
      login(data.user);
      toast.success("Úspešne prihlásený");
      navigate("/dashboard");
    } catch (err: unknown) {
      // Generic error message — don't reveal what specifically failed (requirement #5)
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Nesprávne prihlasovacie údaje";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="vas@email.sk"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Heslo</Label>
        <Input
          id="password"
          type="password"
          placeholder="Vaše heslo"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* TOTP 2FA Code */}
      <div className="space-y-2">
        <Label htmlFor="totp">2FA kód (Google Authenticator)</Label>
        <Input
          id="totp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          {...register("totp")}
          aria-invalid={!!errors.totp}
        />
        {errors.totp && (
          <p className="text-sm text-destructive">{errors.totp.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Prihlasovanie..." : "Prihlásiť sa"}
      </Button>
    </form>
  );
}
```

---

### `src/components/auth/RegisterForm.tsx`

**Purpose:** Registration form with full validation (onBlur). After success → navigates to 2FA setup page with QR code data.

**Validation (onBlur):**
- First/last name: required, max 100 chars
- Email: valid format
- Password: min 8 chars, must contain uppercase + number
- Password repeat: must match

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "Meno je povinné")
      .max(100, "Meno nesmie presiahnuť 100 znakov"),
    last_name: z
      .string()
      .min(1, "Priezvisko je povinné")
      .max(100, "Priezvisko nesmie presiahnuť 100 znakov"),
    email: z.string().email("Neplatný formát e-mailu"),
    password: z
      .string()
      .min(8, "Heslo musí mať aspoň 8 znakov")
      .regex(/[A-Z]/, "Heslo musí obsahovať aspoň jedno veľké písmeno")
      .regex(/[0-9]/, "Heslo musí obsahovať aspoň jednu číslicu"),
    password_repeat: z.string(),
  })
  .refine((data) => data.password === data.password_repeat, {
    message: "Heslá sa nezhodujú",
    path: ["password_repeat"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur", // validate on field blur
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", values);
      toast.success("Registrácia úspešná! Nastavte si 2FA.");
      // Navigate to 2FA setup with QR code data
      navigate("/2fa-setup", {
        state: {
          qr_code: data.qr_code,
          tfa_secret: data.tfa_secret,
        },
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Chyba pri registrácii";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* First name */}
        <div className="space-y-2">
          <Label htmlFor="first_name">Meno</Label>
          <Input
            id="first_name"
            placeholder="Ján"
            {...register("first_name")}
            aria-invalid={!!errors.first_name}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last name */}
        <div className="space-y-2">
          <Label htmlFor="last_name">Priezvisko</Label>
          <Input
            id="last_name"
            placeholder="Novák"
            {...register("last_name")}
            aria-invalid={!!errors.last_name}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="reg_email">E-mail</Label>
        <Input
          id="reg_email"
          type="email"
          placeholder="vas@email.sk"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="reg_password">Heslo</Label>
        <Input
          id="reg_password"
          type="password"
          placeholder="Min. 8 znakov, veľké písmeno + číslo"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Password repeat */}
      <div className="space-y-2">
        <Label htmlFor="password_repeat">Heslo znova</Label>
        <Input
          id="password_repeat"
          type="password"
          placeholder="Zopakujte heslo"
          {...register("password_repeat")}
          aria-invalid={!!errors.password_repeat}
        />
        {errors.password_repeat && (
          <p className="text-sm text-destructive">{errors.password_repeat.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Registrácia..." : "Zaregistrovať sa"}
      </Button>
    </form>
  );
}
```

---

### `src/components/auth/GoogleLoginButton.tsx`

**Purpose:** "Prihlásiť sa cez Google" button. Calls backend to get the Google OAuth URL, then redirects the browser.

**API call:** `GET /api/auth/google` → `{ url }` → `window.location.href = url`

```tsx
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/api/client";
import { useState } from "react";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/google");
      // Redirect to Google OAuth consent screen
      window.location.href = data.url;
    } catch {
      toast.error("Nepodarilo sa pripojiť ku Google");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {/* Google "G" icon */}
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {loading ? "Presmerovanie..." : "Prihlásiť sa cez Google"}
    </Button>
  );
}
```

---

### `src/components/profile/EditProfileForm.tsx`

**Purpose:** Edit first name and last name — pre-filled with current values from DB (requirement #7). Uses react-hook-form + zod.

**API call:** `PUT /api/user/profile` — `{ first_name, last_name }`

```tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, "Meno je povinné")
    .max(100, "Meno nesmie presiahnuť 100 znakov"),
  last_name: z
    .string()
    .min(1, "Priezvisko je povinné")
    .max(100, "Priezvisko nesmie presiahnuť 100 znakov"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfileForm() {
  const { refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
  });

  // Pre-fill form with current user data from DB
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/user/profile");
        reset({
          first_name: data.first_name,
          last_name: data.last_name,
        });
      } catch {
        toast.error("Nepodarilo sa načítať profil");
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      await api.put("/user/profile", values);
      toast.success("Profil bol aktualizovaný");
      await refreshUser(); // Update navbar user info
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Chyba pri aktualizácii profilu";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit_first_name">Meno</Label>
        <Input
          id="edit_first_name"
          {...register("first_name")}
          aria-invalid={!!errors.first_name}
        />
        {errors.first_name && (
          <p className="text-sm text-destructive">{errors.first_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit_last_name">Priezvisko</Label>
        <Input
          id="edit_last_name"
          {...register("last_name")}
          aria-invalid={!!errors.last_name}
        />
        {errors.last_name && (
          <p className="text-sm text-destructive">{errors.last_name.message}</p>
        )}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Ukladanie..." : "Uložiť zmeny"}
      </Button>
    </form>
  );
}
```

---

### `src/components/profile/ChangePasswordForm.tsx`

**Purpose:** Change password form — current password + new password + repeat. Only shown for local accounts (not Google OAuth).

**API call:** `PUT /api/user/password` — `{ current_password, new_password, new_password_repeat }`

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Aktuálne heslo je povinné"),
    new_password: z
      .string()
      .min(8, "Nové heslo musí mať aspoň 8 znakov")
      .regex(/[A-Z]/, "Nové heslo musí obsahovať aspoň jedno veľké písmeno")
      .regex(/[0-9]/, "Nové heslo musí obsahovať aspoň jednu číslicu"),
    new_password_repeat: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_repeat, {
    message: "Nové heslá sa nezhodujú",
    path: ["new_password_repeat"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setSubmitting(true);
    try {
      await api.put("/user/password", values);
      toast.success("Heslo bolo úspešne zmenené");
      reset();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Chyba pri zmene hesla";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current_password">Aktuálne heslo</Label>
        <Input
          id="current_password"
          type="password"
          {...register("current_password")}
          aria-invalid={!!errors.current_password}
        />
        {errors.current_password && (
          <p className="text-sm text-destructive">{errors.current_password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new_password">Nové heslo</Label>
        <Input
          id="new_password"
          type="password"
          placeholder="Min. 8 znakov, veľké písmeno + číslo"
          {...register("new_password")}
          aria-invalid={!!errors.new_password}
        />
        {errors.new_password && (
          <p className="text-sm text-destructive">{errors.new_password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new_password_repeat">Nové heslo znova</Label>
        <Input
          id="new_password_repeat"
          type="password"
          {...register("new_password_repeat")}
          aria-invalid={!!errors.new_password_repeat}
        />
        {errors.new_password_repeat && (
          <p className="text-sm text-destructive">{errors.new_password_repeat.message}</p>
        )}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Mením heslo..." : "Zmeniť heslo"}
      </Button>
    </form>
  );
}
```

---

### `src/components/import/FileUpload.tsx`

**Purpose:** File input for XLSX/CSV + upload/import button. Uses native file input styled with shadcn/ui Input + Button.

**API call:** `POST /api/import/upload` — multipart/form-data with `file`

```tsx
import { useState, useRef } from "react";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      const ext = selected.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
        toast.error("Povolené formáty: XLSX, XLS, CSV");
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vyberte súbor na import");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await api.post("/import/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(data.message || "Import úspešný");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Chyba pri importe";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file_upload">Súbor (XLSX, CSV)</Label>
        <Input
          id="file_upload"
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
        />
        {file && (
          <p className="text-sm text-muted-foreground">
            Vybraný súbor: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2">
        <Upload className="h-4 w-4" />
        {uploading ? "Importujem..." : "Importovať dáta"}
      </Button>
    </div>
  );
}
```

---

### `src/components/import/DeleteDataButton.tsx`

**Purpose:** Delete all Olympic data from the database. Uses a shadcn/ui Dialog for confirmation instead of `confirm()` (requirement #9).

**API call:** `DELETE /api/import/data`

```tsx
import { useState } from "react";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteDataButton() {
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/import/data");
      toast.success("Dáta boli úspešne vymazané");
      setOpen(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Chyba pri vymazávaní dát";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Vymazať všetky dáta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vymazať olympijské dáta?</DialogTitle>
          <DialogDescription>
            Táto akcia vymaže všetky záznamy olympionikov z databázy.
            Po vymazaní je možné dáta znova importovať zo súboru.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Zrušiť</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Mazanie..." : "Potvrdiť vymazanie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### `src/components/common/CookieConsent.tsx`

**Purpose:** Cookie consent banner — shown on first visit. Uses `js-cookie` to store acceptance. Required because the app stores personal user data (requirement #5).

```tsx
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const COOKIE_CONSENT_KEY = "cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!Cookies.get(COOKIE_CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set(COOKIE_CONSENT_KEY, "accepted", { expires: 365 });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Táto stránka používa cookies na ukladanie informácií o prihlásení
            a zabezpečenie správneho fungovania aplikácie.
          </p>
          <Button onClick={handleAccept} size="sm" className="shrink-0">
            Súhlasím
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### `src/components/common/LoadingSpinner.tsx`

**Purpose:** Reusable loading indicator.

```tsx
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={`h-6 w-6 animate-spin ${className ?? ""}`} />;
}
```

---

## Utility Library

### `src/lib/utils.ts`

**Purpose:** `cn()` helper for conditional classname merging — used by all shadcn/ui components.

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Available shadcn/ui Components

All installed and ready to use via `@/components/ui/`:

| Component | Import | Usage |
|-----------|--------|-------|
| `Badge` | `@/components/ui/badge` | Status labels, placing (gold/silver/bronze), login type |
| `Button` | `@/components/ui/button` | All buttons — variants: default, outline, secondary, ghost, destructive, link |
| `Card` | `@/components/ui/card` | Page sections — CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Dialog` | `@/components/ui/dialog` | Confirmation dialogs (delete data) — NO confirm()! |
| `DropdownMenu` | `@/components/ui/dropdown-menu` | Navbar user menu |
| `Input` | `@/components/ui/input` | All text inputs, file upload |
| `Label` | `@/components/ui/label` | Form field labels |
| `Select` | `@/components/ui/select` | Filter dropdowns (year, discipline) |
| `Separator` | `@/components/ui/separator` | Visual dividers |
| `Skeleton` | `@/components/ui/skeleton` | Loading placeholders |
| `Sonner` | `@/components/ui/sonner` | Toast notifications (success, error, info) |
| `Tabs` | `@/components/ui/tabs` | Profile page — personal info vs password change |
| `Table` | `@/components/ui/table` | Athletes table, records table, login history table |

### Adding new shadcn/ui components

```bash
npx shadcn@latest add <component-name>
# e.g.: npx shadcn@latest add alert-dialog checkbox pagination
```

---

## Key Implementation Rules

### NO alert()/confirm() — PENALIZED!
Use `toast` from `sonner` and `Dialog` from shadcn/ui instead:
```tsx
// SUCCESS notification
toast.success("Operácia úspešná");

// ERROR notification
toast.error("Niečo sa pokazilo");

// CONFIRMATION dialog — use shadcn/ui Dialog, NOT confirm()
<Dialog>
  <DialogTrigger>Delete</DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>
```

### Validation — Frontend + Backend
- Frontend: `react-hook-form` + `zod` with `mode: "onBlur"` (validate on field blur)
- Backend: PHP `filter_var()`, regex, prepared statements
- Show inline `<p className="text-sm text-destructive">` error messages under fields

### Session Cookies
- Axios must use `withCredentials: true` to send PHP session cookies
- Backend sets `session_start()` and uses `$_SESSION`

### Responsive Design (requirement #10)
- Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Container with `mx-auto px-4`
- Grid layouts: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- Min 2 custom fonts — Figtree (installed via `@fontsource-variable/figtree`) + system fallback

### Slovak Language
- All UI text in Slovak with correct diacritics (UTF-8)
- Date formatting: `toLocaleDateString("sk-SK")`
- Error messages in Slovak

---

## Environment Variables

Create `.env` file in `frontend/` root for local development:

```env
VITE_API_URL=http://localhost:8000/api
```

For production, the Vite build uses relative `/api` path (proxied by Nginx).

Access in code: `import.meta.env.VITE_API_URL`
