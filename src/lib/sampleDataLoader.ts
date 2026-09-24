import { CAMS_SAMPLE_CSV, KFINTECH_SAMPLE_CSV } from './sampleDataConstants';
import { parseInvestmentCsv } from './csvParser';
import { db } from './db';
import { DataSource } from '../types/investment';

export async function loadSampleData(source: DataSource): Promise<{ recordCount: number; aum: number }> {
  const csv = source === 'CAMS' ? CAMS_SAMPLE_CSV : KFINTECH_SAMPLE_CSV;
  const fileName = source === 'CAMS' ? 'cams_sample.csv' : 'kfintech_sample.csv';

  const result = await parseInvestmentCsv(csv, fileName, source);
  if (result.records.length === 0) {
    throw new Error('Failed to parse sample records');
  }

  const batch = {
    id: `batch_sample_${source.toLowerCase()}_${Date.now()}`,
    source,
    fileName,
    recordCount: result.validRowCount,
    clientCount: result.uniqueClientsCount,
    totalAum: result.totalAum,
    uploadedAt: Date.now(),
    asOfDate: result.asOfDate,
    detectedHeaders: result.detectedHeaders,
  };

  if (source === 'CAMS') {
    await db.replaceCamsData(result.records, batch);
  } else {
    await db.replaceKfintechData(result.records, batch);
  }

  return { recordCount: result.validRowCount, aum: result.totalAum };
}
