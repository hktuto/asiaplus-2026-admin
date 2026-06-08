/**
 * Import events from data/events-formatted.json into Strapi v5
 * 
 * Usage:
 *   STRAPI_API=http://localhost:1337/api node util/import-events.js
 *   STRAPI_API=http://remote:1339/api node util/import-events.js
 *   
 * Requires:
 *   - Strapi server running
 *   - Public permissions for event.create, event.find, category.find
 *   - data/events-formatted.json exists
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.STRAPI_API || 'http://localhost:1337/api';
const EVENTS_FILE = path.join(__dirname, '..', 'data', 'events-formatted.json');

// Category name → target documentId (populated dynamically)
let CATEGORY_MAP = {};

async function api(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  
  return res.json();
}

async function loadCategoryMap() {
  console.log('Loading categories from target API...');
  const data = await api('/categories?pagination[pageSize]=100');
  const categories = data.data || [];
  const map = {};
  for (const cat of categories) {
    const key = cat.name || cat.name_EN || cat.slug;
    if (key) map[key.toLowerCase()] = cat.documentId;
  }
  CATEGORY_MAP = map;
  console.log(`Loaded ${Object.keys(map).length} categories\n`);
}

async function findExistingEvent(slug) {
  try {
    const data = await api(`/events?filters[slug][$eq]=${encodeURIComponent(slug)}`);
    return data.data?.[0] || null;
  } catch (err) {
    return null;
  }
}

function buildEventPayload(event) {
  const payload = {
    title_HK: event.title_HK,
    title_EN: event.title_EN,
    title_CN: event.title_CN,
    subTitle_HK: event.subTitle_HK,
    subTitle_EN: event.subTitle_EN,
    subTitle_CN: event.subTitle_CN,
    program_HK: event.program_HK,
    program_EN: event.program_EN,
    program_CN: event.program_CN,
    artist_HK: event.artist_HK,
    artist_EN: event.artist_EN,
    artist_CN: event.artist_CN,
    pre_HK: event.pre_HK,
    pre_EN: event.pre_EN,
    pre_CN: event.pre_CN,
    displayTime_HK: event.displayTime_HK,
    displayTime_EN: event.displayTime_EN,
    displayTime_CN: event.displayTime_CN,
    tag_HK: event.tag_HK,
    tag_EN: event.tag_EN,
    tag_CN: event.tag_CN,
    slug: event.slug,
    order: event.order,
    feature: event.feature,
    preview_only: event.preview_only || false,
    publishedAt: new Date().toISOString()
  };

  // Filter out empty strings
  for (const key of Object.keys(payload)) {
    if (payload[key] === '' || payload[key] === undefined) {
      delete payload[key];
    }
  }

  // Categories - connect by documentId (looked up dynamically from target)
  if (event.categories && event.categories.length > 0) {
    const remoteCats = [];
    for (const c of event.categories) {
      const docId = CATEGORY_MAP[c.toLowerCase()];
      if (docId) remoteCats.push({ documentId: docId });
    }
    if (remoteCats.length) {
      payload.categories = { connect: remoteCats };
    }
  }

  // Information components
  if (event.infomation && event.infomation.length > 0) {
    payload.infomation = event.infomation.map(info => {
      const clean = {};
      for (const [k, v] of Object.entries(info)) {
        if (v !== '' && v !== undefined && v !== null) clean[k] = v;
      }
      return clean;
    });
  }

  // Program components (sub-programmes)
  if (event.program && event.program.length > 0) {
    payload.program = event.program.map(prog => {
      const clean = {};
      for (const [k, v] of Object.entries(prog)) {
        if (v !== '' && v !== undefined && v !== null) clean[k] = v;
      }
      return clean;
    });
  }

  return payload;
}

async function createEvent(event) {
  const payload = buildEventPayload(event);
  return api('/events', {
    method: 'POST',
    body: JSON.stringify({ data: payload })
  });
}

async function updateEvent(documentId, event) {
  const payload = buildEventPayload(event);
  delete payload.slug; // Don't update slug
  return api(`/events/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data: payload })
  });
}

async function main() {
  if (!fs.existsSync(EVENTS_FILE)) {
    console.error(`Events file not found: ${EVENTS_FILE}`);
    console.error('Run: node util/extract-events.js && node util/format-events.js');
    process.exit(1);
  }

  const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
  console.log(`Loaded ${events.length} events from ${EVENTS_FILE}\n`);

  // Test API connection
  try {
    await api('/categories');
    console.log('API connection OK\n');
  } catch (err) {
    console.error('Cannot connect to Strapi API:', err.message);
    console.error('Make sure Strapi is running and public permissions are enabled.');
    process.exit(1);
  }

  // Load category map from target API
  await loadCategoryMap();

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const event of events) {
    const title = event.title_EN || event.title_HK || '(no title)';
    process.stdout.write(`Importing: ${title.substring(0, 60)}... `);

    try {
      const existing = await findExistingEvent(event.slug);
      
      if (existing) {
        await updateEvent(existing.documentId || existing.id, event);
        console.log('UPDATED');
        updated++;
      } else {
        await createEvent(event);
        console.log('CREATED');
        created++;
      }
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed:  ${failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
