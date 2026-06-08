const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = path.join(__dirname, '..', 'Asia+ 2026 Website_Info to Blueriver');
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const TEMP_DIR = path.join(__dirname, '..', '.temp_extract');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function getDocxParagraphs(docxPath) {
  const tempXml = path.join(TEMP_DIR, 'doc_' + Date.now() + '.xml');
  
  const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('${docxPath.replace(/'/g, "''")}')
$entry = $zip.Entries | Where-Object { $_.Name -eq "document.xml" }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xml = $reader.ReadToEnd()
$reader.Close(); $stream.Close(); $zip.Dispose()
[System.IO.File]::WriteAllText('${tempXml.replace(/\\/g, '\\\\').replace(/'/g, "''")}', $xml, [System.Text.Encoding]::UTF8)
`;
  
  execSync('powershell -NoProfile -Command -', {
    input: psScript,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  
  const xml = fs.readFileSync(tempXml, 'utf8');
  fs.unlinkSync(tempXml);
  
  const paragraphs = xml.split(/<w:p[\s>]/).slice(1);
  const lines = paragraphs.map(p => {
    const texts = [];
    const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;
    while ((match = regex.exec(p)) !== null) {
      texts.push(match[1]);
    }
    return texts.join('').trim();
  }).filter(l => l.length > 0);
  
  return lines;
}

function cleanText(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function parseStandardEvent(lines, folderName, fileName) {
  const event = {
    sourceFolder: folderName,
    sourceFile: fileName,
    titleChi: '',
    titleEng: '',
    artGroupChi: '',
    artGroupEng: '',
    date: '',
    artForm: [],
    programmeChi: '',
    programmeEng: '',
    artistChi: '',
    artistEng: '',
    infoChi: '',
    infoEng: '',
    fringeChi: '',
    fringeEng: ''
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.match(/^Programme\s*Title\s*\(?Chi\)?/i)) {
      i++;
      if (i < lines.length) event.titleChi = cleanText(lines[i]);
      i++; continue;
    }
    if (line.match(/^Programme\s*Title\s*\(?Eng\)?/i)) {
      i++;
      if (i < lines.length) event.titleEng = cleanText(lines[i]);
      i++; continue;
    }
    if (line.match(/^Art\s*Group\s*\(?Chi\)?/i)) {
      i++;
      if (i < lines.length) event.artGroupChi = cleanText(lines[i]);
      i++; continue;
    }
    if (line.match(/^Art\s*Group\s*\(?Eng\)?/i)) {
      i++;
      if (i < lines.length) event.artGroupEng = cleanText(lines[i]);
      i++; continue;
    }
    if (line === 'Date') {
      i++;
      if (i < lines.length) event.date = cleanText(lines[i]);
      i++; continue;
    }
    if (line.match(/^Art\s*Form/i)) {
      i++;
      const forms = [];
      // Collect all consecutive art form lines
      while (i < lines.length && !lines[i].match(/^Tab\s*1/i)) {
        const formText = cleanText(lines[i]);
        if (/音樂|Music/i.test(formText) && !forms.includes('Music')) forms.push('Music');
        if (/舞蹈|Dance/i.test(formText) && !forms.includes('Dance')) forms.push('Dance');
        if (/戲劇|Theatre/i.test(formText) && !forms.includes('Theatre')) forms.push('Theatre');
        if (/展覽|Exhibition/i.test(formText) && !forms.includes('Exhibition')) forms.push('Exhibition');
        if (/其他|Other/i.test(formText) && !forms.includes('Other')) forms.push('Other');
        i++;
      }
      event.artForm = forms;
      continue;
    }
    
    // Tab 1
    if (line === 'Tab 1' || line.match(/^Tab\s*1\s*節目/i)) {
      if (line === 'Tab 1' && i + 1 < lines.length && lines[i+1].match(/節目\s*\(?Chi\)?/i)) {
        i += 2;
      } else {
        i++;
      }
      const buffer = [];
      while (i < lines.length && !lines[i].match(/^Tab\s*1\s*Programme/i)) {
        buffer.push(lines[i]);
        i++;
      }
      event.programmeChi = cleanText(buffer.join('\n'));
      continue;
    }
    
    if (line.match(/^Tab\s*1\s*Programme/i)) {
      i++;
      const buffer = [];
      while (i < lines.length && !lines[i].match(/^Tab\s*2/i)) {
        buffer.push(lines[i]);
        i++;
      }
      event.programmeEng = cleanText(buffer.join('\n'));
      continue;
    }
    
    // Tab 2
    if (line === 'Tab 2' || line.match(/^Tab\s*2\s*表演者/i)) {
      if (line === 'Tab 2' && i + 1 < lines.length && lines[i+1].match(/表演者\s*\(?Chi\)?/i)) {
        i += 2;
      } else {
        i++;
      }
      const buffer = [];
      while (i < lines.length && !lines[i].match(/^Tab\s*2\s*(Artist|Information)/i)) {
        buffer.push(lines[i]);
        i++;
      }
      event.artistChi = cleanText(buffer.join('\n'));
      continue;
    }
    
    if (line.match(/^Tab\s*2\s*(Artist|Information)/i)) {
      i++;
      const buffer = [];
      while (i < lines.length && !lines[i].match(/^Tab\s*3/i)) {
        buffer.push(lines[i]);
        i++;
      }
      event.artistEng = cleanText(buffer.join('\n'));
      continue;
    }
    
    // Tab 3
    if (line === 'Tab 3' || line.match(/^Tab\s*3\s*資訊/i)) {
      if (line === 'Tab 3' && i + 1 < lines.length && lines[i+1].match(/資訊\s*\(?Chi\)?/i)) {
        i += 2;
      } else {
        i++;
      }
      const buffer = [];
      while (i < lines.length && !lines[i].match(/^Tab\s*3\s*Information/i)) {
        buffer.push(lines[i]);
        i++;
      }
      event.infoChi = cleanText(buffer.join('\n'));
      continue;
    }
    
    if (line.match(/^Tab\s*3\s*Information/i)) {
      i++;
      const buffer = [];
      while (i < lines.length && !lines[i].match(/^Tab\s*4/i)) {
        buffer.push(lines[i]);
        i++;
      }
      event.infoEng = cleanText(buffer.join('\n'));
      continue;
    }
    
    // Tab 4
    if (line === 'Tab 4' || line.match(/^Tab\s*4\s*延伸活動/i)) {
      if (line === 'Tab 4' && i + 1 < lines.length && lines[i+1].match(/延伸活動\s*\(?Chi\)?/i)) {
        i += 2;
      } else {
        i++;
      }
      const buffer = [];
      while (i < lines.length && !lines[i].match(/^Tab\s*4\s*Fringe/i)) {
        buffer.push(lines[i]);
        i++;
      }
      event.fringeChi = cleanText(buffer.join('\n'));
      continue;
    }
    
    if (line.match(/^Tab\s*4\s*Fringe/i)) {
      i++;
      const buffer = [];
      while (i < lines.length) {
        buffer.push(lines[i]);
        i++;
      }
      event.fringeEng = cleanText(buffer.join('\n'));
      continue;
    }
    
    i++;
  }
  
  return event;
}

function parseUstEvent(lines, folderName, fileName) {
  const event = {
    sourceFolder: folderName,
    sourceFile: fileName,
    titleChi: '都會音樂節節目',
    titleEng: 'Programmes of Cosmopolis Festival',
    artGroupChi: '香港科技大學',
    artGroupEng: 'The Hong Kong University of Science and Technology',
    date: '16.10-25.10.2026',
    artForm: ['Music'],
    programmeChi: '',
    programmeEng: '',
    artistChi: '',
    artistEng: '',
    infoChi: '',
    infoEng: '',
    fringeChi: '',
    fringeEng: '',
    subProgrammes: []
  };
  
  let i = 0;
  while (i < lines.length) {
    if (i + 1 < lines.length && lines[i+1].match(/^\d+\.\d+\.2026/)) {
      const titleLine = lines[i];
      const dateLine = lines[i+1];
      i += 2;
      
      const chiBuffer = [];
      while (i < lines.length && !lines[i].match(/^Tigran Hamasyan Quartet|^Music of Palestine/)) {
        chiBuffer.push(lines[i]);
        i++;
      }
      
      let titleEng = '';
      if (i < lines.length) {
        titleEng = lines[i];
        i++;
      }
      
      const engBuffer = [];
      while (i < lines.length && !lines[i+1]?.match(/^\d+\.\d+\.2026/)) {
        if (lines[i].match(/^\d+\.\d+\.2026/)) break;
        engBuffer.push(lines[i]);
        i++;
      }
      
      event.subProgrammes.push({
        titleChi: titleLine,
        titleEng: titleEng,
        date: dateLine,
        infoChi: cleanText(chiBuffer.join('\n')),
        infoEng: cleanText(engBuffer.join('\n'))
      });
      continue;
    }
    i++;
  }
  
  return event;
}

// Main extraction
const events = [];
const folders = fs.readdirSync(BASE_DIR)
  .filter(f => fs.statSync(path.join(BASE_DIR, f)).isDirectory())
  .filter(f => /^\d+_/.test(f))
  .sort((a, b) => {
    const na = parseInt(a.match(/^(\d+)_/)[1]);
    const nb = parseInt(b.match(/^(\d+)_/)[1]);
    return na - nb;
  });

for (const folder of folders) {
  const folderPath = path.join(BASE_DIR, folder);
  const docxFiles = fs.readdirSync(folderPath)
    .filter(f => f.endsWith('.docx'))
    .sort();
  
  for (const docx of docxFiles) {
    const docxPath = path.join(folderPath, docx);
    console.log(`Extracting: ${folder}/${docx}`);
    try {
      const lines = getDocxParagraphs(docxPath);
      
      if (folder.includes('UST')) {
        const event = parseUstEvent(lines, folder, docx);
        events.push(event);
      } else {
        const event = parseStandardEvent(lines, folder, docx);
        events.push(event);
      }
    } catch (err) {
      console.error(`Error extracting ${docxPath}:`, err.message);
    }
  }
}

// Save
const outputPath = path.join(OUTPUT_DIR, 'events.json');
fs.writeFileSync(outputPath, JSON.stringify(events, null, 2), 'utf8');
console.log(`\nSaved ${events.length} events to ${outputPath}`);

// Print summary
console.log('\n=== Summary ===');
events.forEach((e, i) => {
  const title = e.titleEng || e.titleChi || '(no title)';
  const hasChi = e.titleChi ? '✓' : '✗';
  const hasEng = e.titleEng ? '✓' : '✗';
  const hasProgChi = e.programmeChi ? '✓' : '✗';
  const hasProgEng = e.programmeEng ? '✓' : '✗';
  const hasInfoChi = e.infoChi ? '✓' : '✗';
  const hasInfoEng = e.infoEng ? '✓' : '✗';
  const hasFringeChi = e.fringeChi ? '✓' : '✗';
  const hasFringeEng = e.fringeEng ? '✓' : '✗';
  const subCount = e.subProgrammes ? ` [${e.subProgrammes.length} sub]` : '';
  console.log(`${(i+1).toString().padStart(2)}. [${e.sourceFolder}] ${title.substring(0, 50)}${title.length > 50 ? '...' : ''} | ProgCHI:${hasProgChi} ProgENG:${hasProgEng} InfoCHI:${hasInfoChi} InfoENG:${hasInfoEng} FringeCHI:${hasFringeChi} FringeENG:${hasFringeEng}${subCount}`);
});
