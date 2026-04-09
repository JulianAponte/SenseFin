import { getLocale, t } from '../i18n.js';
import { openDatePicker } from '../components/datePicker.js';
import { getCategories, getCategoryById, getReceipts, getState, getTransactions } from '../state/store.js';

const PAGE_SIZE = 8;

let receiptPage = 1;
let receiptFilters = {
    search: '',
    preset: 'week',
    amountSort: 'none',
    dateFrom: '',
    dateTo: '',
    category: 'all',
    fileType: 'all'
};

function formatCurrency(value, sign = '') {
    return `${sign}${new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: getState().user.currency || 'USD',
        minimumFractionDigits: 2
    }).format(value)}`;
}

function formatDateLabel(isoDate) {
    return new Intl.DateTimeFormat(getLocale(), { month: 'short', day: 'numeric' }).format(new Date(`${isoDate}T00:00:00`));
}

function matchesDatePreset(isoDate, preset) {
    if (!preset) return true;

    const date = new Date(`${isoDate}T00:00:00`);
    const now = new Date();

    if (preset === '24h') {
        const threshold = new Date(now);
        threshold.setDate(now.getDate() - 1);
        return date >= threshold;
    }
    if (preset === 'week') {
        const threshold = new Date(now);
        threshold.setDate(now.getDate() - 7);
        return date >= threshold;
    }
    if (preset === 'month') {
        const threshold = new Date(now);
        threshold.setMonth(now.getMonth() - 1);
        return date >= threshold;
    }
    if (preset === 'year') {
        const threshold = new Date(now);
        threshold.setFullYear(now.getFullYear() - 1);
        return date >= threshold;
    }

    return true;
}

function getFilteredReceipts() {
    let list = getReceipts().filter(receipt => {
        const category = getCategoryById(receipt.categoryId);
        const text = `${receipt.merchant} ${category?.name || ''}`.toLowerCase();

        if (receiptFilters.search && !text.includes(receiptFilters.search.toLowerCase())) return false;
        if (receiptFilters.category !== 'all' && receipt.categoryId !== receiptFilters.category) return false;
        if (receiptFilters.fileType !== 'all') {
            if (receiptFilters.fileType === 'image' && !['JPG', 'IMG', 'PNG'].includes(receipt.fileType)) return false;
            if (receiptFilters.fileType === 'pdf' && receipt.fileType !== 'PDF') return false;
        }
        if (receiptFilters.dateFrom && receipt.isoDate < receiptFilters.dateFrom) return false;
        if (receiptFilters.dateTo && receipt.isoDate > receiptFilters.dateTo) return false;
        if (!matchesDatePreset(receipt.isoDate, receiptFilters.preset)) return false;
        return true;
    });

    if (receiptFilters.amountSort === 'asc') list = [...list].sort((left, right) => left.amount - right.amount);
    if (receiptFilters.amountSort === 'desc') list = [...list].sort((left, right) => right.amount - left.amount);
    if (receiptFilters.amountSort === 'none') list = [...list].sort((left, right) => right.isoDate.localeCompare(left.isoDate));

    return list;
}

function formatDateButton(value) {
    if (!value) return `<span class="material-symbols-outlined" style="font-size:14px">calendar_month</span>`;
    return `<span class="material-symbols-outlined" style="font-size:13px">calendar_month</span> ${formatDateLabel(value)}`;
}

function buildPagination(total, page) {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (totalPages <= 1) return '';

    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + 3);
    if (end - start < 3) start = Math.max(1, end - 3);

    let buttons = '';
    buttons += `<button class="pagination-btn" data-rcpage="1"><span class="material-symbols-outlined" style="font-size:14px">keyboard_double_arrow_left</span></button>`;
    buttons += `<button class="pagination-btn" data-rcpage="${Math.max(1, page - 1)}" ${page === 1 ? 'disabled' : ''}><span class="material-symbols-outlined" style="font-size:16px">chevron_left</span></button>`;
    for (let current = start; current <= end; current += 1) {
        buttons += `<button class="pagination-btn${current === page ? ' active' : ''}" data-rcpage="${current}">${current}</button>`;
    }
    buttons += `<button class="pagination-btn" data-rcpage="${Math.min(totalPages, page + 1)}" ${page === totalPages ? 'disabled' : ''}><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span></button>`;
    buttons += `<button class="pagination-btn" data-rcpage="${totalPages}"><span class="material-symbols-outlined" style="font-size:14px">keyboard_double_arrow_right</span></button>`;
    return buttons;
}

