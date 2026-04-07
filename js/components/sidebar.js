import MOCK from '../data/mockData.js';

export function renderRightSidebar() {
    const paymentItems = MOCK.payments.map(p => {
        const isChecked = p.status === 'completed';
        const amountColor = isChecked ? 'var(--text-secondary)' : '#fff';
        const statusHtml = p.status === 'overdue'
            ? `<p style="font-size:9px;color:var(--accent-red);font-weight:500">${p.note}</p>`
            : `<p style="font-size:9px;color:var(--text-muted)">${p.note}</p>`;
        return `
        <div class="glass-card payment-item" style="border-left-color:${p.borderColor}">
            <input type="checkbox" class="payment-check" data-id="${p.id}" ${isChecked ? 'checked' : ''}>
            <div class="payment-details" style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
                    <p class="payment-name">${p.name}</p>
                    <p class="payment-amount" style="color:${amountColor}">$${p.amount.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
                </div>
                ${statusHtml}
            </div>
        </div>`;
    }).join('');

    return `
        <div class="glass-card user-profile-card">
            <div style="display:flex;align-items:center;gap:12px">
                <div class="user-avatar"><img src="${MOCK.user.avatar}" alt="${MOCK.user.name}"></div>
                <div>
                    <p class="user-name">${MOCK.user.name}</p>
                    <p class="user-role">${MOCK.user.role}</p>
                </div>
            </div>
            <button style="background:none;border:none;cursor:pointer;color:var(--text-muted);transition:color 0.15s" id="btn-settings">
                <span class="material-symbols-outlined" style="font-size:20px">settings</span>
            </button>
        </div>

        <button class="btn btn-primary-outline btn-full" id="btn-add-reminder" style="padding:16px;border-radius:12px;font-size:13px">
            <span class="material-symbols-outlined" style="font-size:18px">notification_add</span> Add Payment Reminder
        </button>

        <div>
            <h3 class="sidebar-section-label">Upcoming Payments</h3>
            <div style="display:flex;flex-direction:column;gap:12px" id="payment-list">${paymentItems}</div>
        </div>

        <div class="glass-card smart-tip" style="margin-top:auto">
            <div class="smart-tip-header">
                <span class="material-symbols-outlined" style="font-size:14px;color:var(--accent-cyan)">auto_awesome</span>
                <span class="smart-tip-title">Smart Saving Tip</span>
            </div>
            <p class="smart-tip-text">${MOCK.tips[0]}</p>
        </div>`;
}

/* CALENDAR — always 6 weeks, click to add reminder */
export function renderCalendar(year, month) {
    const container = document.getElementById('mini-calendar');
    if (!container) return;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames = ['S','M','T','W','T','F','S'];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const today = new Date();

    const paymentDates = MOCK.payments.map(p => {
        const d = new Date(p.dueDate);
        return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), status: p.status };
    });

    let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

    // Always render exactly 42 cells (6 weeks)
    const cells = [];
    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false, m: month - 1, y: month === 0 ? year - 1 : year });
    // Current month
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true, m: month, y: year });
    // Next month fill — always fill to 42
    let nextDay = 1;
    while (cells.length < 42) {
        cells.push({ day: nextDay++, current: false, m: month + 1, y: month === 11 ? year + 1 : year });
    }

    cells.forEach(cell => {
        const isToday = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const payment = paymentDates.find(p => p.day === cell.day && p.month === (cell.current ? month : cell.m) && p.year === (cell.current ? year : cell.y));
        let dotHtml = '';
        if (payment && !isToday) {
            const dotClass = payment.status === 'overdue' ? 'payment-dot-red' : payment.status === 'completed' ? 'payment-dot-cyan' : 'payment-dot-purple';
            dotHtml = `<div class="payment-dot-indicator ${dotClass}"></div>`;
        } else if (payment && isToday) {
            dotHtml = `<div class="payment-dot-indicator" style="background:#fff;box-shadow:0 0 5px #fff"></div>`;
        }
        const cls = isToday ? 'calendar-day today' : cell.current ? 'calendar-day' : 'calendar-day other-month';
        const dateStr = `${cell.y}-${String((cell.current ? month : cell.m) + 1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}`;
        html += `<div class="${cls}" style="position:relative" data-date="${dateStr}">${cell.day}${dotHtml}</div>`;
    });

    container.innerHTML = `
        <div class="calendar-header">
            <span class="calendar-month">${monthNames[month]} ${year}</span>
            <div class="calendar-nav">
                <button id="cal-prev"><span class="material-symbols-outlined" style="font-size:16px">chevron_left</span></button>
                <button id="cal-next"><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span></button>
            </div>
        </div>
        <div class="calendar-grid">${html}</div>`;

    document.getElementById('cal-prev')?.addEventListener('click', () => renderCalendar(month === 0 ? year-1 : year, month === 0 ? 11 : month-1));
    document.getElementById('cal-next')?.addEventListener('click', () => renderCalendar(month === 11 ? year+1 : year, month === 11 ? 0 : month+1));

    // Click day to add reminder
    container.querySelectorAll('.calendar-day:not(.other-month)').forEach(el => {
        el.addEventListener('click', () => {
            const date = el.dataset.date;
            if (date) window.app.openModal('reminder', { prefillDate: date });
        });
    });
}

export function initRightSidebar() {
    renderCalendar(2023, 9);
    document.getElementById('payment-list')?.addEventListener('change', e => {
        if (e.target.classList.contains('payment-check')) {
            const id = parseInt(e.target.dataset.id);
            const p = MOCK.payments.find(p => p.id === id);
            if (p) p.status = e.target.checked ? 'completed' : 'pending';
        }
    });
    document.getElementById('btn-add-reminder')?.addEventListener('click', () => window.app.openModal('reminder'));
    document.getElementById('btn-settings')?.addEventListener('click', () => window.app.openModal('settings'));
}
