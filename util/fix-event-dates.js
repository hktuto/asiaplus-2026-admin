const API_URL = 'http://47.242.134.247:1339/api';

async function fetchAllEvents() {
  const events = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${API_URL}/events?pagination[page]=${page}&pagination[pageSize]=100&populate[infomation]=true`);
    const json = await res.json();
    events.push(...json.data);
    if (json.data.length < 100) break;
    page++;
  }
  return events;
}

function parseTime(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)$/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const ampm = match[3].toLowerCase();
  if (ampm === 'pm' && hours !== 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
}

function parseDateString(dateStr) {
  if (!dateStr) return [];
  
  // Extract time from the END of the string first
  const timeMatch = dateStr.match(/(\d{1,2}:?\d{0,2}\s*(?:am|pm))$/i);
  let time = null;
  let datePart = dateStr;
  
  if (timeMatch) {
    time = parseTime(timeMatch[1]);
    datePart = dateStr.substring(0, timeMatch.index).trim();
  }
  
  // Remove parentheses and their contents (both ASCII and Chinese full-width)
  datePart = datePart.replace(/[\(（][^\)）]*[\)）]/g, '').trim();
  
  const results = [];
  
  // Pattern: DD.MM-DD.MM.YYYY (range with months on both sides)
  const fullRangeMatch = datePart.match(/^(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (fullRangeMatch) {
    const startDay = parseInt(fullRangeMatch[1]);
    const startMonth = parseInt(fullRangeMatch[2]);
    const endDay = parseInt(fullRangeMatch[3]);
    const endMonth = parseInt(fullRangeMatch[4]);
    const year = parseInt(fullRangeMatch[5]);
    
    let current = new Date(year, startMonth - 1, startDay);
    const end = new Date(year, endMonth - 1, endDay);
    
    while (current <= end) {
      const y = current.getFullYear();
      const m = (current.getMonth() + 1).toString().padStart(2, '0');
      const d = current.getDate().toString().padStart(2, '0');
      results.push({ date: `${y}-${m}-${d}`, time });
      current.setDate(current.getDate() + 1);
    }
    return results;
  }
  
  // Pattern: DD-DD.M.YYYY (range same month)
  const rangeMatch = datePart.match(/^(\d{1,2})-(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (rangeMatch) {
    const startDay = parseInt(rangeMatch[1]);
    const endDay = parseInt(rangeMatch[2]);
    const month = parseInt(rangeMatch[3]);
    const year = parseInt(rangeMatch[4]);
    for (let day = startDay; day <= endDay; day++) {
      const m = month.toString().padStart(2, '0');
      const d = day.toString().padStart(2, '0');
      results.push({ date: `${year}-${m}-${d}`, time });
    }
    return results;
  }
  
  // Pattern: D.M.YYYY (single date)
  const singleMatch = datePart.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (singleMatch) {
    const day = parseInt(singleMatch[1]);
    const month = parseInt(singleMatch[2]);
    const year = parseInt(singleMatch[3]);
    const m = month.toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    results.push({ date: `${year}-${m}-${d}`, time });
    return results;
  }
  
  return results;
}

async function updateEvent(documentId, payload) {
  const res = await fetch(`${API_URL}/events/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload })
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
  console.log(`Found ${events.length} events\n`);

  let ok = 0, fail = 0;

  for (const event of events) {
    const title = event.title_EN || event.title_HK || '(no title)';
    console.log(`Processing: ${title}`);

    let infoPayload;
    
    if (event.infomation && event.infomation.length > 0) {
      // Event already has infomation - preserve existing data and add dates
      const info = event.infomation[0];
      const dates = parseDateString(info.date_HK || info.date_EN);
      
      infoPayload = {
        date_HK: info.date_HK || null,
        date_EN: info.date_EN || null,
        date_CN: info.date_CN || null,
        location_HK: info.location_HK || null,
        location_EN: info.location_EN || null,
        location_CN: info.location_CN || null,
        ticket_HK: info.ticket_HK || null,
        ticket_EN: info.ticket_EN || null,
        ticket_CN: info.ticket_CN || null,
        language_HK: info.language_HK || null,
        language_EN: info.language_EN || null,
        language_CN: info.language_CN || null,
        remark_HK: info.remark_HK || null,
        remark_EN: info.remark_EN || null,
        remark_CN: info.remark_CN || null,
        tittle_HK: info.tittle_HK || null,
        tittle_EN: info.tittle_EN || null,
        tittle_CN: info.tittle_CN || null,
        dates
      };
    } else {
      // Event has no infomation - create from displayTime
      const dates = parseDateString(event.displayTime_HK);
      
      infoPayload = {
        date_HK: event.displayTime_HK || null,
        date_EN: event.displayTime_EN || null,
        date_CN: event.displayTime_CN || null,
        tittle_HK: '演出資訊',
        tittle_EN: 'Information',
        tittle_CN: '演出資訊',
        dates
      };
    }

    // Remove null/empty values to avoid validation issues
    const cleanPayload = {};
    for (const [k, v] of Object.entries(infoPayload)) {
      if (v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) {
        cleanPayload[k] = v;
      }
    }

    const success = await updateEvent(event.documentId, {
      infomation: [cleanPayload]
    });
    
    if (success) ok++; else fail++;
  }

  console.log(`\nDone: ${ok} updated, ${fail} failed`);
}

main().catch(console.error);
