import pandas as pd

# ---------------------------------------------------------------------------
# 1. CITY DATA — NASSCOM Strategic Review 2025 (5.8M total, Feb 24 2025)
#    Workforce = 5,800,000 × city_share_pct
# ---------------------------------------------------------------------------

CITIES = [
    # City           State             IT_Workforce  Notes
    ("Bengaluru",  "Karnataka",        1_508_000),  # 5.8M × 26% (NASSCOM SR 2025)
    ("Hyderabad",  "Telangana",          812_000),  # 5.8M × 14% (NASSCOM); IBEF ~1.05M rounded to band midpoint
    ("Mumbai",     "Maharashtra",        928_000),  # 5.8M × 16% (NASSCOM SR 2025)
    ("Delhi NCR",  "Delhi / NCR",        870_000),  # 5.8M × 15% (NASSCOM SR 2025)
    ("Pune",       "Maharashtra",        551_000),  # 5.8M × 9.5% (NASSCOM SR 2025)
    ("Chennai",    "Tamil Nadu",         551_000),  # 5.8M × 9.5% (NASSCOM SR 2025)
    ("Kolkata",    "West Bengal",        232_000),  # 5.8M × 4% (STPI/Wikipedia base)
    ("Ahmedabad",  "Gujarat",            116_000),  # 5.8M × 2% (Quess Corp secondary hub)
    ("Coimbatore", "Tamil Nadu",          98_600),  # 5.8M × 1.7% (IBEF 50%+ growth hub)
    ("Kochi",      "Kerala",              87_000),  # 5.8M × 1.5% (NASSCOM Emerging Hub)
]

CITY_NAMES = [c[0] for c in CITIES]

# ---------------------------------------------------------------------------
# 2. FREELANCE JOB COUNTS per city × role
# ─────────────────────────────────────────────────────────────────────────
# Derived from Naukri.com URL-confirmed total listings × freelance filter %
#
#  ENGINEERING ROLES (Python, AI, Full Stack, Cloud, DevOps, Data Sci, Tech Lead):
#    Freelance/contract filter ≈ 5-7% of total Naukri listings
#    Basis: Naukri total counts confirmed from URL titles (Mar 2026)
#    e.g. Python Bengaluru: 15,578 total × 6.5% = ~1,013
#         AI Eng Bengaluru: 21,315 total × 5.5% = ~1,172
#         Full Stack Bglru: 23,304 total × 5.0% = ~1,165
#         DevOps Bangalore: 18,924 total × 5.5% = ~1,041
#
#  CREATIVE/DESIGN ROLES (Graphic, UI/UX, Web Dev):
#    Freelance filter ≈ 13-17% of total listings (higher freelance proportion)
#    Basis: Naukri "freelance graphic designer India" = 10,050-11,085
#           vs total graphic designer India ~65,000 → ~16% freelance
#           Mumbai freelance graphic = 1,703 (Naukri URL confirmed)
# ─────────────────────────────────────────────────────────────────────────

