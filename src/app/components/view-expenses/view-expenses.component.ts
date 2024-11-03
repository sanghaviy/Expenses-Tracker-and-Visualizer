import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ToastrService } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';

interface Expense {
  id?: string; // Add an optional id field
  name: string;
  totalAmount: number;
  taxAmount: number;
  category: string;
  date: string;
  paymentType: string;
  comments: string;
}

@Component({
  selector: 'app-view-expenses',
  templateUrl: './view-expenses.component.html',
  styleUrls: ['./view-expenses.component.scss'],
})
export class ViewExpensesComponent implements OnInit {
  expenses: any[] = [];
  username: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 4;
  paginatedExpenses: any[] = [];
  totalPages: number = 0;
  selectedExpenseId: string | null = null;

  constructor(private db: AngularFireDatabase, private toastr: ToastrService) {}

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
      const sanitizedUsername = this.sanitizeUsername(this.username);
      this.db
        .list<Expense>(`expenses/${sanitizedUsername}`)
        .snapshotChanges() // Use snapshotChanges to get the key with the data
        .subscribe({
          next: (expenses) => {
            this.expenses = expenses.map((e) => ({
              id: e.payload.key,
              ...e.payload.val(),
            })); // Include id
            this.totalPages = Math.ceil(
              this.expenses.length / this.itemsPerPage
            );
            this.paginateExpenses();
          },
          error: (error) => {
            console.error('Error fetching expenses:', error);
            this.toastr.error('Failed to load expenses.', 'Error');
          },
        });
    } else {
      this.expenses = [];
    }
  }

  sanitizeUsername(username: string): string {
    return username.replace(/\./g, '_');
  }

  paginateExpenses() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedExpenses = this.expenses.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateExpenses();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateExpenses();
    }
  }

  getCurrentTimestamp(): string {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now
      .getHours()
      .toString()
      .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
  }

  downloadExpenses() {
    try {
      const timestamp = this.getCurrentTimestamp();
      const headers =
        'name,totalAmount,taxAmount,category,date,paymentType,comments';

      const csvContent = [
        headers,
        ...this.expenses.map((expense) => {
          // Assign default values if category or paymentType are not present
          const category = expense.category || 'Unassigned';
          const paymentType = expense.paymentType || 'Debit';

          // Format the date to MM/DD/YYYY
          const formattedDate = new Date(expense.date).toLocaleDateString(
            'en-US'
          );

          return `${expense.name},${expense.totalAmount},${
            expense.taxAmount
          },${category},${formattedDate},${paymentType},${
            expense.comments || ''
          }`;
        }),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      this.toastr.success('Expenses downloaded successfully!', 'Success');
    } catch (error) {
      this.toastr.error('Failed to download expenses.', 'Error');
    }
  }

  shareExpenses() {
    try {
      const timestamp = this.getCurrentTimestamp();
      const headers =
        'name\ttotalAmount\ttaxAmount\tcategory\tdate\tpaymentType\tcomments';

      const csvContent = [
        headers,
        ...this.expenses.map(
          (expense) =>
            `${expense.name}\t${expense.totalAmount}\t${expense.taxAmount}\t${
              expense.category
            }\t${expense.date}\t${expense.paymentType}\t${
              expense.comments || 'No comments'
            }`
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], `expenses_${timestamp}.csv`, {
        type: 'text/csv',
      });

      if (navigator.share) {
        navigator
          .share({
            title: 'Expense Report',
            text: 'Here is the expense report.',
            files: [file],
          })
          .then(() =>
            this.toastr.success('Expenses shared successfully!', 'Success')
          )
          .catch((err) =>
            this.toastr.error('Failed to share expenses.', 'Error')
          );
      } else {
        this.toastr.warning(
          'Sharing is not supported in this browser.',
          'Warning'
        );
      }
    } catch (error) {
      this.toastr.error('Failed to share expenses.', 'Error');
    }
  }

  confirmDelete(expenseId: string) {
    this.selectedExpenseId = expenseId;
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      const bootstrapModal = new bootstrap.Modal(modalElement);
      bootstrapModal.show();
    } else {
      console.error('Modal element not found');
    }
  }  
  
  deleteConfirmed() {
    if (this.selectedExpenseId) {
      this.deleteExpense(this.selectedExpenseId);
      this.selectedExpenseId = null;
    }
  }
  private sanitizeEmail(email: string): string {
    return email.replace(/\./g, '_');
  }

  deleteExpense(expenseId: string) {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userDetails = JSON.parse(loggedInUser);
      const sanitizedEmail = this.sanitizeEmail(userDetails.username);
      const userExpensesRef = this.db.list<Expense>(
        `expenses/${sanitizedEmail}`
      );

      userExpensesRef
        .remove(expenseId)
        .then(() => {
          this.toastr.success('Expense deleted successfully!', 'Success');
          this.loadExpenses(); // Reload the expenses after deletion
        })
        .catch((error) => {
          console.error('Error deleting expense:', error);
          this.toastr.error('Error deleting the expense.', 'Error');
        });
    } else {
      this.toastr.error('User not logged in.', 'Error');
    }
  }
}
