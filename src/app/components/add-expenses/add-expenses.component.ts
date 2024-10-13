import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-expenses',
  templateUrl: './add-expenses.component.html',
  styleUrls: ['./add-expenses.component.scss']
})
export class AddExpensesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  expense = {
    name: '',
    totalAmount: null,
    taxAmount: null,
    category: '',
    date: '',
    paymentType: '',
    comments: ''
  };

  monthlyBudget: number = 0;
  currentBudget: number = 120.00; // Example initial budget

  onSubmit() {
    // Handle form submission logic here
    console.log('Expense submitted:', this.expense);
  }

}
