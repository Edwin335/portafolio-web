import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = false;

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    const success = await this.auth.login(this.username, this.password);
    if (success) {
      this.router.navigate(['/']); // Redirige a home o dashboard
    } else {
      this.error = true;
    }
  }
}
