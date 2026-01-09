import { Injectable, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
  data?: any;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private lastId = 0;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  constructor(private router: Router) {}

  // Méthodes principales
  showSuccess(message: string, title?: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title: title || 'Succès',
      message,
      duration,
      closable: true
    });
  }

  showError(message: string, title?: string, duration: number = 10000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title: title || 'Erreur',
      message,
      duration,
      closable: true
    });
  }

  showInfo(message: string, title?: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title: title || 'Information',
      message,
      duration,
      closable: true
    });
  }

  showWarning(message: string, title?: string, duration: number = 7000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title: title || 'Avertissement',
      message,
      duration,
      closable: true
    });
  }

  // Pour les notifications système (depuis l'API)
  addSystemNotification(notification: Notification): void {
    this.addNotification({
      ...notification,
      id: this.generateId(),
      closable: true
    });
  }

  // Getters
  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
    this.notificationsSubject.next([...this.notifications]);
  }

  clearAll(): void {
    this.notifications = [];
    this.notificationsSubject.next([...this.notifications]);
  }

  // Méthodes privées
  private addNotification(notification: Notification): void {
    this.notifications.push(notification);
    this.notificationsSubject.next([...this.notifications]);

    // Auto-remove si durée définie
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  private generateId(): number {
    return ++this.lastId;
  }

  // Pour afficher les erreurs HTTP de manière spécifique
  showHttpError(error: any): void {
    let message = 'Une erreur est survenue';

    if (error.error && error.error.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    }

    if (error.status === 401) {
      this.showError('Session expirée. Veuillez vous reconnecter.', 'Authentification requise');
      this.router.navigate(['/auth/login']);
    } else if (error.status === 403) {
      this.showError('Vous n\'avez pas les permissions nécessaires', 'Accès refusé');
    } else if (error.status === 404) {
      this.showError('La ressource demandée n\'existe pas', 'Non trouvé');
    } else if (error.status === 422) {
      // Erreurs de validation
      const validationErrors = error.error.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        message = Array.isArray(firstError) ? firstError[0] : String(firstError);
      }
      this.showError(message, 'Erreur de validation');
    } else if (error.status >= 500) {
      this.showError('Une erreur serveur est survenue. Veuillez réessayer plus tard.', 'Erreur serveur');
    } else {
      this.showError(message, 'Erreur');
    }
  }
}
