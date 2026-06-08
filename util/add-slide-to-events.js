/**
 * Add a slide with s1-2026.jpeg to every event
 * 
 * Usage: node util/add-slide-to-events.js
 */

const API_URL = process.env.STRAPI_API || 'http://localhost:1337/api';

const IMAGE_ID = 1; // s1-2026.jpeg

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

async function main() {
  // Fetch all events
  console.log('Fetching events...');
  const eventsData = await api('/events?pagination[pageSize]=100');
  const events = eventsData.data || [];
  console.log(`Found ${events.length} events\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const event of events) {
    const slug = event.slug;
    const documentId = event.documentId || event.id;
    
    process.stdout.write(`Adding slide to ${slug}... `);
    
    try {
      // For media in components, pass as array of IDs directly
      await api(`/events/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          data: {
            slide: [
              {
                image: [IMAGE_ID]
              }
            ]
          }
        })
      });
      console.log('✓');
      updated++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== Complete ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed:  ${failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
