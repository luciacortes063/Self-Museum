# Mis Universos — V4

PWA local para iPhone con una pantalla principal basada en Orión y mundos animados.

## Esta versión añade

- La imagen de Orión proporcionada como fondo completo de la pantalla principal.
- No se superpone ningún título ni texto adicional al fondo.
- Botón `Añadir Mundo`.
- Cada sala/expositor aparece como un mundo flotante.
- Los mundos se mueven de forma lenta y calmada con trayectorias circulares o semicirculares.
- Las trayectorias circulares avanzan en sentido antihorario.
- 7 miniaturas transparentes incluidas: Libros, Transportes, Personas, Castillos, Setas, Aves y Animales.
- Al crear o editar un mundo puedes subir tu propia miniatura.
- Puedes cambiar el tamaño de cada mundo desde su editor.
- Se mantienen IndexedDB, compresión de fotos, filtros, estanterías repetidas y drag & drop.
- Las salas usan una interfaz cálida y compacta para que la estantería ocupe casi toda la pantalla.
- La PWA se llama `Mis Universos` y usa el logo proporcionado como icono.

## Compatibilidad con tus datos anteriores

El nombre de la base IndexedDB sigue siendo `museoyo-local-db`, así que las salas y fotos de la versión local anterior deberían conservarse al actualizar en el mismo navegador/dispositivo.

Las salas antiguas reciben automáticamente una miniatura y un movimiento si todavía no tenían esos campos.

## Ejecutar

```bash
npm install
npm run dev
```

## Comprobar el build

```bash
npm run build
```

## Subir a Vercel

```bash
git add .
git commit -m "Redesign Mis Universos home with Orion and animated worlds"
git push
```