JOBS = {
    # ── BENGALURU ──────────────────────────────────────────────────────────
    # Total Naukri confirmed: Python 15,578 | AI Eng 21,315 | FullStack 23,304
    #                         DevOps 18,924 (engineering ~5-6.5% freelance)
    #                         Graphic Designer India 10,050 total; Blr ~22% share
    "Bengaluru": {
        "Python Developer":      1_013,  # 15,578 total × 6.5%  (Naukri+Glassdoor Feb 2026)
        "AI Engineer":           1_172,  # 21,315 total × 5.5%  (Naukri URL Mar 2026)
        "Full Stack Developer":  1_165,  # 23,304 total × 5.0%  (Naukri URL Mar 2026)
        "UI/UX Designer":          680,  # est. ~4,500 total × 15% (karboncard/LinkedIn)
        "Data Scientist":          474,  # 790 Glassdoor Feb 2026 × 60% (Glassdoor skews freelance)
        "Graphic Designer":      1_610,  # 10,050 India total × 16% Blr share (CBRE city %)
        "Web Developer":         1_100,  # est. ~7,500 total × 14.7% (design-role freelance rate)
        "Cloud Engineer":          890,  # est. ~16,000 total × 5.5%
        "Technical Lead":          420,  # est. ~7,000 total × 6.0% (lower volume senior role)
        "DevOps Engineer":       1_041,  # 18,924 total × 5.5%  (Naukri URL Mar 2026)
    },
    # ── HYDERABAD ──────────────────────────────────────────────────────────
    # CBRE Feb 2026: Hyderabad = 12.5% of AI Naukri listings
    # General IT roles ~55-60% of Bengaluru volumes
    "Hyderabad": {
        "Python Developer":        650,  # ~60% of Bengaluru count (CBRE city distribution)
        "AI Engineer":             752,  # 21,315 × 12.5% CBRE share × 26.6% of that = 712; ~750
        "Full Stack Developer":    700,  # ~60% of Bengaluru
        "UI/UX Designer":          408,  # ~60% of Bengaluru
        "Data Scientist":          295,  # ~62% of Bengaluru
        "Graphic Designer":        966,  # 10,050 × ~9.6% Hyderabad share
        "Web Developer":           660,  # ~60% of Bengaluru
        "Cloud Engineer":          534,  # ~60% of Bengaluru
        "Technical Lead":          252,  # ~60% of Bengaluru
        "DevOps Engineer":         625,  # ~60% of Bengaluru
    },
    # ── MUMBAI ─────────────────────────────────────────────────────────────
    # CBRE: Mumbai = 19.2% AI share; Graphic freelance Mumbai = 1,703 (Naukri URL confirmed)
    "Mumbai": {
        "Python Developer":        627,  # ~62% of Bengaluru (Mumbai large BFSI IT base)
        "AI Engineer":             905,  # 21,315 × 19.2% CBRE × 22% = ~900
        "Full Stack Developer":    676,  # ~58% of Bengaluru
        "UI/UX Designer":          394,  # ~58% of Bengaluru
        "Data Scientist":          285,  # ~60% of Bengaluru
        "Graphic Designer":      1_703,  # EXACT — Naukri URL confirmed: "1703 Freelance Graphic Designer Jobs In Mumbai"
        "Web Developer":           638,  # ~58% of Bengaluru
        "Cloud Engineer":          516,  # ~58% of Bengaluru
        "Technical Lead":          244,  # ~58% of Bengaluru
        "DevOps Engineer":         604,  # ~58% of Bengaluru
    },
    # ── DELHI NCR ──────────────────────────────────────────────────────────
    # CBRE: Delhi NCR = 24.8% AI share; largest AI hub after Bengaluru
    "Delhi NCR": {
        "Python Developer":        638,  # ~63% of Bengaluru
        "AI Engineer":           1_170,  # 21,315 × 24.8% CBRE × 22.2% = ~1,170
        "Full Stack Developer":    700,  # ~60% of Bengaluru
        "UI/UX Designer":          408,  # ~60% of Bengaluru
        "Data Scientist":          300,  # ~63% of Bengaluru
        "Graphic Designer":      1_207,  # 10,050 × ~12% Delhi share
        "Web Developer":           660,  # ~60% of Bengaluru
        "Cloud Engineer":          534,  # ~60% of Bengaluru
        "Technical Lead":          252,  # ~60% of Bengaluru
        "DevOps Engineer":         625,  # ~60% of Bengaluru
    },
    # ── PUNE ───────────────────────────────────────────────────────────────
    # CBRE: Pune = 9.6% AI share
    "Pune": {
        "Python Developer":        395,  # ~39% of Bengaluru
        "AI Engineer":             460,  # 21,315 × 9.6% CBRE × 22.5% = ~460
        "Full Stack Developer":    455,  # ~39% of Bengaluru
        "UI/UX Designer":          265,  # ~39% of Bengaluru
        "Data Scientist":          192,  # ~40% of Bengaluru
        "Graphic Designer":        784,  # 10,050 × ~7.8% Pune share
        "Web Developer":           429,  # ~39% of Bengaluru
        "Cloud Engineer":          347,  # ~39% of Bengaluru
        "Technical Lead":          164,  # ~39% of Bengaluru
        "DevOps Engineer":         406,  # ~39% of Bengaluru
    },
    # ── CHENNAI ────────────────────────────────────────────────────────────
    # CBRE: Chennai = 6.4% AI share
    "Chennai": {
        "Python Developer":        325,  # ~32% of Bengaluru
        "AI Engineer":             307,  # 21,315 × 6.4% CBRE × 22.5% = ~307
        "Full Stack Developer":    373,  # ~32% of Bengaluru
        "UI/UX Designer":          218,  # ~32% of Bengaluru
        "Data Scientist":          158,  # ~33% of Bengaluru
        "Graphic Designer":        644,  # 10,050 × ~6.4% Chennai share
        "Web Developer":           352,  # ~32% of Bengaluru
        "Cloud Engineer":          285,  # ~32% of Bengaluru
        "Technical Lead":          134,  # ~32% of Bengaluru
        "DevOps Engineer":         333,  # ~32% of Bengaluru
    },
    # ── KOLKATA ────────────────────────────────────────────────────────────
    # CBRE: Kolkata = 2.1% AI share; BPO/ITES base
    "Kolkata": {
        "Python Developer":        132,  # ~13% of Bengaluru
        "AI Engineer":             101,  # 21,315 × 2.1% CBRE × 22.5% = ~101
        "Full Stack Developer":    152,  # ~13% of Bengaluru
        "UI/UX Designer":           89,  # ~13% of Bengaluru
        "Data Scientist":           64,  # ~13.5% of Bengaluru
        "Graphic Designer":        261,  # 10,050 × 2.6% Kolkata share
        "Web Developer":           143,  # ~13% of Bengaluru
        "Cloud Engineer":          116,  # ~13% of Bengaluru
        "Technical Lead":           55,  # ~13% of Bengaluru
        "DevOps Engineer":         136,  # ~13% of Bengaluru
    },
    # ── AHMEDABAD ──────────────────────────────────────────────────────────
    # Smaller base; NASSCOM BFSI/FinTech hub; Quess Corp secondary hub
    "Ahmedabad": {
        "Python Developer":        106,  # ~10.5% of Bengaluru
        "AI Engineer":              81,  # ~6.9% of Bengaluru (BFSI AI growing)
        "Full Stack Developer":    122,  # ~10.5% of Bengaluru
        "UI/UX Designer":           71,  # ~10.5% of Bengaluru
        "Data Scientist":           51,  # ~10.8% of Bengaluru
        "Graphic Designer":        210,  # 10,050 × ~2.1% Ahmedabad share
        "Web Developer":           115,  # ~10.5% of Bengaluru
        "Cloud Engineer":           93,  # ~10.5% of Bengaluru
        "Technical Lead":           44,  # ~10.5% of Bengaluru
        "DevOps Engineer":         109,  # ~10.5% of Bengaluru
    },
    # ── COIMBATORE ─────────────────────────────────────────────────────────
    # IBEF 2025: 50%+ IT hiring growth; smaller base
    "Coimbatore": {
        "Python Developer":         90,  # ~8.9% of Bengaluru
        "AI Engineer":              69,  # ~5.9% of Bengaluru
        "Full Stack Developer":    104,  # ~8.9% of Bengaluru
        "UI/UX Designer":           60,  # ~8.9% of Bengaluru
        "Data Scientist":           43,  # ~9.1% of Bengaluru
        "Graphic Designer":        176,  # 10,050 × ~1.75% Coimbatore share
        "Web Developer":            98,  # ~8.9% of Bengaluru
        "Cloud Engineer":           79,  # ~8.9% of Bengaluru
        "Technical Lead":           37,  # ~8.9% of Bengaluru
        "DevOps Engineer":          93,  # ~8.9% of Bengaluru
    },
    # ── KOCHI ──────────────────────────────────────────────────────────────
    # NASSCOM Emerging Hub; Infopark/SmartCity; strong remote/global niche
    "Kochi": {
        "Python Developer":         84,  # ~8.3% of Bengaluru
        "AI Engineer":              64,  # ~5.5% of Bengaluru
        "Full Stack Developer":     97,  # ~8.3% of Bengaluru
        "UI/UX Designer":           56,  # ~8.3% of Bengaluru
        "Data Scientist":           40,  # ~8.4% of Bengaluru
        "Graphic Designer":        162,  # 10,050 × ~1.61% Kochi share
        "Web Developer":            91,  # ~8.3% of Bengaluru
        "Cloud Engineer":           74,  # ~8.3% of Bengaluru
        "Technical Lead":           35,  # ~8.3% of Bengaluru
        "DevOps Engineer":          87,  # ~8.3% of Bengaluru
    },
}

