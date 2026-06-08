/**
 * Content Migration Script
 * Fetches content from a source Strapi API and creates/updates it on a target Strapi API.
 * Requires public create permissions on the target content types.
 *
 * Usage:
 *   OLD_API=http://localhost:1337/api NEW_API=http://remote:1339/api node util/migrate-content.js
 */

const OLD_API = process.env.OLD_API || 'http://localhost:1337/api';
const NEW_API = process.env.NEW_API || 'http://localhost:1337/api';

async function fetchOld(endpoint) {
  const res = await fetch(`${OLD_API}${endpoint}`);
  if (!res.ok) throw new Error(`Old API ${endpoint}: ${res.status}`);
  return res.json();
}

async function postNew(endpoint, body) {
  const res = await fetch(`${NEW_API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`POST ${endpoint} failed:`, res.status, text);
    throw new Error(`POST ${endpoint}: ${res.status}`);
  }
  return JSON.parse(text);
}

async function putNew(endpoint, body) {
  const res = await fetch(`${NEW_API}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`PUT ${endpoint} failed:`, res.status, text);
    throw new Error(`PUT ${endpoint}: ${res.status}`);
  }
  return JSON.parse(text);
}

function deepClean(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepClean);
  if (typeof obj !== 'object') return obj;

  // If this looks like a media file, keep only minimal info
  if (obj.url && obj.id !== undefined) {
    return { id: obj.id };
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', '__component', 'locale'].includes(key)) continue;
    cleaned[key] = deepClean(value);
  }
  return cleaned;
}

function extractAttrs(data) {
  // Handle both v4 (data.attributes) and v5 (flat) formats
  const raw = data.attributes || data;
  return deepClean(raw);
}

async function migrateCategories() {
  console.log('Migrating categories...');
  const old = await fetchOld('/categories?pagination[pageSize]=100');
  const items = old.data || [];

  // Check existing on target
  const targetRes = await fetch(`${NEW_API}/categories?pagination[pageSize]=100`);
  const targetData = targetRes.ok ? await targetRes.json() : { data: [] };
  const targetItems = targetData.data || [];
  const targetNames = new Set(targetItems.map(t => t.name || t.name_EN));

  for (const item of items) {
    const attrs = extractAttrs(item);
    if (targetNames.has(attrs.name) || targetNames.has(attrs.name_EN)) {
      console.log('  → Skipped (already exists):', attrs.name_EN || attrs.name);
      continue;
    }
    try {
      await postNew('/categories', { data: attrs });
      console.log('  ✓ Created:', attrs.name_EN || attrs.name);
    } catch (err) {
      console.log('  ✗ Failed:', attrs.name_EN || attrs.name, err.message);
    }
  }
}

async function migrateFooter() {
  console.log('Migrating footer...');
  const old = await fetchOld('/footer?populate=*');
  const attrs = extractAttrs(old.data);
  await putNew('/footer', { data: attrs });
  console.log('  ✓ Footer updated');
}

async function migrateHome() {
  console.log('Migrating home...');
  const old = await fetchOld('/home?populate=*');
  const attrs = extractAttrs(old.data);
  await putNew('/home', { data: attrs });
  console.log('  ✓ Home updated');
}

async function migrateMenu() {
  console.log('Migrating menu...');
  const old = await fetchOld('/menu?populate=*');
  const attrs = extractAttrs(old.data);
  await putNew('/menu', { data: attrs });
  console.log('  ✓ Menu updated');
}

async function main() {
  try {
    await migrateCategories();
    await migrateFooter();
    await migrateHome();
    await migrateMenu();
    console.log('\nAll content migrated successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

main();
