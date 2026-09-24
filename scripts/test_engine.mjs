import fs from 'fs';
import { parseInvestmentCsv } from '../src/lib/csvParser.ts';
import { groupRecordsByClient } from '../src/lib/clientMatcher.ts';
import { extractAmcName } from '../src/lib/amcHelper.ts';

async function runTests() {
  console.log("=== STARTING FULL ENGINE VERIFICATION TESTS ===");

  const camsCsv = fs.readFileSync('sample_data/cams_sample.csv', 'utf8');
  const kfinCsv = fs.readFileSync('sample_data/kfintech_sample.csv', 'utf8');

  // Test 1: Parse CAMS
  console.log("\n[Test 1] Parsing CAMS CSV...");
  const camsResult = await parseInvestmentCsv(camsCsv, 'cams_sample.csv', 'CAMS');
  console.log(`  Source: ${camsResult.source}`);
  console.log(`  Detected Headers: ${camsResult.detectedHeaders.length}`);
  console.log(`  Valid Records: ${camsResult.validRowCount} / ${camsResult.rawRowCount}`);
  console.log(`  Unique Clients: ${camsResult.uniqueClientsCount}`);
  console.log(`  Total AUM: ₹${camsResult.totalAum.toLocaleString('en-IN')}`);
  console.log(`  Errors: ${camsResult.errors.length}`);
  if (camsResult.validRowCount !== 302) {
    throw new Error(`Expected 302 CAMS records, got ${camsResult.validRowCount}`);
  }

  // Test 2: Parse KFintech
  console.log("\n[Test 2] Parsing KFintech CSV...");
  const kfinResult = await parseInvestmentCsv(kfinCsv, 'kfintech_sample.csv', 'KFINTECH');
  console.log(`  Source: ${kfinResult.source}`);
  console.log(`  Detected Headers: ${kfinResult.detectedHeaders.length}`);
  console.log(`  Valid Records: ${kfinResult.validRowCount} / ${kfinResult.rawRowCount}`);
  console.log(`  Unique Clients: ${kfinResult.uniqueClientsCount}`);
  console.log(`  Total AUM: ₹${kfinResult.totalAum.toLocaleString('en-IN')}`);
  console.log(`  Errors: ${kfinResult.errors.length}`);
  if (kfinResult.validRowCount !== 32) {
    throw new Error(`Expected 32 KFintech records, got ${kfinResult.validRowCount}`);
  }

  // Test 3: Consolidated Client Matching
  console.log("\n[Test 3] Testing Client Cross-Source Matching & Portfolio Consolidation...");
  const allRecords = [...camsResult.records, ...kfinResult.records];
  const clients = groupRecordsByClient(allRecords);
  console.log(`  Total Consolidated Clients: ${clients.length}`);

  const crossSourceClients = clients.filter(c => c.sources.includes('CAMS') && c.sources.includes('KFINTECH'));
  console.log(`  Clients holding positions across BOTH CAMS & KFintech: ${crossSourceClients.length}`);

  crossSourceClients.forEach(c => {
    console.log(`    - ${c.primaryName}: CAMS=₹${c.camsAum.toLocaleString('en-IN')}, KFintech=₹${c.kfintechAum.toLocaleString('en-IN')}, Total=₹${c.totalAum.toLocaleString('en-IN')} (${c.totalSchemesCount} schemes)`);
  });

  if (crossSourceClients.length < 10) {
    throw new Error(`Expected at least 10 cross-source matched clients, got ${crossSourceClients.length}`);
  }

  // Test 4: AMC Extraction Coverage
  console.log("\n[Test 4] Testing AMC Extraction Coverage...");
  const unmappedSchemes = allRecords.filter(r => !r.amc || r.amc === 'Other Mutual Fund');
  console.log(`  Total Records: ${allRecords.length}`);
  console.log(`  Unmapped Schemes: ${unmappedSchemes.length}`);
  if (unmappedSchemes.length > 0) {
    console.warn("  Unmapped:", unmappedSchemes.map(r => r.scheme));
  }

  // Test 5: Verify AUM Math
  console.log("\n[Test 5] Verifying Total Value Math...");
  const totalCalculatedAum = clients.reduce((acc, c) => acc + c.totalAum, 0);
  const expectedTotalAum = camsResult.totalAum + kfinResult.totalAum;
  const diff = Math.abs(totalCalculatedAum - expectedTotalAum);
  console.log(`  Clients Sum AUM: ₹${totalCalculatedAum.toFixed(2)}`);
  console.log(`  Direct Sum AUM:  ₹${expectedTotalAum.toFixed(2)}`);
  console.log(`  Difference: ₹${diff.toFixed(2)}`);
  if (diff > 1.0) {
    throw new Error(`AUM discrepancy detected: ${diff}`);
  }

  console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
