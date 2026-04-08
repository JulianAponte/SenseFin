import defaultData from '../data/mockData.js';

const STORAGE_KEY = 'sensefin-state-v1';

const state = hydrateState();

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function hydrateState() {
    const fallback = normalizeState(clone(defaultData));

    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (!saved) return fallback;
        return normalizeState({ ...fallback, ...JSON.parse(saved) });
    } catch {
        return fallback;
    }
}

function normalizeState(source) {
    const nextState = clone(source);

    nextState.preferences ??= { language: 'en' };
    nextState.user ??= {};
    nextState.user.paymentMethods ??= ['Card **** 4242', 'Bank Transfer', 'Apple Pay'];
    nextState.user.customCategoryIds ??= [];

    nextState.categories ??= { expense: [], income: [] };
    nextState.categories.expense = nextState.categories.expense.map(category => ({
        budget: 0,
        custom: false,
        ...category
    }));
    nextState.categories.income = nextState.categories.income.map(category => ({
        custom: false,
        ...category
    }));

    nextState.transactions ??= [];
    nextState.receipts ??= [];
    nextState.payments ??= [];
    nextState.monthlyTrend ??= [];
    nextState.incomeVsExpense ??= [];
    nextState.tips ??= [];

    return nextState;
}

function persistState() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Storage is optional for the demo app.
    }
}

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function ensureUniqueCategoryId(baseId) {
    const ids = new Set(getAllCategories().map(category => category.id));
    if (!ids.has(baseId)) return baseId;

    let suffix = 2;
    while (ids.has(`${baseId}-${suffix}`)) suffix += 1;
    return `${baseId}-${suffix}`;
}

function getCategoryCollection(type) {
    return state.categories[type] ?? [];
}

export function getState() {
    return state;
}

export function getLanguage() {
    return state.preferences.language || 'en';
}

export function setLanguage(language) {
    state.preferences.language = language === 'es' ? 'es' : 'en';
    persistState();
}

export function getAllCategories() {
    return [...getCategoryCollection('expense'), ...getCategoryCollection('income')];
}

export function getCategories(type) {
    return getCategoryCollection(type).map(category => ({ ...category }));
}

export function getCategoryById(categoryId) {
    return getAllCategories().find(category => category.id === categoryId) || null;
}

export function getCategoryLabel(categoryId) {
    const category = getCategoryById(categoryId);
    return category?.name || 'Uncategorized';
}

export function getCategoryColor(categoryId, fallback = '#1142d4') {
    return getCategoryById(categoryId)?.color || fallback;
}

export function getCategoryIcon(categoryId, fallback = 'label') {
    return getCategoryById(categoryId)?.icon || fallback;
}

export function addExpenseCategory({ name, color, icon, budget }) {
    const trimmedName = (name || '').trim();
    if (!trimmedName) return null;

    const categoryId = ensureUniqueCategoryId(slugify(trimmedName) || `category-${Date.now()}`);
    const category = {
        id: categoryId,
        name: trimmedName,
        type: 'expense',
        color: color || '#22c55e',
        icon: icon || 'sell',
        budget: Number(budget) || 0,
        custom: true
    };

    state.categories.expense.push(category);
    state.user.customCategoryIds = [...new Set([...(state.user.customCategoryIds || []), categoryId])];
    persistState();
    return category;
}

export function removeExpenseCategory(categoryId) {
    const category = getCategoryById(categoryId);
    if (!category?.custom) return;

    state.categories.expense = state.categories.expense.filter(item => item.id !== categoryId);
    state.user.customCategoryIds = (state.user.customCategoryIds || []).filter(id => id !== categoryId);

    const fallbackCategory = state.categories.expense[0]?.id || 'housing';

    state.transactions.forEach(transaction => {
        if (transaction.categoryId === categoryId) transaction.categoryId = fallbackCategory;
    });
    state.receipts.forEach(receipt => {
        if (receipt.categoryId === categoryId) receipt.categoryId = fallbackCategory;
    });

    persistState();
}

