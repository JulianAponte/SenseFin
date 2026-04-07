import MOCK from '../data/mockData.js';

export function renderRecibos() {
    const cards = MOCK.receipts.map(r => `
        <article class="glass-card receipt-card">
            <div class="receipt-preview">
                <span class="material-symbols-outlined">${r.icon}</span>
                <div style="position:absolute;top:20px;right:20px;padding:4px 12px;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);border-radius:8px;font-size:10px;color:#cbd5e1;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.1)">${r.type}</div>
            </div>
            <div class="receipt-info">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                    <h4 class="receipt-merchant">${r.merchant}</h4>
                    <span class="receipt-amount">$${r.amount.toFixed(2)}</span>
                </div>
                <div class="receipt-meta">
                    <span class="badge badge-pill ${r.badgeClass}">${r.category}</span>
                    <span style="font-size:11px;color:#64748b;font-weight:500">${r.date}</span>
                </div>
            </div>
        </article>`).join('');

    return `
    <div class="view-header view-header-between">
        <h2 style="font-size:36px;font-weight:700;color:#fff;letter-spacing:-0.03em">Receipts</h2>
        <div style="display:flex;gap:12px">
            <button class="btn btn-secondary"><span class="material-symbols-outlined">photo_camera</span> Scan Receipt</button>
            <button class="btn btn-primary-fill"><span class="material-symbols-outlined">add_circle</span> Upload Receipt</button>
        </div>
    </div>
    <div class="view-body animate-in" style="gap:24px">
        <div style="display:flex;gap:16px;max-width:800px">
            <input type="text" class="input-field" placeholder="Search receipts by merchant or category..." style="flex:1;height:52px;border-radius:16px;padding:0 24px;font-size:13px">
            <button class="btn btn-secondary" style="width:52px;height:52px;padding:0;border-radius:16px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined">search</span></button>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div style="display:flex;align-items:center;gap:16px">
                <select class="input-field" style="height:42px;border-radius:12px;font-size:13px;font-weight:600;min-width:150px;padding:0 36px 0 16px"><option>Date Range</option><option>Last 7 Days</option></select>
                <select class="input-field" style="height:42px;border-radius:12px;font-size:13px;font-weight:600;min-width:180px;padding:0 36px 0 16px"><option>Order by: Date: Newest</option><option>Order by: Amount: Highest</option></select>
                <select class="input-field" style="height:42px;border-radius:12px;font-size:13px;font-weight:600;min-width:150px;padding:0 36px 0 16px"><option>Category</option><option>Groceries</option></select>
                <div style="display:flex;background:rgba(15,23,42,0.3);padding:4px;border-radius:12px;border:1px solid rgba(255,255,255,0.05);height:42px;align-items:center">
                    <button style="height:100%;padding:0 20px;font-size:10px;font-weight:700;border-radius:8px;background:var(--primary);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(17,66,212,0.2)">ALL</button>
                    <button style="height:100%;padding:0 20px;font-size:10px;font-weight:700;border-radius:8px;background:none;color:#64748b;border:none;cursor:pointer;text-transform:uppercase;letter-spacing:0.15em">Image</button>
                    <button style="height:100%;padding:0 20px;font-size:10px;font-weight:700;border-radius:8px;background:none;color:#64748b;border:none;cursor:pointer;text-transform:uppercase;letter-spacing:0.15em">PDF</button>
                </div>
            </div>
            <button style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:8px"><span class="material-symbols-outlined" style="font-size:14px">refresh</span>Reset Filters</button>
        </div>
        <div class="receipt-grid">${cards}</div>
        <div class="pagination" style="margin-top:auto;border-top:1px solid rgba(30,41,59,0.6);padding-top:24px">
            <span class="pagination-info">Showing 8 of 124 receipts</span>
            <div class="pagination-btns">
                <button class="pagination-btn"><span class="material-symbols-outlined" style="font-size:16px">chevron_left</span></button>
                <button class="pagination-btn active">1</button>
                <button class="pagination-btn">2</button>
                <button class="pagination-btn">3</button>
                <button class="pagination-btn"><span class="material-symbols-outlined" style="font-size:16px">chevron_right</span></button>
            </div>
        </div>
    </div>`;
}

export function initRecibos() {}