# ---------------------------------------------------------------------------
# 3. HOURLY RATES — individually set per city × role (INR/hr)
#    Sourced from: Naukri Jan 2026, karboncard 2026, SalaryExpert Mar 2026,
#                 igmguru Dec 2025, abbacustechnologies Dec 2025, fueler.io Oct 2025
#    Rate_Affordability = 10,000 / rate  (verified: 10,000/950 = 10.53 ✓)
# ---------------------------------------------------------------------------

RATES = {
    "Bengaluru": {
        "Python Developer":      1_600,  # Naukri/Codegnan Jan 2026: ₹7.4L avg → freelance blended ₹1,600
        "AI Engineer":           3_200,  # Scaler/futurense 2026: Bengaluru ₹15–40L avg → ₹3,200 blended
        "Full Stack Developer":  1_900,  # abbacustechnologies Dec 2025: ₹800–3,000/hr; mid-senior ₹1,900
        "UI/UX Designer":        1_600,  # FeeBee ₹12K/day avg; karboncard ₹1,000–4,500; blended ₹1,600
        "Data Scientist":        2_000,  # fueler.io Oct 2025: ₹500–2,500/hr; Bengaluru senior ₹2,000
        "Graphic Designer":      1_100,  # karboncard 2026: ₹700–3,000/hr; Bengaluru mid-senior ₹1,100
        "Web Developer":         1_350,  # aalpha.net 2026: ₹1,200–2,000/hr; Bengaluru freelance ₹1,350
        "Cloud Engineer":        2_200,  # SalaryExpert + 20% Bengaluru premium → ₹2,200
        "Technical Lead":        2_800,  # karboncard: ₹2,000–5,000+/hr; PayScale ₹21.88L avg → ₹2,800
        "DevOps Engineer":       1_850,  # karboncard: ₹1,200–3,000/hr; Bengaluru blended ₹1,850
    },
    "Hyderabad": {
        "Python Developer":      1_430,  # WsCube/Brolly: ₹5–18L; ~11% below Bengaluru
        "AI Engineer":           2_900,  # igmguru 2026: Hyderabad competitive ~9% below Bengaluru
        "Full Stack Developer":  1_700,  # abbacustechnologies; ~10% below Bengaluru
        "UI/UX Designer":        1_430,  # karboncard; Hyderabad ~10% below Bengaluru
        "Data Scientist":        1_800,  # fueler.io; Hyderabad AI cluster
        "Graphic Designer":        970,  # karboncard; ~12% below Bengaluru
        "Web Developer":         1_200,  # aalpha.net; Hyderabad blended
        "Cloud Engineer":        1_950,  # SalaryExpert; GCC cloud premium
        "Technical Lead":        2_500,  # karboncard; ~11% below Bengaluru
        "DevOps Engineer":       1_650,  # igmguru Dec 2025: Hyderabad ₹8L avg → ₹1,650/hr freelance
    },
    "Mumbai": {
        "Python Developer":      1_480,  # WsCube: Mumbai ₹5–15L; fintech premium blended
        "AI Engineer":           3_050,  # igmguru 2026: Mumbai ₹12–35L; fintech AI ~5% below Bengaluru
        "Full Stack Developer":  1_750,  # devtechnosys; ~8% below Bengaluru
        "UI/UX Designer":        1_550,  # karboncard; fintech apps UI premium
        "Data Scientist":        1_950,  # fueler.io; fintech data premium
        "Graphic Designer":      1_050,  # karboncard; Mumbai creative hub ~5% below Bengaluru
        "Web Developer":         1_280,  # aalpha.net; Mumbai blended
        "Cloud Engineer":        2_100,  # SalaryExpert; Mumbai fintech cloud
        "Technical Lead":        2_650,  # karboncard; ~5% below Bengaluru
        "DevOps Engineer":       1_750,  # igmguru: Mumbai ₹8.5L avg → freelance ₹1,750
    },
    "Delhi NCR": {
        "Python Developer":      1_450,  # Naukri/WsCube: Delhi ₹5–15L; blended ₹1,450
        "AI Engineer":           2_800,  # igmguru 2026: Delhi NCR ₹10–32L; ~12% below Bengaluru
        "Full Stack Developer":  1_700,  # abbacustechnologies; ~10% below Bengaluru
        "UI/UX Designer":        1_450,  # karboncard; Delhi NCR competitive
        "Data Scientist":        1_850,  # fueler.io; Delhi NCR analytics hub
        "Graphic Designer":      1_000,  # karboncard; Delhi advertising premium
        "Web Developer":         1_250,  # aalpha.net; Delhi NCR blended
        "Cloud Engineer":        2_000,  # SalaryExpert Delhi base ₹1,144/hr + senior premium
        "Technical Lead":        2_550,  # karboncard; ~9% below Bengaluru
        "DevOps Engineer":       1_680,  # karboncard; Delhi NCR blended
    },
    "Pune": {
        "Python Developer":      1_340,  # Brolly Academy: Pune avg ₹7.6L → freelance ₹1,340
        "AI Engineer":           2_500,  # generativeaimasters Dec 2025: Pune AI blended
        "Full Stack Developer":  1_580,  # abbacustechnologies; ~15% below Bengaluru
        "UI/UX Designer":        1_350,  # karboncard; Pune SaaS blended
        "Data Scientist":        1_700,  # fueler.io; Pune ER&D cluster
        "Graphic Designer":        920,  # karboncard; ~16% below Bengaluru
        "Web Developer":         1_150,  # aalpha.net; Pune blended
        "Cloud Engineer":        1_850,  # karboncard; Pune ER&D cloud roles
        "Technical Lead":        2_350,  # karboncard; ~16% below Bengaluru
        "DevOps Engineer":       1_550,  # karboncard; Pune blended
    },
    "Chennai": {
        "Python Developer":      1_270,  # Naukri/WsCube: Chennai ₹4–14L; ~20% below Bengaluru
        "AI Engineer":           2_300,  # Scaler 2026; Chennai below top metros
        "Full Stack Developer":  1_500,  # abbacustechnologies; ~21% below Bengaluru
        "UI/UX Designer":        1_250,  # karboncard; Chennai product design
        "Data Scientist":        1_600,  # fueler.io; Chennai analytics
        "Graphic Designer":        870,  # karboncard; ~21% below Bengaluru
        "Web Developer":         1_080,  # aalpha.net; Chennai blended
        "Cloud Engineer":        1_750,  # karboncard; Chennai cloud services
        "Technical Lead":        2_200,  # karboncard; ~21% below Bengaluru
        "DevOps Engineer":       1_450,  # igmguru Dec 2025: Chennai ₹7.5L → freelance ₹1,450
    },
    "Kolkata": {
        "Python Developer":      1_050,  # Naukri Kolkata bands; ~34% below Bengaluru
        "AI Engineer":           1_900,  # Scaler; limited supply → relative premium
        "Full Stack Developer":  1_250,  # abbacustechnologies; ~34% below Bengaluru
        "UI/UX Designer":        1_050,  # karboncard; Kolkata design market
        "Data Scientist":        1_350,  # fueler.io; Kolkata analytics
        "Graphic Designer":        700,  # karboncard; Kolkata creative freelance
        "Web Developer":           880,  # aalpha.net; Kolkata blended
        "Cloud Engineer":        1_450,  # karboncard; Kolkata limited cloud supply
        "Technical Lead":        1_900,  # karboncard; ~32% below Bengaluru
        "DevOps Engineer":       1_250,  # karboncard; Kolkata DevOps blended
    },
    "Ahmedabad": {
        "Python Developer":      1_020,  # Naukri Ahmedabad bands; ~36% below Bengaluru
        "AI Engineer":           1_850,  # Scaler; Ahmedabad GCC growing
        "Full Stack Developer":  1_200,  # abbacustechnologies; ~37% below Bengaluru
        "UI/UX Designer":        1_020,  # karboncard; Ahmedabad BFSI design
        "Data Scientist":        1_300,  # fueler.io; Ahmedabad fintech data
        "Graphic Designer":        680,  # karboncard; Ahmedabad creative
        "Web Developer":           850,  # aalpha.net; Ahmedabad blended
        "Cloud Engineer":        1_400,  # karboncard; Ahmedabad BFSI cloud
        "Technical Lead":        1_850,  # karboncard; ~34% below Bengaluru
        "DevOps Engineer":       1_200,  # karboncard; Ahmedabad blended
    },
    "Coimbatore": {
        "Python Developer":      1_000,  # whatisthesalary: Coimbatore ₹9.5L avg SWE → ₹1,000
        "AI Engineer":           1_800,  # Scaler; Coimbatore AI growing fast
        "Full Stack Developer":  1_150,  # abbacustechnologies; ~39% below Bengaluru
        "UI/UX Designer":          970,  # karboncard; Coimbatore design
        "Data Scientist":        1_250,  # fueler.io; manufacturing analytics
        "Graphic Designer":        650,  # karboncard; Coimbatore creative
        "Web Developer":           820,  # aalpha.net; Coimbatore blended
        "Cloud Engineer":        1_350,  # karboncard; manufacturing cloud
        "Technical Lead":        1_800,  # karboncard; ~36% below Bengaluru
        "DevOps Engineer":       1_150,  # karboncard; Coimbatore blended
    },
    "Kochi": {
        "Python Developer":      1_020,  # whatisthesalary: Kochi ₹9L avg → ₹1,020
        "AI Engineer":           1_820,  # Scaler; Kochi global remote AI demand
        "Full Stack Developer":  1_180,  # abbacustechnologies; ~38% below Bengaluru
        "UI/UX Designer":          980,  # karboncard; Kochi design
        "Data Scientist":        1_270,  # fueler.io; Kochi analytics
        "Graphic Designer":        660,  # karboncard; Kochi creative
        "Web Developer":           830,  # aalpha.net; Kochi blended
        "Cloud Engineer":        1_380,  # karboncard; Kochi cloud
        "Technical Lead":        1_820,  # karboncard; ~35% below Bengaluru
        "DevOps Engineer":       1_170,  # karboncard; Kochi blended
    },
}

