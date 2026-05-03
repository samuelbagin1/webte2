import type * as React from 'react'

import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center',
        className,
      )}
    >
      <EmptyIllustration className="mx-auto h-28 w-40 text-accent" />
      <h1 className="mt-4 text-3xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 112"
      fill="none"
      className={className}
    >
      <path
        d="M26 82c9.5-22.5 27.3-38 54-38s44.5 15.5 54 38"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.32"
      />
      <path
        d="M35 82h90"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M80 16v68"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M58 34c8-8 36-8 44 0"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="44" cy="26" r="6" fill="currentColor" opacity="0.28" />
      <circle cx="122" cy="30" r="4" fill="currentColor" opacity="0.38" />
      <circle cx="112" cy="94" r="5" fill="currentColor" opacity="0.22" />
    </svg>
  )
}
