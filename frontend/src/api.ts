import type { Item, ItemInput, PageKey } from './types'

const BASE = '/api/pages'

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export function listItems(page: PageKey): Promise<Item[]> {
  return fetch(`${BASE}/${page}/items`).then(handle<Item[]>)
}

export function createItem(page: PageKey, input: ItemInput): Promise<Item> {
  return fetch(`${BASE}/${page}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(handle<Item>)
}

export function updateItem(page: PageKey, id: string, input: ItemInput): Promise<Item> {
  return fetch(`${BASE}/${page}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(handle<Item>)
}

export function deleteItem(page: PageKey, id: string): Promise<void> {
  return fetch(`${BASE}/${page}/items/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  })
}
