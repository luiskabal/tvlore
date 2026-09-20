# TVLore Privacy and Data Safety Audit

Fecha de auditoria: 2026-08-27

Este documento es un reporte factual de ingenieria para preparar la Privacy Policy
y el formulario Data Safety de Google Play. No es asesoramiento legal y no debe
copiarse como respuesta final del formulario sin revision.

## Alcance

Auditado:

- `apps/mobile`
- `apps/api`
- `packages/contracts`
- Prisma schema y configuracion relevante
- paginas legales servidas por la API publica
- artefacto Android AAB documentado para Internal Testing
- documentacion existente en `docs/`

No auditado directamente:

- consola real de Google Play
- panel real de Supabase
- panel real de Vercel
- politicas internas de retencion de proveedores

## Nota sobre Google Play Data Safety

En Google Play, "collected" incluye datos transmitidos off-device desde la app,
incluyendo datos enviados por SDKs o librerias. "Shared" depende de si los datos
se transfieren a terceros y de si aplica una excepcion como service provider.

Referencia oficial revisada:

- https://support.google.com/googleplay/android-developer/answer/10787469

## Resumen ejecutivo

TVLore usa Supabase Auth para login y una API propia en Vercel para persistir la
biblioteca personal del usuario en Supabase/Postgres. La app almacena datos de
cuenta, perfil minimo, historial de vistos, watchlist, ratings, reflexiones
privadas, comentarios privados, favorite character y Watch Paths.

No se encontro implementacion propia de ads, analytics, tracking, push
notifications, ubicacion precisa/aproximada, contactos, camara, microfono,
pagos, ni identificadores de publicidad. El AAB Android inspeccionado contiene
permisos de almacenamiento heredados y clases nativas transitivas que requieren
confirmacion antes de completar Play Data Safety.

## VERIFIED FROM CODE

### Fuentes principales

