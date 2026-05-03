import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type MatchProgressProps = {
  value: number
  label?: string
  className?: string
}

export function MatchProgress({ value, label, className }: MatchProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label ?? 'Zhoda'}</span>
        <span className="font-mono text-muted-foreground">
          {Math.round(normalizedValue)}%
        </span>
      </div>
      <Progress value={normalizedValue} aria-label={label ?? 'Zhoda'} />
    </div>
  )
}