export function updateCategoryBudgets(entries) {
    entries.forEach(({ id, budget }) => {
        const category = getCategoryById(id);
        if (category?.type === 'expense') category.budget = Math.max(0, Number(budget) || 0);
    });
    persistState();
}

export function updateUserSettings(payload) {
    state.user = {
        ...state.user,
        ...payload
    };
    persistState();
}

export function addTransaction(transaction) {
    state.transactions.unshift({
        id: Date.now(),
        isoDate: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        note: '',
        detail: '',
        methodType: 'visa',
        ...transaction
    });
    persistState();
}

export function addPaymentReminder(reminder) {
    state.payments.push({
        id: Date.now(),
        borderColor: 'rgba(59,130,246,0.5)',
        status: 'pending',
        ...reminder
    });
    persistState();
}

export function updatePaymentStatus(paymentId, status) {
    const payment = state.payments.find(item => item.id === paymentId);
    if (!payment) return;
    payment.status = status;
    persistState();
}

export function removePaymentReminder(paymentId) {
    state.payments = state.payments.filter(item => item.id !== paymentId);
    persistState();
}

export function addReceipt(receipt) {
    state.receipts.unshift({
        id: Date.now(),
        ...receipt
    });
    persistState();
}

export function getTransactions() {
    return state.transactions.map(item => ({ ...item }));
}

export function getReceipts() {
    return state.receipts.map(item => ({ ...item }));
}

export function getPayments() {
    return state.payments.map(item => ({ ...item }));
}

export function getSpendingBreakdown() {
    const expenseTotals = new Map();

    state.transactions
        .filter(transaction => transaction.type === 'expense')
        .forEach(transaction => {
            const current = expenseTotals.get(transaction.categoryId) || 0;
            expenseTotals.set(transaction.categoryId, current + transaction.amount);
        });

    const total = Array.from(expenseTotals.values()).reduce((sum, value) => sum + value, 0);

    const items = Array.from(expenseTotals.entries())
        .map(([categoryId, amount]) => {
            const category = getCategoryById(categoryId);
            return {
                id: categoryId,
                category: category?.name || categoryId,
                color: category?.color || '#1142d4',
                icon: category?.icon || 'sell',
                amount,
                pct: total > 0 ? Math.round((amount / total) * 100) : 0
            };
        })
        .sort((a, b) => b.amount - a.amount);

    return { total, items };
}

export function getCategoryBudgetProgress() {
    const spendingMap = new Map();

    state.transactions
        .filter(transaction => transaction.type === 'expense')
        .forEach(transaction => {
            const current = spendingMap.get(transaction.categoryId) || 0;
            spendingMap.set(transaction.categoryId, current + transaction.amount);
        });

    return state.categories.expense
        .map(category => {
            const spent = spendingMap.get(category.id) || 0;
            const budget = Number(category.budget) || 0;
            const usage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
            return {
                ...category,
                spent,
                remaining: Math.max(0, budget - spent),
                usage
            };
        })
        .sort((a, b) => {
            const budgetWeight = (b.budget || 0) - (a.budget || 0);
            if (budgetWeight !== 0) return budgetWeight;
            return b.spent - a.spent;
        });
}

export function getInsightsSummary() {
    const transactions = getTransactions();
    const income = transactions.filter(item => item.type === 'income');
    const expense = transactions.filter(item => item.type === 'expense');

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expense.reduce((sum, item) => sum + item.amount, 0);
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    const byCategory = {};
    expense.forEach(item => {
        byCategory[item.categoryId] = (byCategory[item.categoryId] || 0) + item.amount;
    });

    const topCategoryEntry = Object.entries(byCategory).sort((left, right) => right[1] - left[1])[0];

    return {
        totalIncome,
        totalExpense,
        savingsRate,
        topCategoryId: topCategoryEntry?.[0] || null,
        topCategoryAmount: topCategoryEntry?.[1] || 0,
        categoryBudgetProgress: getCategoryBudgetProgress()
    };
}
