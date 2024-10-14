import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database'; // Import AngularFireDatabase
interface Expense {
  name: string;
  totalAmount: number;
  taxAmount: number;
  category: string;
  date: string;
  paymentType: string;
  comments: string;
}
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

  constructor(private router: Router, private db: AngularFireDatabase) {} // Inject AngularFireDatabase

  ngOnInit(): void {
    this.loadLoggedInUser(); // Load user details
    this.loadExpenses();      // Load expenses
  }

  // Load logged-in user from localStorage
  loadLoggedInUser() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        this.userDetails = JSON.parse(loggedInUser);
        this.username = this.userDetails.username; // Get the username
      } catch (error) {
        console.error('Failed to parse logged-in user data', error);
      }
    }
  }

  // Load expenses from Firebase based on the username
  loadExpenses() {
    if (this.username) {
      const sanitizedEmail = this.sanitizeEmail(this.username); // Sanitize email for Firebase path
      const userExpensesRef = this.db.list<Expense>(`expenses/${sanitizedEmail}`).valueChanges();

      userExpensesRef.subscribe(expenses => {
        this.expenses = expenses; // Assign fetched expenses
        this.showNoExpenses = this.expenses.length === 0; // Update flag based on expenses
      }, error => {
        console.error('Error loading expenses from Firebase:', error); // Handle error
      });
    } else {
      this.expenses = []; // No username, no expenses
      this.showNoExpenses = true; // Show "No Expenses" message
    }
  }

  // Sanitize email to use in Firebase path
  private sanitizeEmail(email: string): string {
    return email.replace(/\./g, '_'); // Replace dots with underscores
  }

  // This method is triggered when the ViewExpenses component emits an event
  updateNoExpensesStatus(hasExpenses: boolean) {
    this.showNoExpenses = !hasExpenses; // Update the status based on the emitted event
  }

  AddExpenses() {
    this.router.navigate(['/addexpense']); // Navigate to add expense page
  }
}
