import { getLocale, t } from '../i18n.js';
import { getSpendingBreakdown, getState } from '../state/store.js';

function formatCurrency(value) {
    return new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: getState().user.currency || 'USD',
        minimumFractionDigits: 2
    }).format(value);
}

export function renderDashboard() {
    const { total, items } = getSpendingBreakdown();
    const chartItems = items.length ? items : [{ category: 'No data', color: 'rgba(100,116,139,0.4)', amount: 0, pct: 100 }];
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    let currentRotation = -90;

    const segments = chartItems.map(item => {
        const dashLength = (item.pct / 100) * circumference;
        const rotation = currentRotation;
        currentRotation += (item.pct / 100) * 360;

        return `
            <circle
                class="chart-segment"
                cx="60"
                cy="60"
                r="${radius}"
                fill="none"
                stroke="${item.color}"
                stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="${dashLength} ${circumference - dashLength}"
                transform="rotate(${rotation} 60 60)"
            />
        `;
    }).join('');

    const legend = items.length ? items.map(item => `
        <div class="legend-item legend-item-bottom">
            <div class="legend-dot" style="background:${item.color}"></div>
            <div>
                <div class="legend-category">${item.category}</div>
                <div class="legend-amount">${formatCurrency(item.amount)}</div>
            </div>
        </div>
    `).join('') : `
        <div class="legend-item legend-item-bottom">
            <div class="legend-dot" style="background:rgba(100,116,139,0.55)"></div>
            <div>
                <div class="legend-category">No spending data yet</div>
                <div class="legend-amount">${formatCurrency(0)}</div>
            </div>
        </div>
    `;

    return `
        <div class="view-header">
            <button class="btn btn-green-outline" id="btn-add-income">
                <span class="material-symbols-outlined">add_circle</span>
                ${t('common.addIncome')}
            </button>
            <div class="view-header-divider"></div>
            <button class="btn btn-slate" id="btn-add-expense">
                <span class="material-symbols-outlined">remove_circle</span>
                ${t('common.addExpense')}
            </button>
        </div>

        <div class="view-body view-body-dashboard">
            <div class="glass-card center-card-glow chart-card-wide animate-in">
                <div class="glow-bg" style="top:-96px;left:-96px;background:rgba(17,66,212,0.1)"></div>
                <div class="glow-bg" style="bottom:-96px;right:-96px;background:rgba(6,182,212,0.1)"></div>
                <div class="chart-wide-inner chart-wide-inner-centered">
                    <div class="donut-wrapper-large">
                        <svg class="donut-chart-large" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet">
                            <circle cx="60" cy="60" r="${radius}" fill="none" stroke="rgba(30,41,59,0.4)" stroke-width="5"></circle>
                            ${segments}
                        </svg>
                        <div class="donut-center-large">
                            <span class="donut-total-label">${t('dashboard.totalMonthlySpending')}</span>
                            <span class="donut-total-amount">${formatCurrency(total)}</span>
                        </div>
                    </div>
                    <div class="donut-legend-bottom">${legend}</div>
                </div>
            </div>
        </div>
    `;
}

export function initDashboard() {
    document.getElementById('btn-add-income')?.addEventListener('click', () => window.app.openModal('income'));
    document.getElementById('btn-add-expense')?.addEventListener('click', () => window.app.openModal('expense'));
}
