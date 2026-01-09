import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TrendDirection = 'up' | 'down' | 'neutral';

@Component({
  selector: 'app-data-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-card.component.html',
  styleUrls: ['./data-card.component.css']
})
export class DataCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() unit = '';
  @Input() trend: TrendDirection = 'neutral';
  @Input() trendValue = '';
  @Input() icon = '';
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() loading = false;
  @Input() compact = false;

  get trendConfig() {
    const config = {
      'up': { color: 'text-status-success', icon: 'M5 15l7-7 7 7' },
      'down': { color: 'text-status-danger', icon: 'M19 9l-7 7-7-7' },
      'neutral': { color: 'text-gray-500', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
    };
    return config[this.trend];
  }

  get colorClasses() {
    const colors = {
      'primary': 'text-primary-600 bg-primary-50',
      'success': 'text-status-success bg-green-50',
      'warning': 'text-status-warning bg-yellow-50',
      'danger': 'text-status-danger bg-red-50',
      'info': 'text-blue-600 bg-blue-50'
    };
    return colors[this.color];
  }

  get cardClasses() {
    return this.compact ? 'p-4' : 'p-6';
  }
}
