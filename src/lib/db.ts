import Dexie, { type EntityTable } from 'dexie';
import { InvestmentRecord, ImportBatch, DataSource } from '../types/investment';

export interface MetaRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

export class MutualFundDatabase extends Dexie {
  cams_dataset!: EntityTable<InvestmentRecord, 'id'>;
  kfintech_dataset!: EntityTable<InvestmentRecord, 'id'>;
  batches!: EntityTable<ImportBatch, 'id'>;
  meta!: EntityTable<MetaRecord, 'key'>;

  constructor() {
    super('MutualFundTrackerDB');
    this.version(1).stores({
      cams_dataset: 'id, clientName, normalizedClientName, pan, folio, amc, scheme, asOfDate, currentValue, importBatchId',
      kfintech_dataset: 'id, clientName, normalizedClientName, pan, folio, amc, scheme, asOfDate, currentValue, importBatchId',
      batches: 'id, source, fileName, uploadedAt',
      meta: 'key',
    });
  }

  /**
   * Replaces CAMS dataset with new records atomically
   */
  async replaceCamsData(records: InvestmentRecord[], batch: ImportBatch): Promise<void> {
    await this.transaction('rw', this.cams_dataset, this.batches, this.meta, async () => {
      await this.cams_dataset.clear();
      // Remove old CAMS batches
      const oldBatches = await this.batches.where('source').equals('CAMS').toArray();
      for (const b of oldBatches) {
        await this.batches.delete(b.id);
      }
      await this.cams_dataset.bulkAdd(records);
      await this.batches.add(batch);
      await this.meta.put({
        key: 'cams_last_update',
        value: {
          fileName: batch.fileName,
          recordCount: batch.recordCount,
          totalAum: batch.totalAum,
          uploadedAt: batch.uploadedAt,
          asOfDate: batch.asOfDate,
        },
        updatedAt: Date.now(),
      });
    });
  }

  /**
   * Replaces KFintech dataset with new records atomically
   */
  async replaceKfintechData(records: InvestmentRecord[], batch: ImportBatch): Promise<void> {
    await this.transaction('rw', this.kfintech_dataset, this.batches, this.meta, async () => {
      await this.kfintech_dataset.clear();
      // Remove old KFintech batches
      const oldBatches = await this.batches.where('source').equals('KFINTECH').toArray();
      for (const b of oldBatches) {
        await this.batches.delete(b.id);
      }
      await this.kfintech_dataset.bulkAdd(records);
      await this.batches.add(batch);
      await this.meta.put({
        key: 'kfintech_last_update',
        value: {
          fileName: batch.fileName,
          recordCount: batch.recordCount,
          totalAum: batch.totalAum,
          uploadedAt: batch.uploadedAt,
          asOfDate: batch.asOfDate,
        },
        updatedAt: Date.now(),
      });
    });
  }

  /**
   * Clears a specific source dataset independently
   */
  async clearSource(source: DataSource): Promise<void> {
    if (source === 'CAMS') {
      await this.transaction('rw', this.cams_dataset, this.batches, this.meta, async () => {
        await this.cams_dataset.clear();
        const oldBatches = await this.batches.where('source').equals('CAMS').toArray();
        for (const b of oldBatches) {
          await this.batches.delete(b.id);
        }
        await this.meta.delete('cams_last_update');
      });
    } else {
      await this.transaction('rw', this.kfintech_dataset, this.batches, this.meta, async () => {
        await this.kfintech_dataset.clear();
        const oldBatches = await this.batches.where('source').equals('KFINTECH').toArray();
        for (const b of oldBatches) {
          await this.batches.delete(b.id);
        }
        await this.meta.delete('kfintech_last_update');
      });
    }
  }

  /**
   * Clears all database tables (Reset Data)
   */
  async clearAll(): Promise<void> {
    await this.transaction('rw', this.cams_dataset, this.kfintech_dataset, this.batches, this.meta, async () => {
      await this.cams_dataset.clear();
      await this.kfintech_dataset.clear();
      await this.batches.clear();
      await this.meta.clear();
    });
  }
}

export const db = new MutualFundDatabase();
