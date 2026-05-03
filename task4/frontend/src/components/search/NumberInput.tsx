import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type NumberInputProps = {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export function NumberInput({
  value,
  min = 1,
  max = 31,
  onChange,
}: NumberInputProps) {
  const updateValue = (nextValue: number) => {
    onChange(Math.min(max, Math.max(min, nextValue)))
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Znížiť počet dní"
        onClick={() => updateValue(value - 1)}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => updateValue(Number(event.target.value) || min)}
        className="h-11 w-24 text-center font-mono tabular-nums"
        aria-label="Počet dní"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Zvýšiť počet dní"
        onClick={() => updateValue(value + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
