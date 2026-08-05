export type PageKey = 'likes' | 'learn'

export type LearnStatus = 'to-learn' | 'learning' | 'learned'

export interface Item {
  id: string
  title: string
  note: string
  url: string
  status: LearnStatus | null
  createdAt: string
}

export interface ItemInput {
  title: string
  note: string
  url: string
  status: LearnStatus | null
}

export interface PageConfig {
  key: PageKey
  label: string
  emptyText: string
  hasStatus: boolean
}

export const PAGES: PageConfig[] = [
  { key: 'likes', label: 'Likes', emptyText: 'Nothing here yet — add something you like.', hasStatus: false },
  { key: 'learn', label: 'Learn', emptyText: 'Nothing here yet — add something you want to learn.', hasStatus: true },
]
