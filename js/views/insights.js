import { exportCsv, exportPdf } from '../utils/exporters.js';
import { getLocale, t } from '../i18n.js';
import {
    getCategoryById,
    getCategoryBudgetProgress,
    getInsightsSummary,
    getState,
    getTransactions
} from '../state/store.js';

let lineChartResizeObserver = null;

function formatCurrency(value) {
    return new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: getState().user.currency || 'USD',
        minimumFractionDigits: 0
    }).format(value);
}

function buildSvgLineChart(containerId) {
    const element = document.getElementById(containerId);
    if (!element) return;

    const width = Math.max(360, element.clientWidth || 0);
    const height = 220;
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const income = [0.30, 0.40, 0.50, 0.58, 0.65, 0.72, 0.78, 0.82, 0.85, 0.80, 0.76, 0.70];
    const expense = [0.22, 0.28, 0.36, 0.44, 0.50, 0.58, 0.66, 0.70, 0.72, 0.68, 0.60, 0.54];
    const savings = [0.08, 0.10, 0.13, 0.14, 0.15, 0.14, 0.12, 0.12, 0.13, 0.12, 0.16, 0.16];

    const paddingLeft = 70;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    function points(values) {
        return values.map((value, index) => [
            paddingLeft + (index / (months.length - 1)) * chartWidth,
            paddingTop + (1 - value) * chartHeight
        ]);
    }

    function smoothPath(pointsList) {
        let path = `M ${pointsList[0][0]} ${pointsList[0][1]}`;
        for (let index = 1; index < pointsList.length; index += 1) {
            const [x0, y0] = pointsList[index - 1];
            const [x1, y1] = pointsList[index];
            const controlX = (x0 + x1) / 2;
            path += ` C ${controlX} ${y0}, ${controlX} ${y1}, ${x1} ${y1}`;
        }
        return path;
    }

    function areaPath(pointsList) {
        const baseline = paddingTop + chartHeight;
        let path = `M ${pointsList[0][0]} ${baseline} L ${pointsList[0][0]} ${pointsList[0][1]}`;
        for (let index = 1; index < pointsList.length; index += 1) {
            const [x0, y0] = pointsList[index - 1];
            const [x1, y1] = pointsList[index];
            const controlX = (x0 + x1) / 2;
            path += ` C ${controlX} ${y0}, ${controlX} ${y1}, ${x1} ${y1}`;
        }
        path += ` L ${pointsList[pointsList.length - 1][0]} ${baseline} Z`;
        return path;
    }

    const incomePoints = points(income);
    const expensePoints = points(expense);
    const savingsPoints = points(savings);

    const yLabels = [
        { value: 1, label: '$1000' },
        { value: 0.75, label: '$750' },
        { value: 0.5, label: '$500' },
        { value: 0.25, label: '$250' },
        { value: 0, label: '$0' }
    ];

    const grid = yLabels.map(({ value, label }) => {
        const y = paddingTop + (1 - value) * chartHeight;
        return `
            <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"></line>
            <text x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" font-size="9" fill="#7889a4" font-family="Inter">${label}</text>
        `;
    }).join('');

    const xLabels = months.map((month, index) => {
        const x = paddingLeft + (index / (months.length - 1)) * chartWidth;
        return `<text x="${x}" y="${height - 8}" text-anchor="middle" font-size="9" fill="#7889a4" font-family="Inter">${month}</text>`;
    }).join('');

    element.innerHTML = `
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10b981" stop-opacity="0.15"></stop><stop offset="100%" stop-color="#10b981" stop-opacity="0"></stop></linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ef4444" stop-opacity="0.12"></stop><stop offset="100%" stop-color="#ef4444" stop-opacity="0"></stop></linearGradient>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#06b6d4" stop-opacity="0.12"></stop><stop offset="100%" stop-color="#06b6d4" stop-opacity="0"></stop></linearGradient>
            </defs>
            ${grid}
            ${xLabels}
            <path d="${areaPath(incomePoints)}" fill="url(#gI)"></path>
            <path d="${areaPath(expensePoints)}" fill="url(#gE)"></path>
            <path d="${areaPath(savingsPoints)}" fill="url(#gS)"></path>
            <path d="${smoothPath(incomePoints)}" fill="none" stroke="#10b981" stroke-width="2.5"></path>
            <path d="${smoothPath(expensePoints)}" fill="none" stroke="#ef4444" stroke-width="2.5"></path>
            <path d="${smoothPath(savingsPoints)}" fill="none" stroke="#06b6d4" stroke-width="2"></path>
        </svg>
    `;
}

