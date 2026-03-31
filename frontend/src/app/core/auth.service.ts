import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

export interface LoginCredentials {
  matricula: string;
  senha: string;
}

export interface AuthUser {
  id: string;
  nome: string;
  matricula: string;
  perfil: string;       // ex: "Gestor de Carteira"
  token: string;
  grupos: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private currentUser$ = new BehaviorSubject<AuthUser | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);

  /**
   * Realiza o login do usuário.
   * POST /api/auth/login → Retorna AuthUser com JWT.
   * Fallback para mock enquanto o endpoint não estiver disponível.
   */
  login(credentials: LoginCredentials): Observable<AuthUser> {
    this.loading$.next(true);
    // Simulação de chamada real. Ajustar URL conforme o backend.
    return this.http.post<AuthUser>('http://localhost:8000/api/auth/login', credentials).pipe(
      catchError(() => {
        // Mock de fallback para desenvolvimento
        if (credentials.senha.length >= 6) {
          return of(this.getMockUser(credentials.matricula));
        }
        return throwError(() => new Error('Credenciais inválidas. Use uma senha com pelo menos 6 caracteres para o mock.'));
      }),
      tap(user => {
        this.currentUser$.next(user);
        localStorage.setItem('auth_token', user.token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }),
      finalize(() => this.loading$.next(false))
    );
  }

  /**
   * Finaliza a sessão do usuário.
   */
  logout(): void {
    this.currentUser$.next(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * Verifica se o usuário está autenticado baseado na presença do token.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Retorna o token JWT salvo no localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Retorna o Observable do usuário atual.
   */
  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Restaura a sessão do usuário ao recarregar a página.
   * Chamado no AppComponent.
   */
  restoreSession(): void {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.currentUser$.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  private getMockUser(matricula: string): AuthUser {
    return {
      id: '001',
      nome: 'Carlos Silva',
      matricula,
      perfil: 'Gestor de Carteira',
      token: 'mock-jwt-token-' + Date.now(),
      grupos: ['varejo-sp', 'credito-imob', 'agro-premium']
    };
  }

  isLoading(): Observable<boolean> { 
    return this.loading$.asObservable(); 
  }
}
