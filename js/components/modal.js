import { getLocale, t } from '../i18n.js';
import {
    addExpenseCategory,
    addPaymentReminder,
    addReceipt,
    addTransaction,
    getCategories,
    getLanguage,
    getPayments,
    getState,
    getTransactions,
    removeExpenseCategory,
    updateExpenseCategory,
    updateReceipt,
    updateUserSettings
} from '../state/store.js';

const categoryPalette = [
    { name: 'Royal Blue', value: '#1142d4' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Coral Red', value: '#ef4444' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Rose', value: '#ec4899' },
    { name: 'Slate', value: '#64748b' },
    { name: 'Teal', value: '#0f766e' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Mint', value: '#34d399' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Cherry', value: '#dc2626' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Indigo', value: '#4f46e5' }
];

const categoryIcons = [
    { name: 'Subscriptions', value: 'subscriptions' },
    { name: 'Shopping', value: 'shopping_cart' },
    { name: 'Dining', value: 'restaurant' },
    { name: 'Travel', value: 'flight' },
    { name: 'Transport', value: 'directions_car' },
    { name: 'Home', value: 'home_work' },
    { name: 'Health', value: 'favorite' },
    { name: 'Education', value: 'school' },
    { name: 'Entertainment', value: 'sports_esports' },
    { name: 'Bills', value: 'receipt_long' },
    { name: 'Pets', value: 'pets' },
    { name: 'Services', value: 'build' },
    { name: 'Work', value: 'work' },
    { name: 'Fitness', value: 'exercise' },
    { name: 'Savings', value: 'savings' },
    { name: 'Technology', value: 'devices' }
];

function formatCurrency(value) {
    return new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: getState().user.currency || 'USD',
        minimumFractionDigits: 2
    }).format(value);
}

function formatDateLabel(isoDate) {
    return new Intl.DateTimeFormat(getLocale(), { month: 'short', day: 'numeric' }).format(new Date(`${isoDate}T00:00:00`));
}

function renderSelectOptions(items, selectedValue) {
    return items.map(item => `
        <option value="${item}" ${item === selectedValue ? 'selected' : ''}>${item}</option>
    `).join('');
}

function renderCategoryOptionMarkup(type) {
    return getCategories(type).map(category => `
        <option value="${category.id}">${category.name}</option>
    `).join('');
}

function getPaletteItem(color) {
    return categoryPalette.find(item => item.value.toLowerCase() === String(color).toLowerCase()) || categoryPalette[0];
}

function renderColorPalette(selectedColor = categoryPalette[0].value) {
    const selected = getPaletteItem(selectedColor);

    return `
        <div class="input-group">
            <label class="input-label">${t('modal.colorPalette')}</label>
            <div class="color-palette-preview">
                <span class="color-palette-preview-chip" id="selected-category-color-chip" style="--preview-color:${selected.value}"></span>
                <span class="color-palette-preview-label" id="selected-category-color-label">${selected.name}</span>
            </div>
            <div class="color-palette-grid">
                ${categoryPalette.map(item => `
                    <button
                        class="color-palette-btn ${item.value === selected.value ? 'active' : ''}"
                        type="button"
                        data-color-value="${item.value}"
                        data-color-name="${item.name}"
                        style="--swatch-color:${item.value}"
                        title="${item.name}"
                    ></button>
                `).join('')}
            </div>
            <input type="hidden" id="s-new-cat-color" value="${selected.value}">
        </div>
    `;
}

function getIconItem(iconValue) {
    return categoryIcons.find(item => item.value === iconValue) || categoryIcons[0];
}

function renderIconPicker(selectedIcon = categoryIcons[0].value) {
    const selected = getIconItem(selectedIcon);

    return `
        <div class="input-group">
            <label class="input-label">${t('modal.categoryIcon')}</label>
            <div class="icon-picker-preview">
                <span class="icon-picker-preview-chip" id="selected-category-icon-chip">
                    <span class="material-symbols-outlined">${selected.value}</span>
                </span>
                <span class="color-palette-preview-label" id="selected-category-icon-label">${selected.name}</span>
            </div>
            <div class="icon-picker-grid">
                ${categoryIcons.map(item => `
                    <button
                        class="icon-picker-btn ${item.value === selected.value ? 'active' : ''}"
                        type="button"
                        data-icon-value="${item.value}"
                        data-icon-name="${item.name}"
                        title="${item.name}"
                    >
                        <span class="material-symbols-outlined">${item.value}</span>
                    </button>
                `).join('')}
            </div>
            <input type="hidden" id="s-new-cat-icon" value="${selected.value}">
        </div>
    `;
}

