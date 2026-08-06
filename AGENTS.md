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
| `pg` | `^8.11.5` |

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

## Deployment (PM2)

The project includes an `ecosystem.config.js` for PM2 process management.

### PM2 Commands

```bash
# Start with PM2 (production, port 1339)
pm2 start ecosystem.config.js

# Restart
pm2 restart asiaplus

# Stop
pm2 stop asiaplus

# Delete
pm2 delete asiaplus

# View logs
pm2 logs asiaplus

# Monitor
pm2 monit
```

### Production Setup

```bash
# 1. Build the admin panel
pnpm build

# 2. Start with PM2 on port 1339
pm2 start ecosystem.config.js

# 3. Save PM2 config so it restarts on boot
pm2 save
pm2 startup
```

### Configuration

| Setting | Value |
|---|---|
| App name | `asiaplus` |
| Port | `1339` (set via `PORT` env) |
| Script | `pnpm start` |
| Interpreter | `bash` |
| Instances | `1` |
| Auto-restart | `true` |
| Max memory | `1G` |

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

> **Note:** The `ecosystem.config.js` currently sets `exec_interpreter: 'bash'`, which is incompatible with Windows environments. Adjust or remove this setting if deploying on Windows.

---

## Event Import Workflow (Docx → JSON → Strapi)

This project imports festival event data from `.docx` programme info files into Strapi. The pipeline has **4 stages**: extract → format → import → post-process.

### Source File Structure

Place `.docx` files in the folder:
```
Asia+ 2026 Website_Info to Blueriver/
├── 01_Opening Programme_TRI-ART!ON/
│   └── Programme Info_TRI-ART!ON.docx
├── 02_AECP+/
│   └── Programme Info_AECP+.docx
├── 03_Taksu/
│   └── Programme Info_Taksu.docx
└── ... (one numbered folder per event)
```

**Folder naming convention**: `NN_Description/` — the numeric prefix determines event `order`.

### Docx Content Format

Each `.docx` follows a standard template with these sections:

```
Programme Title (Chi)
[Chinese title]
Programme Title (Eng)
[English title]
Art Group (Chi)
[Chinese art group]
Art Group (Eng)
[English art group]
Date
[date string, e.g. 23-24.9.2026]
Art Form
[Music / Dance / Theatre / Exhibition / Other]

Tab 1 節目 (Chi)
[Chinese programme description]
Tab 1 Programme (Eng)
[English programme description]

Tab 2 表演者 (Chi)
[Chinese artist info]
Tab 2 Artist (Eng)
[English artist info]

Tab 3 資訊 (Chi)
[Chinese event info: date, venue, ticket, duration, language]
Tab 3 Information (Eng)
[English event info]

Tab 4 延伸活動 (Chi)
[Chinese fringe activities]
Tab 4 Fringe (Eng)
[English fringe activities]
```

**Special case — UST Cosmopolis Festival**: Uses a different parser (`parseUstEvent`) for sub-programme listings.

### Stage 1: Extract from Docx

```bash
node util/extract-events.js
```

**What it does**:
- Reads `.docx` files via PowerShell/System.IO.Compression (extracts `document.xml`)
- Parses paragraphs into structured event objects
- Saves `data/events.json`

**Output fields**:
- `titleChi`, `titleEng` — programme titles
- `artGroupChi`, `artGroupEng` — art group / subtitle
- `date` — display date string
- `artForm[]` — categories (`Music`, `Dance`, `Theatre`, `Exhibition`, `Other`)
- `programmeChi`, `programmeEng` — Tab 1 content
- `artistChi`, `artistEng` — Tab 2 content
- `infoChi`, `infoEng` — Tab 3 content (date, venue, ticket, duration, language)
- `fringeChi`, `fringeEng` — Tab 4 content
- `subProgrammes[]` — for UST only (title, date, info per sub-programme)

### Stage 2: Format to Strapi Structure

```bash
node util/format-events.js
```

**What it does**:
- Reads `data/events.json`
- Maps raw fields to Strapi v5 event schema
- Parses info text into `infomation` component fields
- Adds related programme references
- Saves `data/events-formatted.json`

