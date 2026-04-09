import { exportCsv, exportPdf } from '../utils/exporters.js';
import { getLocale, t } from '../i18n.js';
import { openDatePicker } from '../components/datePicker.js';
import { getCategories, getCategoryById, getTransactions, getState } from '../state/store.js';

const PAGE_SIZE = 8;

let filters = {
    type: 'all',
    category: 'all',
    search: '',
    preset: 'all',
    dateFrom: '',
    dateTo: '',
    amountSort: 'none'
};
let currentPage = 1;

function formatCurrency(value, sign = '') {
    return `${sign}${new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: getState().user.currency || 'USD',
        minimumFractionDigits: 2
    }).format(value)}`;
}

function formatDisplayDate(isoDate) {
    const date = new Date(`${isoDate}T00:00:00`);
    return {
        label: new Intl.DateTimeFormat(getLocale(), { month: 'short', day: 'numeric' }).format(date),
        timeLabel: new Intl.DateTimeFormat(getLocale(), { weekday: 'short' }).format(date)
    };
}

function matchesPreset(isoDate, preset) {
    if (preset === 'all') return true;

    const date = new Date(`${isoDate}T00:00:00`);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (preset === 'year') return date.getFullYear() === currentYear;
    if (preset === 'month') return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    if (preset === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return date >= startOfWeek && date < endOfWeek;
    }

    return true;
}

function getFilteredTransactions() {
    let list = getTransactions().filter(transaction => {
        const category = getCategoryById(transaction.categoryId);
        const searchText = `${transaction.description} ${transaction.detail} ${category?.name || ''}`.toLowerCase();

        if (filters.type !== 'all' && transaction.type !== filters.type) return false;
        if (filters.category !== 'all' && transaction.categoryId !== filters.category) return false;
        if (filters.search && !searchText.includes(filters.search.toLowerCase())) return false;
        if (!matchesPreset(transaction.isoDate, filters.preset)) return false;
        if (filters.dateFrom && transaction.isoDate < filters.dateFrom) return false;
        if (filters.dateTo && transaction.isoDate > filters.dateTo) return false;
        return true;
    });

    if (filters.amountSort === 'asc') list = [...list].sort((left, right) => left.amount - right.amount);
    if (filters.amountSort === 'desc') list = [...list].sort((left, right) => right.amount - left.amount);
    if (filters.amountSort === 'none') list = [...list].sort((left, right) => right.isoDate.localeCompare(left.isoDate));

    return list;
}

function methodIcon(transaction) {
    if (transaction.methodType === 'visa') {
        return `<div class="payment-method-chip"><span>VISA</span></div>`;
    }
    if (transaction.methodType === 'bank') {
        return `<span class="material-symbols-outlined" style="font-size:16px;color:var(--text-muted)">account_balance</span>`;
    }
    if (transaction.methodType === 'cash') {
        return `<span class="material-symbols-outlined" style="font-size:16px;color:var(--text-muted)">payments</span>`;
    }

    return `<span class="material-symbols-outlined" style="font-size:16px;color:var(--text-muted)">contactless</span>`;
}

function categoryBadge(categoryId) {
    const category = getCategoryById(categoryId);
    if (!category) return `<span class="badge badge-slate">-</span>`;

    return `
        <span class="badge badge-pill" style="background:${category.color}1F;color:${category.color};border-color:${category.color}55">
            ${category.name}
        </span>
    `;
}

