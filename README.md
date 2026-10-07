# MuseoYo-PWA

PWA personal para iPhone: un museo fantástico donde cada colección es una sala y la vista global es una constelación de Orión rodeada por tus "planetas".

## Stack

- React + TypeScript + Vite
- PWA instalable
- Supabase Auth + Postgres + Storage privado
- Vercel
- Sin servidor propio

## 1. Crear Supabase

1. Crea un proyecto gratuito en https://supabase.com
2. Ve a **SQL Editor**.
3. Copia y ejecuta todo `supabase/schema.sql`.
4. Ve a **Authentication > Providers > Email** y mantén Email activado.
5. Para una app personal recomiendo Magic Link.
6. En **Authentication > URL Configuration**:
   - durante desarrollo: añade `http://localhost:5173`
   - tras desplegar: añade tu URL de Vercel, por ejemplo `https://museoyo.vercel.app`
7. Ve a **Project Settings > API** y copia:
   - Project URL
   - anon/public key

El bucket `museum-images` se crea privado desde el SQL y RLS hace que cada usuario solo pueda leer sus propios archivos.

## 2. Configurar localmente

Necesitas Node.js 20+.

```bash
npm install
```

Copia:

```bash
cp .env.example .env.local
```

En Windows puedes simplemente duplicar el archivo manualmente.

Completa:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

Inicia:

```bash
npm run dev
```

Abre http://localhost:5173

## 3. Desplegar en Vercel

La forma más cómoda:

1. Crea un repositorio nuevo en GitHub.
2. Sube esta carpeta.
3. En Vercel: **Add New > Project**.
4. Importa el repositorio.
5. Vercel detectará Vite.
6. Añade estas Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy.

Después copia la URL final de Vercel en:
Supabase > Authentication > URL Configuration > Redirect URLs.

## 4. Instalar como app en iPhone

1. Abre la URL en Safari.
2. Compartir.
3. **Añadir a pantalla de inicio**.
4. Ábrela desde el nuevo icono.

Se ejecutará en modo standalone y se sentirá como una app.

## Gestos

- Desliza izquierda/derecha en una sala para cambiar de sala.
- Arrastra una pieza con el dedo para recolocarla.
- Toca una pieza para editarla.
- Modifica tamaño e inclinación desde el editor.
- Filtros superiores para enseñar solo una categoría.
- Pestaña Orión para ver tus salas como planetas.

## Diseño

Las seis ambientaciones incluidas:
- Bosque encantado
- Biblioteca celeste
- Galería lunar
- Gabinete de cristal
- Castillo antiguo
- Sueño oceánico

Orión está dibujado dentro de la app y funciona como el centro simbólico de la vista global. Cada sala se convierte en un planeta orbitando a su alrededor.

## Privacidad

- Las tablas usan Row Level Security.
- Las fotografías están en un bucket privado.
- Los enlaces de visualización son URLs firmadas temporales.
- No uses nunca una Supabase service-role key en el frontend.
- La `anon key` sí está diseñada para usarse en el cliente siempre que RLS esté configurado.

## Mejores siguientes pasos

- exportar/importar todo el museo;
- marcos seleccionables para cada pieza;
- elementos decorativos arrastrables;
- fechas, lugares y audio por recuerdo;
- favoritos;
- búsqueda global;
- compartir una sala temporalmente;
- convertir la constelación en una navegación animada en 3D;
- widget estilo "recuerdo del día".
