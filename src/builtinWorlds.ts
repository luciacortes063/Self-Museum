export interface BuiltinWorld {
  id: string
  name: string
  imageUrl: string
}

export const builtinWorlds: BuiltinWorld[] = [
  { id: 'libros', name: 'Libros', imageUrl: '/worlds/libros.webp' },
  { id: 'transportes', name: 'Transportes', imageUrl: '/worlds/transportes.webp' },
  { id: 'personas', name: 'Personas', imageUrl: '/worlds/personas.webp' },
  { id: 'castillos', name: 'Castillos', imageUrl: '/worlds/castillos.webp' },
  { id: 'setas', name: 'Setas', imageUrl: '/worlds/setas.webp' },
  { id: 'aves', name: 'Aves', imageUrl: '/worlds/aves.webp' },
  { id: 'animales', name: 'Animales', imageUrl: '/worlds/animales.webp' }
]
