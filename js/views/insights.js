import MOCK from '../data/mockData.js';

function buildSvgLineChart(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const W = el.clientWidth || 700;
    const H = 220;
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const n = months.length;
    const income  = [0.30,0.40,0.50,0.58,0.65,0.72,0.78,0.82,0.85,0.80,0.76,0.70];
    const expense = [0.22,0.28,0.36,0.44,0.50,0.58,0.66,0.70,0.72,0.68,0.60,0.54];
    const savings = [0.08,0.10,0.13,0.14,0.15,0.14,0.12,0.12,0.13,0.12,0.16,0.16];

    const padL=70, padR=20, padT=20, padB=40;
    const cW=W-padL-padR, cH=H-padT-padB;

    function pts(data) { return data.map((v,i) => [padL+(i/(n-1))*cW, padT+(1-v)*cH]); }
    function smoothPath(points) {
        let d=`M ${points[0][0]} ${points[0][1]}`;
        for(let i=1;i<points.length;i++){
            const [x0,y0]=points[i-1],[x1,y1]=points[i]; const cx=(x0+x1)/2;
            d+=` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
        } return d;
    }
    function areaPath(points) {
        const b=padT+cH; let d=`M ${points[0][0]} ${b} L ${points[0][0]} ${points[0][1]}`;
        for(let i=1;i<points.length;i++){
            const [x0,y0]=points[i-1],[x1,y1]=points[i]; const cx=(x0+x1)/2;
            d+=` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
        } d+=` L ${points[points.length-1][0]} ${b} Z`; return d;
    }

    const iP=pts(income), eP=pts(expense), sP=pts(savings);
    const yLabels=[{v:1,l:'$1000'},{v:0.75,l:'$750'},{v:0.5,l:'$500'},{v:0.25,l:'$250'},{v:0,l:'$0'}];
    let grid='', xLbl='';
    yLabels.forEach(({v,l})=>{
        const y=padT+(1-v)*cH;
        grid+=`<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <text x="${padL-8}" y="${y+4}" text-anchor="end" font-size="9" fill="#7889a4" font-family="Inter">${l}</text>`;
    });
    months.forEach((m,i)=>{
        const x=padL+(i/(n-1))*cW;
        xLbl+=`<text x="${x}" y="${H-8}" text-anchor="middle" font-size="9" fill="#7889a4" font-family="Inter">${m}</text>`;
    });

    el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/></linearGradient>
        <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ef4444" stop-opacity="0.12"/><stop offset="100%" stop-color="#ef4444" stop-opacity="0"/></linearGradient>
        <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#06b6d4" stop-opacity="0.12"/><stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/></linearGradient>
        <filter id="glG"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glR"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="glB"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    ${grid}${xLbl}
    <path d="${areaPath(iP)}" fill="url(#gI)"/>
    <path d="${areaPath(eP)}" fill="url(#gE)"/>
    <path d="${areaPath(sP)}" fill="url(#gS)"/>
    <path d="${smoothPath(iP)}" fill="none" stroke="#10b981" stroke-width="2.5" filter="url(#glG)"/>
    <path d="${smoothPath(eP)}" fill="none" stroke="#ef4444" stroke-width="2.5" filter="url(#glR)"/>
    <path d="${smoothPath(sP)}" fill="none" stroke="#06b6d4" stroke-width="2" filter="url(#glB)"/>
    </svg>`;
}

function buildBarChart() {
    const data = MOCK.incomeVsExpense.slice(0, 6);
    return data.map(d => {
        const maxVal = 6000;
        const iH = Math.round((d.income / maxVal) * 80);
        const eH = Math.round((d.expense / maxVal) * 80);
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="display:flex;align-items:flex-end;gap:3px;width:100%;justify-content:center;height:80px">
                <div class="bar-income" style="height:${iH}px;width:14px"></div>
                <div class="bar-expense" style="height:${eH}px;width:14px"></div>
            </div>
            <span style="font-size:9px;color:var(--text-muted);font-weight:700">${d.month.toUpperCase().slice(0,3)}</span>
        </div>`;
    }).join('');
}

