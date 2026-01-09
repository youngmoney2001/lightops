import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  //styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: 'primary' | 'white' | 'gray' = 'primary';
  @Input() message = '';
  @Input() showMessage = false;
  @Input() fullPage = false;

  get sizeClasses(): string {
    const sizes = {
      'sm': 'w-4 h-4',
      'md': 'w-8 h-8',
      'lg': 'w-12 h-12',
      'xl': 'w-16 h-16'
    };
    return sizes[this.size];
  }

  get colorClasses(): string {
    const colors = {
      'primary': 'text-primary-600',
      'white': 'text-white',
      'gray': 'text-gray-600'
    };
    return colors[this.color];
  }

  get containerClasses(): string {
    return this.fullPage
      ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90'
      : 'flex flex-col items-center justify-center';
  }
}
