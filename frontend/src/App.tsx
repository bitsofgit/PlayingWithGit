import { useState } from 'react'
import { PAGES } from './types'
import type { PageKey } from './types'
import { PageView } from './components/PageView'
import { SolarSystem } from './components/SolarSystem'
import { Home } from './components/Home'

function App() {
  const [active, setActive] = useState<PageKey | null>(null)
  const page = active ? PAGES.find((p) => p.key === active)! : null

  return (
    <div className="mx-auto min-h-screen max-w-xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setActive(null)}
          className="text-sm font-medium tracking-wide text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Curio
        </button>
        {page && (
          <button
            onClick={() => setActive(null)}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            ← All pages
          </button>
        )}
      </header>
      {page === null && <Home onSelect={setActive} />}
      {page?.kind === 'list' && <PageView page={page} />}
      {page?.kind === 'custom' && page.key === 'solar-system' && <SolarSystem />}
    </div>
  )
}

export default App
