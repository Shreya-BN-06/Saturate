# Saturate — India IT Freelance Market Dashboard

> \*\*Live Dashboard →\*\* \[shreya-bn-06.github.io/Saturate](https://shreya-bn-06.github.io/Saturate/)

A quantitative, data-driven dashboard that scores India's IT freelance market across **10 cities × 10 roles** using a custom opportunity-scoring formula. Built to help freelancers identify under-served markets and help businesses find affordable, available talent — without relying on gut feel or raw job counts alone.

\---

## What It Does

Most freelance market tools show you either raw job counts (which ignore workforce density) or raw rates (which ignore competition). Saturate combines both into a single **Final Score** that surfaces genuine opportunity gaps — cities and roles where demand is real, rates are competitive, and the market isn't yet flooded.

\---

## Features

### 📍 City × Role Heatmap

An interactive matrix of all 10 cities × 10 roles, color-coded by Final Score. Filter by state, sort by score/jobs/rate. Hover any cell for a live stats tooltip. Click any cell to open a full formula breakdown modal showing the exact calculation steps.

### 🧙 "Where Should I Work From?" Wizard

Input your role and current city. The wizard ranks all 10 cities by opportunity score for your role and identifies geographic arbitrage — cities where your skills are undersupplied relative to the local IT workforce.

### 💰 Rate Benchmarking Tool

Enter your role, city, and current hourly rate. The tool tells you whether you're undercharging, competitive, or premium against the city average, with a national rate distribution chart across all cities.

### 💾 Saved Comparisons Watchlist

Save up to 3 city-role combinations and compare them side-by-side on key metrics: jobs available, hourly rate, Jobs/100K, saturation adjustment, and final score.

### 🔔 Market Alert System

Configure custom triggers: get notified when a job count, rate, or score crosses a threshold during a market simulation run. Useful for tracking shifts in a specific city-role you're monitoring.

### 📂 Quarterly CSV Upload

Upload a new quarter's data via CSV to refresh the entire dashboard without touching any code. The file is parsed client-side, scores are recomputed live in the browser, and every tab re-renders instantly. A "Reset to Baseline" option restores the original Q1 2026 dataset.

### 🔄 Market Simulator

Adjust market conditions (job count shifts, rate changes) and see the heatmap recolor in real time — useful for "what-if" analysis.

\---

## Scoring Formula

```
Jobs\_Per\_100K      = (Jobs\_Available / IT\_Workforce) × 100,000
Rate\_Affordability = 10,000 / Avg\_Hourly\_Rate\_INR
Saturation\_Adj     = 150 / Jobs\_Per\_100K
Final\_Score        = Rate\_Affordability × Saturation\_Adjustment
```

**Verified example — Bengaluru, AI Engineer:**

```
Jobs = 1,172 | Workforce = 1,508,000 | Rate = ₹3,200/hr
Jobs/100K  = (1172 / 1508000) × 100000 = 77.72
Rate\_Aff   = 10000 / 3200              = 3.1250
Sat\_Adj    = 150 / 77.72               = 1.9300
Score      = 3.1250 × 1.9300           = 6.03  🔴
```

|Score Band|Threshold|Meaning|
|-|-|-|
|🟢 High Yield|≥ 20|Strong opportunity — affordable, under-served|
|🟡 Moderate|15 – 20|Viable — some competition, fair rates|
|🔴 Saturated|< 15|High competition or high rates limit opportunity|

\---

## Cities \& Roles Covered

**Cities (NASSCOM FY2025 workforce figures):**
Bengaluru · Mumbai · Delhi NCR · Hyderabad · Pune · Chennai · Kolkata · Ahmedabad · Coimbatore · Kochi

**Roles:**
Python Developer · AI Engineer · Full Stack Developer · UI/UX Designer · Data Scientist · Graphic Designer · Web Developer · Cloud Engineer · Technical Lead · DevOps Engineer

\---

## Data Sources

|Data|Source|
|-|-|
|IT Workforce by city|NASSCOM Annual Strategic Review, Feb 2025 (5.8M total; city % shares from NASSCOM Tech Talent Report / JM Financial, 2024)|
|Freelance job counts|Manually derived from public Naukri.com search result counts + CBRE city distribution report (Feb 2026)|
|Hourly rates|karboncard.com (2026), SalaryExpert (Mar 2026), igmguru (Dec 2025), abbacustechnologies (Dec 2025), fueler.io (Oct 2025), Glassdoor (Feb 2026)|

**No data in this project is collected by automated scraping of Naukri.com or LinkedIn.com.** All job counts and rates were manually researched from public search results and published salary reports. Data is updated manually each quarter via the CSV upload feature.

\---

## CSV Upload Format

To upload a quarterly update, prepare a CSV with these exact column headers:

```
City,State,IT\_Workforce,Role,Jobs\_Available,Avg\_Hourly\_Rate\_INR
```

The dashboard recomputes all scores live in the browser upon upload. No backend, no server, no deployment step required.

\---

## Tech Stack

|Layer|Technology|
|-|-|
|Data pipeline|Python, pandas|
|Frontend|Vanilla HTML5, CSS3, JavaScript (ES6+)|
|Fonts|Plus Jakarta Sans, Outfit, JetBrains Mono (Google Fonts)|
|Charts|Vanilla Canvas / CSS|
|Hosting|GitHub Pages|
|No backend|All scoring computed client-side in the browser|

\---

## Project Structure

```
Saturate/
├── index.html        Main dashboard shell
├── style.css         Full design system (glassmorphism + terminal aesthetic)
├── app.js            All rendering, formula logic, interactivity
├── data.js           Q1 2026 baseline dataset (cities, jobs, rates)
└── Freelance.py             Data research + formula validation script (Python)
```

\---

## Running Locally

```bash
git clone https://github.com/shreya-bn-06/Saturate.git
cd Saturate
# Open index.html in any modern browser — no build step, no dependencies
open index.html
```

\---

## Author

**Shreya B N**
[GitHub](https://github.com/shreya-bn-06)

