interface AmcRule {
  pattern: RegExp;
  name: string;
}

const AMC_RULES: AmcRule[] = [
  { pattern: /^HDFC/i, name: 'HDFC Mutual Fund' },
  { pattern: /^ICICI\s*PRUDENTIAL|^ICICI/i, name: 'ICICI Prudential Mutual Fund' },
  { pattern: /^SBI/i, name: 'SBI Mutual Fund' },
  { pattern: /^KOTAK/i, name: 'Kotak Mahindra Mutual Fund' },
  { pattern: /^NIPPON\s*INDIA|^RELIANCE/i, name: 'Nippon India Mutual Fund' },
  { pattern: /^AXIS/i, name: 'Axis Mutual Fund' },
  { pattern: /^MOTILAL\s*OSWAL/i, name: 'Motilal Oswal Mutual Fund' },
  { pattern: /^PARAG\s*PARIKH|^PPFAS/i, name: 'PPFAS Mutual Fund' },
  { pattern: /^UNION/i, name: 'Union Mutual Fund' },
  { pattern: /^FRANKLIN\s*INDIA|^FRANKLIN\s*TEMPLETON|^FTI/i, name: 'Franklin Templeton Mutual Fund' },
  { pattern: /^DSP/i, name: 'DSP Mutual Fund' },
  { pattern: /^TATA/i, name: 'Tata Mutual Fund' },
  { pattern: /^EDELWEISS/i, name: 'Edelweiss Mutual Fund' },
  { pattern: /^CANARA\s*ROBECO/i, name: 'Canara Robeco Mutual Fund' },
  { pattern: /^UTI/i, name: 'UTI Mutual Fund' },
  { pattern: /^BANDHAN|^IDFC/i, name: 'Bandhan Mutual Fund' },
  { pattern: /^ADITYA\s*BIRLA|^ABSL|^BIRLA/i, name: 'Aditya Birla Sun Life Mutual Fund' },
  { pattern: /^MIRAE\s*ASSET|^MIRAE/i, name: 'Mirae Asset Mutual Fund' },
  { pattern: /^SUNDARAM/i, name: 'Sundaram Mutual Fund' },
  { pattern: /^QUANT/i, name: 'Quant Mutual Fund' },
  { pattern: /^HSBC/i, name: 'HSBC Mutual Fund' },
  { pattern: /^INVESCO/i, name: 'Invesco Mutual Fund' },
  { pattern: /^WHITEOAK|^WHITE\s*OAK/i, name: 'WhiteOak Capital Mutual Fund' },
  { pattern: /^PGIM\s*INDIA|^PGIM/i, name: 'PGIM India Mutual Fund' },
  { pattern: /^MAHINDRA\s*MANULIFE|^MAHINDRA/i, name: 'Mahindra Manulife Mutual Fund' },
  { pattern: /^BARODA\s*BNP|^BNP\s*PARIBAS/i, name: 'Baroda BNP Paribas Mutual Fund' },
  { pattern: /^TRUST/i, name: 'Trust Mutual Fund' },
  { pattern: /^NAVI/i, name: 'Navi Mutual Fund' },
  { pattern: /^GROWW/i, name: 'Groww Mutual Fund' },
  { pattern: /^360\s*ONE|^IIFL/i, name: '360 ONE Mutual Fund' },
  { pattern: /^SAMCO/i, name: 'Samco Mutual Fund' },
  { pattern: /^HELIOS/i, name: 'Helios Mutual Fund' },
  { pattern: /^OLD\s*BRIDGE/i, name: 'Old Bridge Mutual Fund' },
  { pattern: /^BAJAJ\s*FINSERV/i, name: 'Bajaj Finserv Mutual Fund' },
  { pattern: /^ZERODHA/i, name: 'Zerodha Fund House' },
];

/**
 * Extracts and standardizes AMC (Asset Management Company) name
 * from scheme description, product code, and fund identifier.
 */
export function extractAmcName(schemeName: string, productCode?: string, fundCode?: string): string {
  const cleanScheme = (schemeName || '').trim();

  // 1. Direct rule match on scheme name
  for (const rule of AMC_RULES) {
    if (rule.pattern.test(cleanScheme)) {
      return rule.name;
    }
  }

  // 2. KFintech fund code heuristics
  if (fundCode) {
    const f = fundCode.trim().toUpperCase();
    if (f === '101') return 'Canara Robeco Mutual Fund';
    if (f === '108') return 'UTI Mutual Fund';
    if (f === '118') return 'Edelweiss Mutual Fund';
    if (f === '127') return 'Motilal Oswal Mutual Fund';
    if (f === '128') return 'Axis Mutual Fund';
    if (f === 'RMF') return 'Nippon India Mutual Fund';
  }

  // 3. CAMS / KFintech Product Code prefixes
  if (productCode) {
    const p = productCode.trim().toUpperCase();
    if (p.startsWith('FTI')) return 'Franklin Templeton Mutual Fund';
    if (p.startsWith('PP')) return 'PPFAS Mutual Fund';
    if (p.startsWith('UK')) return 'Union Mutual Fund';
    if (p.startsWith('RMF')) return 'Nippon India Mutual Fund';
    if (p.startsWith('D')) return 'DSP Mutual Fund';
    if (p.startsWith('H')) return 'HDFC Mutual Fund';
    if (p.startsWith('K')) return 'Kotak Mahindra Mutual Fund';
    if (p.startsWith('L')) return 'SBI Mutual Fund';
    if (p.startsWith('P')) return 'ICICI Prudential Mutual Fund';
  }

  // 4. Fallback: extract first two words
  const words = cleanScheme.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const candidate = words.slice(0, Math.min(2, words.length)).join(' ');
    return `${candidate} Mutual Fund`;
  }

  return 'Other Mutual Fund';
}
