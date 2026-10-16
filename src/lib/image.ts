function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function getImageAspectRatio(src: string): Promise<number> {
  const img = await loadImage(src)
  return img.width / img.height
}

async function drawResized(file: File, maxWidth: number, maxHeight: number): Promise<HTMLCanvasElement> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)
  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la imagen')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

export async function compressImage(
  file: File,
  options: {
    maxWidth: number
    maxHeight: number
    quality: number
    mimeType?: 'image/jpeg' | 'image/webp'
  }
): Promise<string> {
  const canvas = await drawResized(file, options.maxWidth, options.maxHeight)
  return canvas.toDataURL(options.mimeType ?? 'image/jpeg', options.quality)
}

export async function compressWorldImage(file: File): Promise<string> {
  const canvas = await drawResized(file, 700, 700)
  return canvas.toDataURL('image/webp', 0.82)
}
