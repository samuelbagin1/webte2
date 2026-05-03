import * as React from 'react'

const STORAGE_KEY = 'task4:compare-selection'

function readSelection(): number[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => Number.isInteger(id)).slice(0, 2)
      : []
  } catch {
    return []
  }
}

function writeSelection(ids: number[]) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 2)))
  window.dispatchEvent(new Event('compare-selection-change'))
}

export function useCompareSelection() {
  const [selectedIds, setSelectedIds] = React.useState<number[]>(readSelection)

  React.useEffect(() => {
    const syncSelection = () => setSelectedIds(readSelection())

    window.addEventListener('storage', syncSelection)
    window.addEventListener('compare-selection-change', syncSelection)

    return () => {
      window.removeEventListener('storage', syncSelection)
      window.removeEventListener('compare-selection-change', syncSelection)
    }
  }, [])

  const toggle = React.useCallback((id: number) => {
    const current = readSelection()
    const next = current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id].slice(0, 2)

    writeSelection(next)
    setSelectedIds(next)
  }, [])

  const add = React.useCallback((id: number) => {
    const current = readSelection()
    const next = current.includes(id) ? current : [...current, id].slice(0, 2)

    writeSelection(next)
    setSelectedIds(next)
  }, [])

  return {
    selectedIds,
    toggle,
    add,
    isSelected: React.useCallback(
      (id: number) => selectedIds.includes(id),
      [selectedIds],
    ),
  }
}
