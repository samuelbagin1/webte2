import * as React from 'react'
import { Link } from 'react-router-dom'
import { Menu, Moon, Plane, Sun, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/layout/ThemeProvider'
import { cn } from '@/lib/utils'

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Prepnúť farebný režim"
      onClick={() => setTheme(nextTheme)}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-page/80 backdrop-blur">
      <div className="container flex h-full items-center gap-3">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 rounded-xl text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Kam na dovolenku? domov"
        >
          <Plane className="h-5 w-5 shrink-0" />
          <span className="truncate font-display text-lg font-medium">
            Kam na dovolenku?
          </span>
        </Link>

        <div className="flex-1" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hlavná navigácia">
          <Button variant="ghost" asChild>
            <Link to="/stats">Štatistiky</Link>
          </Button>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label="Otvoriť navigáciu"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          'border-b border-border bg-page px-4 py-3 md:hidden',
          isOpen ? 'block' : 'hidden',
        )}
      >
        <Button
          variant="ghost"
          className="w-full justify-start"
          asChild
          onClick={() => setIsOpen(false)}
        >
          <Link to="/stats">Štatistiky</Link>
        </Button>
      </div>
    </header>
  )
}
