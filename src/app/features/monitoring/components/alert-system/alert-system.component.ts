import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MonitoringService, Alert } from '../../services/monitoring.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-alert-system',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    TimeAgoPipe
  ],
  templateUrl: './alert-system.component.html',
  styleUrls: ['./alert-system.component.css']
})
export class AlertSystemComponent implements OnInit, OnDestroy {
  alerts$: Observable<Alert[]>;
  criticalAlerts$: Observable<Alert[]>;
  warningAlerts$: Observable<Alert[]>;
  infoAlerts$: Observable<Alert[]>;

  displayedColumns: string[] = ['timestamp', 'type', 'title', 'message', 'actions'];

  alertStats = {
    critical: 0,
    warning: 0,
    info: 0,
    total: 0
  };

  private subscriptions: Subscription[] = [];

  constructor(private monitoringService: MonitoringService) {
    this.alerts$ = monitoringService.alerts$;
    this.criticalAlerts$ = monitoringService.getAlertsByType('critical');
    this.warningAlerts$ = monitoringService.getAlertsByType('warning');
    this.infoAlerts$ = monitoringService.getAlertsByType('info');
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.alerts$.subscribe(alerts => {
        this.updateAlertStats(alerts);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private updateAlertStats(alerts: Alert[]): void {
    this.alertStats = {
      critical: alerts.filter(a => a.type === 'critical' && !a.acknowledged).length,
      warning: alerts.filter(a => a.type === 'warning' && !a.acknowledged).length,
      info: alerts.filter(a => a.type === 'info' && !a.acknowledged).length,
      total: alerts.filter(a => !a.acknowledged).length
    };
  }

  acknowledgeAlert(alert: Alert): void {
    this.monitoringService.acknowledgeAlert(alert.id).subscribe();
  }

  acknowledgeAllAlerts(): void {
    this.monitoringService.acknowledgeAllAlerts().subscribe();
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  getAlertColor(type: string): string {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }

  getAlertChipColor(type: string): string {
    switch (type) {
      case 'critical': return 'mat-warn';
      case 'warning': return 'mat-accent';
      case 'info': return 'mat-primary';
      default: return '';
    }
  }
}
