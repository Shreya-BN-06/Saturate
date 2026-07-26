# Project Report: Saturate — India IT Freelance Market Dashboard

**Project URL:** https://shreya-bn-06.github.io/Saturate/
**Data Period:** Q1 2026 (January – March 2026)
**Submitted by:** Shreya B N

---

## 1. Executive Summary

Saturate is an interactive web dashboard that quantifies freelance market opportunity across India's top 10 IT cities and 10 high-demand roles. It addresses a real gap in how freelancers and businesses currently make location and specialization decisions — most rely on raw job counts from job boards (which ignore workforce density) or raw salary figures (which ignore market saturation). Saturate combines these dimensions into a single, transparent, formula-derived **Final Score** that identifies genuine opportunity gaps: markets where skilled freelancers are undersupplied, rates are competitive, and demand is active.

The project is built entirely as a client-side web application with no backend server, using a manually-maintained dataset sourced from published public reports and a Python data-processing pipeline.

---

## 2. Problem Statement

India's IT freelance sector is growing rapidly, yet professionals and businesses lack accessible, quantitative tools to compare opportunity across cities and roles simultaneously. Existing tools present either:

- **Raw job counts** — which inflate apparent opportunity in large cities like Bengaluru simply because of city size, not genuine demand-to-supply ratio
- **Raw salary data** — which doesn't account for how many other freelancers are competing for the same listings
- **Anecdotal advice** — city X is "better" for role Y without data backing it

No publicly available tool scores cities and roles together on a normalized basis that accounts for local IT workforce size, rate competitiveness, and market saturation simultaneously.

---

## 3. Objectives

- Design a quantitative scoring model that combines workforce density, rate affordability, and market saturation into a single comparable metric
- Build an interactive dashboard that makes these scores explorable without requiring technical knowledge
- Source data exclusively from publicly available, officially sanctioned sources without automated scraping of job platforms
- Enable the dataset to be refreshed quarterly via CSV upload, decoupling the tool from any proprietary data dependency
- Provide actionable outputs for two distinct user groups: freelancers (where to work) and businesses (where to hire)

---

## 4. Methodology

### 4.1 Data Collection

Data was collected from three publicly available, non-scraped sources:

- **IT Workforce:** NASSCOM Annual Strategic Review (Feb 2025) — total 5.8M IT workforce; city shares from NASSCOM Tech Talent Report / JM Financial (2024)
- **Freelance Job Counts:** Manually derived from public Naukri.com search result counts, applying a 5–7% freelance filter rate, cross-validated against CBRE's city distribution analysis (Feb 2026)
- **Hourly Rates:** Blended mid-senior freelance rates individually sourced per city × role from karboncard.com, SalaryExpert, igmguru, Glassdoor India, fueler.io, and abbacustechnologies (2025–2026)

All data was collected manually with no automated scraping, keeping the project fully within the Terms of Service of all referenced platforms.

### 4.2 Scoring Formula

The Final Score is computed from three sequential metrics:

**Step 1 — Jobs Per 100K Workforce**
```
Jobs_Per_100K = (Jobs_Available / IT_Workforce) × 100,000
```
Normalizes raw job counts to the local IT workforce size, enabling fair comparison between large cities (Bengaluru, 1.5M workforce) and smaller hubs (Kochi, 87K workforce).

**Step 2 — Rate Affordability**
```
Rate_Affordability = 10,000 / Avg_Hourly_Rate_INR
```
An inverse of the hourly rate. Lower rates produce higher affordability scores. This captures the cost-competitiveness of a market for businesses hiring, or the accessible pricing tier a freelancer must position within.

**Step 3 — Saturation Adjustment**
```
Saturation_Adjustment = 150 / Jobs_Per_100K
```
Rewards markets where listings are relatively sparse compared to the available workforce (under-served), and penalizes markets where listings are dense (over-saturated). Since Jobs_Per_100K is a decimal proportion, this adjustment reliably produces values in the 1.0–5.0 range.

