import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getApiErrorMessage, getSearchStats } from '@/api/client'
import { EmptyState } from '@/components/design/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SearchStatsRow, SearchStatsSort, SortOrder } from '@/types/api'

const SORT_COLUMNS: SearchStatsSort[] = ['name', 'country', 'count']

function parseSort(params: URLSearchParams): {
  sort: SearchStatsSort
  order: SortOrder
} {
  const sortParam = params.get('sort') as SearchStatsSort | null
  const orderParam = params.get('order') as SortOrder | null

  return {
    sort: sortParam && SORT_COLUMNS.includes(sortParam) ? sortParam : 'count',
    order: orderParam === 'asc' ? 'asc' : 'desc',
  }
}

function ariaSort(column: SearchStatsSort, activeSort: SearchStatsSort, order: SortOrder) {
  if (column !== activeSort) {
    return 'none'
  }

  return order === 'asc' ? 'ascending' : 'descending'
}

export function SearchTable() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { sort, order } = parseSort(searchParams)

  const searchesQuery = useQuery({
    queryKey: ['stats', 'searches', sort, order],
    queryFn: () => getSearchStats(sort, order),
  })

  useEffect(() => {
    if (searchesQuery.isError) {
      toast.error(getApiErrorMessage(searchesQuery.error))
    }
  }, [searchesQuery.error, searchesQuery.isError])

  const columns = useMemo<ColumnDef<SearchStatsRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Destinácia',
        cell: ({ row }) => row.original.name,
      },
      {
        accessorKey: 'country',
        header: 'Štát',
        cell: ({ row }) => row.original.country,
      },
      {
        accessorKey: 'count',
        header: 'Počet vyhľadávaní',
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {row.original.count.toLocaleString('sk-SK')}
          </span>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: searchesQuery.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function updateSort(nextSort: SearchStatsSort) {
    const nextOrder = sort === nextSort && order === 'desc' ? 'asc' : 'desc'
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('sort', nextSort)
    nextParams.set('order', nextOrder)
    setSearchParams(nextParams)
  }

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>Čo ľudia hľadajú</CardTitle>
      </CardHeader>
      <CardContent>
        {searchesQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : searchesQuery.isError ? (
          <EmptyState
            title="Štatistiku sa nepodarilo načítať"
            description={getApiErrorMessage(searchesQuery.error)}
            className="border-0 bg-transparent p-4"
          />
        ) : table.getRowModel().rows.length === 0 ? (
          <EmptyState
            title="Zatiaľ nie sú dostupné vyhľadávania"
            description="Štatistika sa naplní po prvých výsledkoch hľadania."
            className="border-0 bg-transparent p-4"
          />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnId = header.column.id as SearchStatsSort

                    return (
                      <TableHead
                        key={header.id}
                        aria-sort={ariaSort(columnId, sort, order)}
                      >
                        <button
                          type="button"
                          className={cn(
                            'flex min-h-11 items-center gap-2 rounded-xl text-left',
                            'font-medium transition-colors hover:text-foreground',
                          )}
                          onClick={() => updateSort(columnId)}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <SortIcon active={sort === columnId} order={order} />
                        </button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  const Icon = order === 'asc' ? ChevronUp : ChevronDown

  return (
    <Icon
      className={cn('h-4 w-4', active ? 'opacity-100' : 'opacity-35')}
      aria-hidden="true"
    />
  )
}
