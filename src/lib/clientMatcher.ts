import { InvestmentRecord, ClientHoldingSummary, DataSource } from '../types/investment';

/**
 * Normalizes a client name by stripping titles/honorifics, special characters,
 * extra whitespace, and converting to uppercase.
 */
export function normalizeClientName(name: string): string {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/\b(MR|MRS|MS|DR|SHRI|SMT|PROF|M\/S)\.?\b/g, '')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns a sorted token key for robust matching across order variations
 * (e.g. "PATEL SURESH D" vs "SURESH D PATEL").
 */
export function getNameTokenKey(normalizedName: string): string {
  return normalizedName
    .split(/\s+/)
    .filter(token => token.length > 0)
    .sort()
    .join(' ');
}

/**
 * Groups raw investment records into consolidated client holding profiles.
 * Respects strict matching hierarchy:
 * 1. PAN (if provided)
 * 2. Exact Normalized Name
 * 3. Exact Token Set Match (same words in different order)
 */
export function groupRecordsByClient(records: InvestmentRecord[]): ClientHoldingSummary[] {
  // Map of client group key -> records
  const clientGroups = new Map<string, {
    primaryName: string;
    normalizedName: string;
    pan?: string;
    email?: string;
    mobile?: string;
    city?: string;
    records: InvestmentRecord[];
  }>();

  // Lookups to route to group key
  const panToKey = new Map<string, string>();
  const nameToKey = new Map<string, string>();
  const tokenSetToKey = new Map<string, string>();

  records.forEach((record) => {
    const rawName = record.clientName.trim();
    const normName = record.normalizedClientName || normalizeClientName(rawName);
    const tokenKey = getNameTokenKey(normName);
    const pan = record.pan ? record.pan.trim().toUpperCase() : undefined;

    let targetKey: string | undefined;

    // 1. Try PAN match
    if (pan && panToKey.has(pan)) {
      targetKey = panToKey.get(pan);
    }
    // 2. Try Exact Name match
    else if (nameToKey.has(normName)) {
      targetKey = nameToKey.get(normName);
    }
    // 3. Try Token Set match (only if at least 2 tokens to prevent generic single-word merges)
    else if (tokenKey.split(' ').length >= 2 && tokenSetToKey.has(tokenKey)) {
      targetKey = tokenSetToKey.get(tokenKey);
    }

    // If no existing match, create new client entry
    if (!targetKey) {
      targetKey = `client_${clientGroups.size + 1}_${normName.replace(/\s+/g, '_')}`;
      clientGroups.set(targetKey, {
        primaryName: rawName,
        normalizedName: normName,
        pan,
        email: record.email,
        mobile: record.mobile,
        city: record.city,
        records: [],
      });

      if (pan) panToKey.set(pan, targetKey);
      nameToKey.set(normName, targetKey);
      if (tokenKey.split(' ').length >= 2) {
        tokenSetToKey.set(tokenKey, targetKey);
      }
    }

    const group = clientGroups.get(targetKey)!;
    group.records.push(record);

    // Populate missing contact info from newer/richer record if present
    if (!group.pan && record.pan) group.pan = record.pan;
    if (!group.email && record.email) group.email = record.email;
    if (!group.mobile && record.mobile) group.mobile = record.mobile;
    if (!group.city && record.city) group.city = record.city;
  });

  // Transform each group into a ClientHoldingSummary
  const summaries: ClientHoldingSummary[] = [];

  clientGroups.forEach((group, clientId) => {
    let totalAum = 0;
    let camsAum = 0;
    let kfintechAum = 0;
    let camsRecordCount = 0;
    let kfintechRecordCount = 0;
    let activeHoldingsCount = 0;
    let zeroBalanceCount = 0;

    const sourcesSet = new Set<DataSource>();
    const foliosSet = new Set<string>();
    const schemesSet = new Set<string>();

    group.records.forEach((rec) => {
      sourcesSet.add(rec.source);
      if (rec.folio) foliosSet.add(rec.folio);
      if (rec.scheme) schemesSet.add(rec.scheme);

      const val = rec.currentValue || 0;
      totalAum += val;

      if (rec.source === 'CAMS') {
        camsAum += val;
        camsRecordCount++;
      } else {
        kfintechAum += val;
        kfintechRecordCount++;
      }

      if (val > 0.01 || rec.units > 0.001) {
        activeHoldingsCount++;
      } else {
        zeroBalanceCount++;
      }
    });

    summaries.push({
      clientId,
      primaryName: group.primaryName,
      normalizedName: group.normalizedName,
      pan: group.pan,
      email: group.email,
      mobile: group.mobile,
      city: group.city,
      sources: Array.from(sourcesSet),
      totalAum: Math.round(totalAum * 100) / 100,
      camsAum: Math.round(camsAum * 100) / 100,
      kfintechAum: Math.round(kfintechAum * 100) / 100,
      camsRecordCount,
      kfintechRecordCount,
      totalFoliosCount: foliosSet.size,
      totalSchemesCount: schemesSet.size,
      activeHoldingsCount,
      zeroBalanceCount,
      records: group.records,
    });
  });

  // Sort descending by Total AUM
  return summaries.sort((a, b) => b.totalAum - a.totalAum);
}
