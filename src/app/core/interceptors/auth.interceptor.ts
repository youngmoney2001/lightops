import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Ne pas ajouter le token pour les requêtes d'authentification
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
      return next.handle(req).pipe(
        map(event => {
          if (event instanceof HttpResponse) {
            return event.body;
          }
          return event;
        })
      );
    }

    const token = this.authService.getToken();

    let authReq = req;
    if (token) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          return event.body;
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/login')) {
          return this.handle401Error(authReq, next);
        }

        // Gestion des autres erreurs HTTP
        this.handleHttpError(error);
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((token: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(token.data.access_token);
            return next.handle(this.addTokenHeader(request, token.data.access_token)).pipe(
              map(event => {
                if (event instanceof HttpResponse) {
                  return event.body;
                }
                return event;
              })
            );
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authService.logout();
            this.router.navigate(['/auth/login']);
            return throwError(() => error);
          })
        );
      } else {
        this.isRefreshing = false;
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        return throwError(() => new Error('No refresh token available'));
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addTokenHeader(request, token)).pipe(
        map(event => {
          if (event instanceof HttpResponse) {
            return event.body;
          }
          return event;
        })
      ))
    );
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Requête invalide';
          break;
        case 403:
          errorMessage = 'Accès non autorisé';
          this.router.navigate(['/unauthorized']);
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 422:
          errorMessage = 'Données invalides';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur';
          break;
        case 503:
          errorMessage = 'Service temporairement indisponible';
          break;
      }
    }

    this.notificationService.showError(errorMessage);
  }
}