function rowsMarkup(list) {
    if (!list.length) {
        return `<tr><td colspan="6" style="padding:48px;text-align:center"><div style="display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--text-muted)"><span class="material-symbols-outlined" style="font-size:48px;opacity:0.3">history</span><div><strong>${t('history.noTransactions')}</strong><div style="font-size:12px">${t('history.noTransactionsHelp')}</div></div></div></td></tr>`;

    }

    return list.map(transaction => {
        const displayDate = formatDisplayDate(transaction.isoDate);
        const category = getCategoryById(transaction.categoryId);
        const isIncome = transaction.type === 'income';
        const icon = transaction.icon || category?.icon || 'payments';
        const accent = category?.color || 'var(--primary)';

        return `
            <tr>
                <td style="width:12%">
                    <span class="table-primary">${displayDate.label}</span>
                    <span class="table-secondary">${displayDate.timeLabel}</span>
                </td>
                <td style="width:30%">
                    <div class="table-entity-cell">
                        <div class="table-entity-icon" style="background:${accent}1A;border-color:${accent}33;color:${accent}">
                            <span class="material-symbols-outlined" style="font-size:16px">${icon}</span>
                        </div>
                        <div style="overflow:hidden">
                            <span class="table-primary">${transaction.description}</span>
                            <span class="table-secondary">${transaction.detail}</span>
                        </div>
                    </div>
                </td>
                <td style="width:15%">${categoryBadge(transaction.categoryId)}</td>
                <td style="width:18%">
                    <div class="table-method-cell">
                        ${methodIcon(transaction)}
                        <span class="table-secondary-strong">${transaction.method}</span>
                    </div>
                </td>
                <td style="width:15%;text-align:right" class="${isIncome ? 'amount-positive' : 'amount-negative'}">
                    ${formatCurrency(transaction.amount, isIncome ? '+' : '-')}
                </td>
                <td style="width:10%;text-align:center">
                    <button class="table-icon-button" type="button" title="${t('history.receipt')}">
                        <span class="material-symbols-outlined" style="font-size:16px">${isIncome ? 'attach_file' : 'description'}</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function formatDateButton(value) {
    if (!value) return `<span class="material-symbols-outlined" style="font-size:14px">calendar_month</span>`;
    const label = new Intl.DateTimeFormat(getLocale(), { month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`));
    return `<span class="material-symbols-outlined" style="font-size:13px">calendar_month</span> ${label}`;
}

function buildPagination(total, page) {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (totalPages <= 1) return '';

    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + 3);
    if (end - start < 3) start = Math.max(1, end - 3);

    let buttons = '';
    buttons += `<button class="pagination-btn" data-page="1" title="${t('common.firstPage')}"><span class="material-symbols-outlined" style="font-size:14px">keyboard_double_arrow_left</span></button>`;
    buttons += `<button class="pagination-btn" data-page="${Math.max(1, page - 1)}" ${page === 1 ? 'disabled' : ''}><span class="material-symbols-outlined" style="font-size:16px">chevron_left</span></button>`;

    for (let current = start; current <= end; current += 1) {
        buttons += `<button class="pagination-btn${current === page ? ' active' : ''}" data-page="${current}">${current}</button>`;
    }

    buttons += `<button class="pagination-btn" data-page="${Math.min(totalPages, page + 1)}" ${page === totalPages ? 'disabled' : ''}><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span></button>`;
    buttons += `<button class="pagination-btn" data-page="${totalPages}" title="${t('common.lastPage')}"><span class="material-symbols-outlined" style="font-size:14px">keyboard_double_arrow_right</span></button>`;
    return buttons;
}

function exportHistoryCsv() {
    const rows = getFilteredTransactions().map(transaction => ({
        date: transaction.isoDate,
        type: transaction.type,
        category: getCategoryById(transaction.categoryId)?.name || '',
        description: transaction.description,
        amount: transaction.amount.toFixed(2),
        method: transaction.method
    }));

    exportCsv('sensefin-history.csv', [
        { key: 'date', label: 'Date' },
        { key: 'type', label: 'Type' },
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method' }
    ], rows);
}