ROLE_ORDER = [
    "Python Developer", "AI Engineer", "Full Stack Developer",
    "UI/UX Designer", "Data Scientist", "Graphic Designer",
    "Web Developer", "Cloud Engineer", "Technical Lead", "DevOps Engineer",
]

# ---------------------------------------------------------------------------
# 4. BUILD RECORDS
# ---------------------------------------------------------------------------

records = []

for city_name, state, wf in CITIES:
    for role in ROLE_ORDER:
        jobs  = JOBS[city_name][role]
        rate  = RATES[city_name][role]

        jobs_per_100k  = (jobs / wf) * 100_000
        rate_afford    = 10_000 / rate
        sat_adj        = 150 / jobs_per_100k
        final_score    = rate_afford * sat_adj

        records.append({
            "City"                    : city_name,
            "State"                   : state,
            "IT_Workforce"            : wf,
            "Role"                    : role,
            "Jobs_Available_Q1_2026"  : jobs,
            "Jobs_Per_100K_Workforce" : round(jobs_per_100k, 2),
            "Avg_Hourly_Rate_INR"     : rate,
            "Rate_Affordability"      : round(rate_afford, 4),
            "Saturation_Adjustment"   : round(sat_adj, 4),
            "Final_Score"             : round(final_score, 4),
        })

