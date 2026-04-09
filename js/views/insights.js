import { exportCsv, exportPdf } from '../utils/exporters.js';
import { getLocale, t } from '../i18n.js';
import { getCategories, getCategoryById, getState, getTransactions } from '../state/store.js';

const insightsFilters = { range: 'month', type: 'all' };

let lineChartResizeObserver = null;
let currentInsightsModel = null;

function formatCurrency(value, options = {}) {
    return new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: getState().user.currency || 'USD',
        minimumFractionDigits: 0,
        ...options
    }).format(value);
}

function formatCompactCurrency(value) {
    return new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: getState().user.currency || 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(value);
}

function parseIsoDate(isoDate) {
    return new Date(`${isoDate}T00:00:00`);
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return startOfDay(next);
}

function toMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getAnchorDate(transactions) {
    if (!transactions.length) return startOfDay(new Date());
    return transactions.map(item => parseIsoDate(item.isoDate)).sort((left, right) => right - left)[0];
}

function getEarliestDate(transactions, anchorDate) {
    if (!transactions.length) return anchorDate;
    return transactions.map(item => parseIsoDate(item.isoDate)).sort((left, right) => left - right)[0];
}

function getRangeBounds(range, anchorDate, earliestDate = anchorDate) {
    if (range === 'all') return { start: startOfDay(earliestDate), end: anchorDate };
    if (range === 'week') return { start: addDays(anchorDate, -6), end: anchorDate };
    if (range === 'year') return { start: new Date(anchorDate.getFullYear(), 0, 1), end: anchorDate };
    return { start: new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1), end: anchorDate };
}

function getPreviousRangeBounds(range, anchorDate) {
    if (range === 'week') {
        const end = addDays(anchorDate, -7);
        return { start: addDays(end, -6), end };
    }

    if (range === 'year') {
        return {
            start: new Date(anchorDate.getFullYear() - 1, 0, 1),
            end: new Date(anchorDate.getFullYear() - 1, anchorDate.getMonth(), anchorDate.getDate())
        };
    }

    if (range === 'all') {
        const end = addDays(anchorDate, -30);
        return { start: addDays(end, -29), end };
    }

    const previousMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 1, 1);
    const lastDay = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
    return {
        start: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1),
        end: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), Math.min(anchorDate.getDate(), lastDay))
    };
}

function isWithinRange(date, bounds) {
    return date >= bounds.start && date <= bounds.end;
}

function getRangeLabel(range) {
    if (range === 'week') return t('common.thisWeek');
    if (range === 'year') return t('common.thisYear');
    if (range === 'all') return t('common.allTime');
    return t('common.thisMonth');
}

