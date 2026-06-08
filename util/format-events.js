const fs = require('fs');
const path = require('path');

const rawEvents = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'events.json'), 'utf8'));

// Category mapping
const categoryMap = {
  'Music': 'music',
  'Dance': 'dance',
  'Theatre': 'theatre',
  'Exhibition': 'exhibition',
  'Other': 'other'
};

// Related programmes mapping (from Related Programmes.docx)
// Index 0-based mapping to event index in rawEvents array
const relatedProgrammeMap = {
  0: ['Taksu - The Spirit of Gamelan', '2026 Hong Kong Drum Festival: Majestic Drums', 'World Music Salon Series: A Guide to Asia+ Music'],
  1: ['Asian Ethnic Cultural Performances+ 2026: Convergence of Cross-Cultural Gifting — Ethnic Cultural Exhibition', 'Sonic Odyssey of Curious Creatures', 'Teh Dar', 'Canvas of Sound'],
  2: ['Canvas of Sound', 'Guitar Duo Recital by the Assad Brothers', 'Teh Dar', '2026 Hong Kong Drum Festival: Majestic Drums', 'World Music Salon Series: A Guide to Asia+ Music'],
  3: ['Taksu - The Spirit of Gamelan', 'Voyage of the Eight Graces', 'Dunhuang: In Search of Light', 'The Connected Stage\' Series: Kylián and Sangba'],
  4: ['Taksu - The Spirit of Gamelan', 'Guitar Duo Recital by the Assad Brothers', 'Thousand Reeds, One Universe', 'World Music Salon Series: A Guide to Asia+ Music'],
  5: ['Duo Recital by Sol Gabetta (Cello) and Patricia Kopatchinskaja (Violin)', 'Swire Proudly Sponsors: Belt and Road | Zitong Wang Plays Chopin', 'Great Violin Concertos: Alexandra Conunova Plays Saint-Saëns', 'World Music Salon Series: A Guide to Asia+ Music'],
  6: ['Guitar Duo Recital by the Assad Brothers', 'Swire Proudly Sponsors: Belt and Road | Zitong Wang Plays Chopin', 'Great Violin Concertos: Alexandra Conunova Plays Saint-Saëns', 'Thousand Reeds, One Universe'],
  7: ['Guitar Duo Recital by the Assad Brothers', 'Canvas of Sound', '2026 Hong Kong Drum Festival: Majestic Drums', 'Taksu - The Spirit of Gamelan'],
  8: ['Taksu - The Spirit of Gamelan', 'Thousand Reeds, One Universe', 'Voyage of the Eight Graces', 'Dunhuang: In Search of Light'],
  9: ['Guitar Duo Recital by the Assad Brothers', 'Duo Recital by Sol Gabetta (Cello) and Patricia Kopatchinskaja (Violin)', 'Great Violin Concertos: Alexandra Conunova Plays Saint-Saëns'],
  10: ['Guitar Duo Recital by the Assad Brothers', 'Duo Recital by Sol Gabetta (Cello) and Patricia Kopatchinskaja (Violin)', 'Swire Proudly Sponsors: Belt and Road | Zitong Wang Plays Chopin'],
  11: ['Festive Korea 2026: Musical "The Longest Night"', 'Voyage of the Eight Graces', 'Dunhuang: In Search of Light', 'The Connected Stage\' Series: Kylián and Sangba'],
  12: ['Festive Korea 2026: "GAT"', 'Asian Ethnic Cultural Performances+ 2026', 'TRI-ART!ON'],
  13: ['Thousand Reeds, One Universe', 'Dunhuang: In Search of Light', 'The Connected Stage\' Series: Kylián and Sangba', 'Asian Ethnic Cultural Performances+ 2026'],
  14: ['Voyage of the Eight Graces', 'Thousand Reeds, One Universe', 'The Connected Stage\' Series: Kylián and Sangba', 'Asian Ethnic Cultural Performances+ 2026'],
  15: ['Voyage of the Eight Graces', 'Dunhuang: In Search of Light', 'Asian Ethnic Cultural Performances+ 2026'],
  16: [], // UST - fringe only, no related
  17: ['Asian Ethnic Cultural Performances+ 2026', 'Sonic Odyssey of Curious Creatures', 'World Music Salon Series: A Guide to Asia+ Music'],
  18: ['Asian Ethnic Cultural Performances+ 2026', 'Asian Ethnic Cultural Performances+ 2026: Convergence of Cross-Cultural Gifting — Ethnic Cultural Exhibition', 'World Music Salon Series: A Guide to Asia+ Music'],
  19: ['TRI-ART!ON', 'Taksu - The Spirit of Gamelan', 'Canvas of Sound', 'Guitar Duo Recital by the Assad Brothers']
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseInfo(infoText) {
  const lines = infoText.split('\n').map(l => l.trim()).filter(l => l);
  return {
    raw: infoText,
    date: lines[0] || '',
    venue: lines.find(l => l.includes('劇院') || l.includes('會堂') || l.includes('中心') || l.includes('Hall') || l.includes('Theatre') || l.includes('Centre')) || '',
    price: lines.find(l => l.includes('$') || l.includes('Free')) || '',
    tickets: lines.find(l => l.includes('URBTIX') || l.includes('Cityline') || l.includes('Eventbrite') || l.includes('POPTICKET')) || '',
    duration: lines.find(l => l.includes('小時') || l.includes('hour') || l.includes('分鐘') || l.includes('minutes')) || '',
    language: lines.find(l => l.includes('粵語') || l.includes('英語') || l.includes('普通話') || l.includes('Cantonese') || l.includes('English') || l.includes('Putonghua')) || '',
    remark: lines.filter(l => l.includes('約') || l.includes('session') || l.includes('suitable') || l.includes('年齡') || l.includes('aged') || l.includes('請穿')).join('\n') || ''
  };
}

const formattedEvents = rawEvents.map((e, index) => {
  const folderNum = parseInt(e.sourceFolder.match(/^(\d+)_/)[1]);
  
  const event = {
    // Metadata
    order: folderNum,
    slug: slugify(e.titleEng || e.titleChi || `event-${folderNum}`),
    feature: true,
    preview_only: false,
    
    // Titles
    title_HK: e.titleChi,
    title_EN: e.titleEng,
    title_CN: e.titleChi,
    
    // Art group as subtitle
    subTitle_HK: e.artGroupChi,
    subTitle_EN: e.artGroupEng,
    subTitle_CN: e.artGroupChi,
    
    // Programme descriptions
    program_HK: e.programmeChi,
    program_EN: e.programmeEng,
    program_CN: e.programmeChi,
    
    // Artists
    artist_HK: e.artistChi,
    artist_EN: e.artistEng,
    artist_CN: e.artistChi,
    
    // Pre-event / fringe activities
    pre_HK: e.fringeChi,
    pre_EN: e.fringeEng,
    pre_CN: e.fringeChi,
    
    // Display time (main date)
    displayTime_HK: e.date,
    displayTime_EN: e.date,
    displayTime_CN: e.date,
    
    // Categories
    categories: e.artForm.map(f => categoryMap[f]).filter(Boolean),
    
    // Information component
    infomation: [],
    
    // Program component (for sub-programmes or multiple dates)
    program: [],
    
    // Related programmes (titles for reference)
    relatedProgrammeTitles: relatedProgrammeMap[index] || [],
    
    // Source reference
    sourceFolder: e.sourceFolder,
    sourceFile: e.sourceFile,
    
    // Tags (art form as string)
    tag_HK: e.artForm.map(f => {
      const map = { 'Music': '音樂', 'Dance': '舞蹈', 'Theatre': '戲劇', 'Exhibition': '展覽', 'Other': '其他' };
      return map[f] || f;
    }).join(' / '),
    tag_EN: e.artForm.join(' / '),
    tag_CN: e.artForm.map(f => {
      const map = { 'Music': '音樂', 'Dance': '舞蹈', 'Theatre': '戲劇', 'Exhibition': '展覽', 'Other': '其他' };
      return map[f] || f;
    }).join(' / ')
  };
  
  // Parse info into information component
  if (e.infoChi || e.infoEng) {
    const infoChiParsed = parseInfo(e.infoChi || '');
    const infoEngParsed = parseInfo(e.infoEng || '');
    
    event.infomation.push({
      date_HK: infoChiParsed.date,
      date_EN: infoEngParsed.date,
      date_CN: infoChiParsed.date,
      location_HK: infoChiParsed.venue,
      location_EN: infoEngParsed.venue,
      location_CN: infoChiParsed.venue,
      ticket_HK: infoChiParsed.price + (infoChiParsed.tickets ? '\n' + infoChiParsed.tickets : ''),
      ticket_EN: infoEngParsed.price + (infoEngParsed.tickets ? '\n' + infoEngParsed.tickets : ''),
      ticket_CN: infoChiParsed.price + (infoChiParsed.tickets ? '\n' + infoChiParsed.tickets : ''),
      language_HK: infoChiParsed.language,
      language_EN: infoEngParsed.language,
      language_CN: infoChiParsed.language,
      remark_HK: infoChiParsed.remark || infoChiParsed.duration,
      remark_EN: infoEngParsed.remark || infoEngParsed.duration,
      remark_CN: infoChiParsed.remark || infoChiParsed.duration,
      tittle_HK: '演出資訊',
      tittle_EN: 'Information',
      tittle_CN: '演出資訊'
    });
  }
  
  // Handle sub-programmes (e.g., UST Cosmopolis Festival)
  if (e.subProgrammes && e.subProgrammes.length > 0) {
    e.subProgrammes.forEach((sp, spIdx) => {
      event.program.push({
        title_HK: sp.titleChi,
        title_EN: sp.titleEng,
        title_CN: sp.titleChi,
        content_HK: sp.infoChi,
        content_EN: sp.infoEng,
        content_CN: sp.infoChi,
        displayTime_HK: sp.date,
        displayTime_EN: sp.date,
        displayTime_CN: sp.date
      });
    });
  }
  
  return event;
});

// Save formatted JSON
const outputPath = path.join(__dirname, '..', 'data', 'events-formatted.json');
fs.writeFileSync(outputPath, JSON.stringify(formattedEvents, null, 2), 'utf8');
console.log(`Saved ${formattedEvents.length} formatted events to ${outputPath}`);

// Print summary
console.log('\n=== Formatted Events Summary ===');
formattedEvents.forEach((e, i) => {
  console.log(`${(i+1).toString().padStart(2)}. ${e.title_EN?.substring(0, 60) || e.title_HK?.substring(0, 60) || '(no title)'}`);
  console.log(`    Slug: ${e.slug}`);
  console.log(`    Categories: ${e.categories.join(', ') || 'none'}`);
  console.log(`    Info components: ${e.infomation.length}`);
  console.log(`    Program components: ${e.program.length}`);
  console.log(`    Related: ${e.relatedProgrammeTitles.length > 0 ? e.relatedProgrammeTitles.join('; ').substring(0, 80) + '...' : 'none'}`);
});
