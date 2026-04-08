const mockData = {
    preferences: {
        language: 'en'
    },
    user: {
        name: 'Alex Rivers',
        fullName: 'Alex Rivers',
        role: 'Premium Member',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKERKeDdbCMfqC0gqxDKRH7enW4EOiVtMH5Dju9Ic20sk1u2_W6f30THKjeD5O7J4WKtZURf3C8I9DfjUeincR9qTMDOQVjQJ8mQU6gvuM02YU-SS67EcNHVv6-hoo5mv92cNtShv-Jt4fONcYmb-BQ9Ogk03QUzP6POpXNqjddwWxAxBtq8p9JbGXtcCBAaUq_acA9rJr0Z3z9ugZm8ZIGc5qE9Ato29qNn7JT2o8pg0YFtWd5Vmtqx1T4Bed7xV2vNZUMctY1w',
        email: 'alex.rivers@sensefin.app',
        dob: '1995-06-14',
        age: 30,
        gender: 'Male',
        country: 'United States',
        currency: 'USD',
        paymentMethods: ['Card **** 4242', 'Bank Transfer', 'Apple Pay', 'Cash'],
        customCategoryIds: []
    },
    categories: {
        income: [
            { id: 'occasional', name: 'Occasional', type: 'income', color: '#22c55e', icon: 'hotel_class' },
            { id: 'freelancer', name: 'Freelancer', type: 'income', color: '#06b6d4', icon: 'draw' },
            { id: 'payroll', name: 'Payroll', type: 'income', color: '#1142d4', icon: 'payments' }
        ],
        expense: [
            { id: 'housing', name: 'Housing', type: 'expense', color: '#1142d4', icon: 'home_work', budget: 1850 },
            { id: 'groceries', name: 'Groceries', type: 'expense', color: '#06b6d4', icon: 'shopping_cart', budget: 900 },
            { id: 'leisure', name: 'Leisure', type: 'expense', color: '#10b981', icon: 'sports_esports', budget: 420 },
            { id: 'transport', name: 'Transport', type: 'expense', color: '#f59e0b', icon: 'directions_car', budget: 280 },
            { id: 'services', name: 'Services', type: 'expense', color: '#8b5cf6', icon: 'settings_suggest', budget: 260 },
            { id: 'pets', name: 'Pets', type: 'expense', color: '#ec4899', icon: 'pets', budget: 180 },
            { id: 'dining', name: 'Dining', type: 'expense', color: '#ef4444', icon: 'restaurant', budget: 240 }
        ]
    },
    payments: [
        { id: 1, name: 'Apple iCloud', amount: 9.99, dueDate: '2026-04-10', status: 'completed', note: 'Paid Apr 7', borderColor: 'rgba(17,66,212,0.3)' },
        { id: 2, name: 'Mortgage', amount: 1450.00, dueDate: '2026-04-14', status: 'overdue', note: 'Late by 1 day', borderColor: '#06b6d4' },
        { id: 3, name: 'Car Insurance', amount: 120.00, dueDate: '2026-04-17', status: 'pending', note: 'Due in 9 days', borderColor: 'rgba(59,130,246,0.5)' }
    ],
    transactions: [
        { id: 1, isoDate: '2026-04-07', time: '02:32 PM', type: 'expense', categoryId: 'services', amount: 142.00, description: 'Amazon Web Services', detail: 'Cloud hosting subscription', method: 'Card **** 4242', methodType: 'visa', icon: 'cloud' },
        { id: 2, isoDate: '2026-04-06', time: '09:15 AM', type: 'income', categoryId: 'payroll', amount: 5250.00, description: 'Monthly Salary', detail: 'Tech Solutions Inc.', method: 'Bank Transfer', methodType: 'bank', icon: 'payments' },
        { id: 3, isoDate: '2026-04-06', time: '07:45 PM', type: 'expense', categoryId: 'leisure', amount: 86.50, description: 'The Green Kitchen', detail: 'Organic dinner', method: 'Apple Pay', methodType: 'contactless', icon: 'restaurant' },
        { id: 4, isoDate: '2026-04-05', time: '12:10 PM', type: 'expense', categoryId: 'groceries', amount: 124.90, description: 'Whole Foods Market', detail: 'Weekly groceries', method: 'Apple Pay', methodType: 'contactless', icon: 'shopping_cart' },
        { id: 5, isoDate: '2026-04-04', time: '06:22 PM', type: 'expense', categoryId: 'leisure', amount: 225.00, description: 'Gym Membership', detail: 'Equinox subscription', method: 'Card **** 4242', methodType: 'visa', icon: 'fitness_center' },
        { id: 6, isoDate: '2026-04-03', time: '08:00 AM', type: 'income', categoryId: 'freelancer', amount: 340.50, description: 'Dividend Payout', detail: 'Vanguard portfolio', method: 'Bank Transfer', methodType: 'bank', icon: 'trending_up' },
        { id: 7, isoDate: '2026-04-02', time: '06:15 PM', type: 'expense', categoryId: 'transport', amount: 65.12, description: 'Shell Gas Station', detail: 'Fuel recharge', method: 'Card **** 4242', methodType: 'visa', icon: 'local_gas_station' },
        { id: 8, isoDate: '2026-04-01', time: '11:10 AM', type: 'expense', categoryId: 'pets', amount: 89.99, description: 'PetSmart', detail: 'Dog food and grooming', method: 'Card **** 4242', methodType: 'visa', icon: 'pets' },
        { id: 9, isoDate: '2026-03-29', time: '08:44 PM', type: 'expense', categoryId: 'housing', amount: 1700.00, description: 'Rent Payment', detail: 'April rent', method: 'Bank Transfer', methodType: 'bank', icon: 'home_work' },
        { id: 10, isoDate: '2026-03-25', time: '03:18 PM', type: 'income', categoryId: 'occasional', amount: 420.00, description: 'Sold old monitor', detail: 'Marketplace sale', method: 'Cash', methodType: 'cash', icon: 'sell' }
    ],
    receipts: [
        { id: 1, merchant: 'Whole Foods Market', amount: 124.50, isoDate: '2026-04-05', categoryId: 'groceries', fileType: 'JPG', icon: 'image', transactionType: 'expense' },
        { id: 2, merchant: 'Amazon Web Services', amount: 42.00, isoDate: '2026-04-04', categoryId: 'services', fileType: 'PDF', icon: 'description', transactionType: 'expense' },
        { id: 3, merchant: 'Shell Gas Station', amount: 65.12, isoDate: '2026-04-02', categoryId: 'transport', fileType: 'IMG', icon: 'local_gas_station', transactionType: 'expense' },
        { id: 4, merchant: 'Cafe Aurora', amount: 12.40, isoDate: '2026-03-30', categoryId: 'dining', fileType: 'JPG', icon: 'coffee', transactionType: 'expense' },
        { id: 5, merchant: 'PetSmart Inc.', amount: 89.99, isoDate: '2026-03-28', categoryId: 'pets', fileType: 'IMG', icon: 'pets', transactionType: 'expense' },
        { id: 6, merchant: 'Uber Ride', amount: 22.30, isoDate: '2026-03-26', categoryId: 'transport', fileType: 'PDF', icon: 'directions_car', transactionType: 'expense' },
        { id: 7, merchant: 'Salary Deposit', amount: 5250.00, isoDate: '2026-03-25', categoryId: 'payroll', fileType: 'PDF', icon: 'payments', transactionType: 'income' },
        { id: 8, merchant: 'Spotify Premium', amount: 10.99, isoDate: '2026-03-21', categoryId: 'leisure', fileType: 'PDF', icon: 'music_note', transactionType: 'expense' },
        { id: 9, merchant: 'Marketplace Sale', amount: 420.00, isoDate: '2026-03-19', categoryId: 'occasional', fileType: 'IMG', icon: 'storefront', transactionType: 'income' }
    ],
    monthlyTrend: [
        { month: 'Nov', amount: 3600 },
        { month: 'Dec', amount: 3980 },
        { month: 'Jan', amount: 3720 },
        { month: 'Feb', amount: 4110 },
        { month: 'Mar', amount: 4035 },
        { month: 'Apr', amount: 4433 }
    ],
    incomeVsExpense: [
        { month: 'Nov', income: 5100, expense: 3600 },
        { month: 'Dec', income: 5200, expense: 3980 },
        { month: 'Jan', income: 5480, expense: 3720 },
        { month: 'Feb', income: 5360, expense: 4110 },
        { month: 'Mar', income: 5840, expense: 4035 },
        { month: 'Apr', income: 6010, expense: 4433 }
    ],
    tips: [
        'You could save $45 this month by switching your leisure subscriptions to an annual plan.',
        'Your grocery spending decreased by 8% compared to last month. Great job!',
        'Consider setting up automatic payments for your recurring bills to avoid late fees.'
    ]
};

export default mockData;
