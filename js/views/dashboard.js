import MOCK from '../data/mockData.js';

export function renderDashboard() {
    const { total, budgetPercent, breakdown } = MOCK.spending;
    const R = 45, C = 2 * Math.PI * R;
    let cumRotation = -90;

    const segments = breakdown.map(item => {
        const dashLen = (item.pct / 100) * C;
        const rotation = cumRotation;
        cumRotation += (item.pct / 100) * 360;
        return `<circle class="chart-segment" cx="50" cy="50" r="${R}" fill="none"
            stroke="${item.color}" stroke-width="6.5" stroke-linecap="round"
            stroke-dasharray="${dashLen} ${C - dashLen}"
            transform="rotate(${rotation} 50 50)"
            title="${item.category}: $${item.amount.toLocaleString('en-US',{minimumFractionDigits:2})}"/>`;
    }).join('');

    const legend = breakdown.map(item => `
        <div class="legend-item">
            <div class="legend-dot" style="background:${item.color}"></div>
            <div>
                <div class="legend-category">${item.category}</div>
                <div class="legend-amount">$${item.amount.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
            </div>
        </div>`).join('');

    return `
    <div class="view-header">
        <button class="btn btn-green-outline" id="btn-add-income">
            <span class="material-symbols-outlined">add_circle</span> Add Income
        </button>
        <div style="height:32px;width:1px;background:rgba(30,41,59,0.5)"></div>
        <button class="btn btn-slate" id="btn-add-expense">
            <span class="material-symbols-outlined">remove_circle</span> Add Expense
        </button>
    </div>
    <div class="view-body view-body-center">
        <div class="glass-card center-card-glow chart-card animate-in">
            <div class="glow-bg" style="top:-96px;left:-96px;background:rgba(17,66,212,0.1)"></div>
            <div class="glow-bg" style="bottom:-96px;right:-96px;background:rgba(6,182,212,0.1)"></div>
            <div class="spending-header">
                <div class="spending-label">Total Monthly Spending</div>
                <div class="spending-amount">$${total.toLocaleString('en-US',{minimumFractionDigits:2})}</div>
            </div>
            <div class="donut-wrapper">
                <svg class="donut-chart" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="${R}" fill="none" stroke="rgba(30,41,59,0.4)" stroke-width="4"/>
                    ${segments}
                </svg>
                <div class="donut-center">
                    <span class="donut-percent">${budgetPercent}%</span>
                    <span class="donut-label">Budget Used</span>
                </div>
            </div>
            <div class="donut-legend">${legend}</div>
        </div>
    </div>`;
}

export function initDashboard() {
    document.getElementById('btn-add-income')?.addEventListener('click', () => window.app.openModal('income'));
    document.getElementById('btn-add-expense')?.addEventListener('click', () => window.app.openModal('expense'));
}