function renderReceiptCategorySelect(type = 'expense', selectedId = '') {
    const categories = getCategories(type);
    const selected = categories.find(category => category.id === selectedId) || categories[0];

    return `
        <div class="custom-select-shell" id="rc-category-shell">
            <button class="custom-select-trigger" type="button" id="rc-category-trigger" aria-expanded="false">
                <span class="custom-select-trigger-main">
                    <span class="custom-select-icon" id="rc-category-selected-icon" style="background:${selected.color}1A;border-color:${selected.color}33;color:${selected.color}">
                        <span class="material-symbols-outlined">${selected.icon}</span>
                    </span>
                    <span class="custom-select-label" id="rc-category-selected-label">${selected.name}</span>
                </span>
                <span class="material-symbols-outlined custom-select-chevron">expand_more</span>
            </button>
            <div class="custom-select-menu" id="rc-category-menu" hidden>
                ${categories.map(category => `
                    <button
                        class="custom-select-option ${category.id === selected.id ? 'active' : ''}"
                        type="button"
                        data-category-option="${category.id}"
                        data-category-name="${category.name}"
                        data-category-icon="${category.icon}"
                        data-category-color="${category.color}"
                    >
                        <span class="custom-select-icon" style="background:${category.color}1A;border-color:${category.color}33;color:${category.color}">
                            <span class="material-symbols-outlined">${category.icon}</span>
                        </span>
                        <span class="custom-select-meta">
                            <span class="custom-select-label">${category.name}</span>
                            <span class="custom-select-caption">${type === 'income' ? t('common.income') : t('common.expense')}</span>
                        </span>
                    </button>
                `).join('')}
            </div>
            <input type="hidden" id="rc-category" value="${selected.id}">
        </div>
    `;
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function getCategoryBudgetCaption(category) {
    return category.custom ? t('modal.customCategory') : t('modal.defaultCategory');
}

function renderSettingsCategoryRow(category, options = {}) {
    const isNew = options.isNew || false;
    const isDirty = options.isDirty || false;
    const caption = isDirty ? t('modal.pendingSave') : getCategoryBudgetCaption(category);

    return `
        <div
            class="settings-category-row ${category.custom ? 'is-custom' : ''}"
            data-category-id="${category.id || ''}"
            data-category-name="${escapeHtml(category.name)}"
            data-category-icon="${category.icon}"
            data-category-color="${category.color}"
            ${isNew ? 'data-new-category="true"' : ''}
            ${isDirty ? 'data-category-dirty="true"' : ''}
        >
            <div class="settings-category-main">
                <div class="settings-category-swatch" style="background:${category.color}">
                    <span class="material-symbols-outlined">${category.icon}</span>
                </div>
                <div>
                    <p class="settings-category-name">${escapeHtml(category.name)}</p>
                    <p class="settings-category-caption">${caption}</p>
                </div>
            </div>
            <div class="settings-category-actions">
                ${category.custom ? `<button class="btn btn-secondary btn-sm category-edit-btn" data-category-edit="${category.id || ''}" style="padding:8px 10px"><span class="material-symbols-outlined" style="font-size:16px">edit</span></button>` : ''}
                ${category.custom ? `<button class="btn btn-secondary btn-sm category-remove-btn" data-category-remove="${category.id || ''}" style="padding:8px 10px;color:var(--accent-red)">&times;</button>` : ''}
            </div>
        </div>
    `;
}

function getModalShell(title, body, actions = '') {
    return `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" id="modal-close" aria-label="${t('common.close')}">&times;</button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="form-feedback" id="modal-feedback" hidden></div>
        ${actions ? `<div class="modal-actions">${actions}</div>` : ''}
    `;
}

function incomeExpenseModal(type) {
    const isIncome = type === 'income';
    const today = new Date().toISOString().slice(0, 10);

    const body = `
        <div class="input-group">
            <label class="input-label">${t('modal.amountUsd')}</label>
            <input type="number" class="input-field" id="m-amount" placeholder="0.00" step="0.01">
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.description')}</label>
            <input type="text" class="input-field" id="m-desc" placeholder="${isIncome ? 'Monthly salary' : 'Coffee shop'}">
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.category')}</label>
            <select class="input-field" id="m-cat">${renderCategoryOptionMarkup(isIncome ? 'income' : 'expense')}</select>
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.paymentMethod')}</label>
            <select class="input-field" id="m-method">${renderSelectOptions(getState().user.paymentMethods, getState().user.paymentMethods[0])}</select>
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.date')}</label>
            <input type="date" class="input-field" id="m-date" value="${today}">
        </div>
    `;

    const actions = `
        <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.cancel')}</button>
        <button class="btn btn-primary-fill btn-sm" id="modal-save">${t('common.save')}</button>
    `;

    return getModalShell(isIncome ? t('modal.addIncome') : t('modal.addExpense'), body, actions);
}

function reminderModal(prefillDate) {
    const reminders = (prefillDate ? getPayments().filter(payment => payment.dueDate === prefillDate) : [])
        .map(payment => `
            <div class="reminder-date-item">
                <div class="reminder-date-item-main">
                    <span class="reminder-date-item-name">${payment.name}</span>
                    <span class="reminder-date-item-note">${payment.note}</span>
                </div>
                <strong class="reminder-date-item-amount">${formatCurrency(payment.amount)}</strong>
            </div>
        `).join('');

    const body = `
        <div class="input-group">
            <label class="input-label">${t('modal.paymentName')}</label>
            <input type="text" class="input-field" id="m-rname" placeholder="Netflix">
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.amountUsd')}</label>
            <input type="number" class="input-field" id="m-ramount" placeholder="0.00" step="0.01">
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.dueDate')}</label>
            <input type="date" class="input-field" id="m-rdate" value="${prefillDate || ''}">
        </div>
        <div class="reminders-date-panel">
            <p class="modal-section-kicker" id="reminders-on-date-title">${t('modal.remindersOnDate')}</p>
            <div id="reminders-on-date-list">
                ${reminders || `<div class="reminders-date-empty">${t('modal.noRemindersOnDate')}</div>`}
            </div>
        </div>
    `;

    const actions = `
        <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.cancel')}</button>
        <button class="btn btn-primary-fill btn-sm" id="modal-save-r">${t('modal.addReminder')}</button>
    `;

    return getModalShell(t('modal.reminderTitle'), body, actions);
}

function buildReceiptFilePreview({ fileName = '', fileType = '', previewDataUrl = '', merchant = '', amount = '', isoDate = '' } = {}) {
    const upperType = String(fileType || '').toUpperCase();
    const hasImage = Boolean(previewDataUrl && upperType !== 'PDF');

    if (!fileName && !hasImage) return '';

    return `
        <div class="receipt-upload-preview-card">
            <div class="receipt-upload-preview-art">
                ${hasImage
                    ? `<img src="${previewDataUrl}" alt="${fileName || merchant || 'Receipt preview'}" class="receipt-upload-preview-image" loading="lazy">`
                    : `<div class="receipt-upload-preview-doc">
                        <span class="material-symbols-outlined">description</span>
                        <strong>${upperType || 'FILE'}</strong>
                    </div>`
                }
            </div>
            <div class="receipt-upload-preview-meta">
                <strong>${fileName || t('modal.fileReady')}</strong>
                <span>${upperType || '-'}</span>
                ${(merchant || amount || isoDate) ? `<small>${[merchant, amount ? formatCurrency(Number(amount)) : '', isoDate].filter(Boolean).join(' · ')}</small>` : ''}
            </div>
        </div>
    `;
}

function uploadReceiptModal(data = {}) {
    const today = new Date().toISOString().slice(0, 10);
    const transaction = data.prefillTransaction || null;
    const initialType = transaction?.type === 'income' ? 'income' : 'expense';
    const initialCategory = transaction?.categoryId || '';
    const initialMerchant = transaction?.description || '';
    const initialAmount = transaction?.amount || '';
    const initialDate = transaction?.isoDate || today;
    const body = `
        <div class="upload-area" id="upload-drop-zone">
            <span class="material-symbols-outlined" style="font-size:48px;color:var(--text-muted)">upload_file</span>
            <p style="font-size:14px;font-weight:600;color:#fff">${t('modal.dragDrop')}</p>
            <p style="font-size:12px;color:var(--text-muted)">${t('modal.uploadSupport')}</p>
            <input type="file" id="upload-file-input" accept="image/*,.pdf" style="display:none">
        </div>
        <div class="field-feedback" id="upload-file-feedback" hidden></div>
        <div id="upload-file-preview">${buildReceiptFilePreview({
            fileName: data.prefillFileName || '',
            fileType: data.prefillFileType || '',
            previewDataUrl: data.prefillPreviewDataUrl || '',
            merchant: initialMerchant,
            amount: initialAmount,
            isoDate: initialDate
        })}</div>
        <input type="hidden" id="upload-file-data-url" value="${data.prefillPreviewDataUrl || ''}">
        <input type="hidden" id="upload-file-name-hidden" value="${data.prefillFileName || ''}">
        <input type="hidden" id="upload-file-type-hidden" value="${data.prefillFileType || ''}">
        ${transaction ? `
            <div class="glass-card linked-transaction-card">
                <p class="modal-section-kicker">${t('modal.linkedTransaction')}</p>
                <div class="linked-transaction-head">
                    <strong>${transaction.description}</strong>
                    <span>${formatCurrency(transaction.amount)}</span>
                </div>
                <p class="linked-transaction-copy">${transaction.isoDate} · ${t(`common.${transaction.type}`)} · ${getCategoryById(transaction.categoryId)?.name || '-'}</p>
            </div>
        ` : ''}
        <div class="input-group">
            <label class="input-label">${t('modal.merchantName')}</label>
            <input type="text" class="input-field" id="rc-merchant" placeholder="${t('modal.merchantPlaceholder')}" value="${escapeHtml(initialMerchant)}">
        </div>
        <div class="modal-grid-two">
            <div class="input-group">
                <label class="input-label">${t('modal.amountUsd')}</label>
                <input type="number" class="input-field" id="rc-amount" placeholder="0.00" step="0.01" value="${initialAmount}">
            </div>
            <div class="input-group">
                <label class="input-label">${t('modal.date')}</label>
                <input type="date" class="input-field" id="rc-date" value="${initialDate}">
            </div>
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.category')}</label>
            ${renderReceiptCategorySelect(initialType, initialCategory)}
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.receiptType')}</label>
            <div class="segmented-grid">
                <button class="filter-chip ${initialType === 'expense' ? 'active' : ''} receipt-type-chip" style="justify-content:center" data-rctype="expense">${t('modal.expense')}</button>
                <button class="filter-chip ${initialType === 'income' ? 'active' : ''} receipt-type-chip" style="justify-content:center" data-rctype="income">${t('modal.income')}</button>
            </div>
        </div>
    `;

    const actions = `
        <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.cancel')}</button>
        <button class="btn btn-primary-fill btn-sm" id="modal-save-receipt">
            <span class="material-symbols-outlined" style="font-size:16px">upload</span>
            ${t('common.upload')}
        </button>
    `;

    return getModalShell(t('modal.uploadReceipt'), body, actions);
}

function scanReceiptModal() {
    const body = `
        <div class="upload-area upload-area-emphasis">
            <span class="material-symbols-outlined" style="font-size:56px;color:var(--primary)">photo_camera</span>
            <p style="font-size:14px;font-weight:600;color:#fff">${t('modal.scanReceipt')}</p>
            <p style="font-size:12px;color:var(--text-muted)">${t('modal.dragDrop')}</p>
            <input type="file" id="scan-file-input" accept="image/*" capture="environment" style="display:none">
            <button class="btn btn-primary-fill btn-sm" id="btn-open-camera" style="margin-top:8px">
                <span class="material-symbols-outlined">photo_camera</span>
                ${t('modal.openCamera')}
            </button>
        </div>
        <div class="glass-card modal-note-card">
            <p class="modal-section-kicker">${t('modal.scanHelpTitle')}</p>
            <div style="display:flex;flex-direction:column;gap:8px">
                <div class="modal-step-row"><span class="material-symbols-outlined">photo_camera</span><span>${t('modal.scanStep1')}</span></div>
                <div class="modal-step-row"><span class="material-symbols-outlined">auto_fix_high</span><span>${t('modal.scanStep2')}</span></div>
                <div class="modal-step-row"><span class="material-symbols-outlined">check_circle</span><span>${t('modal.scanStep3')}</span></div>
            </div>
        </div>
    `;

    const actions = `
        <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.cancel')}</button>
        <button class="btn btn-primary-fill btn-sm" id="btn-confirm-scan">
            <span class="material-symbols-outlined" style="font-size:16px">document_scanner</span>
            ${t('modal.scanExtract')}
        </button>
    `;

    return getModalShell(t('modal.scanReceipt'), body, actions);
}

function settingsModal() {
    const user = getState().user;
    const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
    const countryOptions = ['United States', 'Colombia', 'Mexico', 'Spain', 'United Kingdom', 'Canada'];
    const currencyOptions = ['USD', 'EUR', 'COP', 'MXN', 'GBP'];

    const categoryRows = getCategories('expense').map(category => renderSettingsCategoryRow(category)).join('');

    const paymentMethodRows = (user.paymentMethods || []).map(method => `
        <div class="settings-inline-row">
            <input type="text" class="input-field pm-field" value="${method}" style="flex:1">
            <button class="btn btn-secondary btn-sm pm-remove" style="padding:8px 10px;color:var(--accent-red)">&times;</button>
        </div>
    `).join('');

    const body = `
        <div class="modal-scroll-body">
            <div class="settings-profile-head">
                <div class="user-avatar settings-avatar"><img src="${user.avatar}" alt="${user.name}"></div>
                <div>
                    <p style="font-weight:700;font-size:16px">${user.name}</p>
                    <p style="font-size:11px;color:var(--accent-cyan)">${user.role}</p>
                </div>
            </div>

            <p class="modal-section-kicker">${t('modal.personalInfo')}</p>
            <div class="input-group">
                <label class="input-label">${t('modal.fullName')}</label>
                <input type="text" class="input-field" id="s-name" value="${user.fullName || user.name}">
            </div>
            <div class="modal-grid-two">
                <div class="input-group">
                    <label class="input-label">${t('modal.dateOfBirth')}</label>
                    <input type="date" class="input-field" id="s-dob" value="${user.dob || ''}">
                </div>
                <div class="input-group">
                    <label class="input-label">${t('modal.age')}</label>
                    <input type="number" class="input-field" id="s-age" value="${user.age || ''}" min="1">
                </div>
            </div>
            <div class="modal-grid-two">
                <div class="input-group">
                    <label class="input-label">${t('modal.gender')}</label>
                    <select class="input-field" id="s-gender">${renderSelectOptions(genderOptions, user.gender)}</select>
                </div>
                <div class="input-group">
                    <label class="input-label">${t('modal.country')}</label>
                    <select class="input-field" id="s-country">${renderSelectOptions(countryOptions, user.country)}</select>
                </div>
            </div>
            <div class="input-group">
                <label class="input-label">${t('modal.currency')}</label>
                <select class="input-field" id="s-currency">${renderSelectOptions(currencyOptions, user.currency)}</select>
            </div>

            <p class="modal-section-kicker">${t('modal.account')}</p>
            <div class="input-group">
                <label class="input-label">${t('modal.email')}</label>
                <input type="email" class="input-field" id="s-email" value="${user.email || ''}">
            </div>
            <div class="input-group">
                <label class="input-label">${t('modal.password')}</label>
                <input type="password" class="input-field" id="s-password" placeholder="••••••••">
            </div>

            <p class="modal-section-kicker">${t('modal.paymentMethods')}</p>
            <div id="payment-methods-list" style="display:flex;flex-direction:column;gap:8px">${paymentMethodRows}</div>
            <button class="btn btn-secondary btn-sm btn-full" id="add-payment-method">
                <span class="material-symbols-outlined" style="font-size:16px">add</span>
                ${t('modal.addPaymentMethod')}
            </button>

            <p class="modal-section-kicker">${t('modal.expenseCategories')}</p>
            <p class="modal-help-text">${t('modal.customCategoriesHelp')}</p>
            <div class="settings-category-list" id="settings-category-list">${categoryRows}</div>

            <div class="settings-category-creator">
                <input type="hidden" id="s-category-edit-id" value="">
                <div class="input-group">
                    <label class="input-label">${t('modal.categoryName')}</label>
                    <input type="text" class="input-field" id="s-new-cat-name" placeholder="Subscriptions">
                </div>
                <div class="modal-grid-two">
                    <div class="input-group">
                        ${renderIconPicker()}
                    </div>
                    <div>
                        ${renderColorPalette()}
                    </div>
                </div>
                <div class="settings-inline-row">
                    <button class="btn btn-primary-outline btn-sm" id="btn-add-category" style="flex:1">
                        <span class="material-symbols-outlined" style="font-size:16px">add_circle</span>
                        <span id="btn-category-submit-label">${t('modal.addCategory')}</span>
                    </button>
                    <button class="btn btn-secondary btn-sm" id="btn-cancel-category-edit" hidden>${t('common.cancel')}</button>
                </div>
            </div>
        </div>
    `;

    const actions = `
        <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.cancel')}</button>
        <button class="btn btn-primary-fill btn-sm" id="modal-save-settings">${t('common.saveChanges')}</button>
    `;

    return getModalShell(t('modal.profileSettings'), body, actions);
}

function receiptPreviewModal(receipt) {
    const body = `
        <div class="receipt-preview-modal">
            <div class="receipt-preview-modal-art">
                ${receipt.previewDataUrl && receipt.fileType !== 'PDF'
                    ? `<img src="${receipt.previewDataUrl}" alt="${receipt.merchant}" class="receipt-preview-modal-image" loading="lazy">`
                    : `<span class="material-symbols-outlined">${receipt.icon}</span>`
                }
            </div>
            <div class="receipt-preview-modal-meta">
                <div class="receipt-preview-row"><span>${t('modal.merchantName')}</span><strong>${receipt.merchant}</strong></div>
                <div class="receipt-preview-row"><span>${t('common.category')}</span><strong>${receipt.categoryName}</strong></div>
                <div class="receipt-preview-row"><span>${t('common.amount')}</span><strong>${formatCurrency(receipt.amount)}</strong></div>
                <div class="receipt-preview-row"><span>${t('common.date')}</span><strong>${receipt.dateLabel}</strong></div>
                <div class="receipt-preview-row"><span>${t('common.type')}</span><strong>${receipt.fileType}</strong></div>
                ${receipt.fileName ? `<div class="receipt-preview-row"><span>${t('modal.receiptFileName')}</span><strong>${receipt.fileName}</strong></div>` : ''}
                ${receipt.linkedTransactionLabel ? `<div class="receipt-preview-row"><span>${t('modal.linkedTransaction')}</span><strong>${receipt.linkedTransactionLabel}</strong></div>` : ''}
            </div>
        </div>
    `;

    const linkedBtnClass = receipt.transactionId ? 'btn-danger' : 'btn-secondary';
    const linkedBtnText = receipt.transactionId ? 
        `<span class="material-symbols-outlined" style="font-size:16px">link_off</span> ${t('modal.unlinkTransaction')}` :
        `<span class="material-symbols-outlined" style="font-size:16px">link</span> ${t('modal.linkTransaction')}`;
    
    const actions = `
        <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.close')}</button>
        ${receipt.transactionId ? `<button class="btn ${linkedBtnClass} btn-sm" id="btn-unlink-receipt">${linkedBtnText}</button>` : ''}
        ${!receipt.transactionId ? `<button class="btn btn-secondary btn-sm" id="btn-link-receipt">${linkedBtnText}</button>` : ''}
        <button class="btn btn-primary-fill btn-sm" id="btn-download-preview">
            <span class="material-symbols-outlined" style="font-size:16px">download</span>
            ${t('common.download')}
        </button>
    `;

    return getModalShell(t('modal.receiptPreview'), body, actions);
}

function confirmDeleteReminderModal(payment) {
    const body = `
        <div class="confirm-delete-hero">
            <div class="confirm-delete-icon">
                <span class="material-symbols-outlined">delete_forever</span>
            </div>
            <div>
                <h4 class="confirm-delete-title">${t('sidebar.deletePendingReminderTitle')}</h4>
                <p class="confirm-delete-copy">${t('sidebar.deletePendingReminderSubtitle')}</p>
            </div>
        </div>
        <div class="confirm-delete-card">
            <div>
                <p class="confirm-delete-card-label">${payment.name}</p>
                <p class="confirm-delete-card-note">${payment.note}</p>
            </div>
            <strong class="confirm-delete-card-amount">${formatCurrency(payment.amount)}</strong>
        </div>
    `;

    const actions = `
        <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.cancel')}</button>
        <button class="btn btn-primary-fill btn-sm confirm-delete-action-btn" id="btn-confirm-delete-reminder">
            <span class="material-symbols-outlined" style="font-size:16px">delete</span>
            ${t('sidebar.deletePendingReminderAction')}
        </button>
    `;

    return getModalShell(t('sidebar.deletePendingReminderTitle'), body, actions);
}

function bindOverlayClose(overlay) {
    const close = () => overlay.classList.remove('active');
    document.getElementById('modal-close')?.addEventListener('click', close);
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    overlay.onclick = event => {
        if (event.target === overlay) close();
    };
    return close;
}

function renderRemindersForDate(date) {
    const container = document.getElementById('reminders-on-date-list');
    if (!container) return;

    const reminders = date ? getPayments().filter(payment => payment.dueDate === date) : [];
    container.innerHTML = reminders.length ? reminders.map(payment => `
        <div class="reminder-date-item">
            <div class="reminder-date-item-main">
                <span class="reminder-date-item-name">${payment.name}</span>
                <span class="reminder-date-item-note">${payment.note}</span>
            </div>
            <strong class="reminder-date-item-amount">${formatCurrency(payment.amount)}</strong>
        </div>
    `).join('') : `<div class="reminders-date-empty">${t('modal.noRemindersOnDate')}</div>`;
}

function bindColorPalette() {
    document.querySelectorAll('[data-color-value]').forEach(button => {
        button.addEventListener('click', () => {
            const hiddenInput = document.getElementById('s-new-cat-color');
            const colorChip = document.getElementById('selected-category-color-chip');
            const colorLabel = document.getElementById('selected-category-color-label');
            const selectedColor = button.getAttribute('data-color-value') || categoryPalette[0].value;
            const selectedName = button.getAttribute('data-color-name') || getPaletteItem(selectedColor).name;

            if (hiddenInput) hiddenInput.value = selectedColor;
            if (colorChip) colorChip.style.setProperty('--preview-color', selectedColor);
            if (colorLabel) colorLabel.textContent = selectedName;

            document.querySelectorAll('[data-color-value]').forEach(item => item.classList.toggle('active', item === button));
        });
    });
}

function bindIconPicker() {
    document.querySelectorAll('[data-icon-value]').forEach(button => {
        button.addEventListener('click', () => {
            const hiddenInput = document.getElementById('s-new-cat-icon');
            const iconChip = document.getElementById('selected-category-icon-chip');
            const iconLabel = document.getElementById('selected-category-icon-label');
            const selectedValue = button.getAttribute('data-icon-value') || categoryIcons[0].value;
            const selectedName = button.getAttribute('data-icon-name') || getIconItem(selectedValue).name;

            if (hiddenInput) hiddenInput.value = selectedValue;
            if (iconChip) iconChip.innerHTML = `<span class="material-symbols-outlined">${selectedValue}</span>`;
            if (iconLabel) iconLabel.textContent = selectedName;

            document.querySelectorAll('[data-icon-value]').forEach(item => item.classList.toggle('active', item === button));
        });
    });
}

function bindReceiptCategorySelect() {
    const shell = document.getElementById('rc-category-shell');
    const trigger = document.getElementById('rc-category-trigger');
    const menu = document.getElementById('rc-category-menu');
    const valueInput = document.getElementById('rc-category');
    const label = document.getElementById('rc-category-selected-label');
    const iconWrap = document.getElementById('rc-category-selected-icon');

    if (!shell || !trigger || !menu || !valueInput || !label || !iconWrap) return;

    trigger.addEventListener('click', event => {
        event.preventDefault();
        const isOpen = shell.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));
        menu.hidden = !isOpen;
    });

    menu.querySelectorAll('[data-category-option]').forEach(option => {
        option.addEventListener('click', () => {
            const selectedId = option.getAttribute('data-category-option') || '';
            const selectedName = option.getAttribute('data-category-name') || '';
            const selectedIcon = option.getAttribute('data-category-icon') || 'sell';
            const selectedColor = option.getAttribute('data-category-color') || '#1142d4';

            valueInput.value = selectedId;
            label.textContent = selectedName;
            iconWrap.style.background = `${selectedColor}1A`;
            iconWrap.style.borderColor = `${selectedColor}33`;
            iconWrap.style.color = selectedColor;
            iconWrap.innerHTML = `<span class="material-symbols-outlined">${selectedIcon}</span>`;

            menu.querySelectorAll('[data-category-option]').forEach(item => item.classList.toggle('active', item === option));
            shell.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
            menu.hidden = true;
        });
    });
}

