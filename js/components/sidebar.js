import { getLocale, t } from '../i18n.js';
import { getLanguage, getPayments, getState, removePaymentReminder, updatePaymentStatus } from '../state/store.js';

function formatCurrency(value) {
    return new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: getState().user.currency || 'USD',
        minimumFractionDigits: 2
    }).format(value);
}

export function renderRightSidebar() {
    const state = getState();
    const paymentItems = getPayments().map(payment => {
        const isChecked = payment.status === 'completed';
        const amountColor = isChecked ? 'var(--text-secondary)' : '#fff';
        const noteColor = payment.status === 'overdue' ? 'var(--accent-red)' : 'var(--text-muted)';

        return `
            <div class="glass-card payment-item" style="border-left-color:${payment.borderColor}">
                <input type="checkbox" class="payment-check" data-id="${payment.id}" ${isChecked ? 'checked' : ''}>
                <div class="payment-details" style="flex:1">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;gap:8px">
                        <p class="payment-name">${payment.name}</p>
                        <p class="payment-amount" style="color:${amountColor}">${formatCurrency(payment.amount)}</p>
                    </div>
                    <p style="font-size:10px;color:${noteColor};font-weight:500">${payment.note}</p>
                </div>
                <button class="payment-delete-btn" type="button" data-delete-payment="${payment.id}" title="${t('sidebar.deleteReminder')}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;
    }).join('');

    return `
        <div class="glass-card user-profile-card">
            <div style="display:flex;align-items:center;gap:12px;min-width:0">
                <div class="user-avatar"><img src="${state.user.avatar}" alt="${state.user.name}"></div>
                <div style="min-width:0">
                    <p class="user-name">${state.user.name}</p>
                    <p class="user-role">${t('sidebar.premiumMember')}</p>
                </div>
            </div>

            <div class="profile-actions">
                <button class="language-toggle-btn" id="btn-language-toggle" title="${t('common.language')}">
                    <span class="language-toggle-current">${getLanguage().toUpperCase()}</span>
                </button>
                <button class="icon-action-btn" id="btn-settings" title="${t('common.settings')}">
                    <span class="material-symbols-outlined" style="font-size:20px">settings</span>
                </button>
            </div>
        </div>

        <button class="btn btn-primary-outline btn-full" id="btn-add-reminder">
            <span class="material-symbols-outlined" style="font-size:18px">notification_add</span>
            ${t('sidebar.addPaymentReminder')}
        </button>

        <div>
            <h3 class="sidebar-section-label">${t('sidebar.upcomingPayments')}</h3>
            <div style="display:flex;flex-direction:column;gap:12px" id="payment-list">${paymentItems}</div>
        </div>

        <div class="glass-card smart-tip">
            <div class="smart-tip-header">
                <span class="material-symbols-outlined" style="font-size:14px;color:var(--accent-cyan)">auto_awesome</span>
                <span class="smart-tip-title">${t('sidebar.smartSavingTip')}</span>
            </div>
            <p class="smart-tip-text">${state.tips[0]}</p>
        </div>
    `;
}

export function renderCalendar(year, month) {
    const container = document.getElementById('mini-calendar');
    if (!container) return;

    const locale = getLocale();
    const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
    const dayNames = Array.from({ length: 7 }, (_, index) => {
        const reference = new Date(2026, 3, 5 + index);
        return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(reference);
    });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const today = new Date();

    const paymentDates = getPayments().map(payment => {
        const dueDate = new Date(`${payment.dueDate}T00:00:00`);
        return {
            day: dueDate.getDate(),
            month: dueDate.getMonth(),
            year: dueDate.getFullYear(),
            status: payment.status
        };
    });

    const cells = [];

    for (let index = firstDay - 1; index >= 0; index -= 1) {
        cells.push({ day: prevMonthDays - index, current: false, month: month - 1, year: month === 0 ? year - 1 : year });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push({ day, current: true, month, year });
    }

    let nextDay = 1;
    while (cells.length < 42) {
        cells.push({ day: nextDay, current: false, month: month === 11 ? 0 : month + 1, year: month === 11 ? year + 1 : year });
        nextDay += 1;
    }

    const calendarDays = cells.map(cell => {
        const isToday = cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();
        const payment = paymentDates.find(item => item.day === cell.day && item.month === cell.month && item.year === cell.year);

        let dotHtml = '';
        if (payment) {
            const dotClass = payment.status === 'overdue'
                ? 'payment-dot-red'
                : payment.status === 'completed'
                    ? 'payment-dot-cyan'
                    : 'payment-dot-purple';
            dotHtml = `<div class="payment-dot-indicator ${dotClass}"></div>`;
        }

        const dateString = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
        const classes = ['calendar-day'];
        if (!cell.current) classes.push('other-month');
        if (isToday) classes.push('today');

        return `<div class="${classes.join(' ')}" data-date="${dateString}">${cell.day}${dotHtml}</div>`;
    }).join('');

    container.innerHTML = `
        <div class="calendar-header">
            <span class="calendar-month">${monthLabel}</span>
            <div class="calendar-nav">
                <button id="cal-prev" aria-label="Previous month">
                    <span class="material-symbols-outlined" style="font-size:16px">chevron_left</span>
                </button>
                <button id="cal-next" aria-label="Next month">
                    <span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>
                </button>
            </div>
        </div>
        <div class="calendar-grid">
            ${dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
            ${calendarDays}
        </div>
    `;

    document.getElementById('cal-prev')?.addEventListener('click', () => {
        renderCalendar(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
        renderCalendar(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1);
    });

    container.querySelectorAll('.calendar-day:not(.other-month)').forEach(element => {
        element.addEventListener('click', () => {
            const date = element.getAttribute('data-date');
            if (date) window.app.openModal('reminder', { prefillDate: date });
        });
    });
}

export function initRightSidebar() {
    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());

    document.getElementById('payment-list')?.addEventListener('change', event => {
        const checkbox = event.target;
        if (!(checkbox instanceof HTMLInputElement) || !checkbox.classList.contains('payment-check')) return;

        const paymentId = Number(checkbox.dataset.id);
        updatePaymentStatus(paymentId, checkbox.checked ? 'completed' : 'pending');
        window.app.refreshSidebar();
    });

    document.getElementById('payment-list')?.addEventListener('click', event => {
        const deleteButton = event.target instanceof HTMLElement ? event.target.closest('[data-delete-payment]') : null;
        if (!deleteButton) return;

        const paymentId = Number(deleteButton.getAttribute('data-delete-payment'));
        const payment = getPayments().find(item => item.id === paymentId);
        if (!payment) return;

        if (payment.status !== 'completed') {
            window.app.openModal('confirm-delete-reminder', {
                payment,
                onConfirm: () => {
                    removePaymentReminder(paymentId);
                    window.app.refreshSidebar();
                }
            });
            return;
        }

        removePaymentReminder(paymentId);
        window.app.refreshSidebar();
    });

    document.getElementById('btn-add-reminder')?.addEventListener('click', () => window.app.openModal('reminder'));
    document.getElementById('btn-settings')?.addEventListener('click', () => window.app.openModal('settings'));
    document.getElementById('btn-language-toggle')?.addEventListener('click', () => window.app.toggleLanguage());
}
