/**
 * Sync all Strapi content from localhost to remote server
 *
 * Usage:
 *   node util/sync-to-remote.js
 *
 * Environment variables:
 *   SOURCE_API=http://localhost:1337/api
 *   TARGET_API=http://47.242.134.247:1339/api
 *   TARGET_TOKEN=optional-api-token
 */

const SOURCE_API = process.env.SOURCE_API || 'http://localhost:1337/api';
const TARGET_API = process.env.TARGET_API || 'http://47.242.134.247:1339/api';
const TARGET_TOKEN = process.env.TARGET_TOKEN || '';

const categoryMap = {}; // local category documentId → remote category documentId
const fileMap = {};     // local file id → remote file id
const eventMap = {};    // local event documentId → remote event documentId

async function api(baseUrl, endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = { ...options.headers };
  if (TARGET_TOKEN && baseUrl === TARGET_API) {
    headers['Authorization'] = `Bearer ${TARGET_TOKEN}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status} on ${url}: ${text.substring(0, 500)}`);
  }

  return res.json();
}

// ─── Helpers ───

function cleanObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(cleanObject).filter(Boolean);
  if (typeof obj !== 'object') return obj;

  // If this looks like a media file, keep only the id
  if (obj.url && obj.id !== undefined) {
    return { id: obj.id };
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (['documentId', 'createdAt', 'updatedAt', 'publishedAt', '__component', 'locale'].includes(key)) continue;
    cleaned[key] = cleanObject(value);
  }
  return cleaned;
}

function replaceFileIds(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && value.id !== undefined && fileMap[value.id]) {
    return { id: fileMap[value.id] };
  }
  if (Array.isArray(value)) {
    return value.map(replaceFileIds);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = replaceFileIds(v);
    }
    return out;
  }
  return value;
}

function flattenMediaIds(obj, mediaFields = ['image', 'thumbnail', 'feature', 'files_HK', 'files_EN', 'files_CN']) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => flattenMediaIds(item, mediaFields));

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (mediaFields.includes(key)) {
      if (value && typeof value === 'object' && value.id !== undefined) {
        result[key] = [value.id];
      } else if (Array.isArray(value) && value.every(v => v && v.id !== undefined)) {
        result[key] = value.map(v => v.id);
      } else {
        result[key] = flattenMediaIds(value, mediaFields);
      }
    } else {
      result[key] = flattenMediaIds(value, mediaFields);
    }
  }
  return result;
}

function stripNulls(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripNulls).filter(v => v !== null && v !== undefined);
  if (typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const cleaned = stripNulls(v);
    if (cleaned !== null && cleaned !== undefined && cleaned !== '' && !(Array.isArray(cleaned) && cleaned.length === 0)) {
      out[k] = cleaned;
    }
  }
  return out;
}

// ─── Categories ───

async function syncCategories() {
  console.log('\n=== Syncing Categories ===');
  const source = await api(SOURCE_API, '/categories?pagination[pageSize]=100');
  const items = source.data || [];
  console.log(`Found ${items.length} categories on source`);

  // Check existing on target
  const targetRes = await api(TARGET_API, '/categories?pagination[pageSize]=100');
  const targetItems = targetRes.data || [];
  const targetByName = {};
  for (const t of targetItems) {
    if (t.name) targetByName[t.name] = t.documentId;
    if (t.name_EN) targetByName[t.name_EN] = t.documentId;
  }

  for (const item of items) {
    const payload = stripNulls(cleanObject(item));
    const existing = targetByName[item.name] || targetByName[item.name_EN];

    if (existing) {
      categoryMap[item.documentId] = existing;
      console.log(`  → ${item.name_EN || item.name_HK} already exists, mapped`);
      continue;
    }

    try {
      const created = await api(TARGET_API, '/categories', {
        method: 'POST',
        body: JSON.stringify({ data: { ...payload, publishedAt: new Date().toISOString() } }),
      });
      const remote = created.data;
      categoryMap[item.documentId] = remote.documentId;
      console.log(`  ✓ ${item.name_EN || item.name_HK}`);
    } catch (err) {
      console.log(`  ✗ ${item.name_EN || item.name_HK}: ${err.message}`);
    }
  }
  console.log(`Mapped ${Object.keys(categoryMap).length} categories`);
}

// ─── Media ───

async function syncMedia() {
  console.log('\n=== Syncing Media ===');
  const source = await api(SOURCE_API, '/upload/files?pagination[pageSize]=200');
  const files = source.results || source || [];
  console.log(`Found ${files.length} files on source`);

  if (files.length === 0) return;

  for (const file of files) {
    try {
      const fileUrl = `${SOURCE_API.replace('/api', '')}${file.url}`;
      const buffer = await fetch(fileUrl).then(r => r.arrayBuffer());
      const blob = new Blob([buffer], { type: file.mime });

      const form = new FormData();
      form.append('files', blob, file.name);

      const uploadUrl = `${TARGET_API.replace('/api', '')}/api/upload`;
      const uploaded = await fetch(uploadUrl, {
        method: 'POST',
        headers: TARGET_TOKEN ? { 'Authorization': `Bearer ${TARGET_TOKEN}` } : {},
        body: form,
      }).then(r => r.json());

      const remoteFile = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      if (remoteFile && remoteFile.id) {
        fileMap[file.id] = remoteFile.id;
        console.log(`  ✓ ${file.name} → id ${remoteFile.id}`);
      } else {
        console.log(`  ✗ ${file.name}: unexpected upload response`);
      }
    } catch (err) {
      console.log(`  ✗ ${file.name}: ${err.message}`);
    }
  }
  console.log(`Mapped ${Object.keys(fileMap).length} files`);
}

