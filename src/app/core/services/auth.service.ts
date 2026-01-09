import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from '../../core/services/api.service';
import { StorageService } from '../../core/services/storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  sites?: any[];
  avatar?: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  company?: string;
  position?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  company?: string;
  position?: string;
  terms_accepted: boolean;
}

export interface ResetPasswordData {
  email: string;
}

export interface NewPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private readonly APP_NAME = 'LightOps';

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.storageService.getItem('auth_token');
    const refreshToken = this.storageService.getItem('refresh_token');
    const user = this.storageService.getItem('current_user');

    if (token && user) {
      this.tokenSubject.next(token);
      this.refreshTokenSubject.next(refreshToken);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  // Connexion
  login(credentials: LoginCredentials): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.handleAuthentication(response.data!);
        this.notificationService.showSuccess(
          `Bienvenue sur ${this.APP_NAME}!`,
          'Connexion réussie'
        );
      }),
      catchError(error => {
        const message = error.status === 401
          ? 'Email ou mot de passe incorrect'
          : 'Une erreur est survenue lors de la connexion';
        this.notificationService.showError(message);
        return throwError(() => error);
      })
    );
  }

  // Inscription
  register(data: RegisterData): Observable<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>('auth/register', data).pipe(
      tap(response => {
        this.handleAuthentication(response.data!);
        this.notificationService.showSuccess(
          `Votre compte ${this.APP_NAME} a été créé avec succès`,
          'Inscription réussie'
        );
      }),
      catchError(error => {
        let message = 'Erreur lors de la création du compte';
        if (error.error?.errors?.email) {
          message = 'Cet email est déjà utilisé';
        }
        this.notificationService.showError(message);
        return throwError(() => error);
      })
    );
  }

  // Rafraîchir le token
  refreshToken(refreshToken: string): Observable<ApiResponse<any>> {
    return this.apiService.post<any>('auth/refresh', { refresh_token: refreshToken }).pipe(
      tap(response => {
        this.setToken(response.data.token);
        if (response.data.refresh_token) {
          this.setRefreshToken(response.data.refresh_token);
        }
      })
    );
  }

  // Déconnexion
  logout(): void {
    this.apiService.get('auth/logout').subscribe({
      next: () => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        this.notificationService.showInfo(
          `À bientôt sur ${this.APP_NAME}`,
          'Déconnexion réussie'
        );
      },
      error: () => {
        // Même en cas d'erreur, on déconnecte localement
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // Mot de passe oublié
  forgotPassword(email: string): Observable<any> {
    return this.apiService.post('auth/init-password-by-email', { email }).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'Un email de réinitialisation vous a été envoyé',
          'Demande envoyée'
        );
      }),
      catchError(error => {
        this.notificationService.showError(
          'Impossible d\'envoyer l\'email de réinitialisation',
          'Erreur'
        );
        return throwError(() => error);
      })
    );
  }

  // Réinitialiser le mot de passe
  resetPassword(data: NewPasswordData): Observable<any> {
    return this.apiService.post('auth/reset-password', data).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'Votre mot de passe a été réinitialisé avec succès',
          'Mot de passe modifié'
        );
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        this.notificationService.showError(
          'Impossible de réinitialiser le mot de passe',
          'Erreur'
        );
        return throwError(() => error);
      })
    );
  }

  // Mettre à jour le mot de passe (utilisateur connecté)
  changePassword(data: { old_password: string; new_password: string }): Observable<any> {
    return this.apiService.post('auth/change-password-by-user-id', data).pipe(
      tap(() => {
        this.notificationService.showSuccess(
          'Votre mot de passe a été modifié avec succès',
          'Mot de passe mis à jour'
        );
      }),
      catchError(error => {
        this.notificationService.showError(
          'Impossible de modifier le mot de passe',
          'Erreur'
        );
        return throwError(() => error);
      })
    );
  }

  // Méthodes privées
  private handleAuthentication(response: AuthResponse): void {
    this.setToken(response.token);
    if (response.refresh_token) {
      this.setRefreshToken(response.refresh_token);
    }

    this.currentUserSubject.next(response.user);
    this.storageService.setItem('current_user', JSON.stringify(response.user));
    this.redirectAfterLogin();
  }

  private setToken(token: string): void {
    this.tokenSubject.next(token);
    this.storageService.setItem('auth_token', token);
  }

  private setRefreshToken(refreshToken: string): void {
    this.refreshTokenSubject.next(refreshToken);
    this.storageService.setItem('refresh_token', refreshToken);
  }

  private clearAuthData(): void {
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.currentUserSubject.next(null);

    this.storageService.removeItem('auth_token');
    this.storageService.removeItem('refresh_token');
    this.storageService.removeItem('current_user');
  }

  private redirectAfterLogin(): void {
    const user = this.getCurrentUser();

    if (user?.roles?.includes('admin')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (user?.roles?.includes('manager')) {
      this.router.navigate(['/manager/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Getters
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getRefreshToken(): string | null {
    return this.refreshTokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  getAppName(): string {
    return this.APP_NAME;
  }
}
