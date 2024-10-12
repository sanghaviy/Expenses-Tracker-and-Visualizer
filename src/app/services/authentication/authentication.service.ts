import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  private localStorageKey = 'users';
  userLoggedIn!: Observable<boolean>; // An observable to subscribe in need on other components
  observableLoginChange = new BehaviorSubject<boolean>(false)

  constructor(private http: HttpClient) {
    
    this.userLoggedIn = this.observableLoginChange.asObservable();
  }

  // Sign up user by storing user in local storage
  signUp(user: any): boolean {
    let users = this.getAllUsers();
    const userExists = users.some((u: any) => u.username === user.username);

    if (userExists) {
      return false; // User already exists
    }

    // Push new user into users array and save to local storage
    users.push(user);
    localStorage.setItem(this.localStorageKey, JSON.stringify(users));
    return true; // Successfully registered
  }

  // Login by checking local storage data
  login(credentials: any): boolean {
    let users = this.getAllUsers();
    const user = users.find((u: any) => u.username === credentials.username && u.password === credentials.password);

    if (user) {
      // Save the logged-in user info to local storage (optional)
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      return true; // Login successful
    }

    return false; // Login failed
  }

  // Helper method to get all users from local storage
  private getAllUsers(): any[] {
    const users = localStorage.getItem(this.localStorageKey);
    return users ? JSON.parse(users) : [];
  }
}
