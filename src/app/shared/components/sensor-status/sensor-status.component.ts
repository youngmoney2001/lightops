import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SensorStatus = 'online' | 'offline' | 'warning' | 'error' | 'maintenance';

@Component({
  selector: 'app-sensor-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sensor-status.component.html',
  styleUrls: ['./sensor-status.component.css']
})
export class SensorStatusComponent {
  @Input() status: SensorStatus = 'online';
  @Input() label = '';
  @Input() showLabel = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showTooltip = false;
  @Input() lastUpdate: Date | null = null;
  @Input() sensorId: string | null = null;
  @Input() showLegend = false;
  @Input() statusTypes: { type: SensorStatus; label: string; color: string }[] = [];

  statusConfig: { [key: string]: { color: string; label: string; icon?: string } } = {
    'online': {
      color: 'bg-status-success',
      label: 'En ligne'
    },
    'offline': {
      color: 'bg-gray-400',
      label: 'Hors ligne'
    },
    'warning': {
      color: 'bg-status-warning',
      label: 'Avertissement'
    },
    'error': {
      color: 'bg-status-danger',
      label: 'Erreur'
    },
    'maintenance': {
      color: 'bg-blue-400',
      label: 'Maintenance'
    }
  };

  get config() {
    return this.statusConfig[this.status] || this.statusConfig['offline'];
  }

  get sizeClasses() {
    return {
      'sm': 'h-2 w-2',
      'md': 'h-3 w-3',
      'lg': 'h-4 w-4'
    }[this.size];
  }

  get pulseAnimation() {
    return this.status === 'online' ? 'animate-pulse-slow' : '';
  }
}
