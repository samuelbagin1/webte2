import { Check } from 'lucide-react'

type MatchReasonsProps = {
  reasons: string[]
}

export function MatchReasons({ reasons }: MatchReasonsProps) {
  return (
    <ul className="space-y-2">
      {reasons.slice(0, 4).map((reason) => (
        <li key={reason} className="flex gap-2 text-sm leading-5 text-muted-foreground">
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  )
}
