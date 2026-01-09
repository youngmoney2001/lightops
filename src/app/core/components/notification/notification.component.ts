import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  icon?: string;
  data?: any;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(100%)'
        }),
        animate('300ms ease-out')
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({
          opacity: 0,
          transform: 'translateX(100%)'
        }))
      ])
    ]),
    trigger('fadeInOut', [
      state('in', style({
        opacity: 1
      })),
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate('200ms ease-in')
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({
          opacity: 0
        }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() notification!: Notification;
  @Output() close = new EventEmitter<number>();

  private timeoutId: any;
  progress = 100;
  private progressIntervalId: any;

  // Icônes par type de notification
  iconMap = {
    success: {
      icon: 'check-circle',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200'
    },
    error: {
      icon: 'x-circle',
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
      borderColor: 'border-danger-200'
    },
    warning: {
      icon: 'alert-triangle',
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200'
    },
    info: {
      icon: 'info',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    }
  };

  ngOnInit(): void {
    if (this.notification.duration && this.notification.duration > 0) {
      this.startAutoClose();
      this.startProgressBar();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  get iconConfig() {
    return this.iconMap[this.notification.type] || this.iconMap.info;
  }

  get iconClasses(): string {
    return `w-5 h-5 ${this.iconConfig.color}`;
  }

  get containerClasses(): string {
    const config = this.iconConfig;
    return `relative overflow-hidden rounded-lg border ${config.borderColor} ${config.bgColor} shadow-lg max-w-sm w-full`;
  }

  closeNotification(): void {
    this.close.emit(this.notification.id);
  }

  onActionClick(): void {
    if (this.notification.action?.callback) {
      this.notification.action.callback();
    }
    this.closeNotification();
  }

  onMouseEnter(): void {
    this.clearTimers();
  }

  onMouseLeave(): void {
    if (this.notification.duration && this.notification.duration > 0) {
      this.startAutoClose();
      this.startProgressBar();
    }
  }

  private startAutoClose(): void {
    if (this.notification.duration) {
      this.timeoutId = setTimeout(() => {
        this.closeNotification();
      }, this.notification.duration);
    }
  }

  private startProgressBar(): void {
    if (this.notification.duration) {
      const interval = 50; // ms
      const steps = this.notification.duration / interval;
      const decrement = 100 / steps;

      this.progressIntervalId = setInterval(() => {
        this.progress -= decrement;
        if (this.progress <= 0) {
          clearInterval(this.progressIntervalId);
        }
      }, interval);
    }
  }

  private clearTimers(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
    }
  }
}