function updateReceiptCategorySelect(type) {
    const shell = document.getElementById('rc-category-shell');
    if (!shell) return;
    shell.outerHTML = renderReceiptCategorySelect(type);
    bindReceiptCategorySelect();
}

function setModalFeedback(message, type = 'error') {
    const feedback = document.getElementById('modal-feedback');
    if (!feedback) return;
    feedback.hidden = !message;
    feedback.className = `form-feedback ${type ? `is-${type}` : ''}`;
    feedback.textContent = message || '';
}

function setFieldError(input, message) {
    if (!input?.id) return;
    input.classList.add('is-invalid');

    let error = document.querySelector(`[data-error-for="${input.id}"]`);
    if (!error) {
        error = document.createElement('div');
        error.className = 'field-feedback is-error';
        error.dataset.errorFor = input.id;
        input.insertAdjacentElement('afterend', error);
    }

    error.textContent = message;
}

function clearFieldError(input) {
    if (!input?.id) return;
    input.classList.remove('is-invalid');
    document.querySelector(`[data-error-for="${input.id}"]`)?.remove();
}

function clearFieldErrors() {
    document.querySelectorAll('.input-field.is-invalid').forEach(input => input.classList.remove('is-invalid'));
    document.querySelectorAll('.field-feedback[data-error-for]').forEach(error => error.remove());
}

