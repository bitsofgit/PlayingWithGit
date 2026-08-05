export type PageKey = 'likes' | 'learn' | 'solar-system'

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

export interface ListPageConfig {
  key: PageKey
  label: string
  kind: 'list'
  emptyText: string
  hasStatus: boolean
}

export interface CustomPageConfig {
  key: PageKey
  label: string
  kind: 'custom'
  tagline: string
}

export type PageConfig = ListPageConfig | CustomPageConfig

export const PAGES: PageConfig[] = [
  { key: 'likes', label: 'Likes', kind: 'list', emptyText: 'Nothing here yet — add something you like.', hasStatus: false },
  { key: 'learn', label: 'Learn', kind: 'list', emptyText: 'Nothing here yet — add something you want to learn.', hasStatus: true },
  { key: 'solar-system', label: 'Solar System', kind: 'custom', tagline: 'Explore' },
]