function createBuckets(range, anchorDate, earliestDate) {
    if (range === 'week') {
        return Array.from({ length: 7 }, (_, index) => {
            const date = addDays(anchorDate, index - 6);
            return {
                key: date.toISOString().slice(0, 10),
                label: new Intl.DateTimeFormat(getLocale(), { weekday: 'short' }).format(date),
                income: 0,
                expense: 0,
                savings: 0
            };
        });
    }

    if (range === 'month') {
        return Array.from({ length: anchorDate.getDate() }, (_, index) => {
            const date = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), index + 1);
            return {
                key: date.toISOString().slice(0, 10),
                label: String(index + 1),
                income: 0,
                expense: 0,
                savings: 0
            };
        });
    }

    if (range === 'year') {
        return Array.from({ length: anchorDate.getMonth() + 1 }, (_, index) => {
            const date = new Date(anchorDate.getFullYear(), index, 1);
            return {
                key: toMonthKey(date),
                label: new Intl.DateTimeFormat(getLocale(), { month: 'short' }).format(date),
                income: 0,
                expense: 0,
                savings: 0
            };
        });
    }

    const buckets = [];
    const cursor = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);

    while (cursor <= end) {
        buckets.push({
            key: toMonthKey(cursor),
            label: new Intl.DateTimeFormat(getLocale(), { month: 'short', year: '2-digit' }).format(cursor),
            income: 0,
            expense: 0,
            savings: 0
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets.slice(-12);
}

function resolveBucketKey(date, range) {
    return range === 'week' || range === 'month'
        ? date.toISOString().slice(0, 10)
        : toMonthKey(date);
}

function filterTransactionsByBounds(transactions, bounds) {
    return transactions.filter(item => isWithinRange(parseIsoDate(item.isoDate), bounds));
}

function buildCategoryHealth(expenseTransactions) {
    const spendingMap = new Map();

    expenseTransactions.forEach(transaction => {
        spendingMap.set(transaction.categoryId, (spendingMap.get(transaction.categoryId) || 0) + transaction.amount);
    });

    return getCategories('expense')
        .map(category => {
            const spent = spendingMap.get(category.id) || 0;
            const budget = Number(category.budget) || 0;
            return {
                ...category,
                spent,
                budget,
                remaining: Math.max(0, budget - spent),
                usage: budget > 0 ? Math.round((spent / budget) * 100) : 0
            };
        })
        .filter(category => category.spent > 0 || category.budget > 0)
        .sort((left, right) => right.usage - left.usage || right.spent - left.spent);
}

function buildCategorySpend(expenseTransactions) {
    const totals = new Map();
    const totalSpend = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);

    expenseTransactions.forEach(transaction => {
        totals.set(transaction.categoryId, (totals.get(transaction.categoryId) || 0) + transaction.amount);
    });

    return Array.from(totals.entries())
        .map(([categoryId, amount]) => {
            const category = getCategoryById(categoryId);
            return {
                id: categoryId,
                name: category?.name || '-',
                color: category?.color || '#1142d4',
                amount,
                pct: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0
            };
        })
        .sort((left, right) => right.amount - left.amount);
}

function getTopEntity(transactions) {
    const totals = new Map();

    transactions.forEach(transaction => {
        totals.set(transaction.categoryId, (totals.get(transaction.categoryId) || 0) + transaction.amount);
    });

    const [categoryId, amount] = Array.from(totals.entries()).sort((left, right) => right[1] - left[1])[0] || [];
    if (!categoryId) return null;

    const category = getCategoryById(categoryId);
    return {
        id: categoryId,
        name: category?.name || '-',
        amount: amount || 0,
        color: category?.color || '#1142d4'
    };
}

function getVisibleSeries(type) {
    if (type === 'income') return [{ key: 'income', label: t('common.income'), color: '#10b981' }];
    if (type === 'expense') return [{ key: 'expense', label: t('common.expense'), color: '#ef4444' }];
    return [
        { key: 'income', label: t('common.income'), color: '#10b981' },
        { key: 'expense', label: t('common.expense'), color: '#ef4444' },
        { key: 'savings', label: t('insights.savings'), color: '#06b6d4' }
    ];
}

function buildInsightsModel() {
    const transactions = getTransactions();
    const anchorDate = getAnchorDate(transactions);
    const earliestDate = getEarliestDate(transactions, anchorDate);
    const rangeBounds = getRangeBounds(insightsFilters.range, anchorDate, earliestDate);
    const previousExpenseBounds = getPreviousRangeBounds(insightsFilters.range, anchorDate);

    const rangeTransactions = filterTransactionsByBounds(transactions, rangeBounds);
    const incomeTransactions = rangeTransactions.filter(item => item.type === 'income');
    const expenseTransactions = rangeTransactions.filter(item => item.type === 'expense');
    const focusTransactions = insightsFilters.type === 'all'
        ? rangeTransactions
        : rangeTransactions.filter(item => item.type === insightsFilters.type);

    const trendBuckets = createBuckets(insightsFilters.range, anchorDate, earliestDate);
    const bucketMap = new Map(trendBuckets.map(bucket => [bucket.key, bucket]));

    rangeTransactions.forEach(transaction => {
        const bucket = bucketMap.get(resolveBucketKey(parseIsoDate(transaction.isoDate), insightsFilters.range));
        if (!bucket) return;
        bucket[transaction.type] += transaction.amount;
        bucket.savings = bucket.income - bucket.expense;
    });

    const savingsIncome = incomeTransactions.reduce((sum, item) => sum + item.amount, 0);
    const savingsExpense = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
    const previousExpenseTotal = filterTransactionsByBounds(transactions, previousExpenseBounds)
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);
    const currentExpenseTotal = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);

    return {
        filters: { ...insightsFilters },
        visibleSeries: getVisibleSeries(insightsFilters.type),
        trendBuckets,
        comparisonBuckets: trendBuckets.slice(-6),
        categoryHealth: buildCategoryHealth(expenseTransactions),
        categorySpend: buildCategorySpend(expenseTransactions),
        topEntity: getTopEntity(focusTransactions),
        focusTotal: focusTransactions.reduce((sum, item) => sum + item.amount, 0),
        avgPerBucket: Math.round(focusTransactions.reduce((sum, item) => sum + item.amount, 0) / Math.max(trendBuckets.length, 1)),
        totalIncome: incomeTransactions.reduce((sum, item) => sum + item.amount, 0),
        totalExpense: currentExpenseTotal,
        savingsRate: savingsIncome > 0 ? Math.max(0, Math.round(((savingsIncome - savingsExpense) / savingsIncome) * 100)) : 0,
        expenseDelta: previousExpenseTotal > 0 ? Math.round(((currentExpenseTotal - previousExpenseTotal) / previousExpenseTotal) * 100) : currentExpenseTotal > 0 ? 100 : 0,
        rangeLabel: getRangeLabel(insightsFilters.range)
    };
}