function validateFields(validations) {
    clearFieldErrors();
    setModalFeedback('');

    let hasErrors = false;

    validations.forEach(({ input, message, test }) => {
        if (!input) return;
        const isValid = typeof test === 'function' ? test(input.value) : Boolean(String(input.value || '').trim());
        if (isValid) return;
        setFieldError(input, message);
        hasErrors = true;
    });

    if (hasErrors) setModalFeedback(t('modal.validationError'));
    return !hasErrors;
}

function resetCategoryCreator() {
    const nameInput = document.getElementById('s-new-cat-name');
    const iconInput = document.getElementById('s-new-cat-icon');
    const colorInput = document.getElementById('s-new-cat-color');
    const editIdInput = document.getElementById('s-category-edit-id');
    const submitLabel = document.getElementById('btn-category-submit-label');
    const cancelButton = document.getElementById('btn-cancel-category-edit');

    if (nameInput) nameInput.value = '';
    if (iconInput) iconInput.value = categoryIcons[0].value;
    if (colorInput) colorInput.value = categoryPalette[0].value;
    if (editIdInput) editIdInput.value = '';
    if (submitLabel) submitLabel.textContent = t('modal.addCategory');
    if (cancelButton) cancelButton.hidden = true;

    const iconChip = document.getElementById('selected-category-icon-chip');
    const iconLabel = document.getElementById('selected-category-icon-label');
    if (iconChip) iconChip.innerHTML = `<span class="material-symbols-outlined">${categoryIcons[0].value}</span>`;
    if (iconLabel) iconLabel.textContent = categoryIcons[0].name;
    document.querySelectorAll('[data-icon-value]').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-icon-value') === categoryIcons[0].value);
    });
    document.querySelectorAll('[data-color-value]').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-color-value') === categoryPalette[0].value);
    });
    document.getElementById('selected-category-color-chip')?.style.setProperty('--preview-color', categoryPalette[0].value);
    const paletteLabel = getPaletteItem(categoryPalette[0].value).name;
    const colorLabel = document.getElementById('selected-category-color-label');
    if (colorLabel) colorLabel.textContent = paletteLabel;
}

