import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MonitoringService, GatewayStatus } from '../../services/monitoring.service';
import { SignalStrengthPipe } from '../../pipes/signal-strength.pipe';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

interface GatewayCommunication {
  gatewayId: string;
  rssi: number;
  snr: number;
  channel: number;
  crc: boolean;
  latency: number;
  timestamp: string;
}

@Component({
  selector: 'app-network-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    SignalStrengthPipe,
    TimeAgoPipe
  ],
  templateUrl: './network-monitoring.component.html',
  styleUrls: ['./network-monitoring.component.css']
})
export class NetworkMonitoringComponent implements OnInit, OnDestroy {
  gateways$: Observable<GatewayStatus[]>;
  communications$: Observable<GatewayCommunication[]>;

  displayedColumns: string[] = ['gatewayId', 'rssi', 'snr', 'channel', 'crc', 'latency'];

  // RF Analysis data
  rfMetrics = {
    bandwidth: '125 kHz',
    spreadingFactor: 'SF7',
    codeRate: '4/5',
    frequency: '867.5 MHz'
  };

  // Performance metrics
  performanceMetrics = {
    packetLossRate: 1.2,
    successRate: 98.8,
    averageLatency: 1.8,
    uptime: 99.5
  };

  private subscriptions: Subscription[] = [];

  constructor(private monitoringService: MonitoringService) {
    this.gateways$ = monitoringService.gateways$;
    this.communications$ = this.generateMockCommunications();
  }

  ngOnInit(): void {
    // Initialize real-time monitoring
    this.subscriptions.push(
      this.gateways$.subscribe(gateways => {
        console.log('Gateways updated:', gateways);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private generateMockCommunications(): Observable<GatewayCommunication[]> {
    // Mock data for demonstration
    const mockData: GatewayCommunication[] = [
      {
        gatewayId: '0016c001f156266b',
        rssi: -109,
        snr: 5.75,
        channel: 5,
        crc: true,
        latency: 1.43,
        timestamp: new Date().toISOString()
      },
      {
        gatewayId: '0016c001f156266c',
        rssi: -95,
        snr: 8.2,
        channel: 3,
        crc: true,
        latency: 1.1,
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        gatewayId: '0016c001f156266d',
        rssi: -115,
        snr: 3.1,
        channel: 7,
        crc: true,
        latency: 2.8,
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ];

    return this.gateways$.pipe(
      map(() => mockData)
    );
  }

  refreshData(): void {
    // Refresh gateway data
    this.monitoringService.loadGatewayStatus().subscribe();
  }

  getPacketLossColor(rate: number): string {
    if (rate < 2) return 'text-green-600';
    if (rate < 5) return 'text-yellow-600';
    return 'text-red-600';
  }

  getLatencyColor(latency: number): string {
    if (latency < 2) return 'text-green-600';
    if (latency < 5) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Méthode pour accéder à Math dans le template
  get Math(): Math {
    return Math;
  }
}
