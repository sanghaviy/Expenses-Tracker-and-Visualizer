import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface Expense {
  name: string;
  totalAmount: number;
  taxAmount: number;
  category: string;
  date: string;
  paymentType: string;
  comments: string;
}

interface Currency {
  symbol: string;
  name: string;
}

@Component({
  selector: 'app-add-expenses',
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.scss'],
})
export class AddExpensesComponent implements OnInit {
  expenseForm!: FormGroup;
  categories: string[] = [
    'Groceries',
    'Insurance',
    'Entertainment',
    'Dining out',
  ];
  temporaryCategories: string[] = [];
  newCategory: string = '';
  loggedInUser: any;
  expenses: Expense[] = [];
  currencies: Currency[] = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'Euro' },
    { symbol: '£', name: 'GBP' },
    { symbol: '₹', name: 'INR' },
  ];
  selectedCurrency: Currency;
  selectedCurrencyValue: Currency = { symbol: '$', name: 'USD' };
  monthlyBudgetValue: number = 0;
  monthlyBudget: number = 0;
  spendingPercentage: number = 0;
  totalSpent: number = 0;

  constructor(private toastr: ToastrService, private fb: FormBuilder) {
    debugger;
    this.selectedCurrency = this.currencies[0];
  }

  ngOnInit(): void {
    this.initForm();
    this.loadBudgetAndCurrency();
    this.loadCategories();
    this.loadExpenses();
    this.calculateSpendingPercentage();
  }

  initForm() {
    this.expenseForm = this.fb.group({
      name: ['', Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(1)]],
      taxAmount: [null, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
      paymentType: ['', Validators.required],
      comments: [''],
    });
  }

  loadCategories() {
    this.loggedInUser = JSON.parse(
      localStorage.getItem('loggedInUser') || '{}'
    );
    const storedCategories = localStorage.getItem(
      `categories_${this.loggedInUser.username}`
    );
    if (storedCategories) {
      try {
        this.categories = JSON.parse(storedCategories);
      } catch (error) {
        this.toastr.error('Failed to load categories.', 'Error');
      }
    }
  }

  addCategory() {
    const trimmedCategory = this.newCategory.trim();
    if (trimmedCategory && !this.categories.includes(trimmedCategory)) {
      this.temporaryCategories.push(trimmedCategory);
      this.categories.push(trimmedCategory);
      this.newCategory = '';
    } else {
      this.toastr.error(
        'Please enter a valid, non-duplicate category name.',
        'Error'
      );
    }
  }

  removeCategory(category: string) {
    const index = this.categories.indexOf(category);
    if (index > -1) {
      this.categories.splice(index, 1);
    }
  }

  saveCategories() {
    const uniqueCategories = Array.from(
      new Set([...this.categories, ...this.temporaryCategories])
    );
    localStorage.setItem(
      `categories_${this.loggedInUser.username}`,
      JSON.stringify(uniqueCategories)
    );
    this.toastr.success('Categories saved successfully!', 'Success');
    this.temporaryCategories = [];
  }

  submitExpense() {
    if (this.expenseForm.valid) {
      if (this.monthlyBudget === 0) {
        this.toastr.error(
          'Please set a monthly budget before adding expenses.',
          'Error'
        );
        return;
      }

      const expense: Expense = this.expenseForm.value;
      this.saveExpenseToLocalStorage(expense);
      this.toastr.success('Expense saved successfully!', 'Success');
      this.resetExpenseForm();
      this.calculateSpendingPercentage();
    } else {
      this.toastr.error(
        'Please fill all the required fields correctly.',
        'Error'
      );
    }
  }

  saveExpenseToLocalStorage(expense: Expense) {
    this.loggedInUser = JSON.parse(
      localStorage.getItem('loggedInUser') || '{}'
    );
    const userExpensesKey = `expenses_${this.loggedInUser.username}`;
    const existingExpenses = JSON.parse(
      localStorage.getItem(userExpensesKey) || '[]'
    );
    existingExpenses.push(expense);
    localStorage.setItem(userExpensesKey, JSON.stringify(existingExpenses));
    this.loadExpenses();
  }

  loadExpenses() {
    this.loggedInUser = JSON.parse(
      localStorage.getItem('loggedInUser') || '{}'
    );
    const userExpensesKey = `expenses_${this.loggedInUser.username}`;
    this.expenses = JSON.parse(localStorage.getItem(userExpensesKey) || '[]');
    this.calculateSpendingPercentage();
  }

  resetExpenseForm() {
    this.expenseForm.reset();
    this.newCategory = '';
    this.categories = ['Groceries', 'Insurance', 'Entertainment', 'Dining out']; // Reset to default categories
  }

  saveBudget() {
    this.monthlyBudget = this.monthlyBudgetValue; // Assign the value from the input
    this.selectedCurrency = this.selectedCurrencyValue;

    const budgetData = {
      monthlyBudget: this.monthlyBudget,
      selectedCurrency: this.selectedCurrency,
    };

    this.monthlyBudgetValue = this.monthlyBudget;
    this.calculateSpendingPercentage();

    localStorage.setItem('budgetData', JSON.stringify(budgetData));
    this.toastr.success('Budget and Currency saved successfully!', 'Success');
  }

  loadBudgetAndCurrency() {
    const savedBudgetData = localStorage.getItem('budgetData');
    if (savedBudgetData) {
      try {
        const { monthlyBudget, selectedCurrency } = JSON.parse(savedBudgetData);
        this.monthlyBudget = monthlyBudget || 0;
        this.selectedCurrency = selectedCurrency || {
          symbol: '$',
          name: 'USD',
        };
        this.monthlyBudgetValue = this.monthlyBudget;

        // Find the corresponding currency object from the currencies array
        this.selectedCurrencyValue = this.currencies.find(
          (currency) =>
            currency.symbol === this.selectedCurrency.symbol &&
            currency.name === this.selectedCurrency.name
        ) || { symbol: '$', name: 'USD' }; // Default fallback
      } catch (error) {
        this.toastr.error('Failed to load budget data.', 'Error');
      }
    }
  }

  calculateSpendingPercentage() {
    this.totalSpent = this.expenses.reduce(
      (acc, expense) => acc + expense.totalAmount,
      0
    );
    this.spendingPercentage = (this.totalSpent / this.monthlyBudget) * 100 || 0;
  }

  getSpendingColor(): string {
    const currentSpending = this.expenses.reduce(
      (acc, expense) => acc + expense.totalAmount,
      0
    );
    if (currentSpending < this.monthlyBudget) {
      return 'green';
    } else if (currentSpending === this.monthlyBudget) {
      return 'orange';
    } else {
      return 'red';
    }
  }

  get f() {
    return this.expenseForm.controls;
  }
}
