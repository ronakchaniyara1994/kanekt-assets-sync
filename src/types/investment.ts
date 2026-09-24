export type DataSource = 'CAMS' | 'KFINTECH';

export interface InvestmentRecord {
  id: string; // Unique record ID (UUID)
  source: DataSource;
  clientName: string;
  normalizedClientName: string;
  pan?: string;
  email?: string;
  mobile?: string;
  city?: string;
  pincode?: string;
  address?: string;

  amc: string; // Extracted AMC name (e.g., 'HDFC Mutual Fund')
  scheme: string; // Full Scheme Description
  productCode?: string;
  folio: string;
  plan?: string;
  option?: string;
  taxStatus?: string;

  units: number;
  nav: number;
  currentValue: number; // CLOSING_ASSETS in CAMS, AUM in KFintech
  investedAmount?: number; // Not in holding files, but optional for future exports

  asOfDate: string; // Report / Asset date
  importBatchId: string;
  createdAt: number;
  rawData?: Record<string, unknown>;
}

export interface ImportBatch {
  id: string;
  source: DataSource;
  fileName: string;
  recordCount: number;
  clientCount: number;
  totalAum: number;
  uploadedAt: number;
  asOfDate?: string;
  detectedHeaders: string[];
}

export interface ClientHoldingSummary {
  clientId: string;
  primaryName: string;
  normalizedName: string;
  pan?: string;
  email?: string;
  mobile?: string;
  city?: string;
  sources: DataSource[];
  totalAum: number;
  camsAum: number;
  kfintechAum: number;
  camsRecordCount: number;
  kfintechRecordCount: number;
  totalFoliosCount: number;
  totalSchemesCount: number;
  activeHoldingsCount: number; // AUM > 0
  zeroBalanceCount: number;   // AUM == 0
  records: InvestmentRecord[];
}

export interface DashboardMetrics {
  totalClients: number;
  totalAum: number;
  camsAum: number;
  kfintechAum: number;
  camsClientsCount: number;
  kfintechClientsCount: number;
  sharedClientsCount: number;
  totalSchemes: number;
  totalFolios: number;
  totalRecords: number;
  activeHoldingsCount: number;
}

export interface AmcSummary {
  amcName: string;
  clientsCount: number;
  schemesCount: number;
  totalAum: number;
  camsAum: number;
  kfintechAum: number;
}

export interface SchemeSummary {
  schemeName: string;
  amcName: string;
  clientsCount: number;
  totalAum: number;
  source: DataSource | 'BOTH';
}

export interface ParsedCsvResult {
  source: DataSource;
  fileName: string;
  records: InvestmentRecord[];
  detectedHeaders: string[];
  rawRowCount: number;
  validRowCount: number;
  invalidRowCount: number;
  uniqueClientsCount: number;
  totalAum: number;
  asOfDate?: string;
  sampleRows: InvestmentRecord[];
  errors: string[];
  warnings: string[];
}
