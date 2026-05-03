import * as React from 'react'

const VISIT_TRACKED_KEY = 'z4:visit-tracked'

let visitTrackRequested = false

export function useTrackVisit() {
  React.useEffect(() => {
    if (visitTrackRequested) {
      return
    }

    try {
      if (window.sessionStorage.getItem(VISIT_TRACKED_KEY) === '1') {
        visitTrackRequested = true
        return
      }

      window.sessionStorage.setItem(VISIT_TRACKED_KEY, '1')
    } catch {
      // Storage can be unavailable in private contexts; keep tracking non-blocking.
    }

    visitTrackRequested = true
    fetch('/api/visits/track', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    }).catch(() => {
      visitTrackRequested = false

      try {
        window.sessionStorage.removeItem(VISIT_TRACKED_KEY)
      } catch {
        // Ignore storage cleanup failures for the same reason as above.
      }
    })
  }, [])
}
