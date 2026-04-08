import { getLocale, t } from '../i18n.js';

let pickerElement = null;
let currentContext = null;
let viewYear = 0;
let viewMonth = 0;

function ensurePicker() {
    if (pickerElement) return pickerElement;

    pickerElement = document.createElement('div');
    pickerElement.className = 'app-date-picker';
    pickerElement.id = 'app-date-picker';
    pickerElement.hidden = true;
    document.body.appendChild(pickerElement);

    document.addEventListener('click', event => {
        if (!currentContext || pickerElement.hidden) return;
        const anchor = currentContext.anchor;
        if (pickerElement.contains(event.target) || anchor?.contains(event.target)) return;
        closeDatePicker();
    });

    window.addEventListener('resize', () => {
        if (!pickerElement.hidden) positionPicker();
    });

    window.addEventListener('scroll', () => {
        if (!pickerElement.hidden) positionPicker();
    }, true);

    return pickerElement;
}

function getDaysGrid(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells = [];

    for (let index = firstDay - 1; index >= 0; index -= 1) {
        cells.push({
            day: prevMonthDays - index,
            month: month === 0 ? 11 : month - 1,
            year: month === 0 ? year - 1 : year,
            current: false
        });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push({ day, month, year, current: true });
    }

    let nextDay = 1;
    while (cells.length < 42) {
        cells.push({
            day: nextDay,
            month: month === 11 ? 0 : month + 1,
            year: month === 11 ? year + 1 : year,
            current: false
        });
        nextDay += 1;
    }

    return cells;
}

function formatMonthLabel(year, month) {
    return new Intl.DateTimeFormat(getLocale(), { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
}

function formatDayNames() {
    return Array.from({ length: 7 }, (_, index) => {
        const reference = new Date(2026, 3, 5 + index);
        return new Intl.DateTimeFormat(getLocale(), { weekday: 'narrow' }).format(reference);
    });
}

function positionPicker() {
    if (!currentContext?.anchor || !pickerElement) return;

    const anchorRect = currentContext.anchor.getBoundingClientRect();
    const pickerRect = pickerElement.getBoundingClientRect();
    const top = anchorRect.bottom + 10;
    const left = Math.min(
        window.innerWidth - pickerRect.width - 16,
        Math.max(16, anchorRect.left)
    );

    pickerElement.style.top = `${Math.max(16, top)}px`;
    pickerElement.style.left = `${left}px`;
}

function renderPicker() {
    if (!pickerElement || !currentContext) return;

    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayNames = formatDayNames();
    const cells = getDaysGrid(viewYear, viewMonth);

    pickerElement.innerHTML = `
        <div class="app-date-picker-shell">
            <div class="app-date-picker-head">
                <button class="app-date-picker-nav" type="button" data-dp-nav="prev">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <div class="app-date-picker-title">${formatMonthLabel(viewYear, viewMonth)}</div>
                <button class="app-date-picker-nav" type="button" data-dp-nav="next">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
            <div class="app-date-picker-weekdays">
                ${dayNames.map(name => `<span>${name}</span>`).join('')}
            </div>
            <div class="app-date-picker-grid">
                ${cells.map(cell => {
                    const isoValue = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                    const classes = ['app-date-picker-day'];
                    if (!cell.current) classes.push('is-other-month');
                    if (isoValue === currentContext.value) classes.push('is-selected');
                    if (isoValue === todayIso) classes.push('is-today');

                    return `<button class="${classes.join(' ')}" type="button" data-dp-date="${isoValue}">${cell.day}</button>`;
                }).join('')}
            </div>
            <div class="app-date-picker-foot">
                <button class="app-date-picker-today" type="button" data-dp-today="true">${t('common.today')}</button>
            </div>
        </div>
    `;

    pickerElement.hidden = false;
    positionPicker();

    pickerElement.querySelector('[data-dp-nav="prev"]')?.addEventListener('click', () => {
        if (viewMonth === 0) {
            viewMonth = 11;
            viewYear -= 1;
        } else {
            viewMonth -= 1;
        }
        renderPicker();
    });

    pickerElement.querySelector('[data-dp-nav="next"]')?.addEventListener('click', () => {
        if (viewMonth === 11) {
            viewMonth = 0;
            viewYear += 1;
        } else {
            viewMonth += 1;
        }
        renderPicker();
    });

    pickerElement.querySelectorAll('[data-dp-date]').forEach(button => {
        button.addEventListener('click', () => {
            const date = button.getAttribute('data-dp-date');
            if (!date) return;
            currentContext.onSelect(date);
            closeDatePicker();
        });
    });

    pickerElement.querySelector('[data-dp-today="true"]')?.addEventListener('click', () => {
        currentContext.onSelect(todayIso);
        closeDatePicker();
    });
}

export function openDatePicker({ anchor, value, onSelect }) {
    ensurePicker();

    const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();
    viewYear = initialDate.getFullYear();
    viewMonth = initialDate.getMonth();
    currentContext = { anchor, value, onSelect };
    renderPicker();
}

export function closeDatePicker() {
    if (!pickerElement) return;
    pickerElement.hidden = true;
    currentContext = null;
}