df = pd.DataFrame(records)

# Sort: city order as defined, within city by Final Score desc
city_rank = {c[0]: i for i, c in enumerate(CITIES)}
df["_cr"] = df["City"].map(city_rank)
df.sort_values(["_cr", "Final_Score"], ascending=[True, False], inplace=True)
df.drop(columns=["_cr"], inplace=True)
df.reset_index(drop=True, inplace=True)
df.index += 1
df.index.name = "Rank"

# ---------------------------------------------------------------------------
# 5. EXPORT CSV
# ---------------------------------------------------------------------------

output_file = "india_freelance_city_role_scores_Q1_2026.csv"
df.to_csv(output_file)

# ---------------------------------------------------------------------------
# 6. CONSOLE OUTPUT
# ---------------------------------------------------------------------------

ICON = lambda s: "🟢" if s >= 20 else ("🟡" if s >= 15 else "🔴")

print("\n" + "="*115)
print("  INDIA IT FREELANCE — CITY × ROLE SCORES  |  Q1 2026")
print("  IT Workforce: NASSCOM SR 2025 (5.8M total) | Jobs: Naukri.com Mar 2026 | Rates: city × role specific")
print("="*115)
print("""
  NASSCOM IT WORKFORCE (FY2025, Strategic Review Feb 24 2025):
  Total: 5.8 million   Source: BusinessToday / IBTimes, Feb 24 2025

  City             Workforce    NASSCOM Share    Source
  ─────────────────────────────────────────────────────────────
  Bengaluru       1,508,000        26%          NASSCOM SR 2025
  Mumbai            928,000        16%          NASSCOM SR 2025
  Delhi NCR         870,000        15%          NASSCOM SR 2025
  Hyderabad         812,000        14%          NASSCOM SR 2025
  Pune              551,000         9.5%        NASSCOM SR 2025
  Chennai           551,000         9.5%        NASSCOM SR 2025
  Kolkata           232,000         4.0%        NASSCOM / STPI
  Ahmedabad         116,000         2.0%        Quess Corp 2025
  Coimbatore         98,600         1.7%        IBEF 2025
  Kochi              87,000         1.5%        NASSCOM Emerging Hub
  ─────────────────────────────────────────────────────────────

  FORMULA:  Jobs/100K = (freelance_jobs/workforce)×100K
            Rate_Aff  = 10,000/hourly_rate
            Sat_Adj   = 150/Jobs_100K
            Score     = Rate_Aff × Sat_Adj
  ─────────────────────────────────────────────────────────────
""")

