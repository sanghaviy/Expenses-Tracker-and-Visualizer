  import { Component, OnInit } from '@angular/core';
  import { AngularFireDatabase } from '@angular/fire/compat/database';

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
    currentPage: number = 1; 
    itemsPerPage: number = 5; 
    paginatedExpenses: any[] = [];
    totalPages: number = 0; 

    constructor(private db: AngularFireDatabase ) {} 

    ngOnInit() {
      this.loadLoggedInUser();
      this.loadExpenses(); 
      this.paginateExpenses(); 
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
            this.totalPages = Math.ceil(this.expenses.length / this.itemsPerPage);
            this.paginateExpenses();
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
