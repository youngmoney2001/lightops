import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MonitoringService, AnimalPosition } from '../../services/monitoring.service';

@Component({
  selector: 'app-animal-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './animal-details.component.html',
  styleUrls: ['./animal-details.component.css']
})
export class AnimalDetailsComponent implements OnInit, OnDestroy {
  @Input() animalId?: number;

  animal$: Observable<AnimalPosition | null>;
  trajectory$: Observable<any>;
  qualityStats$: Observable<any>;
  recentPositions$: Observable<AnimalPosition[]>;

  selectedTab: 'overview' | 'positions' | 'metrics' | 'payload' = 'overview';
  timeRange = '24h';

  private subscriptions: Subscription[] = [];

  constructor(private monitoringService: MonitoringService) {
    this.animal$ = monitoringService.selectedAnimal$;
    this.trajectory$ = new Observable();
    this.qualityStats$ = new Observable();
    this.recentPositions$ = new Observable();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.animal$.pipe(
        tap(animal => {
          if (animal) {
            this.loadAnimalData(animal.id);
          }
        })
      ).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadAnimalData(animalId: number): void {
    this.trajectory$ = this.monitoringService.getSensorTrajectory(animalId);
    this.qualityStats$ = this.monitoringService.getGpsQualityStats(animalId);

    // Charger les positions récentes
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);

    this.recentPositions$ = this.monitoringService.getSensorRecords(
      animalId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ).pipe(
      map((response: any) => response.data || [])
    );
  }

  decodePayload(payload: string): any {
    try {
      // Simple payload decoder pour LoRaWAN
      if (!payload) return {};

      const bytes = this.hexToBytes(payload);
      const decoded: any = {};

      // Header byte
      const header = bytes[0];
      decoded.header = header.toString(16).padStart(2, '0');

      // Battery voltage (2 bytes)
      if (bytes.length >= 3) {
        const batteryVoltage = (bytes[1] << 8) | bytes[2];
        decoded.batteryVoltage = (batteryVoltage / 1000).toFixed(2) + 'V';
        decoded.batteryPercentage = Math.min(100, Math.max(0, ((batteryVoltage - 3000) / 12))).toFixed(0);
      }

      // Temperature (2 bytes, optional)
      if (bytes.length >= 5) {
        const temperature = (bytes[3] << 8) | bytes[4];
        decoded.temperature = (temperature / 100).toFixed(1) + '°C';
      }

      // Status byte
      if (bytes.length >= 6) {
        const status = bytes[5];
        decoded.manDown = !!(status & 0x01);
        decoded.motion = !!(status & 0x02);
        decoded.positionSuccess = !!(status & 0x04);
      }

      return decoded;
    } catch (error) {
      return { error: 'Impossible de décoder le payload' };
    }
  }

  private hexToBytes(hex: string): number[] {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  formatPositionTime(time: string): string {
    return new Date(time).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getQualityColor(quality: string): string {
    const colors: { [key: string]: string } = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'moderate': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-orange-100 text-orange-800',
      'very_poor': 'bg-red-100 text-red-800',
      'gateway_estimated': 'bg-purple-100 text-purple-800',
      'historical_estimated': 'bg-gray-100 text-gray-800'
    };
    return colors[quality] || 'bg-gray-100 text-gray-800';
  }

  getBatteryColor(level: number): string {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  }

  getTemperatureColor(temp: number): string {
    if (temp < 15) return 'text-blue-600';
    if (temp > 40) return 'text-red-600';
    return 'text-green-600';
  }

  exportData(format: 'json' | 'csv'): void {
    // Implémentation de l'export
    console.log(`Exporting in ${format} format`);
  }
}
