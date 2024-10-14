  import { Component, OnInit } from '@angular/core';
  import { AngularFireDatabase } from '@angular/fire/compat/database';
  import { Observable } from 'rxjs';

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

    constructor(private db: AngularFireDatabase ) {} // Inject AngularFireDatabase

    ngOnInit() {
      this.loadLoggedInUser();
      this.loadExpenses(); // Load expenses from Firebase
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
        const sanitizedUsername = this.sanitizeUsername(this.username);
        this.db
          .list(`expenses/${sanitizedUsername}`)
          .valueChanges()
          .subscribe((expenses: any[]) => {
            this.expenses = expenses;
            this.totalPages = Math.ceil(this.expenses.length / this.itemsPerPage); // Calculate total pages
            this.paginateExpenses(); // Recalculate pagination after loading expenses
          });
      } else {
        this.expenses = [];
      }
    }

    // Function to sanitize the username (replace . with _)
    sanitizeUsername(username: string): string {
      return username.replace(/\./g, '_');
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
