import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  formvalid: boolean = false;

  // Define the form group for user registration
  signUpForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    //repeatPassword: ['', Validators.required],
  });
  passwordType: string = 'password';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checkForStoredLogin();
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  checkForStoredLogin() {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      this.signUpForm.patchValue({
        username: storedUser
      });
    }
  }
  register() {
    if (this.signUpForm.invalid) {
      this.formvalid = true;
      return;
    }

    const registrationSuccess = this.authService.signUp(this.signUpForm.value);

    if (registrationSuccess) {
      this.toastr.success('Registration successful!');
      this.signUpForm.reset();
      this.router.navigate(['/login']); // Navigate to login page after successful sign-up
    } else {
      this.toastr.error('Username already exists');
    }
  }

  clearStoredLogin() {
    localStorage.removeItem('username');
  }
}

