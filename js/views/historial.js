import MOCK from '../data/mockData.js';

let filters = { type: 'all', category: 'all', search: '', preset: 'all', dateFrom: '', dateTo: '', amountSort: 'none' };

function filtered() {
    let list = MOCK.transactions.filter(t => {
        if (filters.type !== 'all' && t.type !== filters.type) return false;
        if (filters.category !== 'all' && t.category !== filters.category) return false;
        if (filters.search) {
            const q = filters.search.toLowerCase();
            if (!t.description.toLowerCase().includes(q) && !t.detail.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    if (filters.amountSort === 'asc') list = [...list].sort((a, b) => a.amount - b.amount);
    else if (filters.amountSort === 'desc') list = [...list].sort((a, b) => b.amount - a.amount);

    return list;
}

function methodIcon(t) {
    if (t.methodType === 'visa') return `<div style="width:28px;height:16px;background:var(--bg-secondary);border-radius:2px;border:1px solid var(--border-color);display:flex;align-items:center;justify-content:center"><span style="font-size:6px;font-weight:900;color:var(--text-muted);font-style:italic">VISA</span></div>`;
    if (t.methodType === 'bank') return `<span class="material-symbols-outlined" style="font-size:14px;color:var(--text-muted)">account_balance</span>`;
    return `<span class="material-symbols-outlined" style="font-size:14px;color:var(--text-muted)">contactless</span>`;
}

function iconBg(t) {
    const map = {
        'badge-primary': ['rgba(17,66,212,0.1)','rgba(17,66,212,0.2)','#1142d4'],
        'badge-green': ['rgba(16,185,129,0.1)','rgba(16,185,129,0.2)','#10b981'],
        'badge-purple': ['rgba(168,85,247,0.1)','rgba(168,85,247,0.2)','#a855f7'],
        'badge-cyan': ['rgba(6,182,212,0.1)','rgba(6,182,212,0.2)','#06b6d4'],
        'badge-gold': ['rgba(245,158,11,0.1)','rgba(245,158,11,0.2)','#f59e0b']
    };
    return map[t.badgeClass] || map['badge-primary'];
}

function rows(list) {
    if (!list.length) return `<tr><td colspan="6" style="padding:48px;text-align:center;color:var(--text-muted)">No transactions found</td></tr>`;
    return list.map(t => {
        const [bg, border, color] = iconBg(t);
        const isIncome = t.type === 'income';
        return `<tr>
            <td style="width:12%"><span style="color:#fff;font-weight:700;font-size:12px;display:block">${t.date}</span><span style="font-size:9px;color:var(--text-muted)">${t.time}</span></td>
            <td style="width:30%"><div style="display:flex;align-items:center;gap:10px">
                <div style="width:32px;height:32px;border-radius:8px;background:${bg};border:1px solid ${border};display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:16px;color:${color}">${t.icon}</span></div>
                <div style="overflow:hidden"><span style="color:#fff;font-size:12px;font-weight:700;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.description}</span><span style="font-size:10px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${t.detail}</span></div>
            </div></td>
            <td style="width:15%"><span class="badge ${t.badgeClass}">${t.category}</span></td>
            <td style="width:18%"><div style="display:flex;align-items:center;gap:10px">${methodIcon(t)}<span style="font-size:10px;color:var(--text-secondary);font-weight:500">${t.method}</span></div></td>
            <td style="width:15%;text-align:right" class="${isIncome ? 'amount-positive' : 'amount-negative'}">${isIncome ? '+' : '-'}$${t.amount.toLocaleString('en-US',{minimumFractionDigits:2})}</td>
            <td style="width:10%;text-align:center"><button style="background:none;border:none;color:var(--text-muted);cursor:pointer" class="hover-white"><span class="material-symbols-outlined" style="font-size:16px">${isIncome ? 'attach_file' : 'description'}</span></button></td>
        </tr>`;
    }).join('');
}

export function renderHistorial() {
    const cats = [...new Set(MOCK.transactions.map(t => t.category))];
    return `
    <div class="view-header view-header-between">
        <div><h2 style="font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.02em">History</h2>
        <p style="color:var(--text-muted);font-size:11px;margin-top:2px">Review and manage your financial transactions</p></div>
        <div style="display:flex;align-items:center;gap:12px">
            <button class="btn btn-green-outline btn-sm" id="btn-add-tx"><span class="material-symbols-outlined">add_circle</span> Add Income</button>
            <button class="btn btn-slate btn-sm" id="btn-add-exp"><span class="material-symbols-outlined">remove_circle</span> Add Expense</button>
        </div>
    </div>
    <div class="view-body animate-in">
        <div class="glass-card" style="border-radius:16px;padding:16px 20px;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                <input type="text" class="input-field" id="search-tx" placeholder="Search transactions by name, company or category..." style="flex:1;font-size:12px">
                <button class="btn btn-slate btn-sm" style="padding:8px 16px" id="btn-search-go"><span class="material-symbols-outlined" style="font-size:20px">search</span></button>
                <button class="btn btn-slate btn-sm" style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase" id="btn-reset-filters">Reset</button>
            </div>
            <div class="filter-row" style="gap:10px;flex-wrap:wrap">
                <div class="filter-group">
                    <label class="filter-label">Type</label>
                    <select class="filter-select" id="filter-type">
                        <option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Category</label>
                    <select class="filter-select" id="filter-cat">
                        <option value="all">All</option>${cats.map(c=>`<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Period</label>
                    <select class="filter-select" id="filter-preset">
                        <option value="all">All Time</option><option value="week">This Week</option><option value="month">This Month</option><option value="year">This Year</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">Amount</label>
                    <select class="filter-select" id="filter-amount-sort">
                        <option value="none">Default</option><option value="desc">Highest First</option><option value="asc">Lowest First</option>
                    </select>
                </div>
                <div class="filter-divider"></div>
                <div class="filter-group">
                    <label class="filter-label">From</label>
                    <input type="date" class="filter-select" id="filter-date-from" style="width:140px">
                </div>
                <div class="filter-group">
                    <label class="filter-label">To</label>
                    <input type="date" class="filter-select" id="filter-date-to" style="width:140px">
                </div>
            </div>
        </div>
        <div class="glass-card" style="border-radius:16px;overflow:hidden">
            <div style="overflow-x:auto"><table class="data-table"><thead><tr>
                <th style="width:12%">Date</th><th style="width:30%">Description</th><th style="width:15%">Category</th>
                <th style="width:18%">Payment Method</th><th style="width:15%;text-align:right">Amount</th><th style="width:10%;text-align:center">Receipt</th>
            </tr></thead><tbody id="tx-body">${rows(filtered())}</tbody></table></div>
            <div class="pagination">
                <span class="pagination-info">Showing 1-${filtered().length} / ${MOCK.transactions.length} items</span>
                <div class="pagination-btns">
                    <button class="pagination-btn"><span class="material-symbols-outlined" style="font-size:16px">chevron_left</span></button>
                    <button class="pagination-btn active">1</button>
                    <button class="pagination-btn">2</button>
                    <button class="pagination-btn"><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span></button>
                </div>
            </div>
        </div>
    </div>`;
}

export function initHistorial() {
    const refresh = () => { const el = document.getElementById('tx-body'); if(el) el.innerHTML = rows(filtered()); };
    document.getElementById('search-tx')?.addEventListener('input', e => { filters.search = e.target.value; refresh(); });
    document.getElementById('filter-type')?.addEventListener('change', e => { filters.type = e.target.value; refresh(); });
    document.getElementById('filter-cat')?.addEventListener('change', e => { filters.category = e.target.value; refresh(); });
    document.getElementById('filter-amount-sort')?.addEventListener('change', e => { filters.amountSort = e.target.value; refresh(); });
    document.getElementById('btn-add-tx')?.addEventListener('click', () => window.app.openModal('income'));
    document.getElementById('btn-add-exp')?.addEventListener('click', () => window.app.openModal('expense'));
    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
        filters = { type:'all', category:'all', search:'', preset:'all', dateFrom:'', dateTo:'', amountSort:'none' };
        document.getElementById('search-tx').value = '';
        document.getElementById('filter-type').value = 'all';
        document.getElementById('filter-cat').value = 'all';
        document.getElementById('filter-preset').value = 'all';
        document.getElementById('filter-amount-sort').value = 'none';
        const from = document.getElementById('filter-date-from'); if(from) from.value = '';
        const to = document.getElementById('filter-date-to'); if(to) to.value = '';
        refresh();
    });
    filters = { type:'all', category:'all', search:'', preset:'all', dateFrom:'', dateTo:'', amountSort:'none' };
}
