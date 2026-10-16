# MuseoYo — versión local

Esta versión elimina completamente Supabase, cuentas, email y backend.

## Qué incluye

- Todo se guarda localmente con IndexedDB.
- No hay login.
- Fotos comprimidas al añadirlas:
  - máximo 640×640 px
  - JPEG calidad 0.68
- Plantillas nuevas comprimidas:
  - máximo 1050×2400 px
  - JPEG calidad 0.76
- 8 plantillas de fantasía ya incluidas y optimizadas.
- Puedes subir nuevas plantillas desde el móvil.
- Una sala puede repetir su plantilla entre 3 y 12 veces.
- Scroll vertical largo, tipo estantería infinita.
- Las fotos se pueden arrastrar libremente de un tramo a otro.
- Nombre, descripción y filtros opcionales.
- Tamaño e inclinación individual de cada imagen.
- PWA instalable en iPhone.

## Importante sobre el almacenamiento local

Los datos viven en el almacenamiento del navegador/PWA de ese dispositivo.

No borres los datos de Safari ni elimines el almacenamiento del sitio si quieres conservar el museo.

La app pide almacenamiento persistente al navegador cuando es posible, pero iOS sigue teniendo control final sobre el almacenamiento local.

## Instalar dependencias

```bash
npm install
```

## Ejecutar en local

```bash
npm run dev
```

## Comprobar build

```bash
npm run build
```

## Actualizar tu proyecto en GitHub/Vercel

Si esta carpeta sustituye tu proyecto anterior:

1. Conserva tu carpeta `.git` si quieres mantener el mismo repositorio.
2. Sustituye los archivos del proyecto por los de este ZIP.
3. Ejecuta:

```bash
npm install
npm run build
git add .
git commit -m "Switch MuseoYo to local storage and infinite shelf templates"
git push
```

Vercel volverá a desplegar automáticamente.

## Instalar en iPhone

1. Abre tu URL de Vercel en Safari.
2. Pulsa Compartir.
3. Pulsa "Añadir a pantalla de inicio".
4. Abre MuseoYo desde el icono.

## Plantillas incluidas

- Aves de fantasía
- Bosque y fauna
- Palacio de cristal
- Reino de setas
- Bosque encantado
- Castillos de fantasía
- Universo celestial
- Comarca fantástica

Las imágenes incluidas se han comprimido a WebP para que la aplicación cargue mucho más rápido.