function getLinkedTransaction(receipt) {
    if (!receipt.transactionId) return null;
    return getTransactions().find(transaction => transaction.id === receipt.transactionId) || null;
}

function buildReceiptVisual(receipt) {
    if (receipt.previewDataUrl && receipt.fileType !== 'PDF') {
        return `<img src="${receipt.previewDataUrl}" alt="${receipt.merchant}" class="receipt-preview-image" loading="lazy">`;
    }

    const linkedTransaction = getLinkedTransaction(receipt);

    return `
        <div class="receipt-preview-doc-card">
            <div class="receipt-preview-doc-head">
                <span>${receipt.fileType}</span>
                <strong>${formatCurrency(receipt.amount, receipt.transactionType === 'income' ? '+' : '-')}</strong>
            </div>
            <div class="receipt-preview-doc-body">
                <strong>${receipt.merchant}</strong>
                <span>${formatDateLabel(receipt.isoDate)}</span>
                <span>${linkedTransaction?.description || getCategoryById(receipt.categoryId)?.name || '-'}</span>
            </div>
        </div>
    `;
}

function receiptCard(receipt) {
    const category = getCategoryById(receipt.categoryId);
    const isIncome = receipt.transactionType === 'income';
    const amountClass = isIncome ? 'amount-positive' : 'amount-negative';
    const linkedTransaction = getLinkedTransaction(receipt);

    return `
        <article class="glass-card receipt-card">
            <div class="receipt-preview">
                <button class="receipt-action-btn" data-preview-receipt="${receipt.id}" title="${t('common.preview')} / ${t('common.download')}">
                    <span class="material-symbols-outlined">download</span>
                </button>
                <div class="receipt-type-badge">${receipt.fileType}</div>
                ${buildReceiptVisual(receipt)}
            </div>
            <div class="receipt-info">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                    <h4 class="receipt-merchant">${receipt.merchant}</h4>
                    <span class="receipt-amount ${amountClass}">${formatCurrency(receipt.amount, isIncome ? '+' : '-')}</span>
                </div>
                <div class="receipt-meta">
                    <span class="badge badge-pill" style="background:${category?.color || '#334155'}1F;color:${category?.color || '#cbd5e1'};border-color:${category?.color || '#334155'}55">
                        ${category?.name || '-'}
                    </span>
                    <span style="font-size:11px;color:#64748b;font-weight:500">${formatDateLabel(receipt.isoDate)}</span>
                </div>
                ${linkedTransaction ? `<p class="receipt-link-copy">${t('receipts.linkedTo', { value: linkedTransaction.description })}</p>` : ''}
            </div>
        </article>
    `;
}

