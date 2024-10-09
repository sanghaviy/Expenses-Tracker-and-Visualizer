import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
//import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  
  
  passwordType = 'Password';
  formvalid: boolean = false;
  loginForm:FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', Validators.required]
  })

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthenticationService, private toastr: ToastrService) {

  }

  ngOnInit(): void {
  }

  login() {
    if (this.loginForm.invalid) {
      this.formvalid = true;
    }
    else{
      console.log(this.loginForm.value)
      this.authService.login(this.loginForm.value).subscribe({
        next:(response:any) => {
          this.toastr.success(response.message);
          localStorage.setItem('username', this.loginForm.value.username);
          localStorage.setItem('userID', response.userID);
          this.loginForm.reset();
          this.authService.onLoginUser(true);
          this.router.navigate(['/dashboard']);
        },
        error:(err:any) => {
          if(err?.error.message)
          {
            this.toastr.error(err?.error.message);
          }
          else {
          this.toastr.error("Unavailable SQL Server");
          }
        }
      });
      
    }
  }

  fbLogin(fbAuthSuccess: boolean){ // Dummy login for test
    this.authService.onLoginUser(fbAuthSuccess);
    this.router.navigate(['/dashboard']);
  }
}
