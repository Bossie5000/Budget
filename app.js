// Budget Tracker Web Application
class BudgetTracker {
    constructor() {
        this.data = {
            months: {},
            current_month: this.getCurrentMonth()
        };

        this.selectedRow = null;
        this.selectedCategory = null;

        this.loadData();
        this.initializeCurrentMonth();
        this.setupEventListeners();
        this.refreshDisplay();
    }

    getCurrentMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    getPreviousMonth(monthKey) {
        try {
            const [year, month] = monthKey.split('-').map(Number);
            if (month === 1) {
                return `${year - 1}-12`;
            } else {
                return `${year}-${String(month - 1).padStart(2, '0')}`;
            }
        } catch (e) {
            return null;
        }
    }

    initializeMonth(monthKey) {
        const prevMonth = this.getPreviousMonth(monthKey);

        const monthData = {
            income: [],
            fuel_advance: 0.0,
            expenses: {
                fixed: [],
                flexible: [],
                subscriptions: [],
                international_bank: [],
                ad_hoc: [],
                fuel: []
            },
            accounts: {
                credit: 0.0,
                savings: 0.0
            }
        };

        // Copy persistent expenses from previous month
        if (prevMonth && this.data.months[prevMonth]) {
            const prevData = this.data.months[prevMonth];

            // Copy fixed expenses (reset paid status, keep day)
            if (prevData.expenses.fixed) {
                prevData.expenses.fixed.forEach(expense => {
                    monthData.expenses.fixed.push({
                        name: expense.name,
                        amount: expense.amount,
                        paid: false,
                        day: expense.day || 1
                    });
                });
            }

            // Copy flexible expenses (reset paid status, keep day)
            if (prevData.expenses.flexible) {
                prevData.expenses.flexible.forEach(expense => {
                    monthData.expenses.flexible.push({
                        name: expense.name,
                        amount: expense.amount,
                        paid: false,
                        day: expense.day || 1
                    });
                });
            }

            // Copy subscriptions (reset paid status, keep day)
            if (prevData.expenses.subscriptions) {
                prevData.expenses.subscriptions.forEach(expense => {
                    monthData.expenses.subscriptions.push({
                        name: expense.name,
                        amount: expense.amount,
                        paid: false,
                        day: expense.day || 1
                    });
                });
            }
        }

        this.data.months[monthKey] = monthData;
    }

    initializeCurrentMonth() {
        if (!this.data.months[this.data.current_month]) {
            this.initializeMonth(this.data.current_month);
        }
    }

