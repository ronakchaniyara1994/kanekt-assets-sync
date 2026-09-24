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

const AMC_PATTERNS = [
  { pattern: /^HDFC/i, name: 'HDFC Mutual Fund' },
  { pattern: /^ICICI/i, name: 'ICICI Prudential Mutual Fund' },
  { pattern: /^SBI/i, name: 'SBI Mutual Fund' },
  { pattern: /^KOTAK/i, name: 'Kotak Mahindra Mutual Fund' },
  { pattern: /^UNION/i, name: 'Union Mutual Fund' },
  { pattern: /^PARAG PARIKH|^PPFAS/i, name: 'PPFAS Mutual Fund' },
  { pattern: /^TATA/i, name: 'Tata Mutual Fund' },
  { pattern: /^FRANKLIN/i, name: 'Franklin Templeton Mutual Fund' },
  { pattern: /^DSP/i, name: 'DSP Mutual Fund' },
  { pattern: /^NIPPON/i, name: 'Nippon India Mutual Fund' },
  { pattern: /^AXIS/i, name: 'Axis Mutual Fund' },
  { pattern: /^MOTILAL/i, name: 'Motilal Oswal Mutual Fund' },
  { pattern: /^EDELWEISS/i, name: 'Edelweiss Mutual Fund' },
  { pattern: /^CANARA ROBECO/i, name: 'Canara Robeco Mutual Fund' },
  { pattern: /^UTI/i, name: 'UTI Mutual Fund' },
  { pattern: /^BANDHAN/i, name: 'Bandhan Mutual Fund' },
  { pattern: /^ADITYA BIRLA|^ABSL/i, name: 'Aditya Birla Sun Life Mutual Fund' },
  { pattern: /^MIRAE/i, name: 'Mirae Asset Mutual Fund' },
  { pattern: /^SUNDARAM/i, name: 'Sundaram Mutual Fund' },
  { pattern: /^QUANT/i, name: 'Quant Mutual Fund' },
  { pattern: /^HSBC/i, name: 'HSBC Mutual Fund' },
  { pattern: /^INVESCO/i, name: 'Invesco Mutual Fund' },
  { pattern: /^WHITE/i, name: 'WhiteOak Capital Mutual Fund' },
  { pattern: /^TATA/i, name: 'Tata Mutual Fund' },
  { pattern: /^PGIM/i, name: 'PGIM India Mutual Fund' },
  { pattern: /^MAHINDRA/i, name: 'Mahindra Manulife Mutual Fund' }
];

function extractAmc(schemeName, productCode = '') {
  const clean = schemeName.trim();
  for (const amc of AMC_PATTERNS) {
    if (amc.pattern.test(clean)) return amc.name;
  }
  // If scheme name didn't start with AMC name, check known product code prefixes
  if (productCode.startsWith('K')) return 'Kotak Mahindra Mutual Fund';
  if (productCode.startsWith('H')) return 'HDFC Mutual Fund';
  if (productCode.startsWith('D')) return 'DSP Mutual Fund';
  if (productCode.startsWith('L')) return 'SBI Mutual Fund';
  if (productCode.startsWith('P')) return 'ICICI Prudential Mutual Fund';
  if (productCode.startsWith('UK')) return 'Union Mutual Fund';
  if (productCode.startsWith('FTI')) return 'Franklin Templeton Mutual Fund';
  
  // Fallback: take first two words
  return clean.split(/\s+/).slice(0, 2).join(' ') + ' Mutual Fund';
}

console.log("Checking CAMS Scheme AMC extraction:");
const camsAmcs = new Set();
cams.rows.forEach(r => {
  const amc = extractAmc(r.SCHEME_NAME, r.PRODUCT);
  camsAmcs.add(amc);
});
console.log("CAMS AMCs:", [...camsAmcs]);

console.log("\nChecking KFintech Scheme AMC extraction:");
const kfinAmcs = new Set();
kfin.rows.forEach(r => {
  const amc = extractAmc(r['Fund Description'], r['Product Code']);
  kfinAmcs.add(amc);
});
console.log("KFintech AMCs:", [...kfinAmcs]);