function readCategoryDraft() {
    return {
        id: document.getElementById('s-category-edit-id')?.value || '',
        name: document.getElementById('s-new-cat-name')?.value?.trim() || '',
        icon: document.getElementById('s-new-cat-icon')?.value?.trim() || 'sell',
        color: document.getElementById('s-new-cat-color')?.value || categoryPalette[0].value,
        custom: true
    };
}

function hasDuplicateCategoryName(name, excludeId = '') {
    const normalized = name.trim().toLowerCase();
    return Array.from(document.querySelectorAll('.settings-category-row'))
        .some(row => !row.classList.contains('marked-for-removal')
            && (row.dataset.categoryId || '') !== excludeId
            && (row.dataset.categoryName || '').trim().toLowerCase() === normalized);
}

function upsertCategoryRow(category, options = {}) {
    const categoryList = document.getElementById('settings-category-list');
    if (!categoryList) return;

    const existing = category.id ? categoryList.querySelector(`[data-category-id="${category.id}"]`) : null;
    const markup = renderSettingsCategoryRow(category, options);

    if (existing) {
        existing.outerHTML = markup;
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = markup.trim();
    categoryList.appendChild(wrapper.firstElementChild);
}

function saveCategoryDraft() {
    const nameInput = document.getElementById('s-new-cat-name');
    if (!validateFields([
        { input: nameInput, message: t('modal.categoryNameRequired') }
    ])) return;

    const draft = readCategoryDraft();
    const isNewCategory = !draft.id || draft.id.startsWith('draft-');
    if (hasDuplicateCategoryName(draft.name, draft.id)) {
        setFieldError(nameInput, t('modal.categoryNameDuplicate'));
        setModalFeedback(t('modal.validationError'));
        return;
    }

    upsertCategoryRow(
        { ...draft, id: draft.id || `draft-${Date.now()}` },
        { isNew: isNewCategory, isDirty: true }
    );

    resetCategoryCreator();
    setModalFeedback(t('modal.categoryDraftSaved'), 'success');
}

function beginCategoryEdit(row) {
    if (!row) return;

    const nameInput = document.getElementById('s-new-cat-name');
    const iconInput = document.getElementById('s-new-cat-icon');
    const colorInput = document.getElementById('s-new-cat-color');
    const editIdInput = document.getElementById('s-category-edit-id');
    const submitLabel = document.getElementById('btn-category-submit-label');
    const cancelButton = document.getElementById('btn-cancel-category-edit');

    if (nameInput) nameInput.value = row.dataset.categoryName || '';
    if (iconInput) iconInput.value = row.dataset.categoryIcon || categoryIcons[0].value;
    if (colorInput) colorInput.value = row.dataset.categoryColor || categoryPalette[0].value;
    if (editIdInput) editIdInput.value = row.dataset.categoryId || '';
    if (submitLabel) submitLabel.textContent = t('modal.updateCategory');
    if (cancelButton) cancelButton.hidden = false;

    const selectedIcon = getIconItem(iconInput?.value || categoryIcons[0].value);
    const iconChip = document.getElementById('selected-category-icon-chip');
    const iconLabel = document.getElementById('selected-category-icon-label');
    if (iconChip) iconChip.innerHTML = `<span class="material-symbols-outlined">${selectedIcon.value}</span>`;
    if (iconLabel) iconLabel.textContent = selectedIcon.name;

    const selectedColor = getPaletteItem(colorInput?.value || categoryPalette[0].value);
    document.getElementById('selected-category-color-chip')?.style.setProperty('--preview-color', selectedColor.value);
    const colorLabel = document.getElementById('selected-category-color-label');
    if (colorLabel) colorLabel.textContent = selectedColor.name;

    document.querySelectorAll('[data-icon-value]').forEach(item => item.classList.toggle('active', item.getAttribute('data-icon-value') === selectedIcon.value));
    document.querySelectorAll('[data-color-value]').forEach(item => item.classList.toggle('active', item.getAttribute('data-color-value') === selectedColor.value));
}

function bindSettingsModal(close) {
    resetCategoryCreator();

    document.getElementById('add-payment-method')?.addEventListener('click', () => {
        const list = document.getElementById('payment-methods-list');
        if (!list) return;

        const row = document.createElement('div');
        row.className = 'settings-inline-row';
        row.innerHTML = `
            <input type="text" class="input-field pm-field" value="" style="flex:1" placeholder="Card **** 0000">
            <button class="btn btn-secondary btn-sm pm-remove" style="padding:8px 10px;color:var(--accent-red)">&times;</button>
        `;
        list.appendChild(row);
    });

    document.getElementById('btn-add-category')?.addEventListener('click', saveCategoryDraft);
    document.getElementById('btn-cancel-category-edit')?.addEventListener('click', resetCategoryCreator);
    document.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('input', () => clearFieldError(input));
    });

    document.getElementById('modal-container')?.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const removeTrigger = target.closest('[data-category-remove]');
        const editTrigger = target.closest('[data-category-edit]');

        if (target.classList.contains('pm-remove') || target.closest('.pm-remove')) {
            (target.closest('.settings-inline-row') || target.parentElement)?.remove();
        }

        if (removeTrigger instanceof HTMLElement) {
            removeTrigger.closest('.settings-category-row')?.classList.toggle('marked-for-removal');
        }

        if (editTrigger instanceof HTMLElement) {
            beginCategoryEdit(editTrigger.closest('.settings-category-row'));
        }
    });

    document.getElementById('modal-save-settings')?.addEventListener('click', () => {
        const nameInput = document.getElementById('s-name');
        const emailInput = document.getElementById('s-email');

        if (!validateFields([
            { input: nameInput, message: t('modal.fullNameRequired') },
            { input: emailInput, message: t('modal.emailInvalid'), test: value => !value || /\S+@\S+\.\S+/.test(value) }
        ])) return;

        updateUserSettings({
            fullName: document.getElementById('s-name')?.value || getState().user.name,
            name: document.getElementById('s-name')?.value || getState().user.name,
            dob: document.getElementById('s-dob')?.value || '',
            age: Number(document.getElementById('s-age')?.value) || '',
            gender: document.getElementById('s-gender')?.value || '',
            country: document.getElementById('s-country')?.value || '',
            currency: document.getElementById('s-currency')?.value || 'USD',
            email: document.getElementById('s-email')?.value || '',
            password: document.getElementById('s-password')?.value || getState().user.password || '',
            paymentMethods: Array.from(document.querySelectorAll('.pm-field'))
                .map(field => field.value.trim())
                .filter(Boolean)
        });

        document.querySelectorAll('.settings-category-row.marked-for-removal[data-category-id]').forEach(row => {
            removeExpenseCategory(row.getAttribute('data-category-id'));
        });

        document.querySelectorAll('.settings-category-row.is-custom:not(.marked-for-removal)').forEach(row => {
            const payload = {
                name: row.dataset.categoryName || '',
                icon: row.dataset.categoryIcon || 'sell',
                color: row.dataset.categoryColor || categoryPalette[0].value
            };

            if (row.dataset.newCategory === 'true') {
                addExpenseCategory({ ...payload, budget: 0 });
                return;
            }

            if (row.dataset.categoryDirty === 'true' && row.dataset.categoryId) {
                updateExpenseCategory(row.dataset.categoryId, payload);
            }
        });

        window.app?.showToast(t('modal.settingsSaved'));
        close();
        window.app.rerender();
    });
}

