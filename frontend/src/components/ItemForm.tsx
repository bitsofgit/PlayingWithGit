import { useState, type FormEvent } from 'react'
import type { ItemInput, LearnStatus } from '../types'

const STATUS_OPTIONS: { value: LearnStatus; label: string }[] = [
  { value: 'to-learn', label: 'To learn' },
  { value: 'learning', label: 'Learning' },
  { value: 'learned', label: 'Learned' },
]

interface ItemFormProps {
  hasStatus: boolean
  initial?: ItemInput
  submitLabel: string
  onSubmit: (input: ItemInput) => Promise<void> | void
  onCancel?: () => void
}

const EMPTY: ItemInput = { title: '', note: '', url: '', status: null }

export function ItemForm({ hasStatus, initial, submitLabel, onSubmit, onCancel }: ItemFormProps) {
  const [title, setTitle] = useState(initial?.title ?? EMPTY.title)
  const [note, setNote] = useState(initial?.note ?? EMPTY.note)
  const [url, setUrl] = useState(initial?.url ?? EMPTY.url)
  const [status, setStatus] = useState<LearnStatus | null>(
    initial?.status ?? (hasStatus ? 'to-learn' : null),
  )
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), note: note.trim(), url: url.trim(), status })
      if (!initial) {
        setTitle('')
        setNote('')
        setUrl('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="border-b border-[var(--border)] bg-transparent py-1 text-base outline-none focus:border-[var(--text)]"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Link (optional)"
        className="border-b border-[var(--border)] bg-transparent py-1 text-sm text-[var(--text-muted)] outline-none focus:border-[var(--text)]"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        rows={2}
        className="resize-none border-b border-[var(--border)] bg-transparent py-1 text-sm outline-none focus:border-[var(--text)]"
      />
      {hasStatus && (
        <div className="flex gap-2 pt-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                status === opt.value
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="rounded-md bg-[var(--text)] px-3 py-1.5 text-sm text-[var(--bg)] disabled:opacity-40"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-[var(--text-muted)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
