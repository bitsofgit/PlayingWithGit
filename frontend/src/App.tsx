import { useState } from 'react'
import { PAGES } from './types'
import type { PageKey } from './types'
import { PageView } from './components/PageView'

function App() {
  const [active, setActive] = useState<PageKey>('likes')
  const page = PAGES.find((p) => p.key === active)!

  return (
    <div className="mx-auto min-h-screen max-w-xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <span className="text-sm font-medium tracking-wide text-[var(--text-muted)]">Curio</span>
        <nav className="flex gap-1">
          {PAGES.map((p) => (
            <button
              key={p.key}
              onClick={() => setActive(p.key)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                active === p.key
                  ? 'bg-[var(--text)] text-[var(--bg)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </header>
      <PageView page={page} />
    </div>
  )
}

export default App
