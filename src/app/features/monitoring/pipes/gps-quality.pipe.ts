import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gpsQuality',
  standalone: true
})
export class GpsQualityPipe implements PipeTransform {
  transform(value: string): { label: string; color: string; icon: string } {
    switch (value?.toLowerCase()) {
      case 'excellent':
        return { label: 'Excellent', color: 'text-green-600', icon: 'gps_fixed' };
      case 'good':
        return { label: 'Bon', color: 'text-blue-600', icon: 'gps_fixed' };
      case 'moderate':
        return { label: 'Modéré', color: 'text-yellow-600', icon: 'gps_not_fixed' };
      case 'poor':
        return { label: 'Faible', color: 'text-orange-600', icon: 'gps_not_fixed' };
      case 'very_poor':
        return { label: 'Très faible', color: 'text-red-600', icon: 'gps_off' };
      case 'gateway_estimated':
        return { label: 'Gateway estimé', color: 'text-purple-600', icon: 'location_on' };
      case 'historical_estimated':
        return { label: 'Historique estimé', color: 'text-gray-600', icon: 'history' };
      default:
        return { label: 'Inconnu', color: 'text-gray-500', icon: 'help' };
    }
  }
}
