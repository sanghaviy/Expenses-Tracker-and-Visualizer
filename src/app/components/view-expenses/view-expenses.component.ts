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

  ngOnInit() {
    this.loadLoggedInUser();
    this.loadExpenses();
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
        } catch (error) {
          console.error(
            'Failed to load expenses data from localStorage',
            error
          );
        }
      } else {
        this.expenses = [];
      }
    } else {
      this.expenses = [];
    }
  }
}
