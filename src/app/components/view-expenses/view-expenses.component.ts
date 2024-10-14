import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.component.html',
  styleUrls: ['./view-expenses.component.scss']
})
export class ViewExpensesComponent implements OnInit {
  expenses: any[] = [];
  username: string = ''; // To store the username from localStorage
  expensesKey: string = '';

  ngOnInit() {
    this.loadLoggedInUser(); // Load the logged-in user data
    this.loadExpenses();      // Load the expenses associated with that user
  }

  loadLoggedInUser() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        this.username = userData.username; // Extract the username
      } catch (error) {
        console.error('Failed to parse logged-in user data', error);
      }
    } else {
      console.warn('No user is currently logged in.');
    }
  }

  loadExpenses() {
    if (this.username) {
      this.expensesKey = `expenses_${this.username}`;
      const savedExpenses = localStorage.getItem(this.expensesKey);
      if (savedExpenses) {
        try {
          this.expenses = JSON.parse(savedExpenses) || [];
        } catch (error) {
          console.error('Failed to load expenses data from localStorage', error);
        }
      } else {
        // Show an empty message or handle no expenses case
        this.expenses = [];
        console.warn('No expenses found for this user.');
      }
    } else {
      this.expenses = []; // No username found
    }
  }
}
