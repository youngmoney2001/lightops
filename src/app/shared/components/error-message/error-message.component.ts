import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css']
})
export class ErrorMessageComponent {
  @Input() title = 'Erreur';
  @Input() message = 'Une erreur est survenue.';
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() dismissible = false;
  @Input() icon = true;

  isVisible = true;

  get containerClasses(): string {
    const base = 'rounded-lg border p-4';
    const types = {
      'error': 'bg-red-50 border-red-200',
      'warning': 'bg-yellow-50 border-yellow-200',
      'info': 'bg-blue-50 border-blue-200'
    };
    return `${base} ${types[this.type]}`;
  }

  get textClasses(): string {
    const types = {
      'error': 'text-red-800',
      'warning': 'text-yellow-800',
      'info': 'text-blue-800'
    };
    return types[this.type];
  }

  get iconPath(): string {
    const icons = {
      'error': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      'warning': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z',
      'info': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[this.type];
  }

  dismiss(): void {
    this.isVisible = false;
  }
}