    setupEventListeners() {
        // Month selection
        document.getElementById('month-select').addEventListener('change', (e) => {
            this.data.current_month = e.target.value;
            this.refreshDisplay();
        });

        document.getElementById('add-month-btn').addEventListener('click', () => this.addNewMonth());
        document.getElementById('next-month-btn').addEventListener('click', () => this.nextMonth());

        // Main tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Expense category tabs
        document.querySelectorAll('.expense-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchExpenseTab(e.target.dataset.category);
            });
        });

        // Income buttons
        document.getElementById('add-income-btn').addEventListener('click', () => this.addIncome());
        document.getElementById('edit-income-btn').addEventListener('click', () => this.editIncome());
        document.getElementById('delete-income-btn').addEventListener('click', () => this.deleteIncome());

        // Fuel buttons
        document.getElementById('update-fuel-advance-btn').addEventListener('click', () => this.updateFuelAdvance());
        document.getElementById('add-fuel-btn').addEventListener('click', () => this.addFuelPurchase());
        document.getElementById('edit-fuel-btn').addEventListener('click', () => this.editFuelPurchase());
        document.getElementById('delete-fuel-btn').addEventListener('click', () => this.deleteFuelPurchase());
        document.getElementById('toggle-fuel-paid-btn').addEventListener('click', () => this.toggleFuelPaid());

        // Expense buttons
        document.querySelectorAll('.add-expense-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.addExpense(e.target.dataset.category));
        });

        document.querySelectorAll('.edit-expense-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.editExpense(e.target.dataset.category));
        });

        document.querySelectorAll('.delete-expense-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteExpense(e.target.dataset.category));
        });

        document.querySelectorAll('.toggle-expense-paid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleExpensePaid(e.target.dataset.category));
        });

        // Account buttons
        document.getElementById('update-credit-btn').addEventListener('click', () => this.updateCreditBalance());
        document.getElementById('update-savings-btn').addEventListener('click', () => this.updateSavingsBalance());

        // Summary buttons
        document.getElementById('refresh-summary-btn').addEventListener('click', () => this.refreshSummary());
        document.getElementById('check-balance-btn').addEventListener('click', () => this.checkBalance());

        // Import/Export buttons
        document.getElementById('import-data-btn').addEventListener('click', () => this.importData());
        document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileSelect(e));

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-cancel-btn').addEventListener('click', () => this.closeModal());

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    switchExpenseTab(category) {
        document.querySelectorAll('.expense-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.expense-pane').forEach(pane => pane.classList.remove('active'));

        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        document.getElementById(`${category}-expense`).classList.add('active');
    }

    addNewMonth() {
        const monthStr = prompt('Enter month (YYYY-MM format):');
        if (monthStr) {
            try {
                // Validate format
                const [year, month] = monthStr.split('-');
                if (year && month && month.length === 2 && !isNaN(year) && !isNaN(month)) {
                    if (!this.data.months[monthStr]) {
                        this.initializeMonth(monthStr);
                        this.data.current_month = monthStr;
                        this.refreshDisplay();
                        this.saveData();
                    } else {
                        alert('Month already exists');
                    }
                } else {
                    alert('Invalid date format. Use YYYY-MM');
                }
            } catch (e) {
                alert('Invalid date format. Use YYYY-MM');
            }
        }
    }

    nextMonth() {
        try {
            const [year, month] = this.data.current_month.split('-').map(Number);
            let nextMonth;

            if (month === 12) {
                nextMonth = `${year + 1}-01`;
            } else {
                nextMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
            }

            if (!this.data.months[nextMonth]) {
                this.initializeMonth(nextMonth);
            }

            this.data.current_month = nextMonth;
            this.refreshDisplay();
            this.saveData();
        } catch (e) {
            alert('Invalid current month format');
        }
    }

    // Income methods
    addIncome() {
        this.showIncomeDialog('Add Income', null, (result) => {
            const monthData = this.data.months[this.data.current_month];
            monthData.income.push(result);
            this.refreshDisplay();
            this.saveData();
        });
    }

    editIncome() {
        const selectedIndex = this.getSelectedRowIndex('income-tbody');
        if (selectedIndex === null) {
            alert('Please select an income source to edit');
            return;
        }

        const monthData = this.data.months[this.data.current_month];
        const income = monthData.income[selectedIndex];

        this.showIncomeDialog('Edit Income', income, (result) => {
            monthData.income[selectedIndex] = result;
            this.refreshDisplay();
            this.saveData();
        });
    }

    deleteIncome() {
        const selectedIndex = this.getSelectedRowIndex('income-tbody');
        if (selectedIndex === null) {
            alert('Please select an income source to delete');
            return;
        }

        if (confirm('Are you sure you want to delete this income source?')) {
            const monthData = this.data.months[this.data.current_month];
            monthData.income.splice(selectedIndex, 1);
            this.refreshDisplay();
            this.saveData();
        }
    }

    // Fuel methods
    updateFuelAdvance() {
        const advanceAmount = parseFloat(document.getElementById('fuel-advance').value || 0);

        if (advanceAmount < 0) {
            alert('Fuel advance cannot be negative');
            return;
        }

        const monthData = this.data.months[this.data.current_month];
        monthData.fuel_advance = advanceAmount;
        this.refreshDisplay();
        this.saveData();
    }

    addFuelPurchase() {
        const monthData = this.data.months[this.data.current_month];
        const currentSpent = monthData.expenses.fuel.reduce((sum, f) => sum + f.amount, 0);
        const fuelAdvance = monthData.fuel_advance || 0;

        this.showExpenseDialog('Add Fuel Purchase', null, (result) => {
            const newTotal = currentSpent + result.amount;

            if (newTotal > fuelAdvance) {
                const proceed = confirm(
                    `This purchase (R${result.amount.toFixed(2)}) would exceed your fuel advance.\n` +
                    `Current spent: R${currentSpent.toFixed(2)}\n` +
                    `Fuel advance: R${fuelAdvance.toFixed(2)}\n` +
                    `Would result in overspend of R${(newTotal - fuelAdvance).toFixed(2)}\n\n` +
                    'Do you want to proceed anyway?'
                );

                if (!proceed) return;
            }

            monthData.expenses.fuel.push(result);
            this.refreshDisplay();
            this.saveData();
        }, 'fuel');
    }

    editFuelPurchase() {
        const selectedIndex = this.getSelectedRowIndex('fuel-tbody');
        if (selectedIndex === null) {
            alert('Please select a fuel purchase to edit');
            return;
        }

        const monthData = this.data.months[this.data.current_month];
        const fuel = monthData.expenses.fuel[selectedIndex];

        this.showExpenseDialog('Edit Fuel Purchase', fuel, (result) => {
            const currentSpent = monthData.expenses.fuel.reduce((sum, f, i) =>
                i !== selectedIndex ? sum + f.amount : sum, 0);
            const fuelAdvance = monthData.fuel_advance || 0;
            const newTotal = currentSpent + result.amount;

            if (newTotal > fuelAdvance) {
                const proceed = confirm(
                    `This edit would exceed your fuel advance.\n` +
                    `Other fuel expenses: R${currentSpent.toFixed(2)}\n` +
                    `This purchase: R${result.amount.toFixed(2)}\n` +
                    `Fuel advance: R${fuelAdvance.toFixed(2)}\n` +
                    `Would result in overspend of R${(newTotal - fuelAdvance).toFixed(2)}\n\n` +
                    'Do you want to proceed anyway?'
                );

                if (!proceed) return;
            }

            monthData.expenses.fuel[selectedIndex] = result;
            this.refreshDisplay();
            this.saveData();
        }, 'fuel');
    }

    deleteFuelPurchase() {
        const selectedIndex = this.getSelectedRowIndex('fuel-tbody');
        if (selectedIndex === null) {
            alert('Please select a fuel purchase to delete');
            return;
        }

        if (confirm('Are you sure you want to delete this fuel purchase?')) {
            const monthData = this.data.months[this.data.current_month];
            monthData.expenses.fuel.splice(selectedIndex, 1);
            this.refreshDisplay();
            this.saveData();
        }
    }

    toggleFuelPaid() {
        const selectedIndex = this.getSelectedRowIndex('fuel-tbody');
        if (selectedIndex === null) {
            alert('Please select a fuel purchase to toggle');
            return;
        }

        const monthData = this.data.months[this.data.current_month];
        monthData.expenses.fuel[selectedIndex].paid = !monthData.expenses.fuel[selectedIndex].paid;
        this.refreshDisplay();
        this.saveData();
    }

    // Expense methods
    addExpense(category) {
        this.showExpenseDialog('Add Expense', null, (result) => {
            const monthData = this.data.months[this.data.current_month];
            monthData.expenses[category].push(result);
            this.refreshDisplay();
            this.saveData();
        }, category);
    }

    editExpense(category) {
        const selectedIndex = this.getSelectedRowIndex(`${category}-tbody`);
        if (selectedIndex === null) {
            alert('Please select an expense to edit');
            return;
        }

        const monthData = this.data.months[this.data.current_month];
        const expense = monthData.expenses[category][selectedIndex];

        this.showExpenseDialog('Edit Expense', expense, (result) => {
            monthData.expenses[category][selectedIndex] = result;
            this.refreshDisplay();
            this.saveData();
        }, category);
    }

    deleteExpense(category) {
        const selectedIndex = this.getSelectedRowIndex(`${category}-tbody`);
        if (selectedIndex === null) {
            alert('Please select an expense to delete');
            return;
        }

        if (confirm('Are you sure you want to delete this expense?')) {
            const monthData = this.data.months[this.data.current_month];
            monthData.expenses[category].splice(selectedIndex, 1);
            this.refreshDisplay();
            this.saveData();
        }
    }

    toggleExpensePaid(category) {
        const selectedIndex = this.getSelectedRowIndex(`${category}-tbody`);
        if (selectedIndex === null) {
            alert('Please select an expense to toggle');
            return;
        }

        const monthData = this.data.months[this.data.current_month];
        monthData.expenses[category][selectedIndex].paid = !monthData.expenses[category][selectedIndex].paid;
        this.refreshDisplay();
        this.saveData();
    }

    // Account methods
    updateCreditBalance() {
        const creditBalance = parseFloat(document.getElementById('credit-balance').value || 0);
        const monthData = this.data.months[this.data.current_month];

        if (!monthData.accounts) {
            monthData.accounts = { credit: 0.0, savings: 0.0 };
        }

        monthData.accounts.credit = creditBalance;
        document.getElementById('credit-display').textContent = `Current: R${creditBalance.toFixed(2)}`;
        this.saveData();
        alert(`Credit balance updated to R${creditBalance.toFixed(2)}`);
    }

    updateSavingsBalance() {
        const savingsBalance = parseFloat(document.getElementById('savings-balance').value || 0);
        const monthData = this.data.months[this.data.current_month];

        if (!monthData.accounts) {
            monthData.accounts = { credit: 0.0, savings: 0.0 };
        }

        monthData.accounts.savings = savingsBalance;
        document.getElementById('savings-display').textContent = `Current: R${savingsBalance.toFixed(2)}`;
        this.saveData();
        alert(`Savings balance updated to R${savingsBalance.toFixed(2)}`);
    }

    // Summary methods
    checkBalance() {
        const actualBalance = parseFloat(document.getElementById('actual-balance').value || 0);
        const monthData = this.data.months[this.data.current_month];

        const totalIncome = monthData.income.reduce((sum, inc) => sum + inc.amount, 0);
        let paidExpenses = 0;

        for (const [category, expenses] of Object.entries(monthData.expenses)) {
            if (category === 'fuel') continue;
            paidExpenses += expenses.reduce((sum, exp) => exp.paid ? sum + exp.amount : sum, 0);
        }

        const calculatedBalance = totalIncome - paidExpenses;
        const difference = actualBalance - calculatedBalance;

        const resultDiv = document.getElementById('balance-check-result');

        if (Math.abs(difference) < 0.01) {
            resultDiv.textContent = `✓ Balanced! (R${calculatedBalance.toFixed(2)})`;
            resultDiv.className = 'success';
        } else if (difference > 0) {
            resultDiv.textContent = `⚠ R${Math.abs(difference).toFixed(2)} higher - Possible missing expense`;
            resultDiv.className = 'warning';
        } else {
            resultDiv.textContent = `⚠ R${Math.abs(difference).toFixed(2)} lower - Possible duplicate expense`;
            resultDiv.className = 'error';
        }
    }

    refreshSummary() {
        const monthData = this.data.months[this.data.current_month];

        const totalIncome = monthData.income.reduce((sum, inc) => sum + inc.amount, 0);
        const fuelAdvance = monthData.fuel_advance || 0;

        let totalExpenses = 0;
        let paidExpenses = 0;
        const fuelSpent = monthData.expenses.fuel.reduce((sum, f) => sum + f.amount, 0);
        const fuelRemaining = Math.max(0, fuelAdvance - fuelSpent);

        let summaryText = `BUDGET SUMMARY - ${this.data.current_month}\n`;
        summaryText += '='.repeat(50) + '\n\n';

        // Income summary
        summaryText += 'INCOME:\n';
        summaryText += '-'.repeat(20) + '\n';
        monthData.income.forEach(income => {
            summaryText += `${income.source.padEnd(25)} R${income.amount.toFixed(2).padStart(10)}\n`;
        });
        summaryText += '-'.repeat(35) + '\n';
        summaryText += `${'Total Income'.padEnd(25)} R${totalIncome.toFixed(2).padStart(10)}\n\n`;

        // Expenses summary
        summaryText += 'EXPENSES:\n';
        summaryText += '-'.repeat(20) + '\n';

        for (const [category, expenses] of Object.entries(monthData.expenses)) {
            if (expenses.length > 0 && category !== 'fuel') {
                const categoryTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
                const categoryPaid = expenses.reduce((sum, exp) => exp.paid ? sum + exp.amount : sum, 0);

                summaryText += `\n${category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:\n`;
                expenses.forEach(expense => {
                    const paidMark = expense.paid ? '✓' : '✗';
                    summaryText += `  ${paidMark} ${expense.name.padEnd(20)} R${expense.amount.toFixed(2).padStart(8)}\n`;
                });

                summaryText += `  ${'Subtotal'.padEnd(23)} R${categoryTotal.toFixed(2).padStart(8)}\n`;
                summaryText += `  ${'Paid'.padEnd(23)} R${categoryPaid.toFixed(2).padStart(8)}\n`;

                totalExpenses += categoryTotal;
                paidExpenses += categoryPaid;
            }
        }

        summaryText += '\n' + '='.repeat(35) + '\n';
        summaryText += `${'Total Expenses'.padEnd(25)} R${totalExpenses.toFixed(2).padStart(10)}\n`;
        summaryText += `${'Paid Expenses'.padEnd(25)} R${paidExpenses.toFixed(2).padStart(10)}\n`;
        summaryText += `${'Unpaid Expenses'.padEnd(25)} R${(totalExpenses - paidExpenses).toFixed(2).padStart(10)}\n\n`;

        // Balance calculations
        const projectedBalance = totalIncome - totalExpenses;
        const currentBalance = totalIncome - paidExpenses;

        summaryText += 'BALANCE CALCULATIONS:\n';
        summaryText += '-'.repeat(30) + '\n';
        summaryText += `${'Current Balance'.padEnd(30)} R${currentBalance.toFixed(2).padStart(10)}\n`;
        summaryText += `${'Projected Balance'.padEnd(30)} R${projectedBalance.toFixed(2).padStart(10)}\n\n`;

        // Fuel advance tracking
        summaryText += 'FUEL ADVANCE TRACKING:\n';
        summaryText += '-'.repeat(30) + '\n';
        summaryText += `${'Fuel Advance'.padEnd(30)} R${fuelAdvance.toFixed(2).padStart(10)}\n`;
        summaryText += `${'Fuel Spent'.padEnd(30)} R${fuelSpent.toFixed(2).padStart(10)}\n`;
        summaryText += `${'Fuel Remaining'.padEnd(30)} R${fuelRemaining.toFixed(2).padStart(10)}\n`;
        if (fuelSpent > fuelAdvance) {
            summaryText += `${'FUEL OVERSPENT'.padEnd(30)} R${(fuelSpent - fuelAdvance).toFixed(2).padStart(10)}\n`;
        }

        document.getElementById('summary-text').textContent = summaryText;
    }

    // Display methods
    refreshDisplay() {
        this.updateMonthSelector();

        const monthData = this.data.months[this.data.current_month];
        if (!monthData) return;

        this.refreshIncomeTable(monthData);
        this.refreshFuelSection(monthData);
        this.refreshExpenseTables(monthData);
        this.refreshAccountsSection(monthData);
        this.refreshSummary();
    }

    updateMonthSelector() {
        const select = document.getElementById('month-select');
        select.innerHTML = '';

        const months = Object.keys(this.data.months).sort();
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            if (month === this.data.current_month) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    refreshIncomeTable(monthData) {
        const tbody = document.getElementById('income-tbody');
        tbody.innerHTML = '';

        monthData.income.forEach((income, index) => {
            const row = tbody.insertRow();
            row.dataset.index = index;
            row.addEventListener('click', () => this.selectRow(row));

            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);

            cell1.textContent = income.source;
            cell2.textContent = `R${income.amount.toFixed(2)}`;
        });
    }

    refreshFuelSection(monthData) {
        const fuelAdvance = monthData.fuel_advance || 0;
        document.getElementById('fuel-advance').value = fuelAdvance;

        const tbody = document.getElementById('fuel-tbody');
        tbody.innerHTML = '';

        monthData.expenses.fuel.forEach((fuel, index) => {
            const row = tbody.insertRow();
            row.dataset.index = index;
            row.addEventListener('click', () => this.selectRow(row));

            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);

            cell1.textContent = fuel.name;
            cell2.textContent = `R${fuel.amount.toFixed(2)}`;
            cell3.textContent = fuel.date || '';
            cell4.textContent = fuel.paid ? 'Yes' : 'No';
        });

        // Update fuel summary
        const fuelSpent = monthData.expenses.fuel.reduce((sum, f) => sum + f.amount, 0);
        const fuelRemaining = Math.max(0, fuelAdvance - fuelSpent);
        let fuelSummary = `Advance: R${fuelAdvance.toFixed(2)} | Spent: R${fuelSpent.toFixed(2)} | Remaining: R${fuelRemaining.toFixed(2)}`;
        if (fuelSpent > fuelAdvance) {
            fuelSummary += ` | OVERSPENT: R${(fuelSpent - fuelAdvance).toFixed(2)}`;
        }
        document.getElementById('fuel-summary').textContent = fuelSummary;
    }

    refreshExpenseTables(monthData) {
        const categories = ['fixed', 'flexible', 'subscriptions', 'international_bank', 'ad_hoc'];

        categories.forEach(category => {
            const tbody = document.getElementById(`${category}-tbody`);
            tbody.innerHTML = '';

            monthData.expenses[category].forEach((expense, index) => {
                const row = tbody.insertRow();
                row.dataset.index = index;
                row.addEventListener('click', () => this.selectRow(row));

                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                const cell3 = row.insertCell(2);
                const cell4 = row.insertCell(3);

                cell1.textContent = expense.name;
                cell2.textContent = `R${expense.amount.toFixed(2)}`;

                // Display date based on category
                if (['fixed', 'flexible', 'subscriptions'].includes(category)) {
                    cell3.textContent = expense.day || 1;
                } else {
                    cell3.textContent = expense.date || '';
                }

                cell4.textContent = expense.paid ? 'Yes' : 'No';
            });
        });
    }

    refreshAccountsSection(monthData) {
        if (!monthData.accounts) {
            monthData.accounts = { credit: 0.0, savings: 0.0 };
        }

        const creditBalance = monthData.accounts.credit || 0;
        const savingsBalance = monthData.accounts.savings || 0;

        document.getElementById('credit-balance').value = creditBalance;
        document.getElementById('savings-balance').value = savingsBalance;
        document.getElementById('credit-display').textContent = `Current: R${creditBalance.toFixed(2)}`;
        document.getElementById('savings-display').textContent = `Current: R${savingsBalance.toFixed(2)}`;
    }

    // Dialog methods
    showIncomeDialog(title, incomeData, callback) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = title;

        modalBody.innerHTML = `
            <div class="form-group">
                <label for="dialog-source">Source:</label>
                <input type="text" id="dialog-source" value="${incomeData ? incomeData.source : ''}">
            </div>
            <div class="form-group">
                <label for="dialog-amount">Amount:</label>
                <input type="number" id="dialog-amount" step="0.01" min="0" value="${incomeData ? incomeData.amount : ''}">
            </div>
        `;

        const okBtn = document.getElementById('modal-ok-btn');
        const newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);

        newOkBtn.addEventListener('click', () => {
            const source = document.getElementById('dialog-source').value.trim();
            const amount = parseFloat(document.getElementById('dialog-amount').value || 0);

            if (!source) {
                alert('Please enter a source');
                return;
            }

            if (amount < 0) {
                alert('Amount cannot be negative');
                return;
            }

            callback({ source, amount });
            this.closeModal();
        });

        modal.classList.add('show');
        document.getElementById('dialog-source').focus();
    }

    showExpenseDialog(title, expenseData, callback, category = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = title;

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        let dateField = '';
        if (category && ['fixed', 'flexible', 'subscriptions'].includes(category)) {
            // Day of month picker
            const dayValue = expenseData && expenseData.day ? expenseData.day : 1;
            dateField = `
                <div class="form-group">
                    <label for="dialog-day">Day of Month:</label>
                    <input type="number" id="dialog-day" min="1" max="31" value="${dayValue}">
                </div>
            `;
        } else if (category && ['international_bank', 'ad_hoc', 'fuel'].includes(category)) {
            // Full date picker
            const dateValue = expenseData && expenseData.date ? expenseData.date : today;
            dateField = `
                <div class="form-group">
                    <label for="dialog-date">Date:</label>
                    <input type="date" id="dialog-date" value="${dateValue}">
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div class="form-group">
                <label for="dialog-name">Name:</label>
                <input type="text" id="dialog-name" value="${expenseData ? expenseData.name : ''}">
            </div>
            <div class="form-group">
                <label for="dialog-amount">Amount:</label>
                <input type="number" id="dialog-amount" step="0.01" min="0" value="${expenseData ? expenseData.amount : ''}">
            </div>
            ${dateField}
            <div class="form-group">
                <label for="dialog-paid">Paid:</label>
                <input type="checkbox" id="dialog-paid" ${expenseData && expenseData.paid ? 'checked' : ''}>
            </div>
        `;

        const okBtn = document.getElementById('modal-ok-btn');
        const newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);

        newOkBtn.addEventListener('click', () => {
            const name = document.getElementById('dialog-name').value.trim();
            const amount = parseFloat(document.getElementById('dialog-amount').value || 0);
            const paid = document.getElementById('dialog-paid').checked;

            if (!name) {
                alert('Please enter an expense name');
                return;
            }

            if (amount < 0) {
                alert('Amount cannot be negative');
                return;
            }

            const result = { name, amount, paid };

            // Add date based on category
            if (category && ['fixed', 'flexible', 'subscriptions'].includes(category)) {
                const day = parseInt(document.getElementById('dialog-day').value);
                if (day < 1 || day > 31) {
                    alert('Day must be between 1 and 31');
                    return;
                }
                result.day = day;
            } else if (category && ['international_bank', 'ad_hoc', 'fuel'].includes(category)) {
                const date = document.getElementById('dialog-date').value;
                if (!date) {
                    alert('Please select a date');
                    return;
                }
                result.date = date;
            }

            callback(result);
            this.closeModal();
        });

        modal.classList.add('show');
        document.getElementById('dialog-name').focus();
    }

    closeModal() {
        document.getElementById('modal').classList.remove('show');
    }

    // Helper methods
    selectRow(row) {
        const tbody = row.parentElement;
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
    }

    getSelectedRowIndex(tbodyId) {
        const tbody = document.getElementById(tbodyId);
        const selectedRow = tbody.querySelector('tr.selected');

        if (!selectedRow) return null;
        return parseInt(selectedRow.dataset.index);
    }

    // Import/Export methods
    exportData() {
        try {
            // Create a JSON blob from the data
            const dataStr = JSON.stringify(this.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });

            // Create a download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'budget_data.json';

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

            alert('Data exported successfully! The file is compatible with the desktop app.');
        } catch (e) {
            console.error('Failed to export data:', e);
            alert('Failed to export data: ' + e.message);
        }
    }

    importData() {
        // Trigger file input click
        document.getElementById('file-input').click();
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Validate the data structure
                if (!importedData.months || typeof importedData.months !== 'object') {
                    alert('Invalid data file format. Please select a valid budget_data.json file.');
                    return;
                }

                // Confirm before importing
                const confirmMsg = `This will replace all current data with the imported data.\n\n` +
                                 `Imported data contains ${Object.keys(importedData.months).length} month(s).\n\n` +
                                 `Do you want to continue?`;

                if (confirm(confirmMsg)) {
                    this.data = importedData;

                    // Ensure current_month is set
                    if (!this.data.current_month) {
                        this.data.current_month = this.getCurrentMonth();
                    }

                    // Ensure current month exists
                    if (!this.data.months[this.data.current_month]) {
                        this.initializeMonth(this.data.current_month);
                    }

                    this.saveData();
                    this.refreshDisplay();

                    alert('Data imported successfully! You can now use this data in both the web and desktop apps.');
                }
            } catch (e) {
                console.error('Failed to import data:', e);
                alert('Failed to import data: ' + e.message + '\n\nPlease make sure you selected a valid JSON file.');
            }
        };

        reader.onerror = () => {
            alert('Failed to read file. Please try again.');
        };

        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    }

    // Data persistence
    saveData() {
        try {
            localStorage.setItem('budgetTrackerData', JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save data:', e);
            alert('Failed to save data to local storage');
        }
    }

    loadData() {
        try {
            const saved = localStorage.getItem('budgetTrackerData');
            if (saved) {
                this.data = JSON.parse(saved);
                if (!this.data.current_month) {
                    this.data.current_month = this.getCurrentMonth();
                }
            }
        } catch (e) {
            console.error('Failed to load data:', e);
            alert('Failed to load data from local storage');
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BudgetTracker();
});