**Final Score**
```
Final_Score = Rate_Affordability × Saturation_Adjustment
```

**Formula Validation**
The formula was validated against a worked manual example before implementation to ensure the code exactly reproduces expected outputs:

| Input | Value |
|---|---|
| City | Bengaluru |
| Jobs Available | 2,100 |
| IT Workforce | 1,800,000 |
| Avg Hourly Rate | ₹950/hr |

| Step | Calculation | Result |
|---|---|---|
| Jobs/100K | (2100 / 1800000) × 100000 | 116.7 |
| Rate Affordability | 10000 / 950 | 10.53 |
| Saturation Adjustment | 150 / 116.7 | 1.29 |
| Final Score | 10.53 × 1.29 | **13.58 ✓** |

**Score Bands**

| Band | Threshold | Interpretation |
|---|---|---|
| 🟢 High Yield | ≥ 20 | Under-served market, competitive rates — strong opportunity |
| 🟡 Moderate | 15–20 | Viable opportunity — some competition, fair rates |
| 🔴 Saturated | < 15 | High competition or high rates limit freelance opportunity |

---

## 5. System Design

### 5.1 Architecture

Saturate is intentionally designed as a fully client-side application with no server dependency. All data lives in `data.js` as a JavaScript object literal, and all scoring, filtering, and rendering happens in the browser.

```
FR.py (Python research + formula validation)
  ↓
data.js (Q1 2026 dataset: CITIES, ROLES, JOBS, RATES)
  ↓
app.js (computeMarketScores() → calculatedRecords[])
  ↓
index.html + style.css (heatmap, wizard, benchmarking, alerts)
```

This architecture has three intentional benefits:
- Zero infrastructure cost (hosted on GitHub Pages, free)
- No data privacy concerns (no user data ever leaves the browser)
- Quarterly data updates require only a CSV upload, not a deployment

### 5.2 Key Components

**Data Pipeline (Freelance.py)**
A Python script that codifies the research methodology, calculates all 100 city × role scores, and exports the CSV. Serves as the authoritative record of the data derivation and formula, independent of the frontend.

**Scoring Engine (app.js: `computeMarketScores()`)**
Rebuilds `calculatedRecords` from `simulatedData` (a deep clone of `freelanceData`) on every refresh. The same function is called by the initial page load, the market simulator, and the quarterly CSV upload — ensuring scoring logic is defined once and executed identically everywhere.

**Quarterly CSV Upload**
A client-side file parser that accepts CSVs with headers `City, State, IT_Workforce, Role, Jobs_Available, Avg_Hourly_Rate_INR`. On upload, it rebuilds `simulatedData`, calls `computeMarketScores()`, and re-renders all tabs. A reset button restores the original baseline.

### 5.3 Frontend Design

The interface uses a **dark glassmorphism** design system with a financial terminal aesthetic:
- CSS custom properties for full light/dark theme switching
- JetBrains Mono for all numeric values (rates, scores, job counts) to improve scannability
- Glowing color-coded score cells using `color-mix()` against theme variables
- Subtle grain texture overlay to add material depth to glass panels

---

## 6. Features Delivered

| Feature | Description |
|---|---|
| City × Role Heatmap | 10×10 interactive matrix, filterable by state/score/jobs/rate |
| Formula Modal | Full step-by-step score calculation breakdown per cell |
| Location Wizard | Role-based city ranking with geographic arbitrage recommendation |
| Rate Benchmarking | Personal rate vs. city average with national distribution chart |
| Saved Watchlist | Up to 3 city-role comparisons side-by-side |
| Market Alerts | Custom threshold triggers on score/rate/jobs |
| Market Simulator | Real-time what-if scenario adjustment |
| Quarterly CSV Upload | Full dashboard refresh without code changes |
| Light/Dark Theme | Full theme toggle persisted per session |

---

## 7. Results & Insights (Q1 2026 Baseline)

Key findings from the Q1 2026 dataset:

