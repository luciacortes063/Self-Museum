export type RoomTheme =
  | 'enchanted-forest'
  | 'celestial-library'
  | 'moon-gallery'
  | 'crystal-cabinet'
  | 'ancient-castle'
  | 'ocean-dream'

export type DecorationKind =
  | 'plant'
  | 'candle'
  | 'moon'
  | 'star'
  | 'books'
  | 'flower'
  | 'crystal'
  | 'shell'
  | 'crown'
  | 'feather'

export interface Room {
  id: string
  user_id: string
  title: string
  subtitle: string
  icon: string
  theme: RoomTheme
  filters: string[]
  sort_order: number
  created_at?: string
}

export interface Exhibit {
  id: string
  user_id: string
  room_id: string
  title: string
  note: string
  category: string | null
  image_path: string | null
  x: number
  y: number
  scale: number
  rotation: number
  created_at?: string
  imageUrl?: string
}

export interface Decoration {
  id: string
  user_id: string
  room_id: string
  kind: DecorationKind
  x: number
  y: number
  scale: number
  rotation: number
  created_at?: string
}