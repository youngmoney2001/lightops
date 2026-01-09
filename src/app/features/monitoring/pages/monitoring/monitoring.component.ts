import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MonitoringService, AnimalPosition, Alert, GatewayStatus } from '../../services/monitoring.service';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab = 'dashboard';
  unreadAlertsCount = 0;
  onlineGateways = 0;
  totalGateways = 0;
  activeSensors = 0;
  totalSensors = 0;
  isLoading = true;

  // Menu items
  menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard', color: 'text-blue-600' },
    { id: 'map', label: 'Carte interactive', icon: 'map', color: 'text-blue-600' },
    { id: 'network', label: 'Réseau LoRaWAN', icon: 'wifi', color: 'text-blue-600' },
    { id: 'alerts', label: 'Système d\'alerte', icon: 'notifications', color: 'text-blue-600', badge: 0 },
    { id: 'analyzer', label: 'Analyse technique', icon: 'analytics', color: 'text-blue-600' },
    { id: 'reports', label: 'Rapports', icon: 'assessment', color: 'text-blue-600' },
    { id: 'admin', label: 'Administration', icon: 'admin_panel_settings', color: 'text-blue-600' }
  ];

  constructor(
    private router: Router,
    private monitoringService: MonitoringService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    // Initialize WebSocket connection
    this.websocketService.connect();

    // Listen for WebSocket messages
    this.websocketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => this.handleWebSocketMessage(message));

    // Load initial data
    this.loadInitialData();

    // Update active tab based on route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.activeTab = this.getActiveTabFromUrl(url);
      });

    // Subscribe to alerts updates
    this.monitoringService.alerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.unreadAlertsCount = alerts.filter(a => !a.acknowledged && a.type === 'critical').length;
        this.updateMenuItemBadge();
      });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    // Load metrics
    this.monitoringService.loadNetworkMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => {
        this.onlineGateways = metrics.onlineGateways;
        this.totalGateways = metrics.totalGateways;
        this.activeSensors = metrics.activeSensors;
        this.totalSensors = metrics.totalSensors;
        this.isLoading = false;
      });

    // Load initial positions
    this.monitoringService.loadAnimalPositions()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Load gateways
    this.monitoringService.loadGatewayStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Load alerts
    this.monitoringService.loadAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'position_update':
        this.handlePositionUpdate(message.data);
        break;
      case 'alert_created':
        this.handleNewAlert(message.data);
        break;
      case 'gateway_status':
        this.handleGatewayStatus(message.data);
        break;
      case 'sensor_status':
        this.handleSensorStatus(message.data);
        break;
    }
  }

  private handlePositionUpdate(position: AnimalPosition): void {
    // Update local positions
    const positions = this.monitoringService['positionsSubject'].value;
    const index = positions.findIndex(p => p.id === position.id);

    if (index >= 0) {
      positions[index] = position;
    } else {
      positions.push(position);
    }

    this.monitoringService['positionsSubject'].next([...positions]);
  }

  private handleNewAlert(alert: Alert): void {
    // Show notification
    this.showAlertNotification(alert);

    // Update alerts
    const alerts = this.monitoringService['alertsSubject'].value;
    this.monitoringService['alertsSubject'].next([alert, ...alerts]);
  }

  private handleGatewayStatus(status: any): void {
    // Update gateway status
    const gateways = this.monitoringService['gatewaysSubject'].value;
    const index = gateways.findIndex(g => g.id === status.id);

    if (index >= 0) {
      gateways[index] = { ...gateways[index], ...status };
      this.monitoringService['gatewaysSubject'].next([...gateways]);
    }
  }

  private handleSensorStatus(status: any): void {
    // Update sensor metrics
    this.activeSensors = status.activeSensors;
    this.totalSensors = status.totalSensors;
  }

  private showAlertNotification(alert: Alert): void {
    const notification = new Notification('Alerte Tracking Animal', {
      body: `${alert.title}: ${alert.message}`,
      icon: '/assets/icons/alert.png',
      tag: `alert-${alert.id}`
    });

    notification.onclick = () => {
      window.focus();
      this.navigateToTab('alerts');
    };
  }

  private updateMenuItemBadge(): void {
    const alertItem = this.menuItems.find(item => item.id === 'alerts');
    if (alertItem) {
      alertItem['badge'] = this.unreadAlertsCount;
    }
  }

  private getActiveTabFromUrl(url: string): string {
    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];

    if (lastSegment === 'monitoring') return 'dashboard';

    const tabMap: { [key: string]: string } = {
      'dashboard': 'dashboard',
      'map': 'map',
      'animal': 'map', // Animal details should show map
      'network': 'network',
      'alerts': 'alerts',
      'analyzer': 'analyzer',
      'reports': 'reports',
      'admin': 'admin'
    };

    return tabMap[lastSegment] || 'dashboard';
  }

  navigateToTab(tabId: string): void {
    this.activeTab = tabId;
    this.router.navigate([`/monitoring/${tabId}`]);
  }

  acknowledgeAllAlerts(): void {
    const unreadAlerts = this.monitoringService['alertsSubject'].value
      .filter(alert => !alert.acknowledged);

    unreadAlerts.forEach(alert => {
      this.monitoringService.acknowledgeAlert(alert.id).subscribe();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.websocketService.disconnect();
  }
}
