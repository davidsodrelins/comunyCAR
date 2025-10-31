import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'comunyCAR';
  isAuthenticated = false;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.isAuthenticated$.subscribe(
      (isAuth) => (this.isAuthenticated = isAuth)
    );
    this.authService.currentUser$.subscribe(
      (user) => (this.currentUser = user)
    );
  }

  ngOnInit(): void {
    // Verificar autenticação ao iniciar
    this.authService.getMe().subscribe({
      error: () => {
        // Não autenticado
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
