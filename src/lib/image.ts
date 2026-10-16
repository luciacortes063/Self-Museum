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

export async function compressImage(
  file: File,
  options: {
    maxWidth: number
    maxHeight: number
    quality: number
    mimeType?: 'image/jpeg' | 'image/webp'
  }
): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)

  const mimeType = options.mimeType ?? 'image/jpeg'
  const scale = Math.min(
    options.maxWidth / img.width,
    options.maxHeight / img.height,
    1
  )

  const targetWidth = Math.max(1, Math.round(img.width * scale))
  const targetHeight = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No se pudo procesar la imagen')
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  return canvas.toDataURL(mimeType, options.quality)
}
