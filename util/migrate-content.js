/**
 * Content Migration Script
 * Fetches content from a source Strapi API and creates it on a target Strapi API.
 * Requires public create permissions on the target content types.
 *
 * Usage:
 *   OLD_API=https://old-site.com/api NEW_API=http://localhost:1337/api node util/migrate-content.js
 */

const OLD_API = process.env.OLD_API || 'https://asiaplus-2025-up2ld.ondigitalocean.app/api';
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

function extractAttrs(data) {
  const { id, createdAt, updatedAt, publishedAt, ...attrs } = data.attributes || data;
  return attrs;
}

async function migrateCategories() {
  console.log('Migrating categories...');
  const old = await fetchOld('/categories');
  for (const item of old.data) {
    const attrs = extractAttrs(item);
    await postNew('/categories', { data: attrs });
    console.log('  Created category:', attrs.name_EN || attrs.name);
  }
}

async function migrateFooter() {
  console.log('Migrating footer...');
  const old = await fetchOld('/footer?populate=*');
  const attrs = extractAttrs(old.data);
  await putNew('/footer', { data: attrs });
  console.log('  Footer created/updated');
}

async function migrateHome() {
  console.log('Migrating home...');
  const old = await fetchOld('/home?populate=*');
  const attrs = extractAttrs(old.data);
  await putNew('/home', { data: attrs });
  console.log('  Home created/updated');
}

async function migrateMenu() {
  console.log('Migrating menu...');
  const old = await fetchOld('/menu?populate=*');
  const attrs = extractAttrs(old.data);
  await putNew('/menu', { data: attrs });
  console.log('  Menu created/updated');
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
