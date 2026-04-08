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
    removeExpenseCategory,
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

function getModalShell(title, body, actions = '') {
    return `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close" id="modal-close" aria-label="${t('common.close')}">&times;</button>
        </div>
        <div class="modal-body">${body}</div>
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

function uploadReceiptModal() {
    const today = new Date().toISOString().slice(0, 10);
    const body = `
        <div class="upload-area" id="upload-drop-zone">
            <span class="material-symbols-outlined" style="font-size:48px;color:var(--text-muted)">upload_file</span>
            <p style="font-size:14px;font-weight:600;color:#fff">${t('modal.dragDrop')}</p>
            <p style="font-size:12px;color:var(--text-muted)">${t('modal.uploadSupport')}</p>
            <input type="file" id="upload-file-input" accept="image/*,.pdf" style="display:none">
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.merchantName')}</label>
            <input type="text" class="input-field" id="rc-merchant" placeholder="Whole Foods Market">
        </div>
        <div class="modal-grid-two">
            <div class="input-group">
                <label class="input-label">${t('modal.amountUsd')}</label>
                <input type="number" class="input-field" id="rc-amount" placeholder="0.00" step="0.01">
            </div>
            <div class="input-group">
                <label class="input-label">${t('modal.date')}</label>
                <input type="date" class="input-field" id="rc-date" value="${today}">
            </div>
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.category')}</label>
            ${renderReceiptCategorySelect('expense')}
        </div>
        <div class="input-group">
            <label class="input-label">${t('modal.receiptType')}</label>
            <div class="segmented-grid">
                <button class="filter-chip active receipt-type-chip" style="justify-content:center" data-rctype="expense">${t('modal.expense')}</button>
                <button class="filter-chip receipt-type-chip" style="justify-content:center" data-rctype="income">${t('modal.income')}</button>
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

    const categoryRows = getCategories('expense').map(category => `
        <div class="settings-category-row ${category.custom ? 'is-custom' : ''}" data-category-id="${category.id}">
            <div class="settings-category-main">
                <div class="settings-category-swatch" style="background:${category.color}">
                    <span class="material-symbols-outlined">${category.icon}</span>
                </div>
                <div>
                    <p class="settings-category-name">${category.name}</p>
                    <p class="settings-category-caption">${category.custom ? t('modal.customCategory') : t('modal.defaultCategory')}</p>
                </div>
            </div>
            <div class="settings-category-actions">
                ${category.custom ? `<button class="btn btn-secondary btn-sm category-remove-btn" data-category-remove="${category.id}" style="padding:8px 10px;color:var(--accent-red)">&times;</button>` : ''}
            </div>
        </div>
    `).join('');

    const paymentMethodRows = (user.paymentMethods || []).map((method, index) => `
        <div class="settings-inline-row">
            <input type="text" class="input-field pm-field" value="${method}" style="flex:1" data-index="${index}">
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
                        ${t('modal.addCategory')}
                    </button>
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
                <span class="material-symbols-outlined">${receipt.icon}</span>
            </div>
            <div class="receipt-preview-modal-meta">
                <div class="receipt-preview-row"><span>${t('modal.merchantName')}</span><strong>${receipt.merchant}</strong></div>
                <div class="receipt-preview-row"><span>${t('common.category')}</span><strong>${receipt.categoryName}</strong></div>
                <div class="receipt-preview-row"><span>${t('common.amount')}</span><strong>${formatCurrency(receipt.amount)}</strong></div>
                <div class="receipt-preview-row"><span>${t('common.date')}</span><strong>${receipt.dateLabel}</strong></div>
                <div class="receipt-preview-row"><span>${t('common.type')}</span><strong>${receipt.fileType}</strong></div>
            </div>
        </div>
    `;

    const actions = `
        <button class="btn btn-secondary btn-sm" id="modal-cancel">${t('common.close')}</button>
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

function appendPendingCategory() {
    const nameInput = document.getElementById('s-new-cat-name');
    const iconInput = document.getElementById('s-new-cat-icon');
    const colorInput = document.getElementById('s-new-cat-color');
    const categoryList = document.getElementById('settings-category-list');

    if (!nameInput || !iconInput || !colorInput || !categoryList) return;
    if (!nameInput.value.trim()) return;

    const row = document.createElement('div');
    row.className = 'settings-category-row is-custom';
    row.dataset.newCategory = 'true';
    row.dataset.newName = nameInput.value.trim();
    row.dataset.newIcon = iconInput.value.trim() || 'sell';
    row.dataset.newColor = colorInput.value;

    row.innerHTML = `
        <div class="settings-category-main">
            <div class="settings-category-swatch" style="background:${colorInput.value}">
                <span class="material-symbols-outlined">${iconInput.value.trim() || 'sell'}</span>
            </div>
            <div>
                <p class="settings-category-name">${nameInput.value.trim()}</p>
                <p class="settings-category-caption">${t('modal.pendingSave')}</p>
            </div>
        </div>
        <div class="settings-category-actions">
            <button class="btn btn-secondary btn-sm remove-pending-category" style="padding:8px 10px;color:var(--accent-red)">&times;</button>
        </div>
    `;

    categoryList.appendChild(row);
    nameInput.value = '';
    iconInput.value = categoryIcons[0].value;
    colorInput.value = categoryPalette[0].value;
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

function bindSettingsModal(close) {
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

    document.getElementById('btn-add-category')?.addEventListener('click', appendPendingCategory);

    document.getElementById('modal-container')?.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (target.classList.contains('pm-remove') || target.closest('.pm-remove')) {
            (target.closest('.settings-inline-row') || target.parentElement)?.remove();
        }

        if (target.classList.contains('remove-pending-category') || target.closest('.remove-pending-category')) {
            target.closest('.settings-category-row')?.remove();
        }

        if (target.dataset.categoryRemove) {
            target.closest('.settings-category-row')?.classList.toggle('marked-for-removal');
        }
    });

    document.getElementById('modal-save-settings')?.addEventListener('click', () => {
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

        document.querySelectorAll('.settings-category-row[data-new-category="true"]').forEach(row => {
            addExpenseCategory({
                name: row.dataset.newName,
                icon: row.dataset.newIcon,
                color: row.dataset.newColor,
                budget: 0
            });
        });

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
    if (type === 'upload-receipt') container.innerHTML = uploadReceiptModal();
    if (type === 'scan-receipt') container.innerHTML = scanReceiptModal();
    if (type === 'settings') container.innerHTML = settingsModal();
    if (type === 'receipt-preview') container.innerHTML = receiptPreviewModal(data.receipt);
    if (type === 'confirm-delete-reminder') container.innerHTML = confirmDeleteReminderModal(data.payment);

    overlay.classList.add('active');
    const close = bindOverlayClose(overlay);

    document.getElementById('modal-save')?.addEventListener('click', () => {
        const amount = Number(document.getElementById('m-amount')?.value);
        const description = document.getElementById('m-desc')?.value?.trim();
        const categoryId = document.getElementById('m-cat')?.value;
        const date = document.getElementById('m-date')?.value;
        const method = document.getElementById('m-method')?.value || getState().user.paymentMethods[0];

        if (!amount || !description || !categoryId || !date) return;

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

        close();
        window.app.rerender();
    });

    document.getElementById('modal-save-r')?.addEventListener('click', () => {
        const name = document.getElementById('m-rname')?.value?.trim();
        const amount = Number(document.getElementById('m-ramount')?.value);
        const dueDate = document.getElementById('m-rdate')?.value;
        if (!name || !amount || !dueDate) return;

        addPaymentReminder({
            name,
            amount,
            dueDate,
            note: getLanguage() === 'es' ? 'Próximo pago' : 'Upcoming'
        });

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

    document.getElementById('modal-save-receipt')?.addEventListener('click', () => {
        const merchant = document.getElementById('rc-merchant')?.value?.trim();
        const amount = Number(document.getElementById('rc-amount')?.value);
        const isoDate = document.getElementById('rc-date')?.value;
        const categoryId = document.getElementById('rc-category')?.value;
        const selectedType = document.querySelector('.receipt-type-chip.active')?.getAttribute('data-rctype') || 'expense';
        const uploadInput = document.getElementById('upload-file-input');
        const file = uploadInput instanceof HTMLInputElement ? uploadInput.files?.[0] : null;
        const fileType = file?.name?.split('.').pop()?.toUpperCase() || 'PDF';

        if (!merchant || !amount || !isoDate || !categoryId) return;

        addReceipt({
            merchant,
            amount,
            isoDate,
            categoryId,
            fileType,
            icon: fileType === 'PDF' ? 'description' : 'image',
            transactionType: selectedType
        });

        close();
        window.app.rerender();
    });

    document.getElementById('btn-open-camera')?.addEventListener('click', () => {
        document.getElementById('scan-file-input')?.click();
    });

    document.getElementById('btn-confirm-scan')?.addEventListener('click', () => {
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
        document.getElementById('btn-download-preview')?.addEventListener('click', () => {
            if (!data.receipt) return;
            downloadPreview(data.receipt);
        });
    }
}
