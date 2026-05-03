import * as React from 'react'

export function useTrackVisit() {
  React.useEffect(() => {
    const controller = new AbortController()

    fetch('/api/visits/track', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    }).catch(() => {
      // Backend tracking is introduced in a later phase; failures should not block the UI shell.
    })

    return () => controller.abort()
  }, [])
}
