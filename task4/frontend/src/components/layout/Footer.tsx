import { Plane } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-page-alt">
      <div className="container flex min-h-16 items-center justify-between gap-4 py-4 text-sm text-muted-foreground">
        <Plane className="h-5 w-5 shrink-0" />
        <span>Kam na dovolenku?</span>
      </div>
    </footer>
  )
}
