import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs';

export type LoadingType = 'spinner' | 'dots' | 'bars' | 'pulse';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  host: {
    '[class]': 'getHostClasses()'
  }
})
export class LoadingComponent implements OnInit, OnDestroy {
  @Input() type: LoadingType = 'spinner';
  @Input() size: LoadingSize = 'md';
  @Input() message: string = '';
  @Input() fullscreen: boolean = false;
  @Input() backdrop: boolean = true;
  @Input() color: string = 'primary';
  @Input() showGlobalLoading: boolean = false;

  isLoading: boolean = false;
  globalMessage: string = '';

  private loadingSubscription!: Subscription;
  private messageSubscription!: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    if (this.showGlobalLoading) {
      this.loadingSubscription = this.loadingService.loading$
        .subscribe(loading => {
          this.isLoading = loading;
        });

      this.messageSubscription = this.loadingService.message$
        .subscribe(message => {
          this.globalMessage = message;
        });
    }
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  getHostClasses(): string {
    const classes = [];

    if (this.fullscreen) {
      classes.push('fixed inset-0 z-50');
    } else {
      classes.push('relative');
    }

    if (this.fullscreen && this.backdrop) {
      classes.push('bg-gray-500/75');
    }

    return classes.join(' ');
  }

  getSpinnerClasses(): string {
    const sizeClasses = {
      sm: 'w-5 h-5',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    };

    const colorClasses = {
      primary: 'text-primary-600',
      white: 'text-white',
      gray: 'text-gray-600'
    };

    return `animate-spin ${sizeClasses[this.size]} ${colorClasses[this.color as keyof typeof colorClasses] || colorClasses.primary}`;
  }

  getContainerClasses(): string {
    if (this.fullscreen) {
      return 'flex flex-col items-center justify-center h-full';
    }
    return 'flex flex-col items-center justify-center';
  }

  getMessage(): string {
    return this.globalMessage || this.message;
  }

  // Pourcentage aléatoire pour la simulation de progression
  getRandomProgress(): number {
    return Math.floor(Math.random() * 30) + 40; // 40-70%
  }
}