function buildBarChart() {
    return getState().incomeVsExpense.slice(0, 6).map(item => {
        const incomeHeight = Math.round((item.income / 6000) * 80);
        const expenseHeight = Math.round((item.expense / 6000) * 80);

        return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
                <div style="display:flex;align-items:flex-end;gap:3px;width:100%;justify-content:center;height:80px">
                    <div class="bar-income" style="height:${incomeHeight}px;width:14px"></div>
                    <div class="bar-expense" style="height:${expenseHeight}px;width:14px"></div>
                </div>
                <span style="font-size:9px;color:var(--text-muted);font-weight:700">${item.month.toUpperCase().slice(0, 3)}</span>
            </div>
        `;
    }).join('');
}

function exportInsightsCsv() {
    const summary = getInsightsSummary();
    const rows = getCategoryBudgetProgress().map(category => ({
        section: 'Category health',
        label: category.name,
        value: formatCurrency(category.spent),
        detail: `${formatCurrency(category.remaining)} remaining | ${category.usage}% usage`
    }));

    exportCsv('sensefin-insights.csv', [
        { key: 'section', label: 'Section' },
        { key: 'label', label: 'Label' },
        { key: 'value', label: 'Value' },
        { key: 'detail', label: 'Detail' }
    ], [
        {
            section: 'Summary',
            label: 'Total income',
            value: formatCurrency(summary.totalIncome),
            detail: ''
        },
        {
            section: 'Summary',
            label: 'Total expense',
            value: formatCurrency(summary.totalExpense),
            detail: ''
        },
        {
            section: 'Summary',
            label: 'Savings rate',
            value: `${summary.savingsRate}%`,
            detail: ''
        },
        {
            section: 'Summary',
            label: 'Top category',
            value: getCategoryById(summary.topCategoryId)?.name || '-',
            detail: formatCurrency(summary.topCategoryAmount)
        },
        ...rows
    ]);
}

function exportInsightsPdf() {
    const summary = getInsightsSummary();
    const categories = getCategoryBudgetProgress();

    exportPdf('SenseFin Insights Export', [
        {
            title: 'Summary',
            content: `
                <div class="summary-grid">
                    <div class="summary-card"><strong>Total Income</strong><div>${formatCurrency(summary.totalIncome)}</div></div>
                    <div class="summary-card"><strong>Total Expense</strong><div>${formatCurrency(summary.totalExpense)}</div></div>
                    <div class="summary-card"><strong>Savings Rate</strong><div>${summary.savingsRate}%</div></div>
                    <div class="summary-card"><strong>Top Category</strong><div>${getCategoryById(summary.topCategoryId)?.name || '-'}</div></div>
                </div>
            `
        },
        {
            title: 'Category Health',
            content: `
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Budget</th>
                            <th>Spent</th>
                            <th>Remaining</th>
                            <th>Usage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(category => `
                            <tr>
                                <td>${category.name}</td>
                                <td>${formatCurrency(category.budget)}</td>
                                <td>${formatCurrency(category.spent)}</td>
                                <td>${formatCurrency(category.remaining)}</td>
                                <td>${category.usage}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `
        }
    ]);
}

