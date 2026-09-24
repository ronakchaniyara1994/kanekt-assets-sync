const fs = require('fs');

function parseSimpleCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  
  function parseLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    let quoteSymbol = null;
    
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if ((c === "'" || c === '"') && !inQuotes) {
        inQuotes = true;
        quoteSymbol = c;
      } else if (c === quoteSymbol && inQuotes) {
        inQuotes = false;
        quoteSymbol = null;
      } else if (c === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    fields.push(current.trim());
    return fields;
  }

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = fields[idx] !== undefined ? fields[idx] : '';
    });
    rows.push(obj);
  }
  return { headers, rows };
}

const cams = parseSimpleCsv(fs.readFileSync('sample_data/cams_sample.csv', 'utf8'));
const kfin = parseSimpleCsv(fs.readFileSync('sample_data/kfintech_sample.csv', 'utf8'));

function normalizeName(name) {
  return (name || '')
    .toUpperCase()
    .replace(/^MR\.?\s+|^MRS\.?\s+|^MS\.?\s+/i, '')
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const camsClients = new Map();
cams.rows.forEach(r => {
  const raw = r.INV_NAME;
  const norm = normalizeName(raw);
  if (!camsClients.has(norm)) {
    camsClients.set(norm, { raw, norm, cities: new Set(), folios: new Set(), totalAssets: 0 });
  }
  const c = camsClients.get(norm);
  if (r.CITY) c.cities.add(r.CITY);
  if (r.FOLIO) c.folios.add(r.FOLIO);
  c.totalAssets += parseFloat(r.CLOSING_ASSETS) || 0;
});

const kfinClients = new Map();
kfin.rows.forEach(r => {
  const raw = r['Investor Name'];
  const norm = normalizeName(raw);
  if (!kfinClients.has(norm)) {
    kfinClients.set(norm, { raw, norm, email: r.Email, phone: r['Phone Office'], cities: new Set(), totalAum: 0 });
  }
  const c = kfinClients.get(norm);
  if (r.City) c.cities.add(r.City);
  c.totalAum += parseFloat(r.AUM) || 0;
});

console.log(`CAMS Unique Clients (Normalized): ${camsClients.size}`);
console.log(`KFintech Unique Clients (Normalized): ${kfinClients.size}`);

const matched = [];
const kfinOnly = [];

kfinClients.forEach((kVal, kKey) => {
  if (camsClients.has(kKey)) {
    matched.push({
      norm: kKey,
      camsRaw: camsClients.get(kKey).raw,
      kfinRaw: kVal.raw,
      camsAum: camsClients.get(kKey).totalAssets,
      kfinAum: kVal.totalAum,
      email: kVal.email,
    });
  } else {
    // Check if partial / fuzzy match exists (e.g., "RONAKKUMAR BHARATBHAI CHANIYARA" vs "RONAKKUMARBHARATBHAICHANIYARA")
    let foundFuzzy = null;
    camsClients.forEach((cVal, cKey) => {
      const cleanK = kKey.replace(/\s/g, '');
      const cleanC = cKey.replace(/\s/g, '');
      if (cleanK === cleanC) {
        foundFuzzy = { cKey, cVal };
      }
    });
    if (foundFuzzy) {
      matched.push({
        norm: kKey,
        camsRaw: foundFuzzy.cVal.raw,
        kfinRaw: kVal.raw,
        camsAum: foundFuzzy.cVal.totalAssets,
        kfinAum: kVal.totalAum,
        email: kVal.email,
        note: 'Matched by stripped whitespace'
      });
    } else {
      kfinOnly.push(kVal);
    }
  }
});

console.log(`\nMatched Clients across CAMS & KFintech (${matched.length}):`);
matched.forEach(m => console.log(`- ${m.kfinRaw} | CAMS: ₹${m.camsAum.toFixed(2)} | KFintech: ₹${m.kfinAum.toFixed(2)} ${m.note ? '(' + m.note + ')' : ''}`));

console.log(`\nKFintech only clients (${kfinOnly.length}):`);
kfinOnly.forEach(k => console.log(`- ${k.raw} (₹${k.totalAum.toFixed(2)})`));
