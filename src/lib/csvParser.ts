import Papa from 'papaparse';
import { DataSource, InvestmentRecord, ParsedCsvResult } from '../types/investment';
import { extractAmcName } from './amcHelper';
import { normalizeClientName } from './clientMatcher';

/**
 * Strips enclosing quotes (single or double) from a string token
 */
function cleanToken(token: unknown): string {
  if (token === null || token === undefined) return '';
  let str = String(token).trim();
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.substring(1, str.length - 1).trim();
  }
  return str;
}

/**
 * Parses numeric values safely, handling commas, currencies and blanks
 */
function parseNumeric(val: unknown): number {
  if (val === null || val === undefined) return 0;
  const cleaned = cleanToken(val).replace(/,/g, '').replace(/[₹$]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Detects whether CSV content belongs to CAMS or KFintech
 */
export function detectCsvSource(headers: string[]): DataSource | null {
  const cleanedHeaders = headers.map(h => cleanToken(h).toUpperCase());

  // Check CAMS headers
  const camsMatches = ['INV_NAME', 'SCHEME_NAME', 'CLOSING_ASSETS', 'UNITS', 'NAV', 'FOLIO', 'ASSET_DATE'];
  const camsScore = camsMatches.filter(m => cleanedHeaders.includes(m)).length;

  // Check KFintech headers
  const kfinMatches = ['INVESTOR NAME', 'FUND DESCRIPTION', 'AUM', 'BALANCE', 'FOLIO NUMBER', 'REPORT DATE', 'FUND'];
  const kfinScore = kfinMatches.filter(m => cleanedHeaders.includes(m)).length;

  if (camsScore >= 3 && camsScore > kfinScore) return 'CAMS';
  if (kfinScore >= 3 && kfinScore > camsScore) return 'KFINTECH';

  return null;
}

/**
 * Parses CAMS or KFintech CSV content into standardized records
 */
export function parseInvestmentCsv(
  csvContent: string,
  fileName: string,
  expectedSource?: DataSource
): Promise<ParsedCsvResult> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse with PapaParse
    Papa.parse<Record<string, unknown>>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => cleanToken(header),
      complete: (results) => {
        const rawHeaders = results.meta.fields || [];
        const detectedSource = detectCsvSource(rawHeaders);

        const source = expectedSource || detectedSource || 'CAMS';

        if (expectedSource && detectedSource && expectedSource !== detectedSource) {
          warnings.push(
            `File headers appear to match ${detectedSource}, but was uploaded to ${expectedSource} card.`
          );
        }

        if (!detectedSource && !expectedSource) {
          errors.push(
            'Could not reliably identify file structure as CAMS or KFintech. Please verify CSV headers.'
          );
          return resolve({
            source: 'CAMS',
            fileName,
            records: [],
            detectedHeaders: rawHeaders,
            rawRowCount: results.data.length,
            validRowCount: 0,
            invalidRowCount: results.data.length,
            uniqueClientsCount: 0,
            totalAum: 0,
            sampleRows: [],
            errors,
            warnings,
          });
        }

        const records: InvestmentRecord[] = [];
        let invalidRows = 0;
        let batchAsOfDate = '';
        const importBatchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const headerMap = new Map<string, string>();
        rawHeaders.forEach(h => headerMap.set(cleanToken(h).toUpperCase(), h));

        const getField = (row: Record<string, unknown>, ...candidates: string[]): string => {
          for (const cand of candidates) {
            const actualHeader = headerMap.get(cand.toUpperCase());
            if (actualHeader && row[actualHeader] !== undefined) {
              return cleanToken(row[actualHeader]);
            }
            if (row[cand] !== undefined) {
              return cleanToken(row[cand]);
            }
          }
          return '';
        };

        results.data.forEach((row, index) => {
          let clientName = '';
          let scheme = '';
          let folio = '';
          let units = 0;
          let nav = 0;
          let currentValue = 0;
          let asOfDate = '';
          let productCode = '';
          let fundCode = '';
          let city = '';
          let taxStatus = '';
          let email = '';
          let mobile = '';
          let address = '';
          let pincode = '';
          let option = '';
          let pan = '';

          if (source === 'CAMS') {
            clientName = getField(row, 'INV_NAME', 'INVESTOR_NAME', 'INVESTOR NAME');
            scheme = getField(row, 'SCHEME_NAME', 'SCHEME', 'PRODUCT_NAME');
            folio = getField(row, 'FOLIO', 'FOLIO_NO', 'FOLIO NUMBER');
            units = parseNumeric(getField(row, 'UNITS', 'UNIT'));
            nav = parseNumeric(getField(row, 'NAV', 'PUR_PRICE'));
            currentValue = parseNumeric(getField(row, 'CLOSING_ASSETS', 'AUM', 'CURRENT_VALUE', 'AMOUNT'));
            asOfDate = getField(row, 'ASSET_DATE', 'REPORT_DATE', 'DATE');
            productCode = getField(row, 'PRODUCT', 'PROD_CODE');
            city = getField(row, 'CITY');
            taxStatus = getField(row, 'TAX_STATUS', 'HOLD_NATURE');
            pan = getField(row, 'PAN', 'PAN_NO', 'PAN NUMBER');
          } else {
            // KFintech
            clientName = getField(row, 'Investor Name', 'INV_NAME', 'INVESTOR_NAME');
            scheme = getField(row, 'Fund Description', 'SCHEME_NAME', 'SCHEME');
            folio = getField(row, 'Folio Number', 'FOLIO', 'FOLIO_NO');
            units = parseNumeric(getField(row, 'Balance', 'UNITS', 'UNIT'));
            nav = parseNumeric(getField(row, 'NAV'));
            currentValue = parseNumeric(getField(row, 'AUM', 'CLOSING_ASSETS', 'CURRENT_VALUE'));
            asOfDate = getField(row, 'Report Date', 'To Date', 'Transaction Date', 'DATE');
            productCode = getField(row, 'Product Code');
            fundCode = getField(row, 'Fund', 'Scheme Code');
            city = getField(row, 'City');
            pincode = getField(row, 'Pincode');
            email = getField(row, 'Email');
            mobile = getField(row, 'Phone Office', 'Phone Residence', 'Mobile');
            option = getField(row, 'Dividend Option');
            taxStatus = getField(row, 'Hold Mode');
            pan = getField(row, 'PAN', 'PAN_NO', 'Investor ID');

            const addr1 = getField(row, 'Address #1');
            const addr2 = getField(row, 'Address #2');
            const addr3 = getField(row, 'Address #3');
            address = [addr1, addr2, addr3].filter(Boolean).join(', ');
          }

          // Fallback calculation: if currentValue is missing/zero but units and NAV exist
          if (currentValue === 0 && units > 0 && nav > 0) {
            currentValue = Math.round(units * nav * 100) / 100;
          }

          if (asOfDate && !batchAsOfDate) {
            batchAsOfDate = asOfDate;
          }

          // Critical fields check: Must have at least client name and scheme/folio
          if (!clientName && !scheme && !folio) {
            invalidRows++;
            return;
          }

          if (!clientName) {
            clientName = 'Unknown Investor';
          }

          const amc = extractAmcName(scheme, productCode, fundCode);
          const normalizedClientName = normalizeClientName(clientName);

          const record: InvestmentRecord = {
            id: `rec_${source.toLowerCase()}_${index}_${Date.now()}`,
            source,
            clientName,
            normalizedClientName,
            pan: pan || undefined,
            email: email || undefined,
            mobile: mobile || undefined,
            city: city || undefined,
            pincode: pincode || undefined,
            address: address || undefined,
            amc,
            scheme: scheme || 'Unknown Scheme',
            productCode: productCode || undefined,
            folio: folio || 'Unknown Folio',
            option: option || undefined,
            taxStatus: taxStatus || undefined,
            units,
            nav,
            currentValue: Math.round(currentValue * 100) / 100,
            asOfDate: asOfDate || batchAsOfDate || new Date().toISOString().split('T')[0],
            importBatchId,
            createdAt: Date.now(),
          };

          records.push(record);
        });

        // Compute metrics
        const uniqueClients = new Set(records.map(r => r.normalizedClientName));
        const totalAum = records.reduce((acc, r) => acc + (r.currentValue || 0), 0);

        if (records.length === 0) {
          errors.push('No valid investment records could be parsed from the file.');
        }

        resolve({
          source,
          fileName,
          records,
          detectedHeaders: rawHeaders,
          rawRowCount: results.data.length,
          validRowCount: records.length,
          invalidRowCount: invalidRows,
          uniqueClientsCount: uniqueClients.size,
          totalAum: Math.round(totalAum * 100) / 100,
          asOfDate: batchAsOfDate,
          sampleRows: records.slice(0, 5),
          errors,
          warnings,
        });
      },
      error: (err: any) => {
        resolve({
          source: expectedSource || 'CAMS',
          fileName,
          records: [],
          detectedHeaders: [],
          rawRowCount: 0,
          validRowCount: 0,
          invalidRowCount: 0,
          uniqueClientsCount: 0,
          totalAum: 0,
          sampleRows: [],
          errors: [`CSV Parsing Error: ${err.message}`],
          warnings: [],
        });
      }
    });
  });
}