// ─── Events ───

async function syncEvents() {
  console.log('\n=== Syncing Events ===');
  const populate = [
    'categories',
    'slide',
    'slide.image',
    'slide.thumbnail',
    'program',
    'program.dates',
    'program.registerForm',
    'program.feature',
    'infomation',
    'infomation.dates',
    'infomation.files_HK',
    'infomation.files_EN',
    'infomation.files_CN',
    'sections',
    'sections.files',
    'sections.event',
    'popup',
    'events',
  ];
  const qs = populate.map(p => `populate[${p}]=true`).join('&');
  const source = await api(SOURCE_API, `/events?${qs}&pagination[pageSize]=100`);
  const items = source.data || [];
  console.log(`Found ${items.length} events on source`);

  // Check existing on target
  const targetRes = await api(TARGET_API, '/events?pagination[pageSize]=100');
  const targetItems = targetRes.data || [];
  const targetBySlug = {};
  for (const t of targetItems) {
    if (t.slug) targetBySlug[t.slug] = t.documentId;
  }

  // Pass 1: Create events (without related events)
  for (const item of items) {
    if (targetBySlug[item.slug]) {
      eventMap[item.documentId] = targetBySlug[item.slug];
      console.log(`  → ${item.slug} already exists, mapped`);
      continue;
    }

    let payload = stripNulls(cleanObject(item));

    // Replace category documentIds
    if (payload.categories && Array.isArray(payload.categories)) {
      const remoteCats = payload.categories
        .map(c => categoryMap[c.documentId])
        .filter(Boolean)
        .map(docId => ({ documentId: docId }));
      if (remoteCats.length) {
        payload.categories = { connect: remoteCats };
      } else {
        delete payload.categories;
      }
    }

    // Strip related events for pass 1
    delete payload.events;
    delete payload.realtedEvents;

    // Replace file IDs and flatten media arrays
    payload = replaceFileIds(payload);
    payload = flattenMediaIds(payload);

    try {
      const created = await api(TARGET_API, '/events', {
        method: 'POST',
        body: JSON.stringify({ data: { ...payload, publishedAt: new Date().toISOString() } }),
      });
      const remote = created.data;
      eventMap[item.documentId] = remote.documentId;
      console.log(`  ✓ ${item.slug}`);
    } catch (err) {
      console.log(`  ✗ ${item.slug}: ${err.message}`);
    }
  }

  console.log(`Mapped ${Object.keys(eventMap).length} events`);

  // Pass 2: Link related events
  console.log('\n=== Linking Related Events ===');
  for (const item of items) {
    if (!item.events || item.events.length === 0) continue;

    const myRemoteDocId = eventMap[item.documentId];
    if (!myRemoteDocId) continue;

    const relatedRemoteDocIds = item.events
      .map(e => eventMap[e.documentId])
      .filter(Boolean)
      .map(docId => ({ documentId: docId }));

    if (relatedRemoteDocIds.length === 0) continue;

    try {
      await api(TARGET_API, `/events/${myRemoteDocId}`, {
        method: 'PUT',
        body: JSON.stringify({
          data: { events: { connect: relatedRemoteDocIds } }
        }),
      });
      console.log(`  ✓ ${item.slug} → ${relatedRemoteDocIds.length} related`);
    } catch (err) {
      console.log(`  ✗ ${item.slug}: ${err.message}`);
    }
  }
}

// ─── Single Types ───

async function syncSingleType(name, endpoint) {
  console.log(`\n=== Syncing ${name} ===`);
  try {
    const source = await api(SOURCE_API, endpoint);
    const item = source.data;
    if (!item) {
      console.log(`  — No data on source`);
      return;
    }

    let payload = stripNulls(cleanObject(item));
    payload = replaceFileIds(payload);
    payload = flattenMediaIds(payload);

    await api(TARGET_API, endpoint, {
      method: 'PUT',
      body: JSON.stringify({ data: payload }),
    });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`);
  }
}

// ─── Main ───

async function main() {
  console.log(`Source: ${SOURCE_API}`);
  console.log(`Target: ${TARGET_API}`);

  // Health check
  try {
    await api(TARGET_API, '/categories');
    console.log('Target API reachable ✓');
  } catch (err) {
    console.error('Cannot reach target API:', err.message);
    process.exit(1);
  }

  await syncCategories();
  await syncMedia();
  await syncEvents();

  await syncSingleType('Footer', '/footer');
  await syncSingleType('Home', '/home');
  await syncSingleType('Menu', '/menu');
  await syncSingleType('Download', '/download');
  await syncSingleType('Popup', '/popup');
  await syncSingleType('Social Media', '/social-media');

  console.log('\n=== Sync Complete ===');
  console.log(`Categories: ${Object.keys(categoryMap).length}`);
  console.log(`Files:      ${Object.keys(fileMap).length}`);
  console.log(`Events:     ${Object.keys(eventMap).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
