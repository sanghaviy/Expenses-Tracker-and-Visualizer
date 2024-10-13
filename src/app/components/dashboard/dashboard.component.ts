import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userDetails: any;

  constructor(private router: Router) {
   }

  ngOnInit(): void {
    const storedUserDetails = localStorage.getItem('loggedInUser');

    if (storedUserDetails) {
      this.userDetails = JSON.parse(storedUserDetails);
    }
  }

  AddExpenses() {
    this.router.navigate(['/addexpense']);
  }
}
