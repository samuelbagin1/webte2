import { zodResolver } from '@hookform/resolvers/zod'
import { addDays } from 'date-fns'
import {
  Building,
  CalendarIcon,
  Coffee,
  Compass,
  type LucideIcon,
  Mountain,
  Search,
  Waves,
} from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { DateRange } from 'react-day-picker'
import { z } from 'zod'
import { toast } from 'sonner'

import { NumberInput } from '@/components/search/NumberInput'
import { TripTypeCard } from '@/components/search/TripTypeCard'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  createMonthRange,
  daysBetween,
  DISTANCE_OPTIONS,
  formatDate,
  MONTHS,
  TEMPERATURE_OPTIONS,
  TRIP_TYPES,
  type DistancePreference,
  type SearchMode,
} from '@/lib/search'
import { cn } from '@/lib/utils'
import type { TemperaturePreference, TripTypeCode } from '@/types/api'

const tripTypeIcons = {
  sea_beach: Waves,
  mountains: Mountain,
  historic: Building,
  city_break: Coffee,
  adventure: Compass,
} satisfies Record<TripTypeCode, LucideIcon>

const searchSchema = z.object({
  mode: z.enum(['month', 'range']),
  month: z.number().int().min(1).max(12),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  days: z
    .number()
    .int('Počet dní musí byť celé číslo.')
    .min(1, 'Zvoľ aspoň 1 deň.')
    .max(31, 'Maximum je 31 dní.'),
  tripTypes: z
    .array(z.enum(['sea_beach', 'mountains', 'historic', 'city_break', 'adventure']))
    .min(1, 'Vyber aspoň jeden typ dovolenky.'),
  temperature: z.enum(['hot', 'warm', 'mild', 'any']),
  distance: z.enum(['near', 'medium', 'any']),
}).superRefine((value, context) => {
  if (value.mode !== 'range') {
    return
  }

  if (!value.dateRange?.from || !value.dateRange?.to) {
    context.addIssue({
      code: 'custom',
      message: 'Vyber začiatok aj koniec pobytu.',
      path: ['dateRange'],
    })
  }

  if (
    value.dateRange?.from &&
    value.dateRange?.to &&
    value.dateRange.to < value.dateRange.from
  ) {
    context.addIssue({
      code: 'custom',
      message: 'Koniec pobytu nemôže byť pred začiatkom.',
      path: ['dateRange'],
    })
  }
})

type SearchFormValues = z.infer<typeof searchSchema>

const defaultRange = {
  from: new Date(2026, 6, 1),
  to: addDays(new Date(2026, 6, 1), 6),
}

