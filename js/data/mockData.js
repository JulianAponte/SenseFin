const MOCK = {
    user: {
        name: 'Alex Rivers',
        role: 'Premium Member',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKERKeDdbCMfqC0gqxDKRH7enW4EOiVtMH5Dju9Ic20sk1u2_W6f30THKjeD5O7J4WKtZURf3C8I9DfjUeincR9qTMDOQVjQJ8mQU6gvuM02YU-SS67EcNHVv6-hoo5mv92cNtShv-Jt4fONcYmb-BQ9Ogk03QUzP6POpXNqjddwWxAxBtq8p9JbGXtcCBAaUq_acA9rJr0Z3z9ugZm8ZIGc5qE9Ato29qNn7JT2o8pg0YFtWd5Vmtqx1T4Bed7xV2vNZUMctY1w'
    },
    spending: {
        total: 4250.00,
        budgetPercent: 68,
        breakdown: [
            { category: 'Housing', amount: 1700.00, color: '#1142d4', pct: 40 },
            { category: 'Groceries', amount: 850.00, color: '#06b6d4', pct: 20 },
            { category: 'Pets', amount: 640.00, color: '#a855f7', pct: 15 },
            { category: 'Leisure', amount: 1060.00, color: '#10b981', pct: 25 }
        ]
    },
    payments: [
        { id: 1, name: 'Apple iCloud', amount: 9.99, dueDate: '2023-10-02', status: 'completed', note: 'Paid Oct 3', borderColor: 'rgba(17,66,212,0.3)' },
        { id: 2, name: 'Mortgage Pay', amount: 1450.00, dueDate: '2023-10-08', status: 'overdue', note: 'Overdue in 5 days', borderColor: '#06b6d4' },
        { id: 3, name: 'Car Insurance', amount: 120.00, dueDate: '2023-10-13', status: 'pending', note: 'Due in 8 days', borderColor: 'rgba(59,130,246,0.5)' }
    ],
    transactions: [
        { id: 1, date: 'Mar 15', time: '14:32 PM', type: 'expense', category: 'Business', amount: 142.00, description: 'Amazon Web Services', detail: 'Cloud Hosting Subscription', method: 'Card **** 4242', methodType: 'visa', icon: 'cloud', badgeClass: 'badge-primary' },
        { id: 2, date: 'Mar 14', time: '09:15 AM', type: 'income', category: 'Income', amount: 5250.00, description: 'Monthly Salary', detail: 'Tech Solutions Inc.', method: 'Bank Transfer', methodType: 'bank', icon: 'payments', badgeClass: 'badge-green' },
        { id: 3, date: 'Mar 13', time: '19:45 PM', type: 'expense', category: 'Leisure', amount: 86.50, description: 'The Green Kitchen', detail: 'Organic Dinner', method: 'Apple Pay', methodType: 'contactless', icon: 'restaurant', badgeClass: 'badge-purple' },
        { id: 4, date: 'Mar 12', time: '12:10 PM', type: 'expense', category: 'Groceries', amount: 124.90, description: 'Whole Foods Market', detail: 'Weekly Groceries', method: 'Apple Pay', methodType: 'contactless', icon: 'shopping_cart', badgeClass: 'badge-cyan' },
        { id: 5, date: 'Mar 11', time: '18:22 PM', type: 'expense', category: 'Leisure', amount: 225.00, description: 'Gym Membership', detail: 'Equinox Subscription', method: 'Card **** 4242', methodType: 'visa', icon: 'fitness_center', badgeClass: 'badge-purple' },
        { id: 6, date: 'Mar 10', time: '08:00 AM', type: 'income', category: 'Income', amount: 340.50, description: 'Dividend Payout', detail: 'Vanguard Portfolio', method: 'Bank Transfer', methodType: 'bank', icon: 'trending_up', badgeClass: 'badge-green' }
    ],
    receipts: [
        { id: 1, merchant: 'Whole Foods Market', amount: 124.50, date: 'Oct 12', category: 'Groceries', type: 'JPG', icon: 'image', badgeClass: 'badge-cyan' },
        { id: 2, merchant: 'Amazon Cloud SVCS', amount: 42.00, date: 'Oct 10', category: 'Services', type: 'PDF', icon: 'description', badgeClass: 'badge-blue' },
        { id: 3, merchant: 'Shell Gas Station', amount: 65.12, date: 'Oct 09', category: 'Transport', type: 'IMG', icon: 'local_gas_station', badgeClass: 'badge-green' },
        { id: 4, merchant: 'Starbucks Coffee', amount: 12.40, date: 'Oct 08', category: 'Dining', type: 'JPG', icon: 'coffee', badgeClass: 'badge-slate' },
        { id: 5, merchant: 'PetSmart Inc', amount: 89.99, date: 'Oct 05', category: 'Pets', type: 'IMG', icon: 'pets', badgeClass: 'badge-purple' },
        { id: 6, merchant: 'Uber Ride', amount: 22.30, date: 'Oct 04', category: 'Transport', type: 'PDF', icon: 'directions_car', badgeClass: 'badge-green' },
        { id: 7, merchant: 'Apple App Store', amount: 9.99, date: 'Oct 03', category: 'Services', type: 'PDF', icon: 'storefront', badgeClass: 'badge-blue' },
        { id: 8, merchant: 'Spotify Premium', amount: 10.99, date: 'Oct 01', category: 'Leisure', type: 'PDF', icon: 'music_note', badgeClass: 'badge-slate' }
    ],
    monthlyTrend: [
        { month: 'May', amount: 3800 }, { month: 'Jun', amount: 4100 }, { month: 'Jul', amount: 3600 },
        { month: 'Aug', amount: 4500 }, { month: 'Sep', amount: 3900 }, { month: 'Oct', amount: 4250 }
    ],
    incomeVsExpense: [
        { month: 'May', income: 5200, expense: 3800 }, { month: 'Jun', income: 5200, expense: 4100 },
        { month: 'Jul', income: 5650, expense: 3600 }, { month: 'Aug', income: 5200, expense: 4500 },
        { month: 'Sep', income: 5850, expense: 3900 }, { month: 'Oct', income: 5200, expense: 4250 }
    ],
    tips: [
        'You could save $45 this month by switching your leisure subscriptions to an annual plan.',
        'Your grocery spending decreased by 8% compared to last month. Great job!',
        'Consider setting up automatic payments for your recurring bills to avoid late fees.'
    ]
};
export default MOCK;
