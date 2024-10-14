import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userDetails: any;
  username: string = '';  // Store username from localStorage
  expenses: any[] = [];    // Store expenses
  showNoExpenses: boolean = false; // Track whether to show the "No Expenses" message

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadLoggedInUser(); // Load user details
    this.loadExpenses();      // Load expenses
    this.showNoExpenses = this.expenses.length === 0; // Set flag based on expenses
  }

  // Load logged-in user from localStorage
  loadLoggedInUser() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        this.userDetails = JSON.parse(loggedInUser);
        this.username = this.userDetails .username; // Get the username
      } catch (error) {
        console.error('Failed to parse logged-in user data', error);
      }
    }
  }

  // Load expenses from localStorage based on the username
  loadExpenses() {
    if (this.username) {
      const expensesKey = `expenses_${this.username}`; // Create a unique key for expenses
      const savedExpenses = localStorage.getItem(expensesKey);
      if (savedExpenses) {
        try {
          this.expenses = JSON.parse(savedExpenses) || []; // Parse and assign expenses
        } catch (error) {
          console.error('Failed to load expenses data from localStorage', error);
        }
      } else {
        this.expenses = []; // No expenses found
      }
    } else {
      this.expenses = []; // No username, no expenses
    }
  }

  // This method is triggered when the ViewExpenses component emits an event
  updateNoExpensesStatus(hasExpenses: boolean) {
    this.showNoExpenses = !hasExpenses; // Update the status based on the emitted event
  }

  AddExpenses() {
    this.router.navigate(['/addexpense']); // Navigate to add expense page
  }
}
