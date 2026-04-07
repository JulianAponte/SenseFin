import MOCK from '../data/mockData.js';

export function openModal(type, data = {}) {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    if (!overlay || !container) return;

    const catOpts = '<option>Business</option><option>Groceries</option><option>Leisure</option><option>Income</option><option>Transport</option><option>Services</option><option>Pets</option>';
    const methodOpts = `<option>${MOCK.user.paymentMethods?.map(m=>m).join('</option><option>') || 'Card **** 4242</option><option>Bank Transfer</option><option>Apple Pay</option><option>Cash'}</option>`;
    const currencyOpts = '<option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="COP">COP ($)</option><option value="MXN">MXN ($)</option><option value="GBP">GBP (£)</option>';
    const countryOpts = '<option>United States</option><option>Colombia</option><option>Mexico</option><option>Spain</option><option>United Kingdom</option><option>Canada</option>';
    const genderOpts = '<option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option>';

    let html = '';

    if (type === 'income' || type === 'expense') {
        html = `
            <div class="modal-header"><h3 class="modal-title">${type === 'income' ? 'Add Income' : 'Add Expense'}</h3><button class="modal-close" id="modal-close">✕</button></div>
            <div class="modal-body">
                <div class="input-group"><label class="input-label">Amount ($)</label><input type="number" class="input-field" id="m-amount" placeholder="0.00" step="0.01"></div>
                <div class="input-group"><label class="input-label">Description</label><input type="text" class="input-field" id="m-desc" placeholder="e.g. Monthly salary"></div>
                <div class="input-group"><label class="input-label">Category</label><select class="input-field" id="m-cat">${catOpts}</select></div>
                <div class="input-group"><label class="input-label">Payment Method</label><select class="input-field" id="m-method">${methodOpts}</select></div>
                <div class="input-group"><label class="input-label">Date</label><input type="date" class="input-field" id="m-date" value="${new Date().toISOString().split('T')[0]}"></div>
            </div>
            <div class="modal-actions"><button class="btn btn-secondary btn-sm" id="modal-cancel">Cancel</button><button class="btn btn-primary-fill btn-sm" id="modal-save">Save</button></div>`;
    } else if (type === 'reminder') {
        const prefill = data.prefillDate || '';
        html = `
            <div class="modal-header"><h3 class="modal-title">Add Payment Reminder</h3><button class="modal-close" id="modal-close">✕</button></div>
            <div class="modal-body">
                <div class="input-group"><label class="input-label">Payment Name</label><input type="text" class="input-field" id="m-rname" placeholder="e.g. Netflix"></div>
                <div class="input-group"><label class="input-label">Amount ($)</label><input type="number" class="input-field" id="m-ramount" placeholder="0.00" step="0.01"></div>
                <div class="input-group"><label class="input-label">Due Date</label><input type="date" class="input-field" id="m-rdate" value="${prefill}"></div>
            </div>
            <div class="modal-actions"><button class="btn btn-secondary btn-sm" id="modal-cancel">Cancel</button><button class="btn btn-primary-fill btn-sm" id="modal-save-r">Add Reminder</button></div>`;
    } else if (type === 'settings') {
        const u = MOCK.user;
        html = `
            <div class="modal-header"><h3 class="modal-title">Profile Settings</h3><button class="modal-close" id="modal-close">✕</button></div>
            <div class="modal-body" style="max-height:60vh;overflow-y:auto">
                <div style="display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:1px solid var(--border-color);margin-bottom:8px">
                    <div class="user-avatar" style="width:56px;height:56px"><img src="${u.avatar}" alt="${u.name}"></div>
                    <div><p style="font-weight:700;font-size:16px">${u.name}</p><p style="font-size:11px;color:var(--accent-cyan)">${u.role}</p></div>
                </div>
                <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px">Personal Info</p>
                <div class="input-group"><label class="input-label">Full Name</label><input type="text" class="input-field" id="s-name" value="${u.fullName || u.name}"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div class="input-group"><label class="input-label">Date of Birth</label><input type="date" class="input-field" id="s-dob" value="${u.dob || ''}"></div>
                    <div class="input-group"><label class="input-label">Age</label><input type="number" class="input-field" id="s-age" value="${u.age || ''}" placeholder="25"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                    <div class="input-group"><label class="input-label">Gender</label><select class="input-field" id="s-gender">${genderOpts}</select></div>
                    <div class="input-group"><label class="input-label">Country</label><select class="input-field" id="s-country">${countryOpts}</select></div>
                </div>
                <div class="input-group"><label class="input-label">Currency</label><select class="input-field" id="s-currency">${currencyOpts}</select></div>

                <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.15em;margin:12px 0 4px">Account</p>
                <div class="input-group"><label class="input-label">Email</label><input type="email" class="input-field" id="s-email" value="${u.email || ''}" placeholder="alex@mail.com"></div>
                <div class="input-group"><label class="input-label">Password</label><input type="password" class="input-field" id="s-password" value="" placeholder="••••••••"></div>

                <p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.15em;margin:12px 0 4px">Payment Methods</p>
                <div id="payment-methods-list" style="display:flex;flex-direction:column;gap:8px">
                    ${(u.paymentMethods || ['Card **** 4242']).map((m, i) => `
                        <div style="display:flex;align-items:center;gap:8px">
                            <input type="text" class="input-field pm-field" value="${m}" style="flex:1" data-idx="${i}">
                            <button class="btn btn-secondary btn-sm pm-remove" data-idx="${i}" style="padding:6px 8px;font-size:14px;color:var(--accent-red)">✕</button>
                        </div>`).join('')}
                </div>
                <button class="btn btn-secondary btn-sm btn-full" id="add-payment-method" style="margin-top:4px">
                    <span class="material-symbols-outlined" style="font-size:16px">add</span> Add Payment Method
                </button>
                <p style="font-size:10px;color:var(--text-muted);margin-top:2px">Enter last 4 digits of a card (e.g. "Card **** 1234") or a custom payment method name</p>
            </div>
            <div class="modal-actions"><button class="btn btn-secondary btn-sm" id="modal-cancel">Cancel</button><button class="btn btn-primary-fill btn-sm" id="modal-save-settings">Save Changes</button></div>`;
    }

    container.innerHTML = html;
    overlay.classList.add('active');

    const close = () => overlay.classList.remove('active');
    document.getElementById('modal-close')?.addEventListener('click', close);
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    // Income/Expense save
    document.getElementById('modal-save')?.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('m-amount')?.value);
        const desc = document.getElementById('m-desc')?.value;
        if (!amount || !desc) return;
        MOCK.transactions.unshift({
            id: Date.now(), date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}), time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),
            type, category: document.getElementById('m-cat')?.value || 'Business', amount, description: desc, detail: '', method: document.getElementById('m-method')?.value || 'Card **** 4242',
            methodType: 'visa', icon: type === 'income' ? 'payments' : 'receipt_long', badgeClass: type === 'income' ? 'badge-green' : 'badge-primary'
        });
        close(); window.app.navigate(window.app.currentView);
    });

    // Reminder save
    document.getElementById('modal-save-r')?.addEventListener('click', () => {
        const name = document.getElementById('m-rname')?.value;
        const amount = parseFloat(document.getElementById('m-ramount')?.value);
        const date = document.getElementById('m-rdate')?.value;
        if (!name || !amount || !date) return;
        MOCK.payments.push({ id: Date.now(), name, amount, dueDate: date, status: 'pending', note: 'Upcoming', borderColor: 'rgba(59,130,246,0.5)' });
        close(); window.app.refreshSidebar();
    });

    // Settings save
    document.getElementById('modal-save-settings')?.addEventListener('click', () => {
        MOCK.user.fullName = document.getElementById('s-name')?.value || MOCK.user.name;
        MOCK.user.name = MOCK.user.fullName;
        MOCK.user.dob = document.getElementById('s-dob')?.value || '';
        MOCK.user.age = parseInt(document.getElementById('s-age')?.value) || '';
        MOCK.user.gender = document.getElementById('s-gender')?.value || '';
        MOCK.user.country = document.getElementById('s-country')?.value || '';
        MOCK.user.currency = document.getElementById('s-currency')?.value || 'USD';
        MOCK.user.email = document.getElementById('s-email')?.value || '';
        const pw = document.getElementById('s-password')?.value;
        if (pw) MOCK.user.password = pw;
        // Collect payment methods
        const pmFields = document.querySelectorAll('.pm-field');
        MOCK.user.paymentMethods = Array.from(pmFields).map(f => f.value).filter(v => v.trim());
        close(); window.app.refreshSidebar();
    });

    // Add payment method button
    document.getElementById('add-payment-method')?.addEventListener('click', () => {
        const list = document.getElementById('payment-methods-list');
        if (!list) return;
        const idx = list.children.length;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;gap:8px';
        div.innerHTML = `<input type="text" class="input-field pm-field" value="" style="flex:1" placeholder="Card **** 0000" data-idx="${idx}"><button class="btn btn-secondary btn-sm pm-remove" data-idx="${idx}" style="padding:6px 8px;font-size:14px;color:var(--accent-red)">✕</button>`;
        list.appendChild(div);
    });

    // Remove payment method
    container.addEventListener('click', e => {
        if (e.target.classList.contains('pm-remove') || e.target.closest('.pm-remove')) {
            const btn = e.target.classList.contains('pm-remove') ? e.target : e.target.closest('.pm-remove');
            btn.parentElement.remove();
        }
    });
}