function downloadPreview(receipt) {
    const lines = [
        `Merchant: ${receipt.merchant}`,
        `Category: ${receipt.categoryName}`,
        `Amount: ${formatCurrency(receipt.amount)}`,
        `Date: ${receipt.dateLabel}`,
        `Type: ${receipt.fileType}`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${receipt.merchant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-receipt.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
}

export function openModal(type, data = {}) {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    if (!overlay || !container) return;

    if (type === 'income' || type === 'expense') container.innerHTML = incomeExpenseModal(type);
    if (type === 'reminder') container.innerHTML = reminderModal(data.prefillDate || '');
    if (type === 'upload-receipt') container.innerHTML = uploadReceiptModal(data);
    if (type === 'scan-receipt') container.innerHTML = scanReceiptModal();
    if (type === 'settings') container.innerHTML = settingsModal();
    if (type === 'receipt-preview') container.innerHTML = receiptPreviewModal(data.receipt);
    if (type === 'confirm-delete-reminder') container.innerHTML = confirmDeleteReminderModal(data.payment);

    overlay.classList.add('active');
    const close = bindOverlayClose(overlay);
    document.querySelectorAll('#modal-container .input-field').forEach(input => {
        input.addEventListener('input', () => clearFieldError(input));
        input.addEventListener('change', () => clearFieldError(input));
    });

    document.getElementById('modal-save')?.addEventListener('click', () => {
        const amountInput = document.getElementById('m-amount');
        const descriptionInput = document.getElementById('m-desc');
        const dateInput = document.getElementById('m-date');
        if (!validateFields([
            { input: amountInput, message: t('modal.amountRequired'), test: value => Number(value) > 0 },
            { input: descriptionInput, message: t('modal.descriptionRequired') },
            { input: dateInput, message: t('modal.dateRequired') }
        ])) return;

        const amount = Number(amountInput?.value);
        const description = descriptionInput?.value?.trim();
        const categoryId = document.getElementById('m-cat')?.value;
        const date = dateInput?.value;
        const method = document.getElementById('m-method')?.value || getState().user.paymentMethods[0];

        addTransaction({
            isoDate: date,
            type,
            categoryId,
            amount,
            description,
            detail: type === 'income' ? 'Added from quick action' : 'Added from quick action',
            method,
            methodType: method.toLowerCase().includes('bank') ? 'bank' : method.toLowerCase().includes('cash') ? 'cash' : 'visa'
        });

        window.app?.showToast(t('modal.transactionSaved'));
        close();
        window.app.rerender();
    });

    document.getElementById('modal-save-r')?.addEventListener('click', () => {
        const nameInput = document.getElementById('m-rname');
        const amountInput = document.getElementById('m-ramount');
        const dueDateInput = document.getElementById('m-rdate');
        if (!validateFields([
            { input: nameInput, message: t('modal.paymentNameRequired') },
            { input: amountInput, message: t('modal.amountRequired'), test: value => Number(value) > 0 },
            { input: dueDateInput, message: t('modal.dateRequired') }
        ])) return;

        const name = nameInput?.value?.trim();
        const amount = Number(amountInput?.value);
        const dueDate = dueDateInput?.value;

        addPaymentReminder({
            name,
            amount,
            dueDate,
            note: getLanguage() === 'es' ? 'Próximo pago' : 'Upcoming'
        });

        window.app?.showToast(t('modal.reminderSaved'));
        close();
        window.app.refreshSidebar();
    });

    document.getElementById('m-rdate')?.addEventListener('change', event => {
        renderRemindersForDate(event.target.value);
    });

    document.querySelectorAll('.receipt-type-chip').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.receipt-type-chip').forEach(chip => chip.classList.remove('active'));
            button.classList.add('active');
            updateReceiptCategorySelect(button.dataset.rctype === 'income' ? 'income' : 'expense');
        });
    });

    document.getElementById('upload-drop-zone')?.addEventListener('click', () => {
        document.getElementById('upload-file-input')?.click();
    });

    document.getElementById('upload-file-input')?.addEventListener('change', event => {
        const file = event.target.files?.[0];
        const feedback = document.getElementById('upload-file-feedback');
        const preview = document.getElementById('upload-file-preview');
        const dataUrlInput = document.getElementById('upload-file-data-url');
        const fileNameInput = document.getElementById('upload-file-name-hidden');
        const fileTypeInput = document.getElementById('upload-file-type-hidden');
        if (!feedback) return;
        if (!file) {
            feedback.hidden = true;
            feedback.textContent = '';
            if (preview) preview.innerHTML = '';
            if (dataUrlInput) dataUrlInput.value = '';
            if (fileNameInput) fileNameInput.value = '';
            if (fileTypeInput) fileTypeInput.value = '';
            return;
        }

        const merchant = document.getElementById('rc-merchant')?.value || '';
        const amount = document.getElementById('rc-amount')?.value || '';
        const isoDate = document.getElementById('rc-date')?.value || '';
        const fileType = file.name?.split('.').pop()?.toUpperCase() || file.type?.split('/').pop()?.toUpperCase() || 'FILE';

        feedback.hidden = false;
        feedback.className = 'field-feedback is-success';
        if (fileNameInput) fileNameInput.value = file.name;
        if (fileTypeInput) fileTypeInput.value = fileType;

        const reader = new FileReader();
        reader.onload = loadEvent => {
            const result = typeof loadEvent.target?.result === 'string' ? loadEvent.target.result : '';
            if (dataUrlInput) dataUrlInput.value = result;
            if (preview) {
                preview.innerHTML = buildReceiptFilePreview({
                    fileName: file.name,
                    fileType,
                    previewDataUrl: result,
                    merchant,
                    amount,
                    isoDate
                });
            }
        };
        reader.readAsDataURL(file);
        feedback.textContent = `${file.name} · ${fileType} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
        queueMicrotask(() => {
            feedback.textContent = `${file.name} · ${fileType} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
        });
        feedback.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    });

    document.getElementById('modal-save-receipt')?.addEventListener('click', () => {
        const merchantInput = document.getElementById('rc-merchant');
        const amountInput = document.getElementById('rc-amount');
        const dateInput = document.getElementById('rc-date');
        if (!validateFields([
            { input: merchantInput, message: t('modal.merchantRequired') },
            { input: amountInput, message: t('modal.amountRequired'), test: value => Number(value) > 0 },
            { input: dateInput, message: t('modal.dateRequired') }
        ])) return;

        const merchant = merchantInput?.value?.trim();
        const amount = Number(amountInput?.value);
        const isoDate = dateInput?.value;
        const categoryId = document.getElementById('rc-category')?.value;
        const selectedType = document.querySelector('.receipt-type-chip.active')?.getAttribute('data-rctype') || 'expense';
        const uploadInput = document.getElementById('upload-file-input');
        const file = uploadInput instanceof HTMLInputElement ? uploadInput.files?.[0] : null;
        const fileType = document.getElementById('upload-file-type-hidden')?.value || file?.name?.split('.').pop()?.toUpperCase() || 'PDF';
        const fileName = document.getElementById('upload-file-name-hidden')?.value || file?.name || '';
        const previewDataUrl = document.getElementById('upload-file-data-url')?.value || '';

        if (!file) {
            setModalFeedback(t('modal.receiptFileRequired'));
            return;
        }

        addReceipt({
            merchant,
            amount,
            isoDate,
            categoryId,
            fileType,
            fileName,
            previewDataUrl,
            icon: fileType === 'PDF' ? 'description' : 'image',
            transactionType: selectedType,
            transactionId: data.prefillTransaction?.id || null
        });

        window.app?.showToast(t('modal.receiptUploaded'));
        close();
        window.app.rerender();
    });

    document.getElementById('btn-open-camera')?.addEventListener('click', () => {
        document.getElementById('scan-file-input')?.click();
    });

    document.getElementById('btn-confirm-scan')?.addEventListener('click', () => {
        window.app?.showToast(t('modal.scanQueued'));
        close();
    });

    if (type === 'upload-receipt') bindReceiptCategorySelect();
    if (type === 'settings') {
        bindColorPalette();
        bindIconPicker();
        bindSettingsModal(close);
    }
    if (type === 'confirm-delete-reminder') {
        document.getElementById('btn-confirm-delete-reminder')?.addEventListener('click', () => {
            data.onConfirm?.();
            close();
        });
    }

    if (type === 'receipt-preview') {
        const receiptId = data.receipt?.id;
        const receiptType = data.receipt?.transactionType;

        document.getElementById('btn-download-preview')?.addEventListener('click', () => {
            if (!data.receipt) return;
            downloadPreview(data.receipt);
        });

        document.getElementById('btn-unlink-receipt')?.addEventListener('click', () => {
            if (!receiptId) return;
            updateReceipt(receiptId, { transactionId: null });
            window.app?.showToast(t('receipts.linkedTo', { value: t('common.unlinked') }), 'success');
            window.app?.rerender();
        });

        document.getElementById('btn-link-receipt')?.addEventListener('click', () => {
            if (!receiptId || !receiptType) return;
            
            const transactions = getTransactions().filter(tx => tx.type === receiptType);
            const transactionsHtml = transactions.slice(0, 10).map(tx => `
                <div class="transaction-link-item" data-tx-id="${tx.id}" style="padding:12px;border-bottom:1px solid rgba(30,41,59,0.3);cursor:pointer;display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-weight:600">${tx.description}</div>
                        <div style="font-size:12px;color:var(--text-muted)">${formatDateLabel(tx.isoDate)}</div>
                    </div>
                    <strong>${formatCurrency(tx.amount)}</strong>
                </div>
            `).join('');

            const selectBody = `
                <div style="padding:12px 0">
                    <p style="font-size:14px;color:var(--text-muted);margin-bottom:12px">${t('receipts.selectTransaction', { value: data.receipt.merchant })}</p>
                    <div style="max-height:300px;overflow-y:auto">
                        ${transactionsHtml || `<div style="padding:24px;text-align:center;color:var(--text-muted)">${t('receipts.noTransactionsFound')}</div>`}
                    </div>
                </div>
            `;

            const selectActions = `
                <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.cancel')}</button>
            `;

            container.innerHTML = getModalShell(t('receipts.selectTransaction'), selectBody, selectActions);
            bindOverlayClose(overlay);

            document.querySelectorAll('.transaction-link-item').forEach(item => {
                item.addEventListener('click', () => {
                    const txId = item.getAttribute('data-tx-id');
                    updateReceipt(receiptId, { transactionId: Number(txId) });
                    window.app?.showToast(t('receipts.linkedSuccess'), 'success');
                    window.app?.rerender();
                });
            });
        });
    }
}
