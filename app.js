// Saturate India - IT Freelance Market Dashboard Controller
// Using data from data.js (freelanceData) and formulas from FR.py

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. DASHBOARD STATE
    // -------------------------------------------------------------------------
    
    // Deep clone the baseline data so we can modify it in simulations
    let simulatedData = JSON.parse(JSON.stringify(freelanceData));
    let calculatedRecords = [];
    
    // UI State variables
    let activeTab = 'tab-explorer';
    let activeMetric = 'Final_Score'; // Final_Score, Jobs_Available_Q1_2026, Avg_Hourly_Rate_INR
    let activeStateFilter = 'All';
    
    // Watchlist & Alerts lists
    let watchlist = JSON.parse(localStorage.getItem('saturate_watchlist')) || [
        "Bengaluru|AI Engineer",
        "Kolkata|Data Scientist",
        "Coimbatore|UI/UX Designer"
    ];
    
    let alerts = JSON.parse(localStorage.getItem('saturate_alerts')) || [
        { id: 1, city: "Bengaluru", role: "AI Engineer", metric: "Jobs_Available_Q1_2026", condition: "greater", threshold: 1200, active: true },
        { id: 2, city: "Kochi", role: "Python Developer", metric: "Avg_Hourly_Rate_INR", condition: "less", threshold: 1100, active: true },
        { id: 3, city: "All", role: "DevOps Engineer", metric: "Final_Score", condition: "greater", threshold: 20.0, active: true }
    ];
    
    // -------------------------------------------------------------------------
    // 2. FORMULAS & MATH (Directly from FR.py)
    // -------------------------------------------------------------------------
    function computeMarketScores() {
        const records = [];
        const cities = simulatedData.CITIES;
        const roles = simulatedData.ROLE_ORDER;
        const jobs = simulatedData.JOBS;
        const rates = simulatedData.RATES;

        cities.forEach(c => {
            const cityName = c[0];
            const state = c[1];
            const wf = c[2];

            roles.forEach(role => {
                const jobCount = jobs[cityName][role];
                const rate = rates[cityName][role];

                // FR.py Formulas
                const jobsPer100K = (jobCount / wf) * 100000;
                const rateAfford = 10000 / rate;
                const satAdj = 150 / jobsPer100K;
                const finalScore = rateAfford * satAdj;

                records.push({
                    City: cityName,
                    State: state,
                    IT_Workforce: wf,
                    Role: role,
                    Jobs_Available_Q1_2026: jobCount,
                    Jobs_Per_100K_Workforce: Math.round(jobsPer100K * 100) / 100,
                    Avg_Hourly_Rate_INR: rate,
                    Rate_Affordability: Math.round(rateAfford * 10000) / 10000,
                    Saturation_Adjustment: Math.round(satAdj * 10000) / 10000,
                    Final_Score: Math.round(finalScore * 10000) / 10000
                });
            });
        });
        
        calculatedRecords = records;
        updateSidebarStats();
    }

    function getRecord(city, role) {
        return calculatedRecords.find(r => r.City === city && r.Role === role);
    }

    // -------------------------------------------------------------------------
    // 3. THEME TOGGLING
    // -------------------------------------------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Check localStorage or system preference
    let savedTheme = localStorage.getItem('saturate_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('saturate_theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeToggle.title = 'Switch to Light Theme';
        } else {
            themeIcon.textContent = '🌙';
            themeToggle.title = 'Switch to Dark Theme';
        }
    }

    // -------------------------------------------------------------------------
    // 4. SIDEBAR NAVIGATION
    // -------------------------------------------------------------------------
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    const tabMeta = {
        'tab-explorer': { title: 'City × Role Explorer', subtitle: 'Interactive heatmap matrix of India\'s freelance market score (Q1 2026)' },
        'tab-wizard': { title: 'Location Wizard', subtitle: 'Calculate optimal cities to freelance from based on geographical arbitrage' },
        'tab-benchmark': { title: 'Rate Benchmarking Tool', subtitle: 'Benchmark your hourly rate against city and role averages' },
        'tab-watchlist': { title: 'Saved Comparisons', subtitle: 'Track and compare saved city-role markets side-by-side' },
        'tab-alerts': { title: 'Alert Center', subtitle: 'Configure notification thresholds and monitor real-time market activity' }
    };

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    function switchTab(tabId) {
        // Toggle Nav Buttons
        navButtons.forEach(b => {
            if (b.getAttribute('data-tab') === tabId) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        // Toggle Tab Panes
        tabPanes.forEach(pane => {
            if (pane.id === tabId) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        activeTab = tabId;
        
        // Update Titles
        if (tabMeta[tabId]) {
            pageTitle.textContent = tabMeta[tabId].title;
            pageSubtitle.textContent = tabMeta[tabId].subtitle;
        }

        // Trigger specific tab renders
        renderTab(tabId);
    }

    function renderTab(tabId) {
        if (tabId === 'tab-explorer') {
            renderExplorerHeatmap();
            renderExplorerInsights();
        } else if (tabId === 'tab-wizard') {
            populateWizardDropdowns();
        } else if (tabId === 'tab-benchmark') {
            populateBenchmarkDropdowns();
        } else if (tabId === 'tab-watchlist') {
            renderWatchlist();
        } else if (tabId === 'tab-alerts') {
            populateAlertDropdowns();
            renderActiveAlerts();
        }
    }

    // -------------------------------------------------------------------------
    // 5. UPDATE SIDEBAR STATS
    // -------------------------------------------------------------------------
    function updateSidebarStats() {
        let totalJobs = 0;
        let rateSum = 0;
        let count = 0;

        calculatedRecords.forEach(r => {
            totalJobs += r.Jobs_Available_Q1_2026;
            rateSum += r.Avg_Hourly_Rate_INR;
            count++;
        });

        const avgRate = Math.round(rateSum / count);
        
        document.getElementById('sidebarJobCount').textContent = totalJobs.toLocaleString();
        document.querySelector('.sidebar-widget .widget-stat:last-child .stat-value').textContent = `₹${avgRate.toLocaleString()}/hr`;
    }

    // -------------------------------------------------------------------------
    // 6. TAB 1: EXPLORER HEATMAP & MATRIX
    // -------------------------------------------------------------------------
    const stateFilterSelect = document.getElementById('stateFilter');
    const explorerHeatmap = document.getElementById('explorerHeatmap');
    const metricButtons = document.querySelectorAll('.toggle-btn[data-metric]');

    stateFilterSelect.addEventListener('change', (e) => {
        activeStateFilter = e.target.value;
        renderExplorerHeatmap();
    });

    metricButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            metricButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeMetric = btn.getAttribute('data-metric');
            renderExplorerHeatmap();
        });
    });

    function renderExplorerHeatmap() {
        explorerHeatmap.innerHTML = '';
        
        // Filter cities by state if needed
        let filteredCities = simulatedData.CITIES;
        if (activeStateFilter !== 'All') {
            filteredCities = simulatedData.CITIES.filter(c => c[1] === activeStateFilter);
        }

        const roles = simulatedData.ROLE_ORDER;

        if (filteredCities.length === 0) {
            explorerHeatmap.innerHTML = `<tr><td colspan="${roles.length + 1}" style="text-align: center; padding: 2rem;">No cities found matching the state filter.</td></tr>`;
            return;
        }

        // Build Header Row
        let headerHtml = '<thead><tr><th>City (State)</th>';
        roles.forEach(role => {
            // Abbreviate roles for headers to keep columns clean on smaller screens
            const abbr = getRoleAbbreviation(role);
            headerHtml += `<th title="${role}">${abbr}</th>`;
        });
        headerHtml += '</tr></thead>';
        explorerHeatmap.innerHTML += headerHtml;

        // Build Body Rows
        let bodyHtml = '<tbody>';
        filteredCities.forEach(c => {
            const cityName = c[0];
            const state = c[1];
            bodyHtml += `<tr><td class="heatmap-row-header" title="${state}"><strong>${cityName}</strong><br><span style="font-size:0.7rem; color:var(--text-muted); font-weight:normal;">${state}</span></td>`;
            
            roles.forEach(role => {
                const rec = getRecord(cityName, role);
                if (!rec) {
                    bodyHtml += '<td>-</td>';
                    return;
                }

                const score = rec.Final_Score;
                let cellClass = 'low';
                let cellIcon = '🔴';
                if (score >= 20.0) {
                    cellClass = 'high';
                    cellIcon = '🟢';
                } else if (score >= 15.0) {
                    cellClass = 'mid';
                    cellIcon = '🟡';
                }

                let displayVal = '';
                if (activeMetric === 'Final_Score') {
                    displayVal = score.toFixed(1) + ' ' + cellIcon;
                } else if (activeMetric === 'Jobs_Available_Q1_2026') {
                    displayVal = rec.Jobs_Available_Q1_2026.toLocaleString();
                } else if (activeMetric === 'Avg_Hourly_Rate_INR') {
                    displayVal = '₹' + rec.Avg_Hourly_Rate_INR.toLocaleString();
                }

                bodyHtml += `<td class="heatmap-cell ${cellClass}" data-city="${cityName}" data-role="${role}">${displayVal}</td>`;
            });
            bodyHtml += '</tr>';
        });
        bodyHtml += '</tbody>';
        explorerHeatmap.innerHTML += bodyHtml;

        // Add Click Events to Cells
        const cells = explorerHeatmap.querySelectorAll('.heatmap-cell');
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const city = cell.getAttribute('data-city');
                const role = cell.getAttribute('data-role');
                openCellDetailModal(city, role);
            });
        });
    }

    function getRoleAbbreviation(role) {
        const mappings = {
            "Python Developer": "Python",
            "AI Engineer": "AI Eng",
            "Full Stack Developer": "FullStk",
            "UI/UX Designer": "UI/UX",
            "Data Scientist": "DataSci",
            "Graphic Designer": "Graphic",
            "Web Developer": "WebDev",
            "Cloud Engineer": "Cloud",
            "Technical Lead": "TechLd",
            "DevOps Engineer": "DevOps"
        };
        return mappings[role] || role;
    }

    function renderExplorerInsights() {
        const topList = document.getElementById('topScoreList');
        const bottomList = document.getElementById('bottomScoreList');

        topList.innerHTML = '';
        bottomList.innerHTML = '';

        // Sort records by final score
        const sorted = [...calculatedRecords].sort((a, b) => b.Final_Score - a.Final_Score);
        
        // Top 4 High Yield
        const top4 = sorted.slice(0, 4);
        top4.forEach((r, idx) => {
            topList.innerHTML += `
                <div class="insight-card cell-detail-trigger" data-city="${r.City}" data-role="${r.Role}">
                    <div class="insight-left">
                        <span class="insight-icon">🏆</span>
                        <div class="insight-details">
                            <span class="insight-title">${r.Role}</span>
                            <span class="insight-sub">${r.City} • ₹${r.Avg_Hourly_Rate_INR}/hr • ${r.Jobs_Available_Q1_2026} listings</span>
                        </div>
                    </div>
                    <span class="insight-score-badge high">${r.Final_Score.toFixed(1)} 🟢</span>
                </div>
            `;
        });

        // Bottom 4 Low Yield
        const bottom4 = sorted.slice(-4).reverse();
        bottom4.forEach((r, idx) => {
            bottomList.innerHTML += `
                <div class="insight-card cell-detail-trigger" data-city="${r.City}" data-role="${r.Role}">
                    <div class="insight-left">
                        <span class="insight-icon">⚠️</span>
                        <div class="insight-details">
                            <span class="insight-title">${r.Role}</span>
                            <span class="insight-sub">${r.City} • ₹${r.Avg_Hourly_Rate_INR}/hr • ${r.Jobs_Available_Q1_2026} listings</span>
                        </div>
                    </div>
                    <span class="insight-score-badge low">${r.Final_Score.toFixed(1)} 🔴</span>
                </div>
            `;
        });

        // Add event listeners to insights cards
        document.querySelectorAll('.cell-detail-trigger').forEach(card => {
            card.addEventListener('click', () => {
                const city = card.getAttribute('data-city');
                const role = card.getAttribute('data-role');
                openCellDetailModal(city, role);
            });
        });
    }

    // -------------------------------------------------------------------------
    // 7. TAB 2: "WHERE SHOULD I WORK FROM?" WIZARD
    // -------------------------------------------------------------------------
    const wizardRoleSelect = document.getElementById('wizardRole');
    const wizardCitySelect = document.getElementById('wizardCity');
    const wizardSubmitBtn = document.getElementById('wizardSubmitBtn');
    const wizardResults = document.getElementById('wizardResults');

    function populateWizardDropdowns() {
        if (wizardRoleSelect.children.length > 0) return; // Already populated

        // Populate roles
        simulatedData.ROLE_ORDER.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role;
            opt.textContent = role;
            wizardRoleSelect.appendChild(opt);
        });

        // Populate cities
        simulatedData.CITIES.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c[0];
            opt.textContent = `${c[0]} (${c[1]})`;
            wizardCitySelect.appendChild(opt);
        });
    }

    wizardSubmitBtn.addEventListener('click', () => {
        const chosenRole = wizardRoleSelect.value;
        const chosenCity = wizardCitySelect.value;

        // Calculate rankings for this role across all cities
        const roleRecords = calculatedRecords
            .filter(r => r.Role === chosenRole)
            .sort((a, b) => b.Final_Score - a.Final_Score);

        const currentRec = roleRecords.find(r => r.City === chosenCity);
        const currentRank = roleRecords.indexOf(currentRec) + 1;

        // Update Summary Headers
        document.getElementById('wizardCurrentStatusBadge').textContent = `Rank: #${currentRank} of 10`;
        document.getElementById('wizardSummaryText').innerHTML = `Optimizing location for <strong>${chosenRole}</strong> from <strong>${chosenCity}</strong>`;

        // Render recommended Score upgrades (Top 3)
        const scoreRecsContainer = document.getElementById('wizardScoreRecs');
        scoreRecsContainer.innerHTML = '';
        
        // Take top 3 recommendations (exclude current city if possible, or include but label it)
        const top3Scores = roleRecords.slice(0, 3);
        top3Scores.forEach(r => {
            const isCurrent = r.City === chosenCity;
            const scoreDiff = r.Final_Score - currentRec.Final_Score;
            const scoreUpliftPct = currentRec.Final_Score > 0 ? (scoreDiff / currentRec.Final_Score) * 100 : 0;
            
            let badgeClass = 'pos';
            let badgeText = `+${scoreDiff.toFixed(1)} pts (+${Math.round(scoreUpliftPct)}%)`;
            
            if (isCurrent) {
                badgeClass = 'pos';
                badgeText = 'Current Setup';
            } else if (scoreDiff < 0) {
                badgeClass = 'neg';
                badgeText = `${scoreDiff.toFixed(1)} pts (${Math.round(scoreUpliftPct)}%)`;
            }

            scoreRecsContainer.innerHTML += `
                <div class="rec-card cell-detail-trigger" data-city="${r.City}" data-role="${r.Role}">
                    <div class="rec-city-info">
                        <span class="rec-city-name">${r.City} ${isCurrent ? '⭐' : ''}</span>
                        <span class="rec-city-sub">${r.State} • Jobs: ${r.Jobs_Available_Q1_2026}</span>
                    </div>
                    <div class="rec-metrics">
                        <div class="rec-metric-item">
                            <span class="rec-val">${r.Final_Score.toFixed(1)}</span>
                            <span class="rec-label">Score</span>
                        </div>
                        <span class="rec-uplift ${badgeClass}">${badgeText}</span>
                    </div>
                </div>
            `;
        });

        // Render recommended Rate upgrades (Top 3 rates)
        const rateRecsContainer = document.getElementById('wizardRateRecs');
        rateRecsContainer.innerHTML = '';
        
        const top3Rates = [...roleRecords].sort((a, b) => b.Avg_Hourly_Rate_INR - a.Avg_Hourly_Rate_INR).slice(0, 3);
        top3Rates.forEach(r => {
            const isCurrent = r.City === chosenCity;
            const rateDiff = r.Avg_Hourly_Rate_INR - currentRec.Avg_Hourly_Rate_INR;
            const rateDiffPct = currentRec.Avg_Hourly_Rate_INR > 0 ? (rateDiff / currentRec.Avg_Hourly_Rate_INR) * 100 : 0;

            let badgeClass = 'pos';
            let badgeText = `+₹${rateDiff.toLocaleString()}/hr (+${Math.round(rateDiffPct)}%)`;
            
            if (isCurrent) {
                badgeClass = 'pos';
                badgeText = 'Current Setup';
            } else if (rateDiff < 0) {
                badgeClass = 'neg';
                badgeText = `-₹${Math.abs(rateDiff).toLocaleString()}/hr (${Math.round(rateDiffPct)}%)`;
            }

            rateRecsContainer.innerHTML += `
                <div class="rec-card cell-detail-trigger" data-city="${r.City}" data-role="${r.Role}">
                    <div class="rec-city-info">
                        <span class="rec-city-name">${r.City} ${isCurrent ? '⭐' : ''}</span>
                        <span class="rec-city-sub">${r.State} • Workforce: ${r.IT_Workforce.toLocaleString()}</span>
                    </div>
                    <div class="rec-metrics">
                        <div class="rec-metric-item">
                            <span class="rec-val">₹${r.Avg_Hourly_Rate_INR}/hr</span>
                            <span class="rec-label">Avg Rate</span>
                        </div>
                        <span class="rec-uplift ${badgeClass}">${badgeText}</span>
                    </div>
                </div>
            `;
        });

        // Generate Custom Strategic Advice
        const bestScoreCity = roleRecords[0];
        const bestRateCity = top3Rates[0];
        const adviceElement = document.getElementById('wizardStrategicAdvice');

        let advice = '';
        if (chosenCity === bestScoreCity.City) {
            advice = `🎉 Excellent choice! <strong>${chosenCity}</strong> is already the highest-ranked city for <strong>${chosenRole}</strong> freelancers with a score of <strong>${currentRec.Final_Score.toFixed(1)}</strong>. You have the optimal balance of rates and low saturation.`;
        } else {
            advice = `💡 <strong>Geographical Arbitrage Opportunity:</strong> While you are currently in <strong>${chosenCity}</strong> (Score: ${currentRec.Final_Score.toFixed(1)}), moving operations or targeting remote contracts based out of <strong>${bestScoreCity.City}</strong> yields a <strong>+${(bestScoreCity.Final_Score - currentRec.Final_Score).toFixed(1)}</strong> point freelance advantage. `;
            
            if (bestScoreCity.City !== bestRateCity.City) {
                advice += `Additionally, while <strong>${bestRateCity.City}</strong> offers the absolute premium average hourly rate (₹${bestRateCity.Avg_Hourly_Rate_INR}/hr), it is highly saturated. A strategic approach is to <strong>charge premium rates matching ${bestRateCity.City} but focus client search on ${bestScoreCity.City}</strong> where market competition is significantly lower relative to workforce scale!`;
            } else {
                advice += `Furthermore, <strong>${bestScoreCity.City}</strong> also happens to offer the highest rates, making it an absolute hotspot for your skillset!`;
            }
        }
        adviceElement.innerHTML = advice;

        wizardResults.style.display = 'block';
        
        // Add click events to newly created recommendation cards
        wizardResults.querySelectorAll('.cell-detail-trigger').forEach(card => {
            card.addEventListener('click', () => {
                const city = card.getAttribute('data-city');
                const role = card.getAttribute('data-role');
                openCellDetailModal(city, role);
            });
        });
    });

    // -------------------------------------------------------------------------
    // 8. TAB 3: RATE BENCHMARKING TOOL
    // -------------------------------------------------------------------------
    const benchmarkRoleSelect = document.getElementById('benchmarkRole');
    const benchmarkCitySelect = document.getElementById('benchmarkCity');
    const benchmarkForm = document.getElementById('benchmarkForm');
    const benchmarkResults = document.getElementById('benchmarkResults');

    function populateBenchmarkDropdowns() {
        if (benchmarkRoleSelect.children.length > 0) return; // Already populated

        // Populate roles
        simulatedData.ROLE_ORDER.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role;
            opt.textContent = role;
            benchmarkRoleSelect.appendChild(opt);
        });

        // Populate cities
        simulatedData.CITIES.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c[0];
            opt.textContent = `${c[0]} (${c[1]})`;
            benchmarkCitySelect.appendChild(opt);
        });
    }

    benchmarkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const role = benchmarkRoleSelect.value;
        const city = benchmarkCitySelect.value;
        const userRate = parseFloat(document.getElementById('benchmarkRate').value);

        const rec = getRecord(city, role);
        if (!rec) return;

        const avgRate = rec.Avg_Hourly_Rate_INR;
        
        // Find min and max rates for this role across all cities
        const ratesForRole = calculatedRecords.filter(r => r.Role === role).map(r => r.Avg_Hourly_Rate_INR);
        const minRate = Math.min(...ratesForRole);
        const maxRate = Math.max(...ratesForRole);

        // Display results
        document.getElementById('benchmarkRateDisplay').textContent = `₹${userRate.toLocaleString()} / hr`;
        
        const badge = document.getElementById('benchmarkFeedbackBadge');
        const explanation = document.getElementById('benchmarkExplanationText');
        const gaugeFill = document.getElementById('benchmarkGaugeFill');
        const avgMarker = document.getElementById('benchmarkGaugeAvgMarker');
        
        // Percent relative to max
        const rateRange = maxRate - minRate;
        const userPercent = rateRange > 0 ? Math.min(100, Math.max(0, ((userRate - minRate) / rateRange) * 100)) : 50;
        const avgPercent = rateRange > 0 ? ((avgRate - minRate) / rateRange) * 100 : 50;

        gaugeFill.style.width = `${userPercent}%`;
        avgMarker.style.left = `${avgPercent}%`;
        
        document.getElementById('benchmarkGaugeMin').textContent = `Min: ₹${minRate.toLocaleString()}`;
        document.getElementById('benchmarkGaugeAvgLabel').textContent = `City Avg: ₹${avgRate.toLocaleString()}`;
        document.getElementById('benchmarkGaugeMax').textContent = `Max: ₹${maxRate.toLocaleString()}`;

        // Feedback classification
        const ratio = userRate / avgRate;
        if (ratio < 0.9) {
            badge.textContent = '⚠️ Undercharging Alert';
            badge.className = 'price-status-badge under';
            const diffVal = Math.round((1 - ratio) * 100);
            explanation.innerHTML = `You are charging <strong>${diffVal}% less</strong> than the average rate of <strong>₹${avgRate.toLocaleString()}/hr</strong> for <strong>${role}</strong> in <strong>${city}</strong>. You might be leaving money on the table. Consider adjusting your rates upward, or targeting premium agencies.`;
        } else if (ratio > 1.1) {
            badge.textContent = '👑 Premium Pricing';
            badge.className = 'price-status-badge premium';
            const diffVal = Math.round((ratio - 1) * 100);
            explanation.innerHTML = `You are charging a premium rate, <strong>${diffVal}% higher</strong> than the city average of <strong>₹${avgRate.toLocaleString()}/hr</strong>. Ensure your proposals focus on high value, case studies, and advanced certifications to justify this position!`;
        } else {
            badge.textContent = '✅ Fair Market Price';
            badge.className = 'price-status-badge fair';
            explanation.innerHTML = `Your rate is perfectly aligned with the average rate of <strong>₹${avgRate.toLocaleString()}/hr</strong> for <strong>${role}</strong> in <strong>${city}</strong>. This is a competitive market positioning that allows you to attract a steady flow of local clients.`;
        }

        // Render comparative bar chart
        renderBenchmarkChart(role, userRate);

        benchmarkResults.style.display = 'block';
    });

    function renderBenchmarkChart(role, userRate) {
        const chartContainer = document.getElementById('benchmarkCustomChart');
        chartContainer.innerHTML = '';

        // Get averages for this role in all cities
        const roleRecs = calculatedRecords
            .filter(r => r.Role === role)
            .sort((a, b) => b.Avg_Hourly_Rate_INR - a.Avg_Hourly_Rate_INR);

        const maxRateOverall = Math.max(...roleRecs.map(r => r.Avg_Hourly_Rate_INR), userRate);

        roleRecs.forEach(r => {
            const avgVal = r.Avg_Hourly_Rate_INR;
            const barWidthPercent = (avgVal / maxRateOverall) * 100;
            const userPosPercent = (userRate / maxRateOverall) * 100;

            chartContainer.innerHTML += `
                <div class="chart-bar-row">
                    <span class="chart-bar-label" title="${r.City}">${r.City}</span>
                    <div class="chart-bar-track">
                        <div class="chart-bar-fill" style="width: ${barWidthPercent}%;"></div>
                        <div class="user-rate-line-overlay" style="left: ${userPosPercent}%;" title="Your rate: ₹${userRate}/hr"></div>
                    </div>
                    <span class="chart-bar-val">₹${avgVal.toLocaleString()}</span>
                </div>
            `;
        });
    }

    // -------------------------------------------------------------------------
    // 9. TAB 4: SAVED COMPARISONS & WATCHLIST
    // -------------------------------------------------------------------------
    function renderWatchlist() {
        const grid = document.getElementById('watchlistGrid');
        const emptyState = document.getElementById('watchlistEmptyState');
        const comparisonArea = document.getElementById('watchlistComparisonArea');

        if (watchlist.length === 0) {
            grid.style.display = 'none';
            comparisonArea.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        grid.innerHTML = '';
        grid.style.display = 'grid';

        const watchedRecords = [];

        watchlist.forEach(key => {
            const [city, role] = key.split('|');
            const rec = getRecord(city, role);
            if (!rec) return;

            watchedRecords.push(rec);

            const score = rec.Final_Score;
            let scoreClass = 'low';
            if (score >= 20.0) scoreClass = 'high';
            else if (score >= 15.0) scoreClass = 'mid';

            grid.innerHTML += `
                <div class="watchlist-card">
                    <button class="btn-remove-watchlist" data-key="${key}" title="Remove from watchlist">✕</button>
                    <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted);">${rec.State}</div>
                    <div class="watchlist-card-role">${rec.Role}</div>
                    <div class="watchlist-card-city">${rec.City}</div>
                    
                    <div class="watchlist-stats-row">
                        <div class="watchlist-stat-box">
                            <span>Avg Rate</span>
                            <strong>₹${rec.Avg_Hourly_Rate_INR}/hr</strong>
                        </div>
                        <div class="watchlist-stat-box">
                            <span>Available Jobs</span>
                            <strong>${rec.Jobs_Available_Q1_2026}</strong>
                        </div>
                    </div>

                    <div class="watchlist-card-score">
                        <span>Freelance Score:</span>
                        <strong class="watchlist-score-val ${scoreClass}">${score.toFixed(2)}</strong>
                    </div>
                </div>
            `;
        });

        // Add remove handlers
        grid.querySelectorAll('.btn-remove-watchlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = btn.getAttribute('data-key');
                toggleWatchlistItem(key);
            });
        });

        // Render comparison table if more than 1 item watched
        if (watchedRecords.length >= 2) {
            renderWatchlistComparisonTable(watchedRecords);
            comparisonArea.style.display = 'block';
        } else {
            comparisonArea.style.display = 'none';
        }
    }

    function renderWatchlistComparisonTable(records) {
        // Headers
        for (let i = 1; i <= 3; i++) {
            const header = document.getElementById(`compColHeader${i}`);
            if (records[i - 1]) {
                header.innerHTML = `${records[i - 1].Role}<br><span style="font-size:0.75rem; font-weight:normal; color:var(--text-secondary);">${records[i - 1].City}</span>`;
                header.style.display = 'table-cell';
            } else {
                header.style.display = 'none';
            }
        }

        const body = document.getElementById('watchlistComparisonBody');
        body.innerHTML = '';

        const metricsToCompare = [
            { label: 'Workforce size', key: 'IT_Workforce', format: (val) => val.toLocaleString() },
            { label: 'Job count Q1 2026', key: 'Jobs_Available_Q1_2026', format: (val) => val.toLocaleString() },
            { label: 'Jobs / 100K workforce', key: 'Jobs_Per_100K_Workforce', format: (val) => val.toFixed(2) },
            { label: 'Avg hourly rate', key: 'Avg_Hourly_Rate_INR', format: (val) => '₹' + val.toLocaleString() + '/hr' },
            { label: 'Rate affordability index', key: 'Rate_Affordability', format: (val) => val.toFixed(4) },
            { label: 'Saturation adjustment', key: 'Saturation_Adjustment', format: (val) => val.toFixed(4) },
            { label: 'Final Score', key: 'Final_Score', format: (val) => val.toFixed(4), highlight: true }
        ];

        metricsToCompare.forEach(m => {
            let rowHtml = `<tr><td>${m.label}</td>`;
            records.forEach(r => {
                const val = r[m.key];
                const displayVal = m.format(val);
                if (m.highlight) {
                    let scoreClass = 'low';
                    if (val >= 20.0) scoreClass = 'high';
                    else if (val >= 15.0) scoreClass = 'mid';
                    rowHtml += `<td class="heatmap-cell ${scoreClass}"><strong>${displayVal}</strong></td>`;
                } else {
                    rowHtml += `<td>${displayVal}</td>`;
                }
            });
            // fill empty columns
            for (let i = records.length; i < 3; i++) {
                rowHtml += '<td style="display:none;">-</td>';
            }
            rowHtml += '</tr>';
            body.innerHTML += rowHtml;
        });
    }

    function toggleWatchlistItem(key) {
        const index = watchlist.indexOf(key);
        if (index > -1) {
            watchlist.splice(index, 1);
            showToast('📂 Watchlist', `Removed ${key.replace('|', ' ')} from watchlist.`);
        } else {
            if (watchlist.length >= 3) {
                showToast('⚠️ Watchlist Full', `You can only save up to 3 comparisons. Remove one first!`);
                return false;
            }
            watchlist.push(key);
            showToast('💾 Watchlist Saved', `Added ${key.replace('|', ' ')} to watchlist.`);
        }
        localStorage.setItem('saturate_watchlist', JSON.stringify(watchlist));
        renderWatchlist();
        return true;
    }

    // -------------------------------------------------------------------------
    // 10. TAB 5: ALERTS & EVENTS
    // -------------------------------------------------------------------------
    const alertCitySelect = document.getElementById('alertCity');
    const alertRoleSelect = document.getElementById('alertRole');
    const createAlertForm = document.getElementById('createAlertForm');

    function populateAlertDropdowns() {
        if (alertCitySelect.children.length > 1) return; // Already populated

        // Populate cities
        simulatedData.CITIES.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c[0];
            opt.textContent = c[0];
            alertCitySelect.appendChild(opt);
        });

        // Populate roles
        simulatedData.ROLE_ORDER.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role;
            opt.textContent = role;
            alertRoleSelect.appendChild(opt);
        });
    }

    createAlertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = alertCitySelect.value;
        const role = alertRoleSelect.value;
        const metric = document.getElementById('alertMetric').value;
        const condition = document.getElementById('alertCondition').value;
        const threshold = parseFloat(document.getElementById('alertThreshold').value);

        const newAlert = {
            id: Date.now(),
            city,
            role,
            metric,
            condition,
            threshold,
            active: true
        };

        alerts.push(newAlert);
        localStorage.setItem('saturate_alerts', JSON.stringify(alerts));
        renderActiveAlerts();
        showToast('🔔 Alert Configured', 'Added active monitor alert.');
        createAlertForm.reset();
    });

    function renderActiveAlerts() {
        const container = document.getElementById('activeAlertsList');
        container.innerHTML = '';

        if (alerts.length === 0) {
            container.innerHTML = '<div style="font-size:0.9rem; color:var(--text-muted); padding: 1rem 0;">No active alerts configured.</div>';
            return;
        }

        const metricLabels = {
            "Jobs_Available_Q1_2026": "Job Count",
            "Avg_Hourly_Rate_INR": "Hourly Rate",
            "Final_Score": "Freelance Score"
        };

        alerts.forEach(a => {
            const condSym = a.condition === 'greater' ? '>' : '<';
            const thresholdStr = a.metric === 'Avg_Hourly_Rate_INR' ? `₹${a.threshold.toLocaleString()}` : a.threshold;
            
            container.innerHTML += `
                <div class="alert-trigger-card">
                    <div class="alert-info">
                        <span class="alert-bell-icon">🔔</span>
                        <div class="alert-description">
                            <span>Monitor:</span> ${a.role === 'All' ? 'All Roles' : a.role} in ${a.city === 'All' ? 'All Cities' : a.city} 
                            <span>when</span> ${metricLabels[a.metric]} ${condSym} ${thresholdStr}
                        </div>
                    </div>
                    <button class="btn-delete-alert" data-id="${a.id}" title="Delete alert">🗑️</button>
                </div>
            `;
        });

        // Add delete handlers
        container.querySelectorAll('.btn-delete-alert').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                alerts = alerts.filter(a => a.id !== id);
                localStorage.setItem('saturate_alerts', JSON.stringify(alerts));
                renderActiveAlerts();
                showToast('🔔 Alert Removed', 'Deleted market alert monitor.');
            });
        });
    }

    // Alert Checker
    function checkAlerts(changedCity, changedRole, newVal, oldVal, metricKey) {
        const timeStr = new Date().toLocaleTimeString();
        const logFeed = document.getElementById('alertLogFeed');

        const metricLabels = {
            "Jobs_Available_Q1_2026": "Jobs",
            "Avg_Hourly_Rate_INR": "Hourly Rate",
            "Final_Score": "Freelance Score"
        };

        alerts.forEach(a => {
            if (!a.active) return;

            // Match city
            const cityMatch = (a.city === 'All' || a.city === changedCity);
            // Match role
            const roleMatch = (a.role === 'All' || a.role === changedRole);
            // Match metric
            const metricMatch = (a.metric === metricKey);

            if (cityMatch && roleMatch && metricMatch) {
                // Check condition
                let triggered = false;
                if (a.condition === 'greater' && newVal > a.threshold && (oldVal === null || oldVal <= a.threshold)) {
                    triggered = true;
                } else if (a.condition === 'less' && newVal < a.threshold && (oldVal === null || oldVal >= a.threshold)) {
                    triggered = true;
                }

                if (triggered) {
                    const message = `ALERT: ${changedRole} in ${changedCity} - ${metricLabels[metricKey]} crossed threshold! Value: ${metricKey === 'Avg_Hourly_Rate_INR' ? '₹' + newVal.toLocaleString() : newVal} (Rule: ${a.condition === 'greater' ? '>' : '<'} ${a.threshold})`;
                    
                    // Add toast
                    showToast('🔥 Trigger Activated', message, 6000);
                    
                    // Add to log console
                    if (logFeed) {
                        logFeed.innerHTML += `
                            <div class="log-item trigger">
                                <span class="log-time">[${timeStr}]</span>
                                <span class="log-text">${message}</span>
                            </div>
                        `;
                        logFeed.scrollTop = logFeed.scrollHeight;
                    }
                }
            }
        });
    }



    // -------------------------------------------------------------------------
    // 11. LIVE MARKET SIMULATOR
    // -------------------------------------------------------------------------
    const liveSimBtn = document.getElementById('liveSimBtn');
    const simStatusText = document.getElementById('simStatus');

    liveSimBtn.addEventListener('click', () => {
        // Spin Simulator icon micro-animation
        const simIcon = liveSimBtn.querySelector('.sim-icon');
        simIcon.style.transform = 'rotate(360deg)';
        setTimeout(() => { simIcon.style.transform = 'none'; }, 800);

        // Select a random event type
        const eventType = Math.floor(Math.random() * 3); // 0: Job surge, 1: Rate surge, 2: Saturation change
        const cities = simulatedData.CITIES;
        const roles = simulatedData.ROLE_ORDER;

        const randomCity = cities[Math.floor(Math.random() * cities.length)][0];
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        
        const oldRec = JSON.parse(JSON.stringify(getRecord(randomCity, randomRole)));

        let logText = '';
        let toastTitle = '🔄 Market Update';
        const timeStr = new Date().toLocaleTimeString();

        if (eventType === 0) {
            // Jobs surge (+15% to +45%)
            const percentSurge = Math.floor(Math.random() * 30) + 15;
            const multiplier = 1 + (percentSurge / 100);
            
            const oldJobs = simulatedData.JOBS[randomCity][randomRole];
            const newJobs = Math.round(oldJobs * multiplier);
            simulatedData.JOBS[randomCity][randomRole] = newJobs;

            // Recompute
            computeMarketScores();
            const newRec = getRecord(randomCity, randomRole);

            logText = `Market surge: Jobs for '${randomRole}' in ${randomCity} increased by +${percentSurge}% (${oldJobs} ➔ ${newJobs}). Score updated from ${oldRec.Final_Score.toFixed(2)} to ${newRec.Final_Score.toFixed(2)}.`;
            showToast(toastTitle, `'${randomRole}' openings in ${randomCity} surged by +${percentSurge}%!`);
            
            // Check alerts
            checkAlerts(randomCity, randomRole, newJobs, oldJobs, 'Jobs_Available_Q1_2026');
            checkAlerts(randomCity, randomRole, newRec.Final_Score, oldRec.Final_Score, 'Final_Score');

        } else if (eventType === 1) {
            // Rates increase/decrease (-10% to +15%)
            const percentChange = Math.floor(Math.random() * 25) - 10;
            if (percentChange === 0) return;
            const multiplier = 1 + (percentChange / 100);

            const oldRate = simulatedData.RATES[randomCity][randomRole];
            const newRate = Math.round(oldRate * multiplier);
            simulatedData.RATES[randomCity][randomRole] = newRate;

            // Recompute
            computeMarketScores();
            const newRec = getRecord(randomCity, randomRole);

            const direction = percentChange > 0 ? 'increased' : 'decreased';
            logText = `Rate fluctuation: Average hourly pricing for '${randomRole}' in ${randomCity} ${direction} by ${percentChange}% (₹${oldRate}/hr ➔ ₹${newRate}/hr). Score updated from ${oldRec.Final_Score.toFixed(2)} to ${newRec.Final_Score.toFixed(2)}.`;
            showToast(toastTitle, `Hourly rates for '${randomRole}' in ${randomCity} ${direction} by ${Math.abs(percentChange)}%!`);

            // Check alerts
            checkAlerts(randomCity, randomRole, newRate, oldRate, 'Avg_Hourly_Rate_INR');
            checkAlerts(randomCity, randomRole, newRec.Final_Score, oldRec.Final_Score, 'Final_Score');

        } else {
            // General market correction: multiple shifts
            const randomRole2 = roles[Math.floor(Math.random() * roles.length)];
            const oldRate = simulatedData.RATES[randomCity][randomRole2];
            const oldJobs = simulatedData.JOBS[randomCity][randomRole2];
            
            const newRate = Math.round(oldRate * 1.05);
            const newJobs = Math.round(oldJobs * 0.95);
            
            simulatedData.RATES[randomCity][randomRole2] = newRate;
            simulatedData.JOBS[randomCity][randomRole2] = newJobs;

            computeMarketScores();
            const newRec = getRecord(randomCity, randomRole2);

            logText = `Market Correction: Moderate rate adjustment in ${randomCity} for '${randomRole2}'. Rate: ₹${newRate}/hr (+5%), Jobs: ${newJobs} (-5%). Score: ${newRec.Final_Score.toFixed(2)}.`;
            showToast(toastTitle, `Market correction applied in ${randomCity} for '${randomRole2}'.`);
            
            checkAlerts(randomCity, randomRole2, newRate, oldRate, 'Avg_Hourly_Rate_INR');
            checkAlerts(randomCity, randomRole2, newJobs, oldJobs, 'Jobs_Available_Q1_2026');
            checkAlerts(randomCity, randomRole2, newRec.Final_Score, oldRec.Final_Score, 'Final_Score');
        }

        // Add to alert log
        const logFeed = document.getElementById('alertLogFeed');
        if (logFeed) {
            logFeed.innerHTML += `
                <div class="log-item info">
                    <span class="log-time">[${timeStr}]</span>
                    <span class="log-text">${logText}</span>
                </div>
            `;
            logFeed.scrollTop = logFeed.scrollHeight;
        }

        // Update status text
        simStatusText.textContent = 'Simulator Modified';
        simStatusText.parentNode.style.borderColor = 'rgba(244, 63, 94, 0.2)';
        simStatusText.parentNode.style.color = 'var(--accent-rose)';
        const badgeDot = simStatusText.parentNode.querySelector('.dot');
        if (badgeDot) badgeDot.style.backgroundColor = 'var(--accent-rose)';

        // Re-render active tab to show update live
        renderTab(activeTab);
    });

    // -------------------------------------------------------------------------
    // 12. CELL DETAIL MODAL
    // -------------------------------------------------------------------------
    const detailOverlay = document.getElementById('detailOverlay');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    modalCloseBtn.addEventListener('click', closeCellDetailModal);
    detailOverlay.addEventListener('click', (e) => {
        if (e.target === detailOverlay) {
            closeCellDetailModal();
        }
    });

    function openCellDetailModal(city, role) {
        const rec = getRecord(city, role);
        if (!rec) return;

        // Set Title & Meta
        document.getElementById('modalTitle').textContent = `${role} in ${city}`;
        document.getElementById('modalSubmeta').innerHTML = `
            <span>${rec.State}</span>
            <span>•</span>
            <span>IT Workforce: ${rec.IT_Workforce.toLocaleString()}</span>
        `;

        // Score Badge
        const score = rec.Final_Score;
        const scoreBadge = document.getElementById('modalScoreBadge');
        scoreBadge.textContent = `Score: ${score.toFixed(2)}`;
        if (score >= 20.0) {
            scoreBadge.className = 'badge-priority high';
            scoreBadge.textContent += ' 🟢 (High Yield)';
        } else if (score >= 15.0) {
            scoreBadge.className = 'badge-priority mid';
            scoreBadge.textContent += ' 🟡 (Moderate)';
        } else {
            scoreBadge.className = 'badge-priority low';
            scoreBadge.textContent += ' 🔴 (Saturated)';
        }

        // Calculation Values
        document.getElementById('formulaJobsVal').textContent = rec.Jobs_Available_Q1_2026.toLocaleString();
        document.getElementById('formulaJobsSub').textContent = `Total openings`;
        document.getElementById('formulaJobsPer100KVal').textContent = rec.Jobs_Per_100K_Workforce.toFixed(2);
        document.getElementById('formulaRateVal').textContent = `₹${rec.Avg_Hourly_Rate_INR.toLocaleString()}/hr`;

        // Step Formulas
        document.getElementById('calcRateAfford').innerHTML = `10,000 / ₹${rec.Avg_Hourly_Rate_INR.toLocaleString()} = <strong>${rec.Rate_Affordability.toFixed(4)}</strong>`;
        document.getElementById('calcSatAdj').innerHTML = `150 / ${rec.Jobs_Per_100K_Workforce.toFixed(2)} = <strong>${rec.Saturation_Adjustment.toFixed(4)}</strong>`;
        document.getElementById('calcFinalScore').innerHTML = `${rec.Rate_Affordability.toFixed(4)} × ${rec.Saturation_Adjustment.toFixed(4)} = <strong style="color:var(--primary); font-size:1.1rem;">${score.toFixed(4)}</strong>`;

        // Watchlist Button Setup
        const watchlistBtn = document.getElementById('modalWatchlistBtn');
        const key = `${city}|${role}`;
        
        if (watchlist.includes(key)) {
            watchlistBtn.textContent = '💾 Remove from Watchlist';
            watchlistBtn.style.background = 'var(--accent-rose)';
        } else {
            watchlistBtn.textContent = '💾 Save to Watchlist';
            watchlistBtn.style.background = 'var(--primary)';
        }

        // Set Click Action for Watchlist Button
        watchlistBtn.onclick = () => {
            const added = toggleWatchlistItem(key);
            if (added !== false) {
                if (watchlist.includes(key)) {
                    watchlistBtn.textContent = '💾 Remove from Watchlist';
                    watchlistBtn.style.background = 'var(--accent-rose)';
                } else {
                    watchlistBtn.textContent = '💾 Save to Watchlist';
                    watchlistBtn.style.background = 'var(--primary)';
                }
            }
        };

        // Set Click Action for Quick Alert Button
        const alertBtn = document.getElementById('modalCreateAlertBtn');
        alertBtn.onclick = () => {
            closeCellDetailModal();
            switchTab('tab-alerts');
            // Preset values in alerts form
            populateAlertDropdowns();
            alertCitySelect.value = city;
            alertRoleSelect.value = role;
            document.getElementById('alertMetric').value = 'Final_Score';
            document.getElementById('alertCondition').value = 'greater';
            document.getElementById('alertThreshold').value = Math.round(score);
        };

        // Price benchmarking ranges in modal
        const ratesForRole = calculatedRecords.filter(r => r.Role === role).map(r => r.Avg_Hourly_Rate_INR);
        const minRate = Math.min(...ratesForRole);
        const maxRate = Math.max(...ratesForRole);
        const range = maxRate - minRate;
        const markerPos = range > 0 ? ((rec.Avg_Hourly_Rate_INR - minRate) / range) * 100 : 50;

        document.getElementById('modalPriceMarker').style.left = `${markerPos}%`;
        document.getElementById('modalPriceRangeFill').style.left = '0%';
        document.getElementById('modalPriceRangeFill').style.width = '100%';
        document.getElementById('modalPriceMinText').textContent = `Min: ₹${minRate.toLocaleString()}/hr`;
        document.getElementById('modalPriceMaxText').textContent = `Max: ₹${maxRate.toLocaleString()}/hr`;
        
        let positionFeedback = '';
        if (rec.Avg_Hourly_Rate_INR === maxRate) {
            positionFeedback = `<strong>₹${rec.Avg_Hourly_Rate_INR.toLocaleString()}/hr</strong> is the <strong>highest rate</strong> in India for this role.`;
        } else if (rec.Avg_Hourly_Rate_INR === minRate) {
            positionFeedback = `<strong>₹${rec.Avg_Hourly_Rate_INR.toLocaleString()}/hr</strong> is the <strong>lowest average rate</strong> in India for this role.`;
        } else {
            const diffPct = Math.round(((rec.Avg_Hourly_Rate_INR - minRate) / minRate) * 100);
            positionFeedback = `Rate of <strong>₹${rec.Avg_Hourly_Rate_INR.toLocaleString()}/hr</strong> is <strong>+${diffPct}% higher</strong> than the national minimum.`;
        }
        document.getElementById('modalPriceCompareText').innerHTML = positionFeedback;

        // Open Modal
        detailOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable background scroll
    }

    function closeCellDetailModal() {
        detailOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable background scroll
    }

    // -------------------------------------------------------------------------
    // 13. TOAST SYSTEM
    // -------------------------------------------------------------------------
    function showToast(title, message, duration = 4000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';

        // Select icon based on content
        let icon = '🔔';
        if (title.includes('Alert') || title.includes('Trigger')) icon = '🔥';
        else if (title.includes('Watchlist')) icon = '💾';
        else if (title.includes('Update')) icon = '🔄';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('active');
        }, 10);

        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, duration);
    }

    // -------------------------------------------------------------------------
    // 14. CSV DATA UPLOAD
    // -------------------------------------------------------------------------
    const uploadDataBtn = document.getElementById('uploadDataBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    const uploadStatus = document.getElementById('uploadStatus');

    if (uploadDataBtn && csvFileInput) {
        uploadDataBtn.addEventListener('click', () => {
            csvFileInput.click();
        });

        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            uploadStatus.textContent = "Processing...";
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const text = event.target.result;
                    parseCSVAndUpdate(text);
                    uploadStatus.textContent = "✅ Data Loaded";
                    showToast('📂 Data Updated', 'New quarterly data has been loaded and scores recalculated.');
                } catch (error) {
                    uploadStatus.textContent = "❌ Error parsing CSV";
                    showToast('⚠️ Upload Failed', error.message);
                }
            };
            reader.readAsText(file);
        });
    }

    function parseCSVAndUpdate(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) throw new Error('CSV is empty or missing data rows.');

        const requiredHeaders = ['City', 'State', 'IT_Workforce', 'Role', 'Jobs_Available', 'Avg_Hourly_Rate_INR'];
        
        // Split by comma handling potential spaces
        const headers = lines[0].split(',').map(h => h.trim());
        
        requiredHeaders.forEach(req => {
            if (!headers.includes(req)) {
                throw new Error(`Missing required column: ${req}`);
            }
        });

        // Map header indices
        const hIdx = {};
        headers.forEach((h, i) => hIdx[h] = i);

        const newCitiesMap = new Map(); // key: City, value: [City, State, IT_Workforce]
        const newRoles = new Set();
        const newJobs = {};
        const newRates = {};

        for (let i = 1; i < lines.length; i++) {
            const rowText = lines[i].trim();
            if (!rowText) continue; // Skip blank lines

            const fields = rowText.split(',').map(f => f.trim());
            if (fields.length !== headers.length) {
                throw new Error(`Row ${i + 1} has wrong number of fields.`);
            }

            const city = fields[hIdx['City']];
            const state = fields[hIdx['State']];
            const itWorkforce = parseInt(fields[hIdx['IT_Workforce']], 10);
            const role = fields[hIdx['Role']];
            const jobs = parseInt(fields[hIdx['Jobs_Available']], 10);
            const rate = parseFloat(fields[hIdx['Avg_Hourly_Rate_INR']]);

            if (isNaN(jobs) || jobs <= 0) throw new Error(`Row ${i + 1}: Jobs_Available must be a positive number.`);
            if (isNaN(rate) || rate <= 0) throw new Error(`Row ${i + 1}: Avg_Hourly_Rate_INR must be a positive number.`);

            newCitiesMap.set(city, [city, state, itWorkforce]);
            newRoles.add(role);

            if (!newJobs[city]) newJobs[city] = {};
            if (!newRates[city]) newRates[city] = {};

            newJobs[city][role] = jobs;
            newRates[city][role] = rate;
        }

        // Rebuild simulatedData
        simulatedData.CITIES = Array.from(newCitiesMap.values());
        simulatedData.ROLE_ORDER = Array.from(newRoles).sort();
        simulatedData.JOBS = newJobs;
        simulatedData.RATES = newRates;

        // Trigger updates
        computeMarketScores();
        renderTab(activeTab);
    }

    // -------------------------------------------------------------------------
    // 15. APP INITIALIZATION
    // -------------------------------------------------------------------------
    computeMarketScores();
    switchTab('tab-explorer');
});
