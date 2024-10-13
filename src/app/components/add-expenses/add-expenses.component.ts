import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

interface Currency {
  symbol: string;
  name: string;
}

interface Expense {
  name: string;
  totalAmount: number | null;
  taxAmount: number | null;
  category: string;
  date: string;
  paymentType: string;
  comments: string;
}

@Component({
  selector: 'app-add-expenses',
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.scss'],
})
export class AddExpensesComponent implements OnInit {
  expense: Expense = {
    name: '',
    totalAmount: null,
    taxAmount: null,
    category: '',
    date: '',
    paymentType: '',
    comments: '',
  };

  newCategory: string = ''; 
  categories: string[] = ['Groceries', 'Insurance', 'Entertainment', 'Dining out'];
  temporaryCategories: string[] = []; 
  monthlyBudgetValue: number = 0;
  monthlyBudget: number = 0; 
  loggedInUser: any;

  currencies: Currency[] = [
    { symbol: '$', name: 'USD' },
    { symbol: '€', name: 'Euro' },
    { symbol: '£', name: 'GBP' },
    { symbol: '₹', name: 'INR' }
  ];

  selectedCurrency: Currency;

  selectedCurrencyValue: Currency = { symbol: '$', name: 'USD' };

  constructor(private toastr: ToastrService) {
    this.selectedCurrency = this.loadSelectedCurrency();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBudgetAndCurrency();
  }

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

  onSubmit() {
    console.log('Expense submitted:', this.expense);
    this.toastr.success('Expense saved successfully!', 'Success');
    this.resetExpenseForm();
  }

  resetExpenseForm() {
    this.expense = {
      name: '',
      totalAmount: null,
      taxAmount: null,
      category: '',
      date: '',
      paymentType: '',
      comments: '',
    };

    this.newCategory = '';

    this.categories = ['Groceries', 'Insurance', 'Entertainment', 'Dining out']
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
}
