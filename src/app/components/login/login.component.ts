import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  formvalid: boolean = false;
  passwordType: string = 'password';
  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

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
      this.loginForm.patchValue({
        username: storedUser
      });
    }
  }

  login() {
    if (this.loginForm.invalid) {
      this.formvalid = true;
      return;
    }

    const loginSuccess = this.authService.login(this.loginForm.value);

    if (loginSuccess) {
      localStorage.setItem('username', this.loginForm.value.username);
      this.toastr.success('Login successful!');
      this.router.navigate(['/dashboard']);
    } else {
      this.toastr.error('Invalid credentials');
    }
  }

  clearStoredLogin() {
    localStorage.removeItem('username');
  }
}