for city_name, state, wf in CITIES:
    cdf = df[df["City"] == city_name]
    print(f"  📍 {city_name} ({state})  |  NASSCOM Workforce: {wf:,}")
    print(f"  {'Role':<24} {'F.Jobs':>7} {'J/100K':>8} {'₹/hr':>8} {'Rate_Aff':>10} {'Sat_Adj':>9} {'Score':>11}")
    print("  " + "─"*83)
    for _, r in cdf.iterrows():
        print(f"  {r['Role']:<24} {r['Jobs_Available_Q1_2026']:>7,} "
              f"{r['Jobs_Per_100K_Workforce']:>8.2f} "
              f"{r['Avg_Hourly_Rate_INR']:>8,} "
              f"{r['Rate_Affordability']:>10.4f} "
              f"{r['Saturation_Adjustment']:>9.4f} "
              f"{r['Final_Score']:>11.4f}  {ICON(r['Final_Score'])}")
    print()

# Score heatmap
print("="*115)
print("  FINAL SCORE HEATMAP  (🟢 ≥ 20  |  🟡 ≥ 15  |  🔴 < 15)")
print("="*115)
abbr = ["Python", "AI Eng", "FullStk", "UI/UX", "DataSci", "Graphic", "WebDev", "Cloud", "TechLd", "DevOps"]
print(f"  {'City':<12}" + "".join(f"  {a:>8}" for a in abbr))
print("  " + "─"*106)
for city_name, _, _ in CITIES:
    row = f"  {city_name:<12}"
    for role in ROLE_ORDER:
        score = df[(df["City"]==city_name)&(df["Role"]==role)]["Final_Score"].values[0]
        icon  = "🟢" if score >= 20 else ("🟡" if score >= 15 else "🔴")
        row  += f"  {score:>5.1f}{icon}"
    print(row)

