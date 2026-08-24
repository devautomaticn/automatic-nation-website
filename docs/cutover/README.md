# Cutover: WordPress → Astro, en automaticnation.com

Estado verificado el 2026-08-23 contra el sitio en vivo y contra este repo.

- **Hoy:** WordPress en GoDaddy Managed WP (`160.153.0.120`), detrás del Cloudflare
  de GoDaddy. DNS en GoDaddy (`ns63/ns64.domaincontrol.com`). TTL del A de apex: 3600.
- **Destino:** este repo, GitHub Pages, dominio apex, sin `base`.
- **Repo:** `devautomaticn/automatic-nation-website`. Pages ya está habilitado
  (`build_type: workflow`, source `main`) pero **sin dominio custom** (`cname: null`).

`live-post-urls.txt` y `live-non-post-urls.txt` son el inventario de URLs indexadas
hoy, tomado del `sitemap_index.xml` de WordPress. Son la base de la verificación
post-cutover.

---

## 0. Lo que ya está bien

Verificado, no hace falta volver a mirarlo:

| Check | Resultado |
|---|---|
| `npm run check` | 0 errores, 0 warnings, 0 hints (63 archivos) |
| `npm run build` | 140 páginas, sin errores |
| Slugs de posts live vs `src/content/blog/` | 61 = 61, coinciden exactos, cero drift |
| Trampa del BASE_URL (`//` en el HTML construido) | limpio, cero ocurrencias |
| Canonicals con trailing slash | correctos en home, post, `/blogs/` y `/lp/` |
| Stubs `/blog/{slug}/` | 61, con meta-refresh + canonical + `noindex, follow` |
| Sitemap | 64 URLs, los stubs excluidos |
| `robots.txt` | apunta a `sitemap-index.xml` |
| `404.html` | presente en `dist/` |
| `#book` en cada página | sí, en todas menos `404.html` (correcto) |
| `CNAME` llega a `dist/` | sí |

---

## 1. Bloqueadores de deploy

Estos impiden que el sitio funcione. No son opinables.

### 1.1 ~~La migración entera está sin pushear~~ — CERRADO el 2026-08-23

`feat/wp-migration-cutover` mergeada a `main` en fast-forward y pusheada:
`dfbe815..f00bdea`. El workflow *Deploy to GitHub Pages* terminó en verde
(run `32662222069`) y los 61 posts responden ya desde Pages.

Por qué era un bloqueador, que sigue siendo cierto para cualquier cambio futuro:
el workflow hace `actions/checkout`, o sea construye **lo que está en el remoto**,
no lo que tienes en disco.

**El push necesita la cuenta `devautomaticn`.** Comprobado: `mangoneLawFirm` tiene
`push: false` sobre este repo y el push devuelve 403. Antes de pushear:

```bash
gh auth switch -u devautomaticn
```

### 1.2 ~~El dominio custom no está puesto en GitHub Pages~~ — CERRADO el 2026-08-23

Pages ya devuelve `"cname": "automaticnation.com"`. `https_enforced` pasó solo a
`false`, que es lo correcto: el certificado no puede emitirse hasta que el DNS
apunte a Pages. Se activa en la Fase D, paso 16.

`GET /repos/devautomaticn/automatic-nation-website/pages` devuelve `"cname": null`
y `html_url: https://devautomaticn.github.io/automatic-nation-website/`.

Es decir: Pages sirve hoy en el **subpath de proyecto**. El build nuevo no tiene
`base`, así que en esa URL todos los assets (`/logos/…`, `/_astro/…`) resuelven
contra la raíz del dominio y dan 404. **El sitio solo funciona con el dominio custom
puesto.**

**Corrección — la versión anterior de este documento decía esto mal.** Afirmaba que
commitear `public/CNAME` configura el dominio automáticamente en el primer deploy.
Es **falso con `build_type: workflow`**. Comprobado el 2026-08-23: tras el deploy en
verde, el fichero `CNAME` sí se servía (`curl …/CNAME` → `automaticnation.com`) pero
el ajuste de Pages seguía en `"cname": null`. Ese auto-set solo ocurre con el deploy
clásico por rama, no con GitHub Actions. Hay que ponerlo a mano, en
**Settings → Pages → Custom domain** o por API:

```bash
gh api -X PUT repos/devautomaticn/automatic-nation-website/pages \
  -f cname='automaticnation.com'
```

Tiene además una consecuencia de preview (ver §4): con el dominio custom puesto,
`devautomaticn.github.io/automatic-nation-website/` pasa a devolver **301** al apex.

### 1.3 El dominio no está verificado en GitHub

