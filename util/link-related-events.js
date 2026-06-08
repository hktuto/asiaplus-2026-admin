/**
 * Link related events based on relatedProgrammeTitles
 * Run after all events have been imported
 * 
 * Usage: node util/link-related-events.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.STRAPI_API || 'http://localhost:1337/api';
const EVENTS_FILE = path.join(__dirname, '..', 'data', 'events-formatted.json');

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

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  if (!fs.existsSync(EVENTS_FILE)) {
    console.error(`Events file not found: ${EVENTS_FILE}`);
    process.exit(1);
  }

  const formattedEvents = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
  
  // Fetch all events from API
  console.log('Fetching events from API...');
  const allEventsData = await api('/events?pagination[pageSize]=100');
  const allEvents = allEventsData.data || [];
  console.log(`Found ${allEvents.length} events in API\n`);
  
  // Build slug → documentId map
  const slugToDocumentId = {};
  const titleToDocumentId = {};
  
  for (const evt of allEvents) {
    if (evt.slug) slugToDocumentId[evt.slug] = evt.documentId || evt.id;
    if (evt.title_EN) titleToDocumentId[normalizeTitle(evt.title_EN)] = evt.documentId || evt.id;
    if (evt.title_HK) titleToDocumentId[normalizeTitle(evt.title_HK)] = evt.documentId || evt.id;
  }
  
  // Also map from our formatted events
  for (const evt of formattedEvents) {
    if (evt.slug && slugToDocumentId[evt.slug]) {
      titleToDocumentId[normalizeTitle(evt.title_EN)] = slugToDocumentId[evt.slug];
    }
  }
  
  let linked = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const event of formattedEvents) {
    const mySlug = event.slug;
    const myDocumentId = slugToDocumentId[mySlug];
    
    if (!myDocumentId) {
      console.log(`Skipping ${mySlug}: not found in API`);
      skipped++;
      continue;
    }
    
    if (!event.relatedProgrammeTitles || event.relatedProgrammeTitles.length === 0) {
      console.log(`Skipping ${mySlug}: no related programmes`);
      skipped++;
      continue;
    }
    
    // Resolve related event documentIds
    const relatedDocumentIds = [];
    const unresolved = [];
    
    for (const relatedTitle of event.relatedProgrammeTitles) {
      const normalized = normalizeTitle(relatedTitle);
      let found = false;
      
      // Try exact normalized match
      if (titleToDocumentId[normalized]) {
        relatedDocumentIds.push(titleToDocumentId[normalized]);
        found = true;
      } else {
        // Try partial match
        for (const [title, docId] of Object.entries(titleToDocumentId)) {
          if (title.includes(normalized) || normalized.includes(title)) {
            relatedDocumentIds.push(docId);
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        unresolved.push(relatedTitle);
      }
    }
    
    if (relatedDocumentIds.length === 0) {
      console.log(`Skipping ${mySlug}: no related events resolved`);
      skipped++;
      continue;
    }
    
    // Deduplicate
    const uniqueDocIds = [...new Set(relatedDocumentIds)];
    
    process.stdout.write(`Linking ${mySlug} → ${uniqueDocIds.length} related events`);
    if (unresolved.length > 0) {
      process.stdout.write(` (unresolved: ${unresolved.length})`);
    }
    
    try {
      await api(`/events/${myDocumentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          data: {
            events: {
              connect: uniqueDocIds.map(id => ({ documentId: id }))
            }
          }
        })
      });
      console.log(' ✓');
      linked++;
    } catch (err) {
      console.log(` ✗ ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== Link Complete ===`);
  console.log(`Linked:  ${linked}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
