const fs = require('fs');

function parseSimpleCsv(text, quoteChar = "'") {
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

console.log("=== ANALYZING CAMS CSV ===");
const camsContent = fs.readFileSync('sample_data/cams_sample.csv', 'utf8');
const cams = parseSimpleCsv(camsContent);
console.log(`Headers (${cams.headers.length}):`, cams.headers);
console.log(`Row count: ${cams.rows.length}`);
console.log("First row:", cams.rows[0]);
console.log("Sample rows with non-zero closing assets:", cams.rows.filter(r => parseFloat(r.CLOSING_ASSETS) > 0).slice(0, 3));

// Check zero vs non-zero closing assets
const zeroAssets = cams.rows.filter(r => parseFloat(r.CLOSING_ASSETS) === 0);
console.log(`CAMS rows with 0 closing assets: ${zeroAssets.length} / ${cams.rows.length}`);
console.log(`CAMS distinct investors: ${new Set(cams.rows.map(r => r.INV_NAME.trim().toUpperCase())).size}`);
console.log(`CAMS distinct folios: ${new Set(cams.rows.map(r => r.FOLIO)).size}`);
console.log(`CAMS distinct schemes: ${new Set(cams.rows.map(r => r.SCHEME_NAME)).size}`);

console.log("\n=== ANALYZING KFINTECH CSV ===");
const kfinContent = fs.readFileSync('sample_data/kfintech_sample.csv', 'utf8');
const kfin = parseSimpleCsv(kfinContent);
console.log(`Headers (${kfin.headers.length}):`, kfin.headers);
console.log(`Row count: ${kfin.rows.length}`);
console.log("First row:", kfin.rows[0]);
console.log(`KFintech distinct investors: ${new Set(kfin.rows.map(r => r['Investor Name'].trim().toUpperCase())).size}`);
console.log(`KFintech distinct folios: ${new Set(kfin.rows.map(r => r['Folio Number'])).size}`);
console.log(`KFintech distinct schemes: ${new Set(kfin.rows.map(r => r['Fund Description'])).size}`);

// Overlapping clients by Name
const camsNames = new Set(cams.rows.map(r => r.INV_NAME.trim().toUpperCase()));
const kfinNames = new Set(kfin.rows.map(r => r['Investor Name'].trim().toUpperCase()));
const common = [...camsNames].filter(n => kfinNames.has(n));
console.log(`\nCommon client names between CAMS and KFintech (${common.length}):`, common);