**Key mappings**:
| Raw Field | Strapi Field |
|---|---|
| `titleChi` | `title_HK`, `title_CN` |
| `titleEng` | `title_EN` |
| `artGroupChi` | `subTitle_HK`, `subTitle_CN` |
| `artGroupEng` | `subTitle_EN` |
| `programmeChi` | `program_HK`, `program_CN` |
| `programmeEng` | `program_EN` |
| `artistChi` | `artist_HK`, `artist_CN` |
| `artistEng` | `artist_EN` |
| `fringeChi` | `pre_HK`, `pre_CN` |
| `fringeEng` | `pre_EN` |
| `date` | `displayTime_HK/EN/CN` |
| `artForm[]` | `categories[]` + `tag_HK/EN/CN` |

**`infomation` component** (parsed from Tab 3):
- `date_HK/EN/CN` — first line of info (includes time, e.g. `23-24.9.2026（三-四）7:45pm`)
- `location_HK/EN/CN` — venue line
- `ticket_HK/EN/CN` — price + ticket source
- `language_HK/EN/CN` — language line
- `remark_HK/EN/CN` — duration / special notes
- `tittle_HK/EN/CN` — always `"演出資訊"` / `"Information"`

**`program` component** — populated only for UST sub-programmes.

**Related programmes**: Hardcoded mapping in `format-events.js` (`relatedProgrammeMap`) linking events by `title_EN`.

### Stage 3: Import to Strapi

```bash
# Local
node util/import-events.js

# Remote
STRAPI_API=http://47.242.134.247:1339/api node util/import-events.js
```

**Requirements**:
- Strapi server running
- Public API permissions: `event.create`, `event.find`, `category.find`
- Categories already created in Strapi (mapped by name)

**Behaviour**:
- Skips events that already exist (matched by `slug`)
- Creates new events with all fields + components
- Uses `connect: [{ documentId }]` for category relations

### Stage 4: Post-Processing

Run these **after** all events are imported:

#### 4a. Link Related Events

```bash
# Local
node util/link-related-events.js

# Remote
STRAPI_API=http://47.242.134.247:1339/api node util/link-related-events.js
```

Resolves `relatedProgrammeTitles` → actual `documentId` relations via the API.

#### 4b. Add Slide Images

```bash
# Local (s1-2026.jpeg must be uploaded first, check its ID)
STRAPI_API=http://localhost:1337/api node util/add-slide-to-events.js

# Remote (image ID may differ — check /api/upload/files first)
STRAPI_API=http://47.242.134.247:1339/api IMAGE_ID=6 node util/add-slide-to-events.js
```

**Note**: Edit `IMAGE_ID` in the script to match the actual uploaded file ID on the target server.

#### 4c. Parse `information.dates` Component

```bash
# Local
node util/fix-event-dates.js

# Remote (update API_URL in the script first)
node util/fix-event-dates.js
```

**Critical parsing details**:
- Date strings contain **Chinese full-width parentheses** `（五-六）`, not ASCII `()`
- Time patterns: `8pm`, `7:45pm`, `5pm`, `7:30pm` — extracted from end of string
- Date range patterns:
  - Same month: `6-7.11.2026`, `23-24.9.2026`
  - Cross month: `10.9-10.11.2026` (generates all dates in range)
  - Single: `30.10.2026`
- Parsed into `program-date` component: `{ date: "YYYY-MM-DD", time: "HH:MM:SS" }`

### Full Pipeline (One Command)

```bash
# 1. Extract
node util/extract-events.js

# 2. Format
node util/format-events.js

# 3. Import (local)
node util/import-events.js

# 4. Link related
node util/link-related-events.js

# 5. Add slides (check IMAGE_ID first)
node util/add-slide-to-events.js

# 6. Parse dates into structured components
node util/fix-event-dates.js
```

### Remote Deployment

For deploying to production after local import:

```bash
# Sync single types (footer, home, menu)
OLD_API=http://localhost:1337/api NEW_API=http://47.242.134.247:1339/api node util/migrate-content.js

# Then re-run event post-processing steps against remote
STRAPI_API=http://47.242.134.247:1339/api node util/add-slide-to-events.js
STRAPI_API=http://47.242.134.247:1339/api node util/fix-event-dates.js
```

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
| `util/import-events.js` | Event data import script |
| `util/format-events.js` | Event data formatting script |
| `util/sync-to-remote.js` | Sync content to remote Strapi instance |
| `ecosystem.config.js` | PM2 process manager config (port 1339) |

---

## Development Tips

- Always use `pnpm` (not yarn or npm).
- If `better-sqlite3` bindings are missing, run `npm run install` inside the `better-sqlite3` package directory, or use `prebuild-install`.
- After schema changes, restart the server for auto-migrations.
- The admin panel builds with **Vite** (Strapi v5).