function buildSvgLineChart(containerId) {
    const element = document.getElementById(containerId);
    if (!element || !currentInsightsModel) return;

    const width = Math.max(360, element.clientWidth || 0);
    const height = 220;
    const paddingLeft = 70;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const pointsCount = Math.max(currentInsightsModel.trendBuckets.length - 1, 1);
    const allValues = currentInsightsModel.visibleSeries.flatMap(series => currentInsightsModel.trendBuckets.map(bucket => bucket[series.key]));
    const maxValue = Math.max(...allValues, 0, 1);
    const minValue = Math.min(...allValues, 0);
    const rangeValue = Math.max(maxValue - minValue, 1);
    const baselineValue = Math.max(minValue, Math.min(0, maxValue));
    const yForValue = value => paddingTop + ((maxValue - value) / rangeValue) * chartHeight;

    function points(values) {
        return values.map((value, index) => [
            paddingLeft + (index / pointsCount) * chartWidth,
            yForValue(value)
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
        const baseline = yForValue(baselineValue);
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

    const yLabels = Array.from({ length: 5 }, (_, index) => {
        const ratio = (4 - index) / 4;
        const value = minValue + (maxValue - minValue) * ratio;
        return { value, label: formatCompactCurrency(value) };
    });

    const grid = yLabels.map(({ value, label }) => {
        const y = yForValue(value);
        return `
            <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"></line>
            <text x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" font-size="9" fill="#7889a4" font-family="Inter">${label}</text>
        `;
    }).join('');

    const labelStep = Math.max(1, Math.ceil(currentInsightsModel.trendBuckets.length / 6));
    const xLabels = currentInsightsModel.trendBuckets.map((bucket, index) => {
        if (index % labelStep !== 0 && index !== currentInsightsModel.trendBuckets.length - 1) return '';
        const x = paddingLeft + (index / pointsCount) * chartWidth;
        return `<text x="${x}" y="${height - 8}" text-anchor="middle" font-size="9" fill="#7889a4" font-family="Inter">${bucket.label}</text>`;
    }).join('');

    const defs = currentInsightsModel.visibleSeries.map((series, index) => `
        <linearGradient id="ins-gradient-${index}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${series.color}" stop-opacity="0.16"></stop>
            <stop offset="100%" stop-color="${series.color}" stop-opacity="0"></stop>
        </linearGradient>
    `).join('');

    const paths = currentInsightsModel.visibleSeries.map((series, index) => {
        const pointList = points(currentInsightsModel.trendBuckets.map(bucket => bucket[series.key]));
        return `
            <path d="${areaPath(pointList)}" fill="url(#ins-gradient-${index})"></path>
            <path d="${smoothPath(pointList)}" fill="none" stroke="${series.color}" stroke-width="${series.key === 'savings' ? 2 : 2.5}"></path>
        `;
    }).join('');

    element.innerHTML = `
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <defs>${defs}</defs>
            ${grid}
            ${xLabels}
            ${paths}
        </svg>
    `;
}

function buildBarChart() {
    if (!currentInsightsModel) return '';

    const visibleBars = currentInsightsModel.visibleSeries.filter(series => series.key !== 'savings');
    const maxValue = Math.max(
        ...currentInsightsModel.comparisonBuckets.flatMap(bucket => visibleBars.map(series => Math.max(0, bucket[series.key]))),
        1
    );

    return currentInsightsModel.comparisonBuckets.map(bucket => `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
            <div style="display:flex;align-items:flex-end;gap:4px;width:100%;justify-content:center;height:80px">
                ${visibleBars.map(series => `
                    <div style="height:${Math.round((Math.max(0, bucket[series.key]) / maxValue) * 80)}px;width:${visibleBars.length === 1 ? 20 : 14}px;background:${series.color};border-radius:999px 999px 4px 4px"></div>
                `).join('')}
            </div>
            <span style="font-size:9px;color:var(--text-muted);font-weight:700">${bucket.label}</span>
        </div>
    `).join('');
}

function buildCategorySpendChart() {
    if (!currentInsightsModel?.categorySpend.length) {
        return `<div class="empty-state-card insights-empty-state" style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px"><span class="material-symbols-outlined" style="font-size:48px;opacity:0.2">pie_chart</span><div style="text-align:center"><strong>${t('insights.noCategorySpend')}</strong></div></div>`;
    }

    return currentInsightsModel.categorySpend.slice(0, 5).map(item => `
        <div class="insight-category-bar-row">
            <div class="insight-category-bar-head">
                <div class="insight-category-bar-label">
                    <span class="insight-category-bar-dot" style="background:${item.color}"></span>
                    <span>${item.name}</span>
                </div>
                <div class="insight-category-bar-meta">
                    <strong>${formatCurrency(item.amount)}</strong>
                    <span>${item.pct}%</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${Math.max(item.pct, item.amount ? 8 : 0)}%;background:${item.color}"></div>
            </div>
        </div>
    `).join('');
}

function exportInsightsCsv() {
    if (!currentInsightsModel) return;

    const success = exportCsv('sensefin-insights.csv', [
        { key: 'section', label: 'Section' },
        { key: 'label', label: 'Label' },
        { key: 'value', label: 'Value' },
        { key: 'detail', label: 'Detail' }
    ], [
        { section: 'Summary', label: 'Range', value: currentInsightsModel.rangeLabel, detail: '' },
        { section: 'Summary', label: 'Flow total', value: formatCurrency(currentInsightsModel.focusTotal), detail: '' },
        { section: 'Summary', label: 'Savings rate', value: `${currentInsightsModel.savingsRate}%`, detail: currentInsightsModel.rangeLabel },
        { section: 'Summary', label: 'Top entity', value: currentInsightsModel.topEntity?.name || '-', detail: currentInsightsModel.topEntity ? formatCurrency(currentInsightsModel.topEntity.amount) : '' },
        ...currentInsightsModel.trendBuckets.map(bucket => ({
            section: 'Trend',
            label: bucket.label,
            value: formatCurrency(bucket[currentInsightsModel.filters.type === 'expense' ? 'expense' : currentInsightsModel.filters.type === 'income' ? 'income' : 'savings']),
            detail: `${formatCurrency(bucket.income)} income | ${formatCurrency(bucket.expense)} expense`
        })),
        ...currentInsightsModel.categoryHealth.map(category => ({
            section: 'Category health',
            label: category.name,
            value: formatCurrency(category.spent),
            detail: `${formatCurrency(category.remaining)} remaining | ${category.usage}% usage`
        }))
    ]);

    window.app?.showToast(success ? t('insights.exportCsvSuccess') : t('insights.exportError'), success ? 'success' : 'error');
}

function exportInsightsPdf() {
    if (!currentInsightsModel) return;

    const success = exportPdf('SenseFin Insights Export', [
        {
            title: 'Summary',
            content: `
                    <div class="summary-grid">
                        <div class="summary-card"><strong>Range</strong><div>${currentInsightsModel.rangeLabel}</div></div>
                        <div class="summary-card"><strong>Flow total</strong><div>${formatCurrency(currentInsightsModel.focusTotal)}</div></div>
                        <div class="summary-card"><strong>Savings rate</strong><div>${currentInsightsModel.savingsRate}%</div></div>
                        <div class="summary-card"><strong>Top entity</strong><div>${currentInsightsModel.topEntity?.name || '-'}</div></div>
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
                        ${currentInsightsModel.categoryHealth.map(category => `
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

    window.app?.showToast(success ? t('insights.exportPdfSuccess') : t('insights.exportError'), success ? 'success' : 'error');
}

function getSpendingAlertCopy(model) {
    if (!model.totalExpense) return t('insights.noSpendingData');
    if (model.expenseDelta > 0) return t('insights.spendingAlertText', { value: model.expenseDelta });
    if (model.expenseDelta < 0) return t('insights.spendingAlertDownText', { value: Math.abs(model.expenseDelta) });
    return t('insights.spendingAlertStableText');
}

export function renderInsights() {
    currentInsightsModel = buildInsightsModel();

    const topEntityLabel = currentInsightsModel.filters.type === 'income'
        ? t('insights.topSource')
        : currentInsightsModel.filters.type === 'expense'
            ? t('insights.topCategory')
            : t('insights.topEntity');

    const categoryHealth = currentInsightsModel.categoryHealth.slice(0, 4).map(category => `
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
            <div><h2 class="view-title">${t('common.insights')}</h2></div>
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
                            <button class="filter-chip ${insightsFilters.range === 'week' ? 'active' : ''}" data-ins="range" data-val="week">${t('common.thisWeek')}</button>
                            <button class="filter-chip ${insightsFilters.range === 'month' ? 'active' : ''}" data-ins="range" data-val="month">${t('common.thisMonth')}</button>
                            <button class="filter-chip ${insightsFilters.range === 'year' ? 'active' : ''}" data-ins="range" data-val="year">${t('common.thisYear')}</button>
                            <button class="filter-chip ${insightsFilters.range === 'all' ? 'active' : ''}" data-ins="range" data-val="all">${t('common.allTime')}</button>
                        </div>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <label class="filter-chip-label">${t('insights.transactionType')}</label>
                        <div class="filter-chip-btns">
                            <button class="filter-chip ${insightsFilters.type === 'all' ? 'active' : ''}" data-ins="type" data-val="all">${t('common.all')}</button>
                            <button class="filter-chip ${insightsFilters.type === 'income' ? 'active' : ''}" data-ins="type" data-val="income" style="color:#10b981;border-color:rgba(16,185,129,0.3)">${t('common.income')}</button>
                            <button class="filter-chip ${insightsFilters.type === 'expense' ? 'active' : ''}" data-ins="type" data-val="expense" style="color:#ef4444;border-color:rgba(239,68,68,0.3)">${t('common.expense')}</button>
                        </div>
                    </div>

                    <div class="insights-filter-action">
                        <button class="btn btn-primary-fill btn-sm" id="btn-apply-insights">${t('insights.applyFilters')}</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="insights-body animate-in">
            <div class="glass-card insights-chart-card">
                <div id="svg-line-chart" style="width:100%;height:220px"></div>
                <div class="insights-legend-row">
                    ${currentInsightsModel.visibleSeries.map(series => `
                        <div class="insights-legend-item">
                            <div style="width:32px;height:2px;border-radius:9999px;background:${series.color};box-shadow:0 0 6px ${series.color}"></div>
                            <span>${series.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="insights-grid">
                <div style="display:flex;flex-direction:column;gap:20px">
                    <div class="glass-card insights-stat-card">
                        <p class="modal-section-kicker">${t('insights.incomeVsExpenses')}</p>
                        <div style="display:flex;align-items:flex-end;justify-content:space-around;gap:6px;height:100px">${buildBarChart()}</div>
                        <div class="mini-legend-row">
                            ${currentInsightsModel.visibleSeries.filter(series => series.key !== 'savings').map(series => `
                                <div class="mini-legend-item"><div class="mini-legend-swatch" style="background:${series.color}"></div><span>${series.label}</span></div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="glass-card insights-stat-card">
                        <p class="modal-section-kicker">${t('insights.categorySpend')}</p>
                        <div class="insight-category-bars">${buildCategorySpendChart()}</div>
                    </div>

                    <div class="insights-stats-grid">
                        <div class="glass-card stat-card insights-tile accent-blue">
                            <p class="modal-section-kicker">${t('insights.rangeTotal')}</p>
                            <p class="insights-tile-value" style="color:#60a5fa">${formatCurrency(currentInsightsModel.focusTotal)}</p>
                        </div>
                        <div class="glass-card stat-card insights-tile accent-red">
                            <p class="modal-section-kicker">${t('insights.avgPerPeriod')}</p>
                            <p class="insights-tile-value" style="color:#ef4444">${formatCurrency(currentInsightsModel.avgPerBucket)}</p>
                        </div>
                        <div class="glass-card stat-card insights-tile accent-green">
                            <p class="modal-section-kicker">${topEntityLabel}</p>
                            <p class="insights-tile-value" style="font-size:18px;color:#10b981">${currentInsightsModel.topEntity?.name?.toUpperCase() || '-'}</p>
                        </div>
                        <div class="glass-card stat-card insights-tile accent-blue">
                            <p class="modal-section-kicker">${t('insights.savingsRate')}</p>
                            <p class="insights-tile-value" style="color:#06b6d4">${currentInsightsModel.savingsRate}%</p>
                        </div>
                    </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:16px">
                    <div class="glass-card alert-card ${currentInsightsModel.expenseDelta > 0 ? 'accent-red' : 'accent-green'}">
                        <div class="alert-card-head">
                            <div>
                                <p class="modal-section-kicker">${t('insights.spendingAlert')}</p>
                                <p class="alert-card-copy">${getSpendingAlertCopy(currentInsightsModel)}</p>
                            </div>
                            <div class="alert-card-icon" style="background:${currentInsightsModel.expenseDelta > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'};border-color:${currentInsightsModel.expenseDelta > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}">
                                <span class="material-symbols-outlined" style="color:${currentInsightsModel.expenseDelta > 0 ? '#ef4444' : '#10b981'}">${currentInsightsModel.expenseDelta > 0 ? 'notifications' : 'task_alt'}</span>
                            </div>
                        </div>
                        <div class="progress-bar"><div class="progress-fill" style="width:${Math.max(8, Math.min(Math.abs(currentInsightsModel.expenseDelta), 100))}%;background:${currentInsightsModel.expenseDelta > 0 ? '#ef4444' : '#10b981'}"></div></div>
                    </div>

                    <div class="glass-card alert-card accent-blue">
                        <div class="alert-card-head">
                            <div>
                                <p class="modal-section-kicker">${t('insights.categoryHealth')}</p>
                                <p class="alert-card-copy">${currentInsightsModel.topEntity ? t('insights.topEntityText', { name: currentInsightsModel.topEntity.name, range: currentInsightsModel.rangeLabel }) : t('insights.noCategoryData')}</p>
                            </div>
                            <div class="alert-card-icon" style="background:rgba(6,182,212,0.08);border-color:rgba(6,182,212,0.2)"><span class="material-symbols-outlined" style="color:#06b6d4">monitoring</span></div>
                        </div>
                        <div class="category-health-stack">${categoryHealth || `<div class="empty-state-card" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px"><span class="material-symbols-outlined" style="font-size:36px;opacity:0.2">category</span><div style="text-align:center;font-size:13px">${t('insights.noCategoryData')}</div></div>`}</div>
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
            insightsFilters[button.dataset.ins] = button.dataset.val;
            document.querySelectorAll(`[data-ins="${button.dataset.ins}"]`).forEach(item => item.classList.toggle('active', item === button));
        });
    });

    document.getElementById('btn-apply-insights')?.addEventListener('click', () => window.app.navigate('insights'));
    document.getElementById('btn-export-insights-csv')?.addEventListener('click', exportInsightsCsv);
    document.getElementById('btn-export-insights-pdf')?.addEventListener('click', exportInsightsPdf);
}
