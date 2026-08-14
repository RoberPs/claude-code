# Kōhi ☕

Landing de una cafetería de especialidad con lista de espera: los visitantes
se registran, reciben una posición en la cola y consultan su sitio desde un
panel privado protegido con JWT.

Proyecto de práctica del curso de Claude Code, construido íntegramente a
través de servidores **MCP** (SQLite, GitHub y Playwright).

## Stack

Express 5 · better-sqlite3 (SQL directo, sin ORM) · bcrypt · jsonwebtoken ·
HTML y CSS vanilla, sin frameworks ni paso de build.

## Puesta en marcha

```bash
npm install
npm run db:init   # crea kohi.db a partir de schema.sql
npm start         # http://localhost:3000
```

`kohi.db` no se versiona: contiene hashes de contraseñas reales. `db:init` es
idempotente, se puede ejecutar sobre una base existente sin perder datos.

## API

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/register` | `name`, `email`, `password` → hashea con bcrypt, asigna `MAX(position)+1` |
| `POST` | `/api/login` | `email`, `password` → JWT (7 días) |
| `GET` | `/api/me` | Requiere `Authorization: Bearer <token>` → `name`, `email`, `position`, `total` |

Códigos de error: `400` campos faltantes o JSON inválido · `401` credenciales
o token inválidos · `409` email duplicado.

## Páginas

`index.html` landing · `register.html` alta en la lista · `login.html` acceso ·
`dashboard.html` panel con posición, barra de progreso y pase QR ficticio.

## Notas de implementación

- **Posición atómica.** El cálculo de `MAX(position)+1` y el `INSERT` van dentro
  de una misma `db.transaction()`, para que dos altas simultáneas no reciban
  la misma posición.
- **Login sin oráculo de emails.** Usuario inexistente y contraseña incorrecta
  devuelven el mismo `401`, así el endpoint no revela quién está registrado.
- **`JWT_SECRET`** se lee del entorno y solo cae a un valor de desarrollo si no
  está definida. En cualquier despliegue real hay que exportarla.

## Configuración MCP

`.mcp.json` declara los tres servidores usados. El token de GitHub se toma de
la variable de entorno `GITHUB_PERSONAL_ACCESS_TOKEN`; no hay credenciales en
el repositorio.
