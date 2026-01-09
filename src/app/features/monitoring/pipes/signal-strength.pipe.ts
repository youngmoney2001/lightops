import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'signalStrength',
  standalone: true
})
export class SignalStrengthPipe implements PipeTransform {
  transform(rssi: number, snr?: number): { label: string; color: string; icon: string; strength: number } {
    if (rssi === undefined || rssi === null) {
      return { label: 'N/A', color: 'text-gray-500', icon: 'signal_wifi_off', strength: 0 };
    }

    let strength = 0;
    let label = '';
    let color = '';
    let icon = '';

    // RSSI strength calculation
    if (rssi >= -50) {
      strength = 4;
      label = 'Excellent';
      color = 'text-green-600';
      icon = 'signal_wifi_4_bar';
    } else if (rssi >= -70) {
      strength = 3;
      label = 'Bon';
      color = 'text-blue-600';
      icon = 'signal_wifi_3_bar';
    } else if (rssi >= -85) {
      strength = 2;
      label = 'Modéré';
      color = 'text-yellow-600';
      icon = 'signal_wifi_2_bar';
    } else if (rssi >= -100) {
      strength = 1;
      label = 'Faible';
      color = 'text-orange-600';
      icon = 'signal_wifi_1_bar';
    } else {
      strength = 0;
      label = 'Très faible';
      color = 'text-red-600';
      icon = 'signal_wifi_0_bar';
    }

    // Consider SNR if provided
    if (snr !== undefined && snr !== null) {
      if (snr < -10) {
        strength = Math.max(0, strength - 1);
        label += ' (SNR faible)';
      } else if (snr > 10) {
        label += ' (SNR excellent)';
      }
    }

    return { label, color, icon, strength };
  }
}