export function renderInsights() {
    const totalExp = MOCK.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const totalInc = MOCK.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const rate = totalInc>0?(((totalInc-totalExp)/totalInc)*100).toFixed(0):0;
    const catSpend = {};
    MOCK.transactions.filter(t=>t.type==='expense').forEach(t=>{catSpend[t.category]=(catSpend[t.category]||0)+t.amount;});
    const topCat = Object.entries(catSpend).sort((a,b)=>b[1]-a[1])[0];
    const avgMonthly = (totalExp / (MOCK.monthlyTrend.length || 1)).toFixed(0);

    return `
    <header style="padding:32px 32px 24px;flex-shrink:0">
        <h2 style="font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.02em;text-transform:uppercase">Insights</h2>
    </header>

    <!-- Filters bar -->
    <div style="padding:0 32px 24px;flex-shrink:0">
        <div class="glass-card" style="border-radius:16px;padding:16px 24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
            <div class="filter-group"><label class="filter-label">Date Range</label>
                <select class="filter-select"><option>LAST 6 MONTHS</option><option>LAST 3 MONTHS</option><option>THIS YEAR</option></select></div>
            <div class="filter-divider"></div>
            <div class="filter-group"><label class="filter-label">Transaction Type</label>
                <select class="filter-select"><option>ALL TRANSACTIONS</option><option>INCOME</option><option>EXPENSES</option></select></div>
            <div class="filter-divider"></div>
            <div class="filter-group"><label class="filter-label">Category</label>
                <select class="filter-select"><option>ALL</option><option>FOOD</option><option>HOME</option><option>TRANSPORT</option></select></div>
            <div class="filter-divider"></div>
            <div class="filter-group"><label class="filter-label">Savings</label>
                <select class="filter-select"><option>THIS MONTH</option><option>LAST MONTH</option></select></div>
            <div style="margin-left:auto"><button class="btn btn-primary-fill btn-sm" style="padding:10px 20px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase">Apply Filters</button></div>
        </div>
    </div>

    <!-- Scrollable body -->
    <div style="flex:1;overflow-y:auto;padding:0 32px 32px;display:flex;flex-direction:column;gap:20px" class="animate-in">

        <!-- Line chart -->
        <div class="glass-card" style="border-radius:16px;padding:24px">
            <div id="svg-line-chart" style="width:100%;height:220px"></div>
            <div style="display:flex;align-items:center;gap:24px;margin-top:16px">
                <div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:2px;border-radius:9999px;background:#10b981;box-shadow:0 0 6px #10b981"></div><span style="font-size:11px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:0.15em">Incomes</span></div>
                <div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:2px;border-radius:9999px;background:#ef4444;box-shadow:0 0 6px #ef4444"></div><span style="font-size:11px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:0.15em">Expenses</span></div>
                <div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:2px;border-radius:9999px;background:#06b6d4;box-shadow:0 0 6px #06b6d4"></div><span style="font-size:11px;font-weight:700;color:#06b6d4;text-transform:uppercase;letter-spacing:0.15em">Savings</span></div>
            </div>
        </div>

        <!-- Bottom grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <!-- Left: bar chart + stats -->
            <div style="display:flex;flex-direction:column;gap:20px">
                <div class="glass-card" style="border-radius:16px;padding:20px">
                    <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:16px">Income vs Expenses</p>
                    <div style="display:flex;align-items:flex-end;justify-content:space-around;gap:6px;height:100px">${buildBarChart()}</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div class="glass-card stat-card" style="border-radius:16px;padding:20px">
                        <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:8px">Avg. Monthly Spending</p>
                        <p style="font-size:24px;font-weight:700;color:#fff">$\u2009${avgMonthly}</p>
                    </div>
                    <div class="glass-card stat-card" style="border-radius:16px;padding:20px">
                        <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:8px">Top Category</p>
                        <p style="font-size:24px;font-weight:700;color:#fff">$\u2009${topCat ? topCat[1].toFixed(0) : '0'}</p>
                    </div>
                    <div class="glass-card stat-card" style="border-radius:16px;padding:20px">
                        <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:8px">Highest Category</p>
                        <p style="font-size:24px;font-weight:700;color:#fff">${topCat ? topCat[0].toUpperCase() : '-'}</p>
                    </div>
                    <div class="glass-card stat-card" style="border-radius:16px;padding:20px">
                        <p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:8px">Savings Rate</p>
                        <p style="font-size:24px;font-weight:700;color:#fff">${rate}%</p>
                    </div>
                </div>
            </div>

            <!-- Right: alert cards -->
            <div style="display:flex;flex-direction:column;gap:16px">
                <div class="glass-card" style="border-radius:16px;padding:20px">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
                        <div><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:4px">Spending Alert</p>
                        <p style="font-size:13px;color:var(--text-secondary)">Your spending increased by <span style="color:#ef4444;font-weight:700">2%</span> this month.</p></div>
                        <div style="width:40px;height:40px;border-radius:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:20px;color:#ef4444">notifications</span></div>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:62%;background:#ef4444;box-shadow:0 0 8px rgba(239,68,68,0.5)"></div></div>
                </div>
                <div class="glass-card" style="border-radius:16px;padding:20px">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
                        <div><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:4px">Top Category</p>
                        <p style="font-size:13px;color:var(--text-secondary)">Top Category: <span style="color:#f59e0b;font-weight:700">${topCat ? topCat[0] : 'N/A'}</span> (${topCat ? ((topCat[1]/totalExp)*100).toFixed(0) : 0}% of total budget).</p></div>
                        <div style="width:40px;height:40px;border-radius:12px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:20px;color:#f59e0b">diamond</span></div>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${topCat ? ((topCat[1]/totalExp)*100).toFixed(0) : 0}%;background:#f59e0b;box-shadow:0 0 8px rgba(245,158,11,0.5)"></div></div>
                </div>
                <div class="glass-card" style="border-radius:16px;padding:20px">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
                        <div><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--text-muted);margin-bottom:4px">Saving Rates</p>
                        <p style="font-size:13px;color:var(--text-secondary)">Savings rate decreased by <span style="color:#ef4444;font-weight:700">2%</span> vs last month.</p></div>
                        <div style="width:40px;height:40px;border-radius:12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:20px;color:#f59e0b">square</span></div>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${rate}%;background:#f59e0b;box-shadow:0 0 8px rgba(245,158,11,0.5)"></div></div>
                </div>
            </div>
        </div>
    </div>`;
}

export function initInsights() {
    requestAnimationFrame(() => buildSvgLineChart('svg-line-chart'));
}
