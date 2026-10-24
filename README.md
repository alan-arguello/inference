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

Pendiente: los formularios son prototipos (validan y muestran confirmación, pero no envían datos). Conéctalos a tu herramienta de formularios o pagos.
