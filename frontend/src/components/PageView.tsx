import { useEffect, useState } from 'react'
import type { Item, ItemInput, PageConfig } from '../types'
import * as api from '../api'
import { ItemForm } from './ItemForm'
import { ItemList } from './ItemList'

export function PageView({ page }: { page: PageConfig }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .listItems(page.key)
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load data. Is the backend running?')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page.key])

  async function handleAdd(input: ItemInput) {
    const created = await api.createItem(page.key, input)
    setItems((prev) => [created, ...prev])
    setAdding(false)
  }

  async function handleUpdate(id: string, input: ItemInput) {
    const updated = await api.updateItem(page.key, id, input)
    setItems((prev) => prev.map((it) => (it.id === id ? updated : it)))
  }

  async function handleDelete(id: string) {
    await api.deleteItem(page.key, id)
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">{page.label}</h1>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--text)]"
          >
            Add
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-4 border-b border-[var(--border)] pb-4">
          <ItemForm
            hasStatus={page.hasStatus}
            submitLabel="Add"
            onCancel={() => setAdding(false)}
            onSubmit={handleAdd}
          />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {loading ? (
        <p className="py-8 text-sm text-[var(--text-muted)]">Loading…</p>
      ) : (
        <ItemList
          items={items}
          hasStatus={page.hasStatus}
          emptyText={page.emptyText}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
