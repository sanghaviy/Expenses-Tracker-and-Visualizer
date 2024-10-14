import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as Papa from 'papaparse';
import { AngularFireDatabase } from '@angular/fire/compat/database'; // Import AngularFireDatabase
import { ToastrService } from 'ngx-toastr'; // Import Toastr for notifications

interface Expense {
  name: string;
  totalAmount: number;
  taxAmount: number;
  category: string;
  date: string; // Keep as string for CSV parsing
  paymentType: string;
  comments: string;
}

@Component({
  selector: 'app-import-expenses',
  templateUrl: './import-expenses.component.html',
  styleUrls: ['./import-expenses.component.scss']
})
export class ImportExpensesComponent {
  importedExpenses: Expense[] = []; // Store parsed expenses
  csvFileName: string = ''; // Store file name
  errorMessage: string = ''; // Store error message, if any

  constructor(private router: Router, private db: AngularFireDatabase, private toastr: ToastrService) { } // Inject AngularFireDatabase and ToastrService

  // Called when a file is selected
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.csvFileName = file.name;
      this.parseCSVFile(file);
    }
  }

  // Function to parse the CSV file
  parseCSVFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = reader.result as string;

      Papa.parse<Expense>(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (result: Papa.ParseResult<Expense>) => {
          if (result.errors.length === 0) {
            this.mapToExpenses(result.data);
          } else {
            this.errorMessage = 'Error parsing CSV file.';
          }
        },
        error: (error: any) => {
          console.error('Error reading file:', error);
          this.errorMessage = 'Error reading file. Please check the format.';
        }
      });
    };
    reader.readAsText(file);
  }

  // Function to map CSV data to expenses
  mapToExpenses(parsedData: Expense[]) {
    this.importedExpenses = parsedData.map(expense => {
      return {
        name: expense.name,
        totalAmount: +expense.totalAmount, // Ensure number format
        taxAmount: +expense.taxAmount, // Ensure number format
        category: expense.category || 'Unassigned', // Default category
        date: this.convertDate(expense.date), // Convert date from dd-mm-yyyy to Date
        paymentType: expense.paymentType || 'Debit', // Default payment type
        comments: expense.comments || 'No comments' // Default comments
      };
    });
  }

  // Function to convert date from dd-mm-yyyy format to yyyy-mm-dd
  convertDate(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      // Return date in yyyy-mm-dd format for standardization
      return `${year}-${month}-${day}`;
    }
    return dateStr; // Return original if format is incorrect
  }

  // Function to save imported expenses to Firebase
  // Function to save imported expenses to Firebase
  saveImportedExpenses() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userDetails = JSON.parse(loggedInUser);
      const sanitizedEmail = this.sanitizeEmail(userDetails.username); // Sanitize username for Firebase path
      const userExpensesRef = this.db.list<Expense>(`expenses/${sanitizedEmail}`);

      // Push each imported expense individually to Firebase
      this.importedExpenses.forEach(expense => {
        userExpensesRef.push(expense) // Push each expense separately
          .then(() => {
            this.toastr.success('Imported expenses saved to Firebase successfully!', 'Success');
          })
          .catch(error => {
            console.error('Error saving expenses to Firebase:', error);
            this.errorMessage = 'Error saving expenses to Firebase.';
          });
      });

      // Navigate back to the view expenses page after pushing all expenses
      this.router.navigate(['/view-expenses']);
    } else {
      this.errorMessage = 'User not logged in.';
    }
  }

  // Sanitize email to use in Firebase path
  private sanitizeEmail(email: string): string {
    return email.replace(/\./g, '_'); // Replace dots with underscores
  }
}
