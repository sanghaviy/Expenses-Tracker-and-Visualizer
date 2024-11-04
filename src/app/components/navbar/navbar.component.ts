import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  isMenuToggled = false;
  loginHeader: boolean = false;
  userLoggedIn = false;
  @Output() menuToggled = new EventEmitter<boolean>();
  @Output() logoutUser = new EventEmitter<any>();
  userName: string = '';

  constructor(private router: Router, private translate: TranslateService) {
    this.userName = localStorage.getItem('username') || '';
    translate.setDefaultLang('en');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }
  
  logout(){
    this.logoutUser.emit(false);
    this.router.navigate(['/login'])
  }

  toggleMenu() {
    this.isMenuToggled = !this.isMenuToggled;
    this.menuToggled.emit(this.isMenuToggled);
  }
  
}
