import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.component.html',
  styleUrls: ['./view-expenses.component.scss'],
})
export class ViewExpensesComponent implements OnInit {
  expenses: any[] = [];
  username: string = '';
  expensesKey: string = '';

  // Pagination properties
  currentPage: number = 1; // Current page number
  itemsPerPage: number = 5; // Number of items per page
  paginatedExpenses: any[] = []; // Array to hold the expenses for the current page
  totalPages: number = 0; // Total number of pages

  ngOnInit() {
    this.loadLoggedInUser();
    this.loadExpenses();
    this.paginateExpenses(); // Call to initialize pagination
  }

  loadLoggedInUser() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        this.username = userData.username;
      } catch (error) {
        console.error('Failed to parse logged-in user data', error);
      }
    }
  }

  loadExpenses() {
    if (this.username) {
      this.expensesKey = `expenses_${this.username}`;
      const savedExpenses = localStorage.getItem(this.expensesKey);
      if (savedExpenses) {
        try {
          this.expenses = JSON.parse(savedExpenses) || [];
          this.totalPages = Math.ceil(this.expenses.length / this.itemsPerPage); // Calculate total pages
          this.paginateExpenses(); // Recalculate pagination after loading expenses
        } catch (error) {
          console.error('Failed to load expenses data from localStorage', error);
        }
      } else {
        this.expenses = [];
      }
    } else {
      this.expenses = [];
    }
  }

  // Function to calculate paginated expenses
  paginateExpenses() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedExpenses = this.expenses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Navigate to the previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateExpenses();
    }
  }

  // Navigate to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateExpenses();
    }
  }
}
