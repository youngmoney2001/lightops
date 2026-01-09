import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent, Notification } from '../notification/notification.component';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  templateUrl: './notification-container.component.html',
  styleUrls: ['./notification-container.component.css']
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  maxNotifications = 5;

  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.getNotifications()
      .subscribe((notifications: Notification[]) => {
        this.notifications = notifications.slice(-this.maxNotifications);
      });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  onCloseNotification(id: number): void {
    this.notificationService.removeNotification(id);
  }

  get containerClasses(): string {
    const classes: any = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    };

    return `fixed z-50 ${classes[this.position]} space-y-3`;
  }

  get containerWidth(): string {
    return this.position.includes('top') || this.position.includes('bottom')
      ? 'w-full max-w-sm'
      : 'w-full max-w-xs';
  }
}