export function SearchForm() {
  const navigate = useNavigate()
  const {
    formState: { errors },
    handleSubmit,
    control,
    setValue,
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      mode: 'month',
      month: 7,
      dateRange: defaultRange,
      days: 7,
      tripTypes: ['sea_beach'],
      temperature: 'warm',
      distance: 'medium',
    },
  })

  const mode = useWatch({ control, name: 'mode' })
  const month = useWatch({ control, name: 'month' })
  const days = useWatch({ control, name: 'days' })
  const dateRange = useWatch({ control, name: 'dateRange' })
  const tripTypes = useWatch({ control, name: 'tripTypes' })
  const temperature = useWatch({ control, name: 'temperature' })
  const distance = useWatch({ control, name: 'distance' })

  const selectedRangeLabel =
    dateRange?.from && dateRange?.to
      ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
      : 'Vyber rozsah dátumov'

  const toggleTripType = (code: TripTypeCode) => {
    const next = tripTypes.includes(code)
      ? tripTypes.filter((type) => type !== code)
      : [...tripTypes, code]

    setValue('tripTypes', next, { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = (values: SearchFormValues) => {
    const range =
      values.mode === 'month'
        ? createMonthRange(values.month, values.days)
        : {
            start: formatDate(values.dateRange?.from ?? defaultRange.from),
            end: formatDate(values.dateRange?.to ?? defaultRange.to),
          }
    const derivedMonth =
      values.mode === 'range'
        ? (values.dateRange?.from ?? defaultRange.from).getMonth() + 1
        : values.month

    const params = new URLSearchParams({
      mode: values.mode,
      month: String(derivedMonth),
      start: range.start,
      end: range.end,
      days: String(
        values.mode === 'range' && values.dateRange?.from && values.dateRange?.to
          ? daysBetween(values.dateRange.from, values.dateRange.to)
          : values.days,
      ),
      types: values.tripTypes.join(','),
      temp: values.temperature,
      distance: values.distance,
    })

    toast.success('Vyhľadávanie je pripravené.')
    navigate(`/results?${params.toString()}`)
  }

  return (
    <Card className="mx-auto max-w-3xl rounded-2xl border bg-card">
      <CardContent className="space-y-6 p-6 lg:p-8">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Tabs
            value={mode}
            onValueChange={(value) =>
              setValue('mode', value as SearchMode, { shouldValidate: true })
            }
          >
            <TabsList className="grid w-full grid-cols-2 sm:w-fit">
              <TabsTrigger value="month">Mesiac</TabsTrigger>
              <TabsTrigger value="range">Rozsah dátumov</TabsTrigger>
            </TabsList>

            <TabsContent value="month" className="pt-4">
              <label className="space-y-2">
                <span className="text-sm font-medium">Mesiac</span>
                <Select
                  value={String(month)}
                  onValueChange={(value) =>
                    setValue('month', Number(value), { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyber mesiac" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((item) => (
                      <SelectItem key={item.value} value={String(item.value)}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </TabsContent>

            <TabsContent value="range" className="pt-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Rozsah dátumov</span>
                <Popover onOpenChange={(open) => {
                    if (open) setValue('dateRange', undefined, { shouldDirty: true })
                  }}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {selectedRangeLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange as DateRange}
                      onSelect={(range) =>
                        setValue('dateRange', range, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateRange && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.dateRange.message}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {mode === 'month' && (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="days">
                Počet dní
              </label>
              <NumberInput
                value={days}
                onChange={(value) =>
                  setValue('days', value, { shouldDirty: true, shouldValidate: true })
                }
              />
              {errors.days && (
                <p className="text-sm font-medium text-destructive">
                  {errors.days.message}
                </p>
              )}
            </div>
          )}

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Typy dovolenky</legend>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {TRIP_TYPES.map((type) => {
                const Icon = tripTypeIcons[type.code]

                return (
                  <TripTypeCard
                    key={type.code}
                    icon={Icon}
                    label={type.label}
                    description={type.description}
                    selected={tripTypes.includes(type.code)}
                    onToggle={() => toggleTripType(type.code)}
                  />
                )
              })}
            </div>
            {errors.tripTypes && (
              <p className="text-sm font-medium text-destructive">
                {errors.tripTypes.message}
              </p>
            )}
          </fieldset>

          <SegmentedRadioGroup
            label="Teplota"
            value={temperature}
            options={TEMPERATURE_OPTIONS}
            onValueChange={(value) =>
              setValue('temperature', value as TemperaturePreference, {
                shouldValidate: true,
              })
            }
          />

          <SegmentedRadioGroup
            label="Vzdialenosť"
            value={distance}
            options={DISTANCE_OPTIONS}
            onValueChange={(value) =>
              setValue('distance', value as DistancePreference, {
                shouldValidate: true,
              })
            }
          />

          <Button type="submit" variant="accent" size="lg" className="h-12 w-full lg:w-auto">
            <Search className="h-4 w-4" />
            Vyhľadať destinácie
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

type SegmentedOption = {
  value: string
  label: string
}

function SegmentedRadioGroup({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string
  value: string
  options: readonly SegmentedOption[]
  onValueChange: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium">{label}</span>
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1 sm:flex"
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-center text-sm font-medium text-muted-foreground transition-colors',
              value === option.value && 'bg-card text-foreground shadow-sm',
            )}
          >
            <RadioGroupItem value={option.value} className="sr-only" />
            {option.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
