# inference

Sitio estático de SIS — Super Intelligence Society by AiYaiYai.

- `index.html`: landing de la comunidad.
- `silicon-valley/index.html`: programa inmersivo en San Francisco (próximamente).
- `assets/css/tokens.css` y `assets/css/bundle.css`: design system (tokens y componentes `inf-`).
- `assets/img/`: fotos y logos.

- `blog/<slug>/index.html`: artículos de "Temas de los que escribimos".
- SEO: cada página tiene title, meta description, canonical, Open Graph y Twitter Cards con imagen de 1200×630 (`assets/og/`), JSON-LD (Organization, WebSite, Event y BlogPosting), `sitemap.xml`, `robots.txt`, favicons y `site.webmanifest`.
- Las URLs absolutas apuntan a `https://alan-arguello.github.io/inference/` (GitHub Pages). Si publicas en otro dominio, cambia esa URL en `index.html`, `silicon-valley/index.html`, `blog/*/index.html`, `sitemap.xml` y `robots.txt` (buscar y reemplazar).

No necesita build: se puede publicar tal cual en GitHub Pages, Vercel o Netlify.

## Formularios (Supabase)

Los dos formularios guardan en el proyecto de Supabase **SIS** (`vfenkhnmcetmkgxnpanr`):

- `sis_applications`: aplicaciones a la comunidad (página principal).
- `sv_reservations`: lugares apartados para Silicon Valley Immersion 2027.

El sitio usa la llave pública (publishable) y solo puede **insertar**: con esa llave nadie puede leer, editar ni borrar registros (RLS). Los registros se ven en Supabase → Table Editor, donde también se pueden exportar a CSV. Un correo solo puede registrarse una vez por formulario. El esquema está en `supabase/migrations/`.

Columnas internas para el seguimiento: `estado` (`nueva`, `en_revision`, `aceptada`, `rechazada` en aplicaciones; `nueva`, `contactada`, `pago_pendiente`, `pagada`, `cancelada` en Silicon Valley) y `notas`. También se guardan `pagina`, `referrer` y los `utm_*` para saber de dónde llega cada registro.
