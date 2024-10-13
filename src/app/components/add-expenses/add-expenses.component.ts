import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Define an interface for the expense model
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
  expenseForm!: FormGroup; // Reactive form
  categories: string[] = ['Groceries', 'Insurance', 'Entertainment', 'Dining out'];
  temporaryCategories: string[] = [];
  newCategory: string = '';
  loggedInUser: any;
  expenses: Expense[] = []; // Array to hold logged expenses

  currencies: Currency[] = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'Euro' },
    { symbol: '£', name: 'GBP' },
    { symbol: '₹', name: 'INR' }
  ];

  selectedCurrency: Currency;
  selectedCurrencyValue: Currency = { symbol: '$', name: 'USD' };
  monthlyBudgetValue: number = 0;
  monthlyBudget: number = 0;

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.selectedCurrency = this.loadSelectedCurrency();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadBudgetAndCurrency();
    this.loadExpenses(); // Load expenses when the component initializes
  }

  // Initialize the reactive form
  initForm() {
    this.expenseForm = this.fb.group({
      name: ['', [Validators.required]],
      totalAmount: [null, [Validators.required, Validators.min(1)]],
      taxAmount: [null, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      date: ['', [Validators.required]],
      paymentType: ['', [Validators.required]],
      comments: ['']
    });
  }

  // Load existing categories from localStorage
  loadCategories() {
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const storedCategories = localStorage.getItem(`categories_${this.loggedInUser.username}`);
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
      this.toastr.error('Please enter a valid, non-duplicate category name.', 'Error');
    }
  }

  loadSelectedCurrency(): Currency {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      return JSON.parse(savedCurrency);
    }
    return { symbol: '$', name: 'USD' };
  }

  removeCategory(category: string) {
    const index = this.categories.indexOf(category);
    if (index > -1) {
      this.categories.splice(index, 1);
    }
  }

  saveCategories() {
    const uniqueCategories = Array.from(new Set([...this.categories, ...this.temporaryCategories]));
    localStorage.setItem(`categories_${this.loggedInUser.username}`, JSON.stringify(uniqueCategories));
    this.toastr.success('Categories saved successfully!', 'Success');
    this.temporaryCategories = [];
  }

  submitExpense() {
    if (this.expenseForm.valid) {
      const expense: Expense = this.expenseForm.value; // Get form value
      this.saveExpenseToLocalStorage(expense); // Save expense to local storage
      this.toastr.success('Expense saved successfully!', 'Success');
      this.resetExpenseForm();
    } else {
      this.toastr.error('Please fill all the required fields correctly.', 'Error');
    }
  }

  // Save expense to local storage
  saveExpenseToLocalStorage(expense: Expense) {
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}'); // Retrieve logged in user
    const userExpensesKey = `expenses_${this.loggedInUser.username}`; // Create a key for the user
    const existingExpenses = JSON.parse(localStorage.getItem(userExpensesKey) || '[]'); // Retrieve existing expenses
    existingExpenses.push(expense); // Add the new expense
    localStorage.setItem(userExpensesKey, JSON.stringify(existingExpenses)); // Save updated expenses to local storage
    this.loadExpenses(); // Reload expenses after saving a new one
  }

  // Load expenses from local storage
  loadExpenses() {
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}'); // Retrieve logged in user
    const userExpensesKey = `expenses_${this.loggedInUser.username}`; // Create a key for the user
    const storedExpenses = localStorage.getItem(userExpensesKey); // Retrieve stored expenses
    if (storedExpenses) {
      try {
        this.expenses = JSON.parse(storedExpenses); // Load expenses into the component's state
      } catch (error) {
        this.toastr.error('Failed to load expenses.', 'Error');
      }
    }
  }

  resetExpenseForm() {
    this.expenseForm.reset();
    this.newCategory = '';
    this.categories = ['Groceries', 'Insurance', 'Entertainment', 'Dining out'];
  }

  saveBudget() {
    this.monthlyBudget = this.monthlyBudgetValue;
    this.selectedCurrency = this.selectedCurrencyValue;
    const budgetData = {
      monthlyBudget: this.monthlyBudgetValue,
      selectedCurrency: this.selectedCurrency
    };
    localStorage.setItem('budgetData', JSON.stringify(budgetData));
    this.toastr.success('Budget and Currency saved successfully!', 'Success');
  }

  loadBudgetAndCurrency() {
    const savedBudgetData = localStorage.getItem('budgetData');
    if (savedBudgetData) {
      try {
        const { monthlyBudget, selectedCurrency } = JSON.parse(savedBudgetData);
        this.monthlyBudget = monthlyBudget;
        this.selectedCurrency = selectedCurrency;
      } catch (error) {
        this.toastr.error('Failed to load budget data.', 'Error');
      }
    }
  }

  // Helper method to access form controls easily in the template
  get f() {
    return this.expenseForm.controls;
  }
}
