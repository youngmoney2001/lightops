import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoringService, NetworkMetric, LoRaMetric, Alert } from '../../services/monitoring.service';

@Component({
  selector: 'app-metrics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.css']
})
export class MetricsDashboardComponent implements OnInit, OnDestroy {
  networkMetrics$: Observable<NetworkMetric>;
  loraMetrics$: Observable<LoRaMetric>;
  alerts$: Observable<Alert[]>;

  activeAlertsCount = 0;
  criticalAlertsCount = 0;
  unacknowledgedAlertsCount = 0;

  timeRanges = [
    { label: '24h', value: '24h' },
    { label: '7j', value: '7d' },
    { label: '30j', value: '30d' },
    { label: 'Tout', value: 'all' }
  ];

  selectedTimeRange = '24h';
  autoRefresh = true;
  refreshInterval = 30000; // 30 secondes

  private subscriptions: Subscription[] = [];

  // Make Math available in template
  Math = Math;
  now = new Date();

  constructor(private monitoringService: MonitoringService) {
    this.networkMetrics$ = monitoringService.loadNetworkMetrics();
    this.loraMetrics$ = monitoringService.loadLoRaMetrics();
    this.alerts$ = monitoringService.alerts$;
  }

  ngOnInit(): void {
    // Mettre à jour les compteurs d'alertes
    this.subscriptions.push(
      this.alerts$.subscribe(alerts => {
        this.activeAlertsCount = alerts.length;
        this.criticalAlertsCount = alerts.filter(a => a.type === 'critical').length;
        this.unacknowledgedAlertsCount = alerts.filter(a => !a.acknowledged).length;
      })
    );

    // Auto-refresh si activé
    if (this.autoRefresh) {
      this.subscriptions.push(
        interval(this.refreshInterval).subscribe(() => {
          this.refreshMetrics();
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  refreshMetrics(): void {
    this.networkMetrics$ = this.monitoringService.loadNetworkMetrics();
    this.loraMetrics$ = this.monitoringService.loadLoRaMetrics();
    this.alerts$ = this.monitoringService.alerts$;
  }

  acknowledgeAlert(alert: Alert): void {
    this.monitoringService.acknowledgeAlert(alert.id).subscribe();
  }

  acknowledgeAllAlerts(): void {
    this.monitoringService.acknowledgeAllAlerts().subscribe();
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'critical': return '⚠️';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }

  getAlertColor(type: string): string {
    switch (type) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'info': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  calculatePercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }
}