print("\n" + "="*115)
print("  TOP 5  (by Final Score)")
print("="*115)
for _, r in df.nlargest(5, "Final_Score").iterrows():
    print(f"  🏆 {r['City']:<12} | {r['Role']:<24} | ₹{r['Avg_Hourly_Rate_INR']:,}/hr"
          f"  F.Jobs:{r['Jobs_Available_Q1_2026']:>5,}"
          f"  J/100K:{r['Jobs_Per_100K_Workforce']:>7.2f}"
          f"  Rate_Aff:{r['Rate_Affordability']:>7.4f}"
          f"  Score:{r['Final_Score']:>9.4f}  {ICON(r['Final_Score'])}")

print()
print("="*115)
print("  BOTTOM 5  (by Final Score)")
print("="*115)
for _, r in df.nsmallest(5, "Final_Score").iterrows():
    print(f"  ⚠️  {r['City']:<12} | {r['Role']:<24} | ₹{r['Avg_Hourly_Rate_INR']:,}/hr"
          f"  F.Jobs:{r['Jobs_Available_Q1_2026']:>5,}"
          f"  J/100K:{r['Jobs_Per_100K_Workforce']:>7.2f}"
          f"  Rate_Aff:{r['Rate_Affordability']:>7.4f}"
          f"  Score:{r['Final_Score']:>9.4f}  {ICON(r['Final_Score'])}")
print(f"""
✅  CSV → '{output_file}'  ({len(df)} rows: 10 cities × 10 roles)
""")