**Highest-scoring combinations (🟢 High Yield):**
Tier-2 cities consistently outperform metros for roles like Graphic Designer, Data Scientist, and Technical Lead — lower job density relative to the workforce creates favorable saturation adjustments that offset the lower absolute rates.

**Lowest-scoring combinations (🔴 Saturated):**
AI Engineer in Bengaluru, Mumbai, and Delhi NCR scores poorly despite high rates — the combination of high rates (lowering Rate Affordability) and dense listings (lowering Saturation Adjustment) compresses the final score significantly.

**Geographic arbitrage finding:**
A Python Developer in Kochi or Coimbatore scores comparably to Pune or Chennai, at 30-35% lower rates — meaningful for clients sourcing talent cost-effectively and for freelancers targeting less competitive markets.

---

## 8. Limitations

- **Freelance job count estimation:** Naukri does not publicly expose freelance-specific listing counts via an official API. Counts are estimated by applying a 5-7% freelance filter rate to total listing volumes, cross-validated against CBRE's published city distribution data. This introduces a margin of error that would be reduced if official API access were available.
- **Static workforce figures:** NASSCOM publishes city-level workforce data annually. The 5.8M total and city shares used here are from February 2025 and will require updating when NASSCOM's next Strategic Review is published.
- **Snapshot data:** The Q1 2026 dataset is a point-in-time snapshot. Job markets shift continuously; the dashboard is designed for quarterly refreshes, not real-time tracking.
- **10-city scope:** India has dozens of emerging IT hubs (Indore, Nagpur, Visakhapatnam, etc.) not covered in this version.

---

## 9. Future Scope

- Integration with Adzuna's official Job Search API (India: country code `in`) for automated weekly job count and salary histogram refreshes — fully sanctioned and compliant with Adzuna's published API terms
- Expansion to 20+ cities including tier-2 emerging hubs flagged by NASSCOM's Emerging Tech Cities report
- Trend-over-time charts once multiple quarterly CSV uploads have been collected
- Role-specific sub-scoring (e.g. separating AI Engineer into LLM/MLOps/CV sub-roles)
- A Python FastAPI backend for multi-user saved watchlists and alert notifications via email

---

## 10. Tech Stack Summary

| Component | Technology |
|---|---|
| Data pipeline | Python 3, pandas |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Typography | Plus Jakarta Sans, Outfit, JetBrains Mono |
| Hosting | GitHub Pages |
| Version control | Git |
| Backend | None (fully client-side) |

---

## 11. References

- NASSCOM Annual Strategic Review 2025, published February 24, 2025 (via BusinessToday / IBTimes)
- NASSCOM Tech Talent Report, JM Financial, 2024
- CBRE India AI Jobs Report, careers360.com, February 18, 2026
- Naukri JobSpeak Index, January 2026
- karboncard.com — Freelance Hourly Rate Guide India, 2026
- SalaryExpert — Cloud Engineer India, March 2026
- igmguru — City-wise DevOps/AI Salary Report, December 2025
- abbacustechnologies.com — IT Hiring Cost Guide, December 2025
- fueler.io — Freelance Developer Rate Report, October 2025
- Glassdoor India — Role-wise Salary Data, February 2026
- Quess Corp — IT Hiring Report, December 2025
- IBEF — Information Technology Sector Report, 2025

---

## 12. Conclusion

Saturate demonstrates that a meaningful, analytically rigorous market intelligence tool can be built without scraping, without a backend, and without proprietary data access — using publicly available reports, a carefully designed scoring formula, and a fully client-side architecture. The resulting dashboard is transparent in its methodology (every cell's score can be traced to its exact calculation steps), safe in its data sourcing (no ToS violations), and practical in its maintenance (quarterly refresh via a single CSV upload).

The project reflects competencies across the full stack: research methodology and data ethics, formula design and validation, Python data processing, frontend engineering, and product thinking around two distinct user groups with different goals from the same dataset.

---

*Dashboard live at: https://shreya-bn-06.github.io/Saturate/*
*Data period: Q1 2026 (January – March 2026)*
