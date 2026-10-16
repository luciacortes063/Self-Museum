export interface ShelfTemplate {
  id: string
  name: string
  imageUrl: string
  aspectRatio: number
  builtin: boolean
  createdAt?: string
}

export interface Room {
  id: string
  title: string
  subtitle: string
  filters: string[]
  templateId: string
  segments: number
  createdAt: string
}

export interface Exhibit {
  id: string
  roomId: string
  title: string
  note: string
  category: string | null
  imageDataUrl: string
  x: number
  y: number
  pageIndex: number
  scale: number
  rotation: number
  createdAt: string
}