export function renderReceipts() {
    const categories = getCategories('expense').concat(getCategories('income'));

    return `
        <div class="view-header view-header-between receipts-header">
            <div>
                <h2 class="view-title">${t('common.receipts')}</h2>
            </div>
            <div class="header-action-cluster">
                <button class="btn btn-secondary btn-sm" id="btn-scan-receipt">
                    <span class="material-symbols-outlined">photo_camera</span>
                    ${t('receipts.scanReceipt')}
                </button>
                <button class="btn btn-primary-fill btn-sm" id="btn-upload-receipt">
                    <span class="material-symbols-outlined">add_circle</span>
                    ${t('receipts.uploadReceipt')}
                </button>
            </div>
        </div>

        <div class="view-body animate-in" style="gap:24px">
            <div class="filter-toolbar">
                <input type="text" class="input-field" id="receipt-search" placeholder="${t('receipts.searchPlaceholder')}" style="flex:1">
                <button class="btn btn-slate btn-sm" id="btn-receipts-reset">${t('common.reset')}</button>
            </div>

            <div class="filter-panel" style="padding:16px 20px">
                <div class="filter-row filter-row-spaced">
                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.dateRange')}</span>
                        <div class="filter-chip-btns">
                            <button class="filter-chip" data-rcrange="24h">${t('common.last24Hours')}</button>
                            <button class="filter-chip active" data-rcrange="week">${t('common.lastWeek')}</button>
                            <button class="filter-chip" data-rcrange="month">${t('common.lastMonth')}</button>
                            <button class="filter-chip" data-rcrange="year">${t('common.lastYear')}</button>
                        </div>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.amount')}</span>
                        <div class="amount-sort-btns">
                            <button class="amount-sort-btn" id="rc-amt-asc"><span class="material-symbols-outlined">arrow_upward</span></button>
                            <button class="amount-sort-btn" id="rc-amt-desc"><span class="material-symbols-outlined">arrow_downward</span></button>
                        </div>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.from')}</span>
                        <div class="date-range-btn-wrap">
                            <button class="date-range-btn" id="rc-btn-from"><span id="rc-lbl-from">${formatDateButton('')}</span></button>
                            <input type="date" id="rc-input-from" class="hidden-date-input">
                        </div>
                    </div>
                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.to')}</span>
                        <div class="date-range-btn-wrap">
                            <button class="date-range-btn" id="rc-btn-to"><span id="rc-lbl-to">${formatDateButton('')}</span></button>
                            <input type="date" id="rc-input-to" class="hidden-date-input">
                        </div>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.category')}</span>
                        <select class="filter-select" id="rc-category-filter">
                            <option value="all">${t('common.all')}</option>
                            ${categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('')}
                        </select>
                    </div>

                    <div class="filter-inline-divider"></div>

                    <div class="filter-chip-group">
                        <span class="filter-chip-label">${t('common.type')}</span>
                        <div class="filter-chip-btns">
                            <button class="filter-chip active" data-rctype-filter="all">${t('common.all')}</button>
                            <button class="filter-chip" data-rctype-filter="image">${t('receipts.image')}</button>
                            <button class="filter-chip" data-rctype-filter="pdf">${t('receipts.pdf')}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="receipt-grid" id="receipt-grid"></div>

            <div class="pagination" style="margin-top:auto;border-top:1px solid rgba(30,41,59,0.6);padding-top:24px">
                <span class="pagination-info" id="rc-pagination-info">—</span>
                <div class="pagination-btns" id="rc-pagination-btns"></div>
            </div>
        </div>
    `;
}

function refreshReceipts() {
    const allReceipts = getFilteredReceipts();
    const totalPages = Math.max(1, Math.ceil(allReceipts.length / PAGE_SIZE));
    if (receiptPage > totalPages) receiptPage = totalPages;

    const startIndex = (receiptPage - 1) * PAGE_SIZE;
    const pageItems = allReceipts.slice(startIndex, startIndex + PAGE_SIZE);

    const grid = document.getElementById('receipt-grid');
    if (grid) {
        grid.innerHTML = pageItems.length
            ? pageItems.map(receiptCard).join('')
            : `<div class="empty-state-card" style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:48px"><span class="material-symbols-outlined" style="font-size:56px;opacity:0.2">receipt</span><div class="empty-state-copy"><strong>${t('receipts.noReceipts')}</strong><span>${t('receipts.noReceiptsHelp')}</span></div></div>`;
    }

    const info = document.getElementById('rc-pagination-info');
    if (info) {
        const start = allReceipts.length ? startIndex + 1 : 0;
        const end = Math.min(startIndex + PAGE_SIZE, allReceipts.length);
        info.textContent = t('receipts.showingReceipts', { start, end, total: allReceipts.length });
    }

    const buttons = document.getElementById('rc-pagination-btns');
    if (buttons) buttons.innerHTML = buildPagination(allReceipts.length, receiptPage);

    document.querySelectorAll('[data-rcpage]').forEach(button => {
        button.addEventListener('click', () => {
            receiptPage = Number(button.dataset.rcpage);
            refreshReceipts();
        });
    });

    document.getElementById('rc-amt-asc')?.classList.toggle('active', receiptFilters.amountSort === 'asc');
    document.getElementById('rc-amt-desc')?.classList.toggle('active', receiptFilters.amountSort === 'desc');

    document.querySelectorAll('[data-preview-receipt]').forEach(button => {
        button.addEventListener('click', () => {
            const receipt = getReceipts().find(item => item.id === Number(button.dataset.previewReceipt));
            if (!receipt) return;

            window.app.openModal('receipt-preview', {
                receipt: {
                    ...receipt,
                    categoryName: getCategoryById(receipt.categoryId)?.name || '-',
                    dateLabel: formatDateLabel(receipt.isoDate),
                    linkedTransactionLabel: getLinkedTransaction(receipt)?.description || '',
                    fileName: receipt.fileName || ''
                }
            });
        });
    });
}

