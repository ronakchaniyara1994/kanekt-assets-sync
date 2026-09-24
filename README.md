# Kanekt Assets — Local Mutual Fund Client Investment Tracker

A professional, local-first web application designed for mutual fund distributors and financial advisors to import, consolidate, and analyze client investment data from **CAMS** and **KFintech** CSV holding statements.

---

## 🔍 Structural Analysis of CAMS & KFintech CSVs

Before building this application, a thorough structural analysis of the reference CSV files was conducted:

| Attribute | CAMS Reference File | KFintech Reference File |
| :--- | :--- | :--- |
| **Row Count** | 302 holding positions | 32 holding positions |
| **Columns** | 15 columns | 30 columns |
| **True Data Grain** | **Point-in-Time Folio-Scheme Holding Position** | **Point-in-Time Folio-Scheme Holding Position** |
| **Primary Financial Metric** | `CLOSING_ASSETS` (= `UNITS * NAV`) | `AUM` (= `Balance * NAV`) |
| **Value Meaning** | **Current Market Value / AUM in INR** | **Current Market Value / AUM in INR** |
| **Invested Amount** | Absent in holding export | Absent in holding export |
| **Client Matching** | Exact normalized name + Token Set Inversion match | Exact normalized name + Token Set Inversion match |
| **AMC Detection** | Extracted from `SCHEME_NAME` / `PRODUCT` | Extracted from `Fund Description` / `Fund` |

*Note: Neither file contains historical transaction entries or purchase costs. To maintain financial accuracy, all figures represent actual AUM (Current Market Value); fake invested amounts or returns are never fabricated.*

---

## 🚀 Key Features

1. **Independent Upload & Replacement**:
   - Separate upload cards for CAMS and KFintech.
   - Replacing CAMS updates only CAMS; KFintech remains untouched (and vice versa).
   - Validation and Import Preview with detected columns and parsed rows before committing.
   - Built-in **"Load Sample Data"** 1-click test button preloaded with the reference datasets.

2. **Unified Investment Dashboard**:
   - **Total Current Value (AUM)**, **Total Clients**, **Total Schemes**, and **Folios**.
   - **RTA Source Breakdown**: Visual Donut chart and percentage split between CAMS and KFintech.
   - **Top Clients Card**: Ranked by total AUM with source tags and 1-click portfolio drill-down.
   - **Top Schemes Card**: Largest scheme exposures across both RTAs.
   - **AMC Breakdown Table**: Summary of clients, schemes, and AUM by fund house.

3. **Clients & Portfolios Module**:
   - Filter tabs: `[ All Clients ]`, `[ CAMS ]`, `[ KFintech ]`.
   - Real-time search across client names, PANs, cities, folios, and scheme names.
   - Multi-filter support (by AMC, zero-balance toggle, AUM sorting).
   - Comprehensive **Client Portfolio Modal**: drill down into any client to see their holdings across CAMS and KFintech with units, NAV, AUM, and folio numbers.
   - Filtered CSV Export for client lists.

4. **100% Privacy & Local Storage**:
   - IndexedDB powered by **Dexie.js**.
   - Zero cloud databases, zero external APIs, zero server uploads. All data remains in your local browser.
   - Backup & Restore: Export and restore complete application state via JSON.

---

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite 6
- **Styling**: Tailwind CSS (light financial theme, clean typography)
- **Local Database**: IndexedDB via Dexie.js
- **CSV Parser**: Papa Parse
- **Charts**: Recharts
- **Icons**: Lucide React

---

## 💻 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

### 2. Build for Production
```bash
npm run build
npm run preview
```

### 3. Run Automated Engine Tests
```bash
npx tsx scripts/test_engine.mjs
```
