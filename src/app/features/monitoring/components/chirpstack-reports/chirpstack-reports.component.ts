import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MonitoringService, ChirpStackTenant, ChirpStackApplication, DeviceReport, GatewayReport } from '../../services/monitoring.service';

interface ReportFilters {
  tenantId?: string;
  applicationId?: string;
  startDate?: Date;
  endDate?: Date;
  reportType: 'devices' | 'gateways' | 'performance' | 'usage';
}

interface PerformanceMetrics {
  totalUplinkMessages: number;
  totalDownlinkMessages: number;
  averageSNR: number;
  averageRSSI: number;
  successRate: number;
  errorRate: number;
}

@Component({
  selector: 'app-chirpstack-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './chirpstack-reports.component.html',
  styleUrl: './chirpstack-reports.component.css'
})
export class ChirpstackReportsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // Data observables
  tenants$!: Observable<ChirpStackTenant[]>;
  applications$!: Observable<ChirpStackApplication[]>;
  deviceReports$!: Observable<DeviceReport[]>;
  gatewayReports$!: Observable<GatewayReport[]>;

  // Filters
  filters: ReportFilters = {
    reportType: 'devices'
  };

  // Loading states
  loading = false;

  // Performance metrics
  performanceMetrics: PerformanceMetrics = {
    totalUplinkMessages: 0,
    totalDownlinkMessages: 0,
    averageSNR: 0,
    averageRSSI: 0,
    successRate: 0,
    errorRate: 0
  };

  // Table columns
  deviceColumns = ['deviceName', 'devEUI', 'lastSeen', 'uplinkCount', 'downlinkCount', 'status'];
  gatewayColumns = ['gatewayId', 'name', 'location', 'lastSeen', 'rxPackets', 'txPackets', 'status'];

  constructor(private monitoringService: MonitoringService) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFilteredData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadInitialData(): void {
    this.tenants$ = this.monitoringService.getChirpStackTenants();
    this.applications$ = this.monitoringService.getChirpStackApplications();
  }

  private setupFilteredData(): void {
    // Combine filters with data sources
    const filteredData$ = combineLatest([
      this.tenants$.pipe(startWith([])),
      this.applications$.pipe(startWith([]))
    ]).pipe(
      map(([tenants, applications]) => ({ tenants, applications }))
    );

    this.subscriptions.push(
      filteredData$.subscribe(() => {
        this.loadReports();
      })
    );
  }

  onTenantChange(tenantId: string): void {
    this.filters.tenantId = tenantId;
    this.filters.applicationId = undefined; // Reset application when tenant changes
    this.loadApplicationsForTenant(tenantId);
    this.loadReports();
  }

  onApplicationChange(applicationId: string): void {
    this.filters.applicationId = applicationId;
    this.loadReports();
  }

  onReportTypeChange(reportType: ReportFilters['reportType']): void {
    this.filters.reportType = reportType;
    this.loadReports();
  }

  onDateRangeChange(): void {
    this.loadReports();
  }

  private loadApplicationsForTenant(tenantId: string): void {
    this.applications$ = this.monitoringService.getChirpStackApplications().pipe(
      map(apps => apps.filter(app => app.tenantId === tenantId))
    );
  }

  private loadReports(): void {
    this.loading = true;

    switch (this.filters.reportType) {
      case 'devices':
        this.loadDeviceReports();
        break;
      case 'gateways':
        this.loadGatewayReports();
        break;
      case 'performance':
        this.loadPerformanceReports();
        break;
      case 'usage':
        this.loadUsageReports();
        break;
    }
  }

  private loadDeviceReports(): void {
    this.deviceReports$ = this.monitoringService.getDeviceReports(
      this.filters.tenantId,
      this.filters.applicationId,
      this.filters.startDate,
      this.filters.endDate
    );
    this.loading = false;
  }

  private loadGatewayReports(): void {
    this.gatewayReports$ = this.monitoringService.getGatewayReports(
      this.filters.tenantId,
      this.filters.startDate,
      this.filters.endDate
    );
    this.loading = false;
  }

  private loadPerformanceReports(): void {
    const performance$ = this.monitoringService.getPerformanceMetrics(
      this.filters.tenantId,
      this.filters.applicationId,
      this.filters.startDate,
      this.filters.endDate
    );

    this.subscriptions.push(
      performance$.subscribe(metrics => {
        this.performanceMetrics = metrics;
        this.loading = false;
      })
    );
  }

  private loadUsageReports(): void {
    // Usage reports combine device and gateway data
    this.deviceReports$ = this.monitoringService.getDeviceReports(
      this.filters.tenantId,
      this.filters.applicationId,
      this.filters.startDate,
      this.filters.endDate
    );
    this.gatewayReports$ = this.monitoringService.getGatewayReports(
      this.filters.tenantId,
      this.filters.startDate,
      this.filters.endDate
    );
    this.loading = false;
  }

  exportReport(): void {
    // Implementation for exporting reports
    const reportData = {
      filters: this.filters,
      timestamp: new Date(),
      type: this.filters.reportType
    };

    // Create and download CSV/JSON file
    this.downloadReport(reportData);
  }

  private downloadReport(data: any): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chirpstack-report-${this.filters.reportType}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  refreshReports(): void {
    this.loadReports();
  }
}
