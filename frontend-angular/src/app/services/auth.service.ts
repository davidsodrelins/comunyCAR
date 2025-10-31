import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

/**
 * Serviço de Autenticação
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(private apiService: ApiService) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getUserFromStorage());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Obter usuário atual
   */
  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Obter status de autenticação
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Fazer login
   */
  login(): void {
    // Redirecionar para página de login do OAuth
    const loginUrl = `${window.location.origin}/login`;
    window.location.href = loginUrl;
  }

  /**
   * Fazer logout
   */
  logout(): Observable<any> {
    return this.apiService.logout().pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      })
    );
  }

  /**
   * Obter informações do usuário autenticado
   */
  getMe(): Observable<any> {
    return this.apiService.getMe().pipe(
      tap((user) => {
        if (user) {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  /**
   * Obter usuário do localStorage
   */
  private getUserFromStorage(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Atualizar usuário atual
   */
  updateCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }
}
