# AGENTS.md — asiaplus-2026-admin

## Project Overview

This is the **Strapi v5** headless CMS backend for the Asia+ Festival 2026 website.
It manages content types including events, categories, pages, news, menus, footer, home slider, and popups.

- **Repository**: `https://github.com/hktuto/asiaplus-2026-admin.git`
- **Main branch**: `main`
- **Package manager**: `pnpm` (switched from yarn during v4→v5 migration)
- **Node version**: `>=18.0.0 <=22.x.x`
- **Database**: SQLite (default) / PostgreSQL (production)

---

## Tech Stack

| Dependency | Version |
|---|---|
| `@strapi/strapi` | `5.47.1` |
| `@strapi/plugin-cloud` | `5.47.1` |
| `@strapi/plugin-users-permissions` | `5.47.1` |
| `@strapi/plugin-color-picker` | `5.47.1` |
| `strapi-plugin-multi-select` | `^2.1.1` |
| `react` / `react-dom` | `^18.0.0` |
| `react-router-dom` | `^6.0.0` |
| `styled-components` | `^6.0.0` |
| `better-sqlite3` | `12.8.0` |
| `pg` | `^8.21.0` |

---

## Common Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build admin panel
pnpm build

# Start production server
pnpm start
```

---

## Content Migration Utility

A reusable script is provided in `util/migrate-content.js` for copying content from an old Strapi site.

### Usage

```bash
# Migrate from the 2025 site (default)
node util/migrate-content.js

# Migrate from a custom source
OLD_API=https://old-site.com/api NEW_API=http://localhost:1337/api node util/migrate-content.js
```

### Requirements

- The **target** Strapi instance must have **public create permissions** enabled for:
  - `Category`
  - `Footer`
  - `Home`
  - `Menu`
- The script copies:
  - All **categories**
  - **Footer** single type (with components: main menu, sub menu, logos)
  - **Home** single type (with slider components)
  - **Menu** single type (with menu item components)

---

## Strapi v4 → v5 Migration Notes

This project was migrated from Strapi `4.22.0` to `5.47.1`.

### Key Changes Applied

- **Entity Service API** → **Document Service API** (handled by codemods)
- **I18n plugin** removed from dependencies (now built into Strapi 5 core)
- **React Router** upgraded from v5 → v6
- **Styled Components** upgraded from v5 → v6
- **Middleware config** (`config/middlewares.js`): merged duplicate `strapi::security` entries into a single object
- **SQLite driver**: `better-sqlite3` upgraded to `12.8.0`

### API Response Format

Strapi v5 returns **flat responses** (no more `data.attributes` wrapper).
If you need backward compatibility temporarily, add header:
```
Strapi-Response-Format: v4
```

### Document IDs

All content now has a persistent `documentId` field in addition to numeric `id`.

---

## Project Structure

```
├── config/
│   ├── admin.js
│   ├── api.js
│   ├── database.js
│   ├── middlewares.js
│   ├── plugins.js
│   └── server.js
├── src/
│   ├── api/           # Content-type APIs (controllers, services, routes, schemas)
│   ├── components/    # Reusable components (programs/*, ui/*)
│   ├── extensions/
│   └── index.js
├── util/
│   └── migrate-content.js
├── database/migrations/
└── public/uploads/
```

---

## Content Types

### Collection Types
- `category` — event categories (name_HK, name_EN, name_CN, name, order)
- `event` — festival events with trilingual content
- `new` — news articles
- `page` — CMS pages

### Single Types
- `footer` — site footer (copyright, menus, logos)
- `home` — homepage slider
- `menu` — main navigation
- `download` — download page sections
- `popup` — site-wide popup
- `social-media` — social media links

---

## Important Files

| File | Purpose |
|---|---|
| `config/middlewares.js` | Custom CSP for DigitalOcean Spaces images |
| `config/database.js` | SQLite / Postgres / MySQL config |
| `config/server.js` | Server host, port, webhooks |
| `src/index.js` | Application lifecycle hooks |
| `util/migrate-content.js` | Content migration script |

---

## Development Tips

- Always use `pnpm` (not yarn or npm).
- If `better-sqlite3` bindings are missing, run `npm run install` inside the `better-sqlite3` package directory, or use `prebuild-install`.
- After schema changes, restart the server for auto-migrations.
- The admin panel builds with **Vite** (Strapi v5).
