import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'batteryStatus',
  standalone: true
})
export class BatteryStatusPipe implements PipeTransform {
  transform(value: string | number): { label: string; color: string; icon: string; percentage: number } {
    let percentage = 0;
    let status = 'unknown';

    if (typeof value === 'number') {
      percentage = value;
      if (percentage >= 80) status = 'normal';
      else if (percentage >= 20) status = 'low';
      else status = 'critical';
    } else {
      status = value?.toLowerCase() || 'unknown';
      // Map string status to percentage
      switch (status) {
        case 'normal': percentage = 85; break;
        case 'low': percentage = 35; break;
        case 'critical': percentage = 10; break;
        default: percentage = 0;
      }
    }

    switch (status) {
      case 'normal':
        return { label: 'Normal', color: 'text-green-600', icon: 'battery_full', percentage };
      case 'low':
        return { label: 'Faible', color: 'text-yellow-600', icon: 'battery_4_bar', percentage };
      case 'critical':
        return { label: 'Critique', color: 'text-red-600', icon: 'battery_1_bar', percentage };
      default:
        return { label: 'Inconnu', color: 'text-gray-500', icon: 'battery_unknown', percentage: 0 };
    }
  }
}