`protected_domain_state: null`. Sin verificar, si alguna vez sueltas el dominio en
Pages, otra cuenta de GitHub puede reclamarlo y servir contenido en él. Son 5 minutos
y se hace **antes** del cutover.

**Corrección:** `devautomaticn` es una cuenta **de usuario**, no una organización
(`gh api users/devautomaticn` → `"type": "User"`), así que esto NO está en los
ajustes de una organización sino en los de la cuenta:
<https://github.com/settings/pages> → *Add a domain* → y añadir el TXT
`_github-pages-challenge-devautomaticn` en GoDaddy.

---

## 2. Bloqueadores de contenido

> **Estado: 6 de 7 cerrados** (commits `c0a5da0` y `9a5eb2b`). Queda solo el
> `og-image.png`. La tabla se conserva como registro de qué se decidió.

| # | Qué | Dónde | Impacto |
|---|---|---|---|
| 1 | `BOOKING_URL = ''` | `src/lib/site.ts:19` | **Los CTAs de las 126 páginas saltan a `#book` en vez de a un calendario.** Es el objetivo de conversión del sitio. |
| 2 | `og-image.png` no existe | referenciado en los `<meta>` de las 64 páginas | Todas las tarjetas sociales dan 404. Hace falta un PNG estático 1200×630 en `public/`. |
| 3 | Cita de cliente placeholder | `src/data/landings/home.ts:79-82` | `[CLIENT QUOTE …]`, `[Name]`, `[Role]`, `[Company]` **visibles en la home**. |
| 4 | `[FILL IN RANGE]` | `src/data/landings/home.ts:104` | Visible en el FAQ de precios. |
| 5 | `SITE.city = ''` | `src/lib/site.ts:14` | El footer imprime literalmente `[CITY]` en las 126 páginas. |
| 6 | Emails placeholder | `src/content/blog/how-to-build-a-crm-system/index.md` | `sales@mycompany.com`, `support@mycompany.com` heredados de WordPress. |
| 7 | 55 imágenes sin alt | `tools/wp-migrate/out/alt-todo.tsv` | Accesibilidad + SEO. No bloquea, pero es deuda conocida. |

`SITE.linkedin = ''` **no** es un bloqueador: el footer esconde el icono entero
mientras esté vacío. Es degradación intencional.

---

## 3. URLs que se van a romper

> **Estado: cerrado** (commit `c0a5da0`). Las 14 URLs responden con `RedirectStub`
> y están excluidas del sitemap. `/feed/` se dejó fuera a propósito — ver abajo.

Los 61 posts están cubiertos (coinciden exactos). Lo que **no** tiene equivalente:

| URL en vivo hoy | Recomendación |
|---|---|
| `/about-us/` | Página real bajo `/about/`… o `RedirectStub` a `/`. Tiene enlaces desde el nav de WP. |
| `/book-a-call-now/` | **Stub al calendario** (el mismo `BOOKING_URL`). Es tráfico de intención alta. |
| `/training-sessions/` | Stub a `/` o a `/blogs/`. |
| `/resource/` | Stub a `/blogs/`. |
| `/resources/` | Stub a `/blogs/`. |
| `/resources/airtable-best-practices-checklist/` | Lead magnet. 3 enlaces in-content lo apuntan. Rehacer la página o stub a `/blogs/`. |
| `/resources/step-by-step-guide-to-automating-project-task-creation/` | Lead magnet. 4 enlaces in-content. Igual. |
| `/testimonials/{5 slugs}/` | Stub a `/` (o a una futura sección de testimonios). |
| `/category/blog/` | Stub a `/blogs/`. |
| `/author/admin/` | Stub a `/blogs/`. |
| `/feed/` | Ver abajo. |

**Total: 15 URLs sin destino** — 14 del sitemap de WordPress, más `/feed/`, que no está en el
sitemap pero sí declarado en el `<head>` de todas las páginas.

`RESERVED_SLUGS` en `src/lib/blog.ts` ya reserva `about-us`, `book-a-call-now`,
`training-sessions`, `resource`, `resources` y `testimonials` — pero **reservar no es
redirigir**. Reservar solo evita que un post con ese slug quede pisado. Hoy no hay
ningún stub para ninguna de las 15.

Cada stub es un `.astro` de una línea:

```astro
---
import RedirectStub from '../layouts/RedirectStub.astro';
---
<RedirectStub to="https://automaticnation.com/blogs/" />
```

### El caso `/feed/`

`/feed/` responde 200 hoy y está declarado como `<link rel="alternate">` en el
`<head>` de todas las páginas de WordPress — o sea, hay lectores RSS suscritos.
El sitio nuevo publica en `/rss.xml`.