- `apps/mobile/package.json`
- `apps/mobile/app.json`
- `apps/mobile/eas.json`
- `apps/mobile/.env.example`
- `apps/mobile/src/auth/supabase-auth.ts`
- `apps/mobile/src/auth/use-auth-session.ts`
- `apps/mobile/src/api/client.ts`
- `apps/mobile/src/api/catalog.ts`
- `apps/mobile/src/api/tracking.ts`
- `apps/mobile/src/api/preferences.ts`
- `apps/mobile/src/api/reflections.ts`
- `apps/mobile/src/api/watchlist.ts`
- `apps/mobile/src/api/watch-paths.ts`
- `apps/api/package.json`
- `apps/api/.env.example`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/auth/supabase-auth.service.ts`
- `apps/api/src/users/users.controller.ts`
- `apps/api/src/users/users.repository.ts`
- `apps/api/src/legal.controller.ts`
- `apps/api/src/correlation-id.middleware.ts`
- `apps/api/src/rate-limit.guard.ts`
- `apps/api/src/catalog/tmdb-client.ts`
- `apps/api/src/tracking/*`
- `apps/api/src/preferences/*`
- `apps/api/src/reflections/*`
- `apps/api/src/watchlist/*`
- `apps/api/src/watch-paths/*`
- `packages/contracts/src/index.ts`
- `docs/data-inventory.md`
- `docs/privacy.md`
- `docs/google-play-android-release.md`
- `docs/current-state.md`

### Datos personales o de cuenta

| Dato | Collected? | Stored? | Transmitted off-device? | Required / optional | Purpose | Retention / deletion behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Email | Si | Si, en Supabase Auth y `user_identities.email` | Si, entre mobile, Supabase Auth y API | Requerido para cuenta OAuth | Authentication, account management, identidad de cuenta | `DELETE /users/me` elimina la fila TVLore y, si esta configurado, elimina Supabase Auth. Logs/backups de proveedores: unknown. |
| Display name / nombre | Si | Si, en `users.displayName`; tambien puede existir en metadata de Supabase Auth | Si | Opcional desde OAuth; la API usa fallback si falta | Profile display | Eliminado con la fila `User`; metadata de Supabase se elimina si Supabase Auth deletion funciona. |
| Avatar URL / profile picture URL | Si | No en tablas Prisma de TVLore; si puede existir en Supabase Auth metadata y mobile session | Si | Opcional | Mostrar avatar en perfil | No hay copia en DB TVLore; depende de Supabase Auth deletion para metadata. |
| Google account identifiers | Parcial | No se almacena el Google subject crudo en Prisma; Supabase Auth probablemente lo mantiene en su sistema de identities | Si, durante OAuth | Requerido solo si el usuario elige Google login | Authentication | TVLore borra su mapping local; retencion exacta en Supabase/Google: unknown. |
| Apple account identifiers | Parcial | No se almacena Apple subject crudo en Prisma; Supabase Auth probablemente lo mantiene | Si, durante Apple Sign-In en iOS | Opcional; iOS only | Authentication | TVLore borra su mapping local; retencion exacta en Supabase/Apple: unknown. |
| Supabase user ID | Si | Si, como `users.id` y `user_identities.providerSubject` | Si | Requerido para cuenta autenticada | Backend identity mapping, authorization, account management | Eliminado con `DELETE /users/me` en TVLore DB y Supabase Auth si configurado. |
| Availability country / pais de disponibilidad | Si | Si, `users.availabilityCountry`; default Prisma `CL` | Si | Opcional como setting, pero existe default al crear usuario | Where to Watch, discovery, recomendaciones por pais | Eliminado con la fila `User`. |
| Device locale country inferred locally | Si, localmente | No persistido directamente como tal | Puede transmitirse si se convierte en availability country | Opcional / fallback | Sugerir pais de disponibilidad | Si se guarda como profile setting, aplica retencion de availability country. |
| IP address / network metadata | Si, por requests HTTP | No en Prisma; usado en rate limiter in-memory para usuarios no autenticados; puede existir en Vercel/Supabase logs | Si | Requerido tecnicamente para usar red/API | Seguridad, rate limiting, reliability, debugging | Sin retencion explicita en repo; provider logs/backups: unknown. |
| Device identifiers | No verificado | No verificado en Prisma ni codigo app | No verificado por codigo propio | N/A | N/A | No hay deletion behavior porque no se encontro recoleccion propia. Ver "UNKNOWN" por SDKs transitivos. |
| Advertising ID | No | No | No | N/A | N/A | No se encontro permiso `AD_ID` ni SDK de ads. |
| Auth/session tokens | Si | Si en device: Expo SecureStore en native; web usa AsyncStorage. No en Prisma product DB actual. | Si, bearer token enviado a API y validado contra Supabase Auth | Requerido para features autenticados | Authentication, session persistence | Sign out limpia sesion local; account deletion elimina cuenta si Supabase deletion esta configurado. |
| Correlation ID, route, status, latency, timestamp | Si | No en Prisma; log operacional en API/Vercel | Si, si llega como header o se genera en API | Tecnico | Observability, debugging, reliability | Sin retencion explicita en repo. |

### Datos generados por el usuario

| Dato | Collected? | Stored? | Transmitted off-device? | Required / optional | Purpose | Retention / deletion behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Watched state de episodios | Si | Si, `episode_watches` | Si | Opcional, accion del usuario | Biblioteca, progreso, chronology, continue watching, recomendaciones | Eliminado al hacer unwatch o con account deletion. |
| Watched state de movies | Si | Si, `movie_watches` | Si | Opcional, accion del usuario | Biblioteca, history, recomendaciones | Eliminado al hacer unwatch o con account deletion. |
| Watched timestamps | Si | Si, `watchedAt` en watch rows | Si | Opcional; default server `new Date()` si no se envia | Orden cronologico, recently watched, progreso | Eliminado junto al watched state. |
| Watched state de show completo | Si | Si, como multiples `episode_watches` | Si | Opcional | Marcar una serie completa como vista | Unwatch/show deletion borra watch rows correspondientes; account deletion borra todo. |
| Watched state de season completa | Si | Si, como multiples `episode_watches` | Si | Opcional | Marcar temporada como vista | Unwatch/season deletion borra watch rows correspondientes; account deletion borra todo. |
| Ratings de shows | Si | Si, `show_preferences.rating` | Si | Opcional | Preferencias, perfil, recomendaciones | Delete preference o account deletion. |
| Ratings de movies | Si | Si, `movie_preferences.rating` | Si | Opcional | Preferencias, perfil, recomendaciones | Delete preference o account deletion. |
| Ratings de episodes | Si | Si, `episode_preferences.rating` | Si | Opcional | Preferencias, perfil, recomendaciones | Delete preference o account deletion. |
| Check-ins / reflections | Si | Si, tablas `*_reflections` | Si | Opcional | Nota privada post-watch | No se encontro endpoint DELETE especifico para reflections; account deletion las elimina. |
| Reaction | Si | Si, en reflection row | Si | Opcional dentro del check-in; requerido por el endpoint si se guarda reflection | Clasificar experiencia post-watch | Account deletion. |
| Favorite character | Si | Si, `favoriteCharacter` en reflections | Si | Opcional | Reflexion privada y preferencias personales | Account deletion. |
| Comments privados | Si | Si, `comment` en reflections | Si | Opcional | Nota privada post-watch | Account deletion. |
| Watchlist de shows | Si | Si, `show_watchlist_items` | Si | Opcional | Guardar titulos para ver despues | Remove watchlist item o account deletion. |
| Watchlist de movies | Si | Si, `movie_watchlist_items` | Si | Opcional | Guardar titulos para ver despues | Remove watchlist item o account deletion. |
| Watch Paths personales | Si | Si, `user_watch_paths` y `user_watch_path_items` | Si | Opcional | Crear rutas personales de visualizacion | No se encontro endpoint DELETE path; account deletion los elimina. |
| Watch Path title/description/items/notes | Si | Si | Si | Title e items requeridos para crear path; description/note opcionales | Organizar rutas personales | Account deletion. |
| TMDB collection URL importada | Si | No necesariamente como URL completa; se parsea el provider ID y se guardan items resultantes | Si, a API TVLore y luego TMDB | Opcional | Importar una coleccion como Watch Path | Path resultante eliminado con account deletion; logs/provider retention unknown. |
| Search query | Si | No persistido en Prisma; in-memory cache en mobile/API client | Si, mobile -> API -> TMDB | Opcional, accion del usuario | Search de catalogo | No hay retention en DB TVLore; puede quedar en provider/access logs: unknown. |
| Viewing history/progress | Si | Si, derivado de watched rows; no hay progress continuo por minuto | Si | Opcional | Library summary, continue watching, recomendaciones | Eliminado con watched rows/account deletion. |
| Public social comments/reactions | No | No | No | N/A | N/A | Social publico no implementado en MVP actual. |
| Generic favorites list | No | No | No | N/A | N/A | No hay lista generica de favoritos; solo favorite character dentro de reflections y watchlist. |

### Servicios externos que reciben datos

| Servicio | Datos que recibe segun codigo | Purpose | Stored by TVLore? | Estado |
| --- | --- | --- | --- | --- |
| Supabase Auth | Email, display name, avatar URL/profile metadata, OAuth identity data, Supabase user ID, session tokens | Authentication, session management, account deletion | Supabase Auth almacena datos de cuenta fuera de Prisma | VERIFIED FROM CODE |
| Supabase Postgres | TVLore product data: user, identity mapping, availability country, watched state, watchlist, ratings, reflections, watch paths, catalog cache | Persistencia de app | Si, via Prisma/API | VERIFIED FROM CODE |
| Google OAuth | Interaccion de login Google; Google provee identity a Supabase Auth | Authentication | No en Prisma como Google subject crudo | VERIFIED FROM CODE para flujo; detalles internos Google/Supabase: INFERRED |
| Apple Sign-In | Interaccion de login Apple en iOS; nombre/email/id token hacia Supabase | Authentication | No en Prisma como Apple subject crudo | VERIFIED FROM CODE para app; no aplica al Android build |
| TMDB | Search query, media type, TMDB provider IDs, language, page, discovery params, watch region en discovery, collection ID, cast/detail lookups | Catalog search, details, cast, recommendations, provider availability | TVLore puede persistir catalog metadata compartida, no datos de cuenta | VERIFIED FROM CODE |
| JustWatch / providers relacionados | No hay llamada directa. TVLore usa TMDB watch providers. | Mostrar disponibilidad | No directo | VERIFIED FROM CODE |
| Vercel | Requests a la API, IP/user agent probable, route/status/latency/correlation logs, auth header en transito | Hosting API, reliability, debugging | No en Prisma por Vercel; platform logs unknown | VERIFIED FROM CODE para API; provider retention UNKNOWN |
| Expo / EAS | Build/distribution metadata; app incluye runtime Expo y SecureStore/WebBrowser/dev-client modules | Build/runtime framework, distribution | No product data TVLore verificado | PARTIAL / UNKNOWN para collection runtime por SDKs |
| Sentry | No se encontro SDK/config | N/A | No | NOT IMPLEMENTED |
| Firebase Analytics / Crashlytics | No se encontro SDK/config explicito | N/A | No | NOT IMPLEMENTED |
| AdMob / ads SDK | No se encontro SDK/config ni permiso AD_ID | N/A | No | NOT IMPLEMENTED |
| OneSignal / push provider | No se encontro SDK/config ni push token code | N/A | No | NOT IMPLEMENTED |

### SDKs y permisos Android encontrados

Dependencias directas relevantes en `apps/mobile/package.json`:

- `@supabase/supabase-js`
- `expo`
- `expo-apple-authentication`
- `expo-constants`
- `expo-dev-client`
- `expo-linking`
- `expo-router`
- `expo-secure-store`
- `expo-status-bar`
- `expo-web-browser`
- `react-native`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-url-polyfill`
- `react-native-worklets`

Permisos observados en el AAB Android inspeccionado:

- `android.permission.INTERNET`
- `android.permission.ACCESS_NETWORK_STATE`
- `android.permission.VIBRATE`
- `android.permission.READ_EXTERNAL_STORAGE`
- `android.permission.WRITE_EXTERNAL_STORAGE`
- `android.permission.SYSTEM_ALERT_WINDOW`
- `android.permission.USE_BIOMETRIC`
- `android.permission.USE_FINGERPRINT`

Permisos no encontrados en el AAB inspeccionado:

- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.CAMERA`
- `android.permission.RECORD_AUDIO`
- `android.permission.READ_CONTACTS`
- `android.permission.GET_ACCOUNTS`
- `android.permission.READ_MEDIA_IMAGES`
- `android.permission.READ_MEDIA_VIDEO`
- `android.permission.READ_MEDIA_AUDIO`
- `android.permission.POST_NOTIFICATIONS`
- `com.google.android.gms.permission.AD_ID`

SDKs o clases nativas observadas en el AAB pero no usadas por flujos TVLore
encontrados en el codigo:

- Google MLKit / barcode scanning classes
- Google DataTransport classes
- Expo dev launcher / dev menu classes

Esto requiere confirmacion antes de responder preguntas estrictas sobre SDKs
transitivos en Play Console, porque estan presentes en el artefacto aunque no se
encontro codigo de producto que los invoque.

### Confirmaciones especificas

| Tema | Estado | Evidencia |
| --- | --- | --- |
| Advertising SDKs | No verificado como implementado | No SDK de ads en package.json/AAB scan; no permiso `AD_ID`. |
| Analytics SDKs | No verificado como implementado | No Firebase Analytics, Segment, Amplitude, Mixpanel, PostHog ni similar en dependencias/codigo. |
| Tracking SDKs | No verificado como implementado | No SDK de tracking encontrado; TVLore si guarda actividad funcional propia. |
| Push notification tokens | No implementado | No paquete/config/codigo de notifications; no `POST_NOTIFICATIONS`. |
| Precise/coarse location | No implementado | No permisos location; pais es preference/manual/default, no GPS. |
| Contacts | No implementado | No permisos contacts ni codigo. |
| Photos/files | No feature implementado | No flujo de fotos/files encontrado; AAB tiene `READ/WRITE_EXTERNAL_STORAGE`, needs confirmation. |
| Microphone/camera | No implementado | No permisos/codigo. |
| Payment information | No implementado | No billing SDK ni flujo de pagos. |
| Device identifiers | No app-specific implementation found | No AD_ID ni device ID code; provider/runtime identifiers unknown. |

### Datos enviados a TMDB y otros APIs

La app mobile no llama a TMDB directamente. Mobile llama a la API TVLore; la API
usa `TMDB_ACCESS_TOKEN` server-side.

Search:

- endpoint TMDB: `/3/search/multi`
- envia `query`
- envia `include_adult=false`
- envia `language=en-US`
- envia `page`
- el filtro show/movie se aplica en TVLore segun el tipo solicitado

Detail/resolve:

- endpoint TMDB: `/3/tv/{providerId}` o `/3/movie/{providerId}`
- envia `language=en-US`
- no envia email, Supabase ID ni Google ID

Season/episode:

- endpoint TMDB: `/3/tv/{providerShowId}/season/{seasonNumber}`
- endpoint episode/cast: `/3/tv/{providerShowId}/season/{season}/episode/{episode}`
- envia `language=en-US`
- para episode puede enviar `append_to_response=credits`

Watch providers:

- endpoint TMDB: `/3/tv/{providerId}/watch/providers` o `/3/movie/{providerId}/watch/providers`
- envia media type y provider ID en la URL
- no envia pais en esta llamada; TVLore filtra `results[country]` localmente

Discovery/recommendations:

- endpoint TMDB: `/3/discover/tv` o `/3/discover/movie`
- envia `include_adult=false`
- envia `language=en-US`
- envia `page=1`
- envia `sort_by`
- envia `watch_region={availabilityCountry}`
- envia `with_watch_monetization_types=flatrate|free|ads`
- puede enviar `vote_count.gte`
- movies envian `include_video=false`

Collection import:

- parsea un URL de TMDB collection
- envia collection ID a `/3/collection/{providerId}`
- envia `language=en-US`

No se encontro codigo que envie a TMDB:

- email
- nombre
- avatar
- Supabase user ID
- Google/Apple account identifiers
- auth bearer token de TVLore
- comments/reflections/watchlist completos

Nota: en recomendaciones, TMDB puede observar IDs de titulos que TVLore consulta
para disponibilidad. Esos IDs son derivados del perfil del usuario, pero no van
acompanados por identificadores personales en el codigo auditado.

### Account deletion

Superficie implementada:

- `GET /users/me/account-deletion`
- `DELETE /users/me`
- pagina publica `https://tvlore-api.vercel.app/account-deletion`
- accion in-app en Profile para delete account

Comportamiento de `DELETE /users/me`:

- valida el bearer token con Supabase Auth
- busca el usuario TVLore por Supabase user ID
- elimina la fila `User` de TVLore DB
- por cascada Prisma elimina datos user-owned:
  - `user_identities`
  - `refresh_sessions`
  - `episode_watches`
  - `movie_watches`
  - `show_watchlist_items`
  - `movie_watchlist_items`
  - `show_preferences`
  - `movie_preferences`
  - `episode_preferences`
  - `show_reflections`
  - `movie_reflections`
  - `episode_reflections`
  - `user_watch_paths`
  - `user_watch_path_items`
- luego llama Supabase Auth Admin DELETE para eliminar el Auth user

Datos que permanecen por diseno:

- catalogo compartido:
  - `shows`
  - `movies`
  - `seasons`
  - `episodes`
  - `external_identifiers`
  - provider/catalog metadata

Limitaciones conocidas:

- No hay transaccion cross-system entre TVLore DB y Supabase Auth.
- Si falla Supabase Auth deletion despues de borrar la fila TVLore, los datos de
  producto pueden quedar eliminados pero la cuenta Auth podria permanecer.
- Si falta `SUPABASE_SERVICE_ROLE_KEY`, deletion de Supabase Auth no esta
  configurado; el endpoint reporta/configura esta condicion y la UI puede
  deshabilitar la accion.
- No hay retention explicita para logs, backups o terceros.
- No se encontro endpoint especifico para borrar solo reflections o solo Watch
  Paths; account deletion si los elimina.

El usuario puede solicitar eliminacion de datos:

- Si, via accion in-app autenticada.
- Si, via instrucciones publicas en `/account-deletion`.

### Cifrado en transito

Verificado o soportado por configuracion:

- Mobile production API base URL: `https://tvlore-api.vercel.app`
- Supabase URL: `https://qpekdijebjzigrgcumpv.supabase.co`
- Supabase Auth validation usa HTTPS
- TMDB API usa `https://api.themoviedb.org`
- Google/Apple OAuth ocurren via proveedores HTTPS/Supabase

Limitaciones:

- El repo tiene fallbacks locales HTTP para desarrollo (`localhost` / emulator).
- El cifrado del enlace Postgres `DATABASE_URL` no puede confirmarse desde el
  repo porque el valor real no esta versionado.
- Cifrado at rest no fue verificado en paneles de proveedor.

### URLs existentes

| URL | Estado |
| --- | --- |
| `https://tvlore-api.vercel.app/privacy` | Existe y responde HTML |
| `https://tvlore-api.vercel.app/terms` | Existe y responde HTML |
| `https://tvlore-api.vercel.app/support` | Existe y responde HTML |
| `https://tvlore-api.vercel.app/account-deletion` | Existe y responde HTML |
| `https://github.com/luiskabal/tvlore/issues` | Soporte enlazado por API |

## Android build production / Internal Testing

Estado inspeccionado:

- paquete Android: `com.luiskabal.tvlore`
- app version: `1.0.0`
- versionCode documentado: `9`
- track de submit en `apps/mobile/eas.json`: `internal`
- API production en bundle: `https://tvlore-api.vercel.app`
- Supabase production en bundle: `https://qpekdijebjzigrgcumpv.supabase.co`
- no se encontro `api.themoviedb.org` en bundle mobile; TMDB queda server-side

Limitacion:

- No hubo acceso directo a Play Console ni EAS CLI en el entorno de auditoria.
- No estaban disponibles `node`, `corepack`, `npm`, `pnpm`, `npx`, `eas`, `java`,
  `bundletool`, `aapt` o `aapt2`, asi que la inspeccion del AAB fue por ZIP/text
  extraction y no por tooling oficial Android.

## INFERRED

### Retencion de Supabase, Vercel, Google, Apple y TMDB

El repo no define politicas de retencion de logs/backups de proveedores. Se
infiere que estos servicios pueden retener logs operacionales segun sus propias
politicas, pero no hay configuracion versionada que permita confirmarlo.

### Raw Google/Apple provider identifiers

El codigo TVLore no almacena el subject crudo de Google/Apple en Prisma. Por el
uso normal de Supabase Auth con OAuth, es probable que Supabase Auth mantenga
identidades de proveedor internamente. Confirmar en Supabase Dashboard si se
necesita precision legal.

### Clasificacion "shared" en Play Data Safety

Supabase y Vercel parecen actuar como service providers para ejecutar la app.
TMDB recibe queries y provider IDs para funcionalidad de catalogo. Google/Apple
reciben datos por OAuth. Si esto debe marcarse como "shared" en Play depende de
la interpretacion legal y de las excepciones de service provider de Google Play.

### Operational logs

El middleware de API registra route sin query, status, latency, timestamp y
correlation ID. Vercel/Supabase pueden tener logs adicionales como IP, user
agent o URL completa, pero eso no esta definido en el repo.

### Pais/region en Play Data Safety

No hay GPS ni location permission. `availabilityCountry` es una preferencia de
producto. Para Play, no deberia marcarse como precise/coarse location por codigo
actual, pero podria requerir declararse como otro dato personal si el formulario
incluye pais/region de perfil.

## UNKNOWN / NEEDS CONFIRMATION

- Retencion exacta de Supabase Auth despues de account deletion.
- Retencion exacta de Supabase Postgres backups.
- Retencion exacta de Vercel logs.
- Retencion exacta de Google/Apple OAuth logs.
- Retencion exacta de TMDB API logs.
- Si `SUPABASE_SERVICE_ROLE_KEY` esta configurado en production actualmente.
- Prueba real de account deletion con una cuenta desechable en production.
- Si Play Console detecta o exige explicar `READ_EXTERNAL_STORAGE` y
  `WRITE_EXTERNAL_STORAGE` en el AAB.
- Origen exacto de MLKit/DataTransport en el AAB y si recolectan datos por
  defecto sin invocacion de producto.
- Si `expo-dev-client`/dev launcher deberia estar presente en un production AAB
  distribuido a testers.
- Si Vercel/Supabase logs deben declararse como diagnostics en Play Data Safety.
- Si TMDB debe tratarse como tercero "shared" o como processor/service provider
  para el formulario final.

## Propuesta para Google Play Data Safety

Esto es un punto de partida basado exclusivamente en implementacion real. No es
respuesta final legal.

### Categorias que probablemente deben declararse como collected

| Google Play category | Data type probable | TVLore data | Purpose |
| --- | --- | --- | --- |
| Personal info | Name | Display name | App functionality, account management |
| Personal info | Email address | Email | App functionality, account management |
| Personal info | User IDs | Supabase user ID | App functionality, account management, security |
| Personal info | Other info | Avatar URL/profile photo URL, availability country if Play UI requires | App functionality, personalization |
| App activity | In-app search history | Search queries sent to API/TMDB | App functionality |
| App activity | App interactions / other actions | watched state, watchlist, ratings, progress actions | App functionality, personalization |
| App activity | Other user-generated content | private comments/reflections, favorite character, Watch Path title/description/notes | App functionality, personalization |

### Categorias que no se encontraron implementadas

| Google Play category | Estado |
| --- | --- |
| Location: approximate / precise | No encontrado; no permisos location |
| Financial info | No encontrado |
| Photos and videos uploaded by user | No feature encontrado; revisar permisos storage |
| Audio files / voice / music | No encontrado |
| Files and docs | No feature encontrado; revisar permisos storage |
| Calendar | No encontrado |
| Contacts | No encontrado |
| Web browsing history | No encontrado |
| Device or other IDs | No AD_ID ni device-id code encontrado; SDK/provider IDs unknown |
| Advertising or marketing purpose | No encontrado |
| Third-party advertising | No encontrado |

### Diagnostics / app info and performance

No se encontro SDK de crash reporting ni analytics client-side. La API si genera
logs operacionales y los proveedores de hosting/auth pueden registrar metadata
de requests. Confirmar si Play Console espera declarar esto como diagnostics o
si queda cubierto por logs de service provider.

### Data encrypted in transit

Direccion probable para Play:

- Si, para trafico production HTTP(S) app/API/Supabase/TMDB/OAuth.

Matiz:

- No confirmar Postgres transport ni at-rest encryption desde el repo.
- Local development puede usar HTTP, pero eso no representa el Android
  production build.

### Data deletion

Direccion probable para Play:

- Si, el usuario puede solicitar eliminacion de cuenta/datos.

Base factual:

- in-app delete account action
- `DELETE /users/me`
- public account deletion URL

Matiz:

- Confirmar `SUPABASE_SERVICE_ROLE_KEY` en production y probar con cuenta
  desechable antes de marcarlo como completamente operativo en Play.

## Checklist de confirmacion antes de enviar Play Data Safety

- Probar account deletion en production con una cuenta desechable.
- Confirmar en Supabase que Auth user fue eliminado.
- Confirmar que user-owned rows fueron eliminadas en DB.
- Confirmar si Supabase/Vercel logs retienen IP, user agent o query strings.
- Revisar Play Console warnings por permisos `READ_EXTERNAL_STORAGE` y
  `WRITE_EXTERNAL_STORAGE`.
- Confirmar origen de MLKit/DataTransport/dev-client en el AAB.
- Confirmar si el build distribuido a Internal Testing es el mismo artefacto
  analizado.
- Revisar la Privacy Policy publica para alinear wording con el Data Safety final.