export function initReceipts() {
    receiptPage = 1;
    receiptFilters = { search: '', preset: 'week', amountSort: 'none', dateFrom: '', dateTo: '', category: 'all', fileType: 'all' };
    refreshReceipts();

    document.getElementById('btn-scan-receipt')?.addEventListener('click', () => window.app.openModal('scan-receipt'));
    document.getElementById('btn-upload-receipt')?.addEventListener('click', () => window.app.openModal('upload-receipt'));

    document.getElementById('receipt-search')?.addEventListener('input', event => {
        receiptFilters.search = event.target.value;
        receiptPage = 1;
        refreshReceipts();
    });

    document.querySelectorAll('[data-rcrange]').forEach(button => {
        button.addEventListener('click', () => {
            receiptFilters.preset = button.dataset.rcrange;
            receiptPage = 1;
            document.querySelectorAll('[data-rcrange]').forEach(item => item.classList.toggle('active', item.dataset.rcrange === receiptFilters.preset));
            refreshReceipts();
        });
    });

    document.getElementById('rc-amt-asc')?.addEventListener('click', () => {
        receiptFilters.amountSort = receiptFilters.amountSort === 'asc' ? 'none' : 'asc';
        receiptPage = 1;
        refreshReceipts();
    });

    document.getElementById('rc-amt-desc')?.addEventListener('click', () => {
        receiptFilters.amountSort = receiptFilters.amountSort === 'desc' ? 'none' : 'desc';
        receiptPage = 1;
        refreshReceipts();
    });

    ['from', 'to'].forEach(direction => {
        const button = document.getElementById(`rc-btn-${direction}`);
        const input = document.getElementById(`rc-input-${direction}`);
        const label = document.getElementById(`rc-lbl-${direction}`);

        button?.addEventListener('click', () => {
            openDatePicker({
                anchor: button,
                value: input?.value || '',
                onSelect: selectedDate => {
                    if (input) input.value = selectedDate;
                    receiptFilters[direction === 'from' ? 'dateFrom' : 'dateTo'] = selectedDate;
                    if (label) label.innerHTML = formatDateButton(selectedDate);
                    receiptPage = 1;
                    refreshReceipts();
                }
            });
        });

        input?.addEventListener('change', event => {
            receiptFilters[direction === 'from' ? 'dateFrom' : 'dateTo'] = event.target.value;
            if (label) label.innerHTML = formatDateButton(event.target.value);
            receiptPage = 1;
            refreshReceipts();
        });
    });

    document.getElementById('rc-category-filter')?.addEventListener('change', event => {
        receiptFilters.category = event.target.value;
        receiptPage = 1;
        refreshReceipts();
    });

    document.querySelectorAll('[data-rctype-filter]').forEach(button => {
        button.addEventListener('click', () => {
            receiptFilters.fileType = button.dataset.rctypeFilter;
            receiptPage = 1;
            document.querySelectorAll('[data-rctype-filter]').forEach(item => item.classList.toggle('active', item.dataset.rctypeFilter === receiptFilters.fileType));
            refreshReceipts();
        });
    });

    document.getElementById('btn-receipts-reset')?.addEventListener('click', () => {
        receiptFilters = { search: '', preset: 'week', amountSort: 'none', dateFrom: '', dateTo: '', category: 'all', fileType: 'all' };
        receiptPage = 1;

        const search = document.getElementById('receipt-search');
        const category = document.getElementById('rc-category-filter');
        const from = document.getElementById('rc-input-from');
        const to = document.getElementById('rc-input-to');
        const fromLabel = document.getElementById('rc-lbl-from');
        const toLabel = document.getElementById('rc-lbl-to');

        if (search) search.value = '';
        if (category) category.value = 'all';
        if (from) from.value = '';
        if (to) to.value = '';
        if (fromLabel) fromLabel.innerHTML = formatDateButton('');
        if (toLabel) toLabel.innerHTML = formatDateButton('');
        document.querySelectorAll('[data-rcrange]').forEach(button => button.classList.toggle('active', button.dataset.rcrange === 'week'));
        document.querySelectorAll('[data-rctype-filter]').forEach(button => button.classList.toggle('active', button.dataset.rctypeFilter === 'all'));
        refreshReceipts();
    });
}
