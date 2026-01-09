import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.css']
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'text' | 'circle' | 'rectangle' | 'table' = 'card';
  @Input() rows = 3;
  @Input() width = '100%';
  @Input() height = 'auto';
  @Input() borderRadius = '0.5rem';
  @Input() className = '';

  get skeletonClasses() {
    const baseClasses = 'animate-pulse bg-gray-200';

    const typeClasses = {
      'card': 'rounded-xl h-40',
      'text': 'rounded h-4',
      'circle': 'rounded-full',
      'rectangle': 'rounded',
      'table': 'rounded h-10'
    };

    return `${baseClasses} ${typeClasses[this.type]} ${this.className}`;
  }

  getRows(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
