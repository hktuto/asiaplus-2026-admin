const API_URL = 'http://47.242.134.247:1339/api';
const MEDIA_ID = 6; // s1-2026.jpeg on remote

async function fetchAllEvents() {
  const events = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${API_URL}/events?pagination[page]=${page}&pagination[pageSize]=100`);
    const json = await res.json();
    events.push(...json.data);
    if (json.data.length < 100) break;
    page++;
  }
  return events;
}

async function updateEventSlide(documentId) {
  const res = await fetch(`${API_URL}/events/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        slide: [{ image: [MEDIA_ID] }]
      }
    })
  });
  const json = await res.json();
  if (!res.ok) {
    console.error(`  ✗ ${documentId}: ${json.error?.message || res.statusText}`);
    return false;
  }
  console.log(`  ✓ ${documentId}`);
  return true;
}

async function main() {
  console.log('Fetching events...');
  const events = await fetchAllEvents();
  console.log(`Found ${events.length} events`);

  let ok = 0, fail = 0;
  for (const event of events) {
    const success = await updateEventSlide(event.documentId);
    if (success) ok++; else fail++;
  }

  console.log(`\nDone: ${ok} updated, ${fail} failed`);
}

main().catch(console.error);