function exportHistoryPdf() {
    const rows = getFilteredTransactions();
    const body = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Method</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(transaction => `
                    <tr>
                        <td>${transaction.isoDate}</td>
                        <td>${transaction.type}</td>
                        <td>${getCategoryById(transaction.categoryId)?.name || '-'}</td>
                        <td>${transaction.description}</td>
                        <td>${formatCurrency(transaction.amount, transaction.type === 'income' ? '+' : '-')}</td>
                        <td>${transaction.method}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    exportPdf('SenseFin History Export', [{ content: body }]);
}

export function renderHistory() {
    const categories = getCategories('expense').concat(getCategories('income'));

    return `
        <div class="view-header view-header-between history-header">
            <div>
                <h2 class="view-title">${t('common.history')}</h2>
                <p class="view-subtitle">${t('history.subtitle')}</p>
            </div>
            <div class="header-action-cluster">
                <button class="btn btn-secondary btn-sm" id="btn-export-history-csv">
                    <span class="material-symbols-outlined">table_view</span>
                    ${t('common.exportCsv')}
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-export-history-pdf">
                    <span class="material-symbols-outlined">picture_as_pdf</span>
                    ${t('common.exportPdf')}
                </button>
                <button class="btn btn-green-outline btn-sm" id="btn-add-tx">
                    <span class="material-symbols-outlined">add_circle</span>
                    ${t('common.addIncome')}
                </button>
                <button class="btn btn-slate btn-sm" id="btn-add-exp">
                    <span class="material-symbols-outlined">remove_circle</span>
                    ${t('common.addExpense')}
                </button>
            </div>
        </div>

        <div class="view-body animate-in">
            <div class="glass-card filter-panel">
                <div class="filter-toolbar">
                    <input type="text" class="input-field" id="search-tx" placeholder="${t('history.searchPlaceholder')}" style="flex:1">
                    <button class="btn btn-slate btn-sm" id="btn-reset-filters">${t('common.reset')}</button>
                </div>

                <div class="filter-row filter-row-spaced">
                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.type')}</span>
                        <div class="filter-chip-btns">
                            <button class="filter-chip active" data-filter="type" data-val="all">${t('common.all')}</button>
                            <button class="filter-chip" data-filter="type" data-val="income">${t('common.income')}</button>
                            <button class="filter-chip" data-filter="type" data-val="expense">${t('common.expense')}</button>
                        </div>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.category')}</span>
                        <select class="filter-select" id="filter-cat">
                            <option value="all">${t('common.all')}</option>
                            ${categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.period')}</span>
                        <select class="filter-select" id="filter-preset">
                            <option value="all">${t('common.allTime')}</option>
                            <option value="week">${t('common.thisWeek')}</option>
                            <option value="month">${t('common.thisMonth')}</option>
                            <option value="year">${t('common.thisYear')}</option>
                        </select>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.amount')}</span>
                        <div class="amount-sort-btns">
                            <button class="amount-sort-btn" id="amt-asc"><span class="material-symbols-outlined">arrow_upward</span></button>
                            <button class="amount-sort-btn" id="amt-desc"><span class="material-symbols-outlined">arrow_downward</span></button>
                        </div>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.from')}</span>
                        <div class="date-range-btn-wrap">
                            <button class="date-range-btn" id="btn-date-from"><span id="lbl-date-from">${formatDateButton('')}</span></button>
                            <input type="date" id="input-date-from" class="hidden-date-input">
                        </div>
                    </div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.to')}</span>
                        <div class="date-range-btn-wrap">
                            <button class="date-range-btn" id="btn-date-to"><span id="lbl-date-to">${formatDateButton('')}</span></button>
                            <input type="date" id="input-date-to" class="hidden-date-input">
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass-card data-table-card">
                <div class="table-scroll">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width:12%">${t('common.date')}</th>
                                <th style="width:30%">${t('modal.description')}</th>
                                <th style="width:15%">${t('common.category')}</th>
                                <th style="width:18%">${t('modal.paymentMethod')}</th>
                                <th style="width:15%;text-align:right">${t('common.amount')}</th>
                                <th style="width:10%;text-align:center">${t('history.receipt')}</th>
                            </tr>
                        </thead>
                        <tbody id="tx-body"></tbody>
                    </table>
                </div>

                <div class="pagination">
                    <span class="pagination-info" id="pagination-info">—</span>
                    <div class="pagination-btns" id="pagination-btns"></div>
                </div>
            </div>
        </div>
    `;
}

function refreshTable() {
    const allTransactions = getFilteredTransactions();
    const totalPages = Math.max(1, Math.ceil(allTransactions.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allTransactions.slice(startIndex, startIndex + PAGE_SIZE);

    const tableBody = document.getElementById('tx-body');
    if (tableBody) tableBody.innerHTML = rowsMarkup(pageItems);

    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
        const start = allTransactions.length ? startIndex + 1 : 0;
        const end = Math.min(startIndex + PAGE_SIZE, allTransactions.length);
        paginationInfo.textContent = t('history.showingItems', { start, end, total: allTransactions.length });
    }

    const paginationButtons = document.getElementById('pagination-btns');
    if (paginationButtons) paginationButtons.innerHTML = buildPagination(allTransactions.length, currentPage);

    document.querySelectorAll('#pagination-btns .pagination-btn').forEach(button => {
        button.addEventListener('click', () => {
            const page = Number(button.dataset.page);
            if (!Number.isNaN(page)) {
                currentPage = page;
                refreshTable();
            }
        });
    });

    document.getElementById('amt-asc')?.classList.toggle('active', filters.amountSort === 'asc');
    document.getElementById('amt-desc')?.classList.toggle('active', filters.amountSort === 'desc');
}

export function initHistory() {
    currentPage = 1;
    filters = { type: 'all', category: 'all', search: '', preset: 'all', dateFrom: '', dateTo: '', amountSort: 'none' };
    refreshTable();

    document.getElementById('search-tx')?.addEventListener('input', event => {
        filters.search = event.target.value;
        currentPage = 1;
        refreshTable();
    });

    document.getElementById('filter-cat')?.addEventListener('change', event => {
        filters.category = event.target.value;
        currentPage = 1;
        refreshTable();
    });

    document.getElementById('filter-preset')?.addEventListener('change', event => {
        filters.preset = event.target.value;
        currentPage = 1;
        refreshTable();
    });

    document.querySelectorAll('[data-filter="type"]').forEach(button => {
        button.addEventListener('click', () => {
            filters.type = button.dataset.val;
            currentPage = 1;
            document.querySelectorAll('[data-filter="type"]').forEach(item => item.classList.toggle('active', item.dataset.val === filters.type));
            refreshTable();
        });
    });

    document.getElementById('amt-asc')?.addEventListener('click', () => {
        filters.amountSort = filters.amountSort === 'asc' ? 'none' : 'asc';
        currentPage = 1;
        refreshTable();
    });

    document.getElementById('amt-desc')?.addEventListener('click', () => {
        filters.amountSort = filters.amountSort === 'desc' ? 'none' : 'desc';
        currentPage = 1;
        refreshTable();
    });

    ['from', 'to'].forEach(direction => {
        const button = document.getElementById(`btn-date-${direction}`);
        const input = document.getElementById(`input-date-${direction}`);
        const label = document.getElementById(`lbl-date-${direction}`);

        button?.addEventListener('click', () => {
            openDatePicker({
                anchor: button,
                value: input?.value || '',
                onSelect: selectedDate => {
                    if (input) input.value = selectedDate;
                    filters[direction === 'from' ? 'dateFrom' : 'dateTo'] = selectedDate;
                    if (label) label.innerHTML = formatDateButton(selectedDate);
                    currentPage = 1;
                    refreshTable();
                }
            });
        });

        input?.addEventListener('change', event => {
            filters[direction === 'from' ? 'dateFrom' : 'dateTo'] = event.target.value;
            if (label) label.innerHTML = formatDateButton(event.target.value);
            currentPage = 1;
            refreshTable();
        });
    });

    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
        filters = { type: 'all', category: 'all', search: '', preset: 'all', dateFrom: '', dateTo: '', amountSort: 'none' };
        currentPage = 1;

        const search = document.getElementById('search-tx');
        const category = document.getElementById('filter-cat');
        const preset = document.getElementById('filter-preset');
        const dateFrom = document.getElementById('input-date-from');
        const dateTo = document.getElementById('input-date-to');
        const labelFrom = document.getElementById('lbl-date-from');
        const labelTo = document.getElementById('lbl-date-to');

        if (search) search.value = '';
        if (category) category.value = 'all';
        if (preset) preset.value = 'all';
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        if (labelFrom) labelFrom.innerHTML = formatDateButton('');
        if (labelTo) labelTo.innerHTML = formatDateButton('');
        document.querySelectorAll('[data-filter="type"]').forEach(button => button.classList.toggle('active', button.dataset.val === 'all'));
        refreshTable();
    });

    document.getElementById('btn-add-tx')?.addEventListener('click', () => window.app.openModal('income'));
    document.getElementById('btn-add-exp')?.addEventListener('click', () => window.app.openModal('expense'));
    document.getElementById('btn-export-history-csv')?.addEventListener('click', exportHistoryCsv);
    document.getElementById('btn-export-history-pdf')?.addEventListener('click', exportHistoryPdf);
}
