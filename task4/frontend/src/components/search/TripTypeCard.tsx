import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type TripTypeCardProps = {
  icon: LucideIcon
  label: string
  description: string
  selected: boolean
  onToggle: () => void
}

export function TripTypeCard({
  icon: Icon,
  label,
  description,
  selected,
  onToggle,
}: TripTypeCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        'min-h-32 rounded-2xl border border-border bg-card p-4 text-left transition-colors duration-150 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected && 'border-accent bg-accent-soft',
      )}
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="block text-sm font-semibold text-foreground">
        {label}
      </span>
      <span className="mt-1 block text-sm leading-5 text-muted-foreground">
        {description}
      </span>
    </button>
  )
}
