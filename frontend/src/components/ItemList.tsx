import { useState } from 'react'
import type { Item, ItemInput } from '../types'
import { ItemForm } from './ItemForm'

const STATUS_LABEL: Record<string, string> = {
  'to-learn': 'To learn',
  learning: 'Learning',
  learned: 'Learned',
}

interface ItemListProps {
  items: Item[]
  hasStatus: boolean
  emptyText: string
  onUpdate: (id: string, input: ItemInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ItemList({ items, hasStatus, emptyText, onUpdate, onDelete }: ItemListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (items.length === 0) {
    return <p className="py-8 text-sm text-[var(--text-muted)]">{emptyText}</p>
  }

  return (
    <ul className="flex flex-col divide-y divide-[var(--border)]">
      {items.map((item) => (
        <li key={item.id} className="py-3">
          {editingId === item.id ? (
            <ItemForm
              hasStatus={hasStatus}
              initial={{ title: item.title, note: item.note, url: item.url, status: item.status }}
              submitLabel="Save"
              onCancel={() => setEditingId(null)}
              onSubmit={async (input) => {
                await onUpdate(item.id, input)
                setEditingId(null)
              }}
            />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate font-medium underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--text)]"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <span className="truncate font-medium">{item.title}</span>
                  )}
                  {item.status && (
                    <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                      {STATUS_LABEL[item.status]}
                    </span>
                  )}
                </div>
                {item.note && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{item.note}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3 text-sm text-[var(--text-muted)]">
                <button onClick={() => setEditingId(item.id)} className="hover:text-[var(--text)]">
                  Edit
                </button>
                <button onClick={() => onDelete(item.id)} className="hover:text-[var(--text)]">
                  Delete
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
