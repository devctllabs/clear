export type TrashKind = 'deck' | 'folder' | 'note' | 'workspace'

export type TrashItem = {
  deletedAt: string
  id: string
  kind: TrashKind
  locationPath: string[]
  title: string
}

export type TrashState = {
  items: TrashItem[]
  lastEmptiedAt: string
}