Un `RedirectStub` **no resuelve esto**: un meta-refresh mueve a un humano, no a un
lector RSS. Y Astro no puede emitir XML exactamente en `/feed/` (un endpoint necesita
extensión: `src/pages/feed/index.xml.ts` daría `/feed/index.xml`, no `/feed/`).

Opciones honestas, en orden:
1. Aceptar la pérdida. El `<link rel="alternate">` nuevo ya apunta a `/rss.xml`, así
   que los lectores que redescubran el feed desde la página lo encontrarán. Los
   suscriptores actuales se caen.
2. Poner un `RedirectStub` en `/feed/` — recupera a los humanos que abran la URL,
   no a los lectores.

Dado el volumen probable, la opción 1 con un stub encima (o sea, 2) es suficiente.
Decisión de negocio, no técnica.

---

## 4. El problema del preview

Una vez que `public/CNAME` está desplegado, GitHub Pages pone el dominio custom y
`devautomaticn.github.io/automatic-nation-website/` **redirige 301 a
`automaticnation.com`** — que todavía es WordPress. O sea: entre el push y el cambio
de DNS **no hay forma de ver el sitio nuevo en una URL de GitHub**.

Y sin CNAME, el subpath sirve el sitio con todos los assets rotos (§1.2). No sirve
como preview tampoco.

Lo que sí funciona:

```bash
npm run build && npm run preview     # la única forma honesta de verificar rutas y assets
```

Si quieres probar el certificado y el DNS de verdad antes del cutover, la alternativa
es un subdominio de staging (`staging.automaticnation.com` → CNAME a
`devautomaticn.github.io`) desde un repo aparte. Es más trabajo del que probablemente
valga: el cutover en sí tarda minutos y es reversible (§8).

---

## 5. El riesgo de cache

La home actual manda:

```
cache-control: public, max-age=2678400     # 31 días
```

Eso va **al navegador**, no solo al edge. Un visitante reciente puede seguir viendo
la home de WordPress hasta 31 días después de que el DNS cambie, sin ningún error
visible.

Mitigación, en orden de importancia:
1. **Bajar el `max-age` en GoDaddy varios días antes del cutover** (a 300s o menos).
2. Purgar el cache de GoDaddy/Cloudflare justo antes del cambio de DNS.
3. Aceptar que algunos visitantes verán la versión vieja un tiempo. No hay forma de
   invalidar un cache de navegador ya emitido.

---

## 6. Secuencia de cutover

### Fase A — Preparación (día −7)

1. **Backup del WordPress.** Export XML completo + backup de `wp-content/uploads`.
   Guardarlo fuera de GoDaddy.
2. **Bajar el TTL del DNS.** En GoDaddy, el A de `@` y el de `www`: de 3600 → **600**.
   Sin esto, un rollback tarda una hora en propagar en vez de diez minutos.
3. **Bajar el `max-age`** del cache de WordPress (§5).
4. **Verificar el dominio en GitHub** (§1.3).

### Fase B — Cerrar los gaps (día −7 a −1)

5. ~~Rellenar los bloqueadores de contenido de §2~~ — hecho salvo `og-image.png`.
6. ~~Crear los stubs de las URLs de §3~~ — hecho, 14 stubs.
7. `npm run check && npm run build && npm run preview` — recorrer la home, un post,
   `/blogs/`, `/lp/airtable-consulting/`, el 404, y un par de stubs.

### Fase C — Push (día −1)

8. ~~Mergear a `main` y pushear~~ — hecho, `dfbe815..f00bdea`.
9. ~~Esperar a que el workflow *Deploy to GitHub Pages* termine en verde~~ — hecho,
   run `32662222069`.
10. ~~Poner *Custom domain* = `automaticnation.com`~~ — hecho por API. **No se pone
    solo**, ver §1.2. El DNS check falla todavía: es lo esperado, el DNS aún apunta
    a GoDaddy.

### Fase D — Cutover DNS (día 0)

En GoDaddy → DNS de `automaticnation.com`:

11. **Borrar** el A de `@` → `160.153.0.120`.
12. **Añadir cuatro A** en `@`:
    ```
    185.199.108.153
    185.199.109.153
    185.199.110.153
    185.199.111.153
    ```
13. **Añadir cuatro AAAA** en `@` (opcional pero recomendado):
    ```
    2606:50c0:8000::153   2606:50c0:8001::153
    2606:50c0:8002::153   2606:50c0:8003::153
    ```
14. **`www`** → CNAME a `devautomaticn.github.io.` (con el punto final). GitHub
    redirige `www` → apex automáticamente.

