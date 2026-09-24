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
  return { headers, rows, rawLineCount: lines.length };
}

const cams = parseSimpleCsv(fs.readFileSync('sample_data/cams_sample.csv', 'utf8'));
const kfin = parseSimpleCsv(fs.readFileSync('sample_data/kfintech_sample.csv', 'utf8'));

console.log("--- CAMS Columns Deep-Dive ---");
cams.headers.forEach(h => {
  const sample = cams.rows.find(r => r[h] !== '') || cams.rows[0];
  const emptyCount = cams.rows.filter(r => r[h] === '').length;
  console.log(`[${h}] sample: "${sample[h]}" | empty: ${emptyCount}/${cams.rows.length}`);
});

console.log("\n--- KFintech Columns Deep-Dive ---");
kfin.headers.forEach(h => {
  const sample = kfin.rows.find(r => r[h] !== '') || kfin.rows[0];
  const emptyCount = kfin.rows.filter(r => r[h] === '').length;
  console.log(`[${h}] sample: "${sample[h]}" | empty: ${emptyCount}/${kfin.rows.length}`);
});

// Check math: CLOSING_ASSETS vs UNITS * NAV
console.log("\n--- CAMS Math Check (UNITS * NAV vs CLOSING_ASSETS) ---");
let camsDiffs = 0;
cams.rows.slice(0, 10).forEach(r => {
  const u = parseFloat(r.UNITS) || 0;
  const n = parseFloat(r.NAV) || 0;
  const val = parseFloat(r.CLOSING_ASSETS) || 0;
  const calc = Math.round(u * n * 100) / 100;
  console.log(`${r.INV_NAME} | Units: ${u} * NAV: ${n} = Calc: ${calc} | CSV: ${val}`);
});

// Check math: KFintech Balance * NAV vs AUM
console.log("\n--- KFintech Math Check (Balance * NAV vs AUM) ---");
kfin.rows.slice(0, 10).forEach(r => {
  const u = parseFloat(r.Balance) || 0;
  const n = parseFloat(r.NAV) || 0;
  const val = parseFloat(r.AUM) || 0;
  const calc = Math.round(u * n * 100) / 100;
  console.log(`${r['Investor Name']} | Balance: ${u} * NAV: ${n} = Calc: ${calc} | CSV: ${val}`);
});