export function renderInsights() {
    const summary = getInsightsSummary();
    const monthlyTransactions = getTransactions().filter(item => item.type === 'expense');
    const avgMonthly = monthlyTransactions.length
        ? Math.round(summary.totalExpense / Math.max(1, getState().monthlyTrend.length))
        : 0;
    const topCategory = getCategoryById(summary.topCategoryId);
    const categoryHealth = getCategoryBudgetProgress().slice(0, 4).map(category => `
        <div class="glass-card category-health-card">
            <div class="category-health-head">
                <div>
                    <p class="category-health-title">${category.name}</p>
                    <p class="category-health-meta">${formatCurrency(category.spent)} / ${formatCurrency(category.budget)}</p>
                </div>
                <span class="category-health-pill" style="color:${category.color};border-color:${category.color}55;background:${category.color}14">${category.usage}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(category.usage, 100)}%;background:${category.color}"></div></div>
        </div>
    `).join('');

    return `
        <header class="insights-header">
            <div>
                <h2 class="view-title">${t('common.insights')}</h2>
            </div>
            <div class="header-action-cluster">
                <button class="btn btn-secondary btn-sm" id="btn-export-insights-csv">
                    <span class="material-symbols-outlined">table_view</span>
                    ${t('common.exportCsv')}
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-export-insights-pdf">
                    <span class="material-symbols-outlined">picture_as_pdf</span>
                    ${t('common.exportPdf')}
                </button>
            </div>
        </header>

        <div class="insights-filter-wrap">
            <div class="glass-card filter-panel">
                <div class="filter-row filter-row-spaced">
                    <div class="filter-chip-group">
                        <label class="filter-chip-label">${t('common.dateRange')}</label>
                        <div class="filter-chip-btns">
                            <button class="filter-chip" data-ins="range" data-val="week">${t('common.thisWeek')}</button>
                            <button class="filter-chip active" data-ins="range" data-val="month">${t('common.thisMonth')}</button>
                            <button class="filter-chip" data-ins="range" data-val="year">${t('common.thisYear')}</button>
                            <button class="filter-chip" data-ins="range" data-val="all">${t('common.allTime')}</button>
                        </div>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <label class="filter-chip-label">${t('insights.transactionType')}</label>
                        <div class="filter-chip-btns">
                            <button class="filter-chip active" data-ins="type" data-val="all">${t('common.all')}</button>
                            <button class="filter-chip" data-ins="type" data-val="income" style="color:#10b981;border-color:rgba(16,185,129,0.3)">${t('common.income')}</button>
                            <button class="filter-chip" data-ins="type" data-val="expense" style="color:#ef4444;border-color:rgba(239,68,68,0.3)">${t('common.expense')}</button>
                        </div>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <label class="filter-chip-label">${t('insights.savings')}</label>
                        <div class="filter-chip-btns">
                            <button class="filter-chip" data-ins="savings" data-val="week">${t('common.thisWeek')}</button>
                            <button class="filter-chip active" data-ins="savings" data-val="month">${t('common.thisMonth')}</button>
                            <button class="filter-chip" data-ins="savings" data-val="year">${t('common.thisYear')}</button>
                            <button class="filter-chip" data-ins="savings" data-val="all">${t('common.allTime')}</button>
                        </div>
                    </div>

                    <div class="insights-filter-action">
                        <button class="btn btn-primary-fill btn-sm">${t('insights.applyFilters')}</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="insights-body animate-in">
            <div class="glass-card insights-chart-card">
                <div id="svg-line-chart" style="width:100%;height:220px"></div>
                <div class="insights-legend-row">
                    <div class="insights-legend-item"><div style="width:32px;height:2px;border-radius:9999px;background:#10b981;box-shadow:0 0 6px #10b981"></div><span>Income</span></div>
                    <div class="insights-legend-item"><div style="width:32px;height:2px;border-radius:9999px;background:#ef4444;box-shadow:0 0 6px #ef4444"></div><span>Expenses</span></div>
                    <div class="insights-legend-item"><div style="width:32px;height:2px;border-radius:9999px;background:#06b6d4;box-shadow:0 0 6px #06b6d4"></div><span>Savings</span></div>
                </div>
            </div>

            <div class="insights-grid">
                <div style="display:flex;flex-direction:column;gap:20px">
                    <div class="glass-card insights-stat-card">
                        <p class="modal-section-kicker">${t('insights.incomeVsExpenses')}</p>
                        <div style="display:flex;align-items:flex-end;justify-content:space-around;gap:6px;height:100px">${buildBarChart()}</div>
                        <div class="mini-legend-row">
                            <div class="mini-legend-item"><div class="mini-legend-swatch" style="background:#10b981"></div><span>${t('common.income')}</span></div>
                            <div class="mini-legend-item"><div class="mini-legend-swatch" style="background:#ef4444"></div><span>${t('common.expense')}</span></div>
                        </div>
                    </div>

                    <div class="insights-stats-grid">
                        <div class="glass-card stat-card insights-tile accent-red">
                            <p class="modal-section-kicker">${t('insights.avgMonthly')}</p>
                            <p class="insights-tile-value" style="color:#ef4444">${formatCurrency(avgMonthly)}</p>
                        </div>
                        <div class="glass-card stat-card insights-tile accent-red">
                            <p class="modal-section-kicker">${t('insights.topSpend')}</p>
                            <p class="insights-tile-value" style="color:#ef4444">${formatCurrency(summary.topCategoryAmount)}</p>
                        </div>
                        <div class="glass-card stat-card insights-tile accent-green">
                            <p class="modal-section-kicker">${t('insights.topCategory')}</p>
                            <p class="insights-tile-value" style="font-size:18px;color:#10b981">${topCategory?.name?.toUpperCase() || '-'}</p>
                        </div>
                        <div class="glass-card stat-card insights-tile accent-blue">
                            <p class="modal-section-kicker">${t('insights.savingsRate')}</p>
                            <p class="insights-tile-value" style="color:#06b6d4">${summary.savingsRate}%</p>
                        </div>
                    </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:16px">
                    <div class="glass-card alert-card accent-red">
                        <div class="alert-card-head">
                            <div>
                                <p class="modal-section-kicker">${t('insights.spendingAlert')}</p>
                                <p class="alert-card-copy">${t('insights.spendingAlertText', { value: 2 })}</p>
                            </div>
                            <div class="alert-card-icon" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2)"><span class="material-symbols-outlined" style="color:#ef4444">notifications</span></div>
                        </div>
                        <div class="progress-bar"><div class="progress-fill" style="width:62%;background:#ef4444"></div></div>
                    </div>

                    <div class="glass-card alert-card accent-blue">
                        <div class="alert-card-head">
                            <div>
                                <p class="modal-section-kicker">${t('insights.categoryHealth')}</p>
                                <p class="alert-card-copy">${topCategory ? `${topCategory.name} is driving most of your spend this cycle.` : 'No category data yet.'}</p>
                            </div>
                            <div class="alert-card-icon" style="background:rgba(6,182,212,0.08);border-color:rgba(6,182,212,0.2)"><span class="material-symbols-outlined" style="color:#06b6d4">monitoring</span></div>
                        </div>
                        <div class="category-health-stack">${categoryHealth}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initInsights() {
    const renderLineChart = () => buildSvgLineChart('svg-line-chart');
    requestAnimationFrame(renderLineChart);
    window.setTimeout(renderLineChart, 90);

    lineChartResizeObserver?.disconnect();
    const chartContainer = document.getElementById('svg-line-chart');
    if (chartContainer) {
        lineChartResizeObserver = new ResizeObserver(() => renderLineChart());
        lineChartResizeObserver.observe(chartContainer);
    }

    document.querySelectorAll('[data-ins]').forEach(button => {
        button.addEventListener('click', () => {
            const group = button.dataset.ins;
            document.querySelectorAll(`[data-ins="${group}"]`).forEach(item => item.classList.remove('active'));
            button.classList.add('active');
        });
    });

    document.getElementById('btn-export-insights-csv')?.addEventListener('click', exportInsightsCsv);
    document.getElementById('btn-export-insights-pdf')?.addEventListener('click', exportInsightsPdf);
}