> **NO TOCAR, bajo ninguna circunstancia.** Lista completa, verificada contra la zona
> real el 2026-08-24: son **18 registros** y el cutover toca exactamente **dos**.
> - Los **5 registros MX de Google Workspace** (`aspmx.l.google.com` y sus alts).
>   El correo de la empresa vive ahí. Un cutover que rompe el email es un incidente.
> - El TXT **`v=spf1 include:_spf.google.com ~all`**.
> - El **CNAME `litesrv._domainkey` → `litesrv._domainkey.mlsend.com.`** — es la firma
>   DKIM de MailerLite. Borrarla no rompe el correo entrante, así que no se nota en el
>   momento: lo que hace es que la newsletter empiece a caer en spam.
> - Los **dos TXT `google-site-verification=…`** — uno es la verificación de Search
>   Console, y perderla justo cuando más falta hace es exactamente el peor momento.
> - **Tres subdominios con servicio en producción**, que este documento no mencionaba
>   hasta ahora: `norton` y `pm` (→ `46.224.159.63`, ambos responden 401) y `workflows`
>   (→ `68.183.117.241`, responde 200). Ya están en TTL 600.
> - El **CNAME `_acme-challenge`** → `…dcv.cloudflare.com.`, validación de certificado.
> - **NS** y **SOA**: GoDaddy los bloquea en la propia UI.
>
> Lo único que cambia en la Fase D es el **`A @`** (que pasa a ser cuatro filas) y el
> **`CNAME www`**. Las otras dieciséis filas se quedan exactamente como están.
>
> Antes de guardar nada, hacer captura de la zona DNS completa.

15. Esperar propagación (10 min con TTL 600). Comprobar:
    ```bash
    dig +short automaticnation.com A     # deben salir los 185.199.*
    ```
16. En **Settings → Pages**, esperar a *DNS check successful*, y entonces marcar
    **Enforce HTTPS**. El certificado puede tardar hasta ~1 hora en emitirse; hasta
    entonces habrá aviso de certificado. Es normal, no es un fallo del cutover.
17. Purgar el cache de GoDaddy/Cloudflare.

### Fase E — Verificación (día 0, +1h)

18. Correr el script de §7. Debe dar 200 en las 64 URLs del sitemap nuevo y 200 en
    las 15 legacy (los stubs devuelven 200 con meta-refresh, no 301 — eso es lo
    esperado en Pages estático).
19. A mano: home, un post con imágenes, `/blogs/`, `/lp/airtable-consulting/`, el
    hero de tetris (que carguen los 15 iconos), una URL inventada → 404.
20. Confirmar que el **email sigue funcionando**. Mandarse un correo.

### Fase F — SEO (día 0 a +30)

21. Search Console → enviar `https://automaticnation.com/sitemap-index.xml`.
22. Search Console → *Inspeccionar URL* sobre la home → *Solicitar indexación*.
23. Retirar el sitemap viejo (`sitemap_index.xml`) de Search Console.
24. A los 7 y a los 30 días: revisar *Cobertura* buscando 404 inesperados, y
    *Rendimiento* comparando contra el mes anterior.
25. **Mantener el WordPress vivo y pagado al menos 30 días.** Es el rollback.

---

## 7. Script de verificación post-cutover

```bash
#!/usr/bin/env bash
# Corre desde la raíz del repo, después de npm run build.
fail=0

echo "── URLs del sitio nuevo ──"
grep -o '<loc>[^<]*</loc>' dist/sitemap-0.xml | sed 's/<[^>]*>//g' | while read -r u; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 20 "$u")
  [ "$code" = 200 ] || { echo "FAIL $code $u"; fail=1; }
done

echo "── URLs legacy (deben responder, no 404) ──"
while read -r u; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 20 "$u")
  [ "$code" = 200 ] || echo "FAIL $code $u"
done < docs/cutover/live-non-post-urls.txt

echo "── Posts legacy (deben ser los mismos, 200) ──"
while read -r u; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 20 "$u")
  [ "$code" = 200 ] || echo "FAIL $code $u"
done < docs/cutover/live-post-urls.txt

echo "── Sanity ──"
curl -sI https://www.automaticnation.com/ | head -1        # 301 → apex
curl -s https://automaticnation.com/ | grep -c 'id="book"' # 1
dig +short automaticnation.com MX | wc -l                  # 5, el email sigue vivo
```

---

## 8. Rollback

Si algo sale mal después del cambio de DNS:

1. En GoDaddy: borrar los cuatro A de GitHub, restaurar el A `@` → `160.153.0.120`.
2. Con TTL 600, propaga en ~10 minutos.
3. El WordPress no se tocó en ningún momento, así que vuelve exactamente como estaba.

El único paso no trivialmente reversible es el **cache de navegador de 31 días** de
§5 — por eso bajarlo en la Fase A no es opcional.
