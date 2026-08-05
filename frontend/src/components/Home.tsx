import { useEffect, useState } from 'react'
import { PAGES } from '../types'
import type { PageKey } from '../types'
import * as api from '../api'

export function Home({ onSelect }: { onSelect: (page: PageKey) => void }) {
  const [counts, setCounts] = useState<Partial<Record<PageKey, number>>>({})

  useEffect(() => {
    let cancelled = false
    const listPages = PAGES.filter((p) => p.kind === 'list')
    Promise.all(
      listPages.map((p) =>
        api
          .listItems(p.key)
          .then((items) => [p.key, items.length] as const)
          .catch(() => [p.key, undefined] as const),
      ),
    ).then((results) => {
      if (cancelled) return
      setCounts(Object.fromEntries(results))
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="grid grid-cols-2 gap-3">
      {PAGES.map((p) => {
        const subtitle =
          p.kind === 'list'
            ? counts[p.key] === undefined
              ? ' '
              : `${counts[p.key]} item${counts[p.key] === 1 ? '' : 's'}`
            : p.tagline
        return (
          <button
            key={p.key}
            onClick={() => onSelect(p.key)}
            className="flex flex-col items-start gap-1 rounded-lg border border-[var(--border)] p-4 text-left transition-colors hover:border-[var(--text)]"
          >
            <span className="text-base font-medium">{p.label}</span>
            <span className="text-sm text-[var(--text-muted)]">{subtitle}</span>
          </button>
        )
      })}
    </div>
  )
}
