import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, interval, combineLatest } from 'rxjs';
import { map, tap, switchMap, catchError, startWith } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

export interface AnimalPosition {
  id: number;
  sensorId: number;
  deviceName: string;
  devEui: string;
  animalId?: number;
  animalName: string;
  animalPhoto?: string;
  animalSpecies?: string;
  animalBreed?: string;
  animalHealth?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  pdop?: number;
  hdop?: number;
  vdop?: number;
  positionTime: string;
  receivedAt: string;
  batteryLevel: number;
  batteryVoltage?: number;
  batteryStatus: 'normal' | 'low' | 'critical';
  temperature?: number;
  movementStatus: 'active' | 'idle' | 'no_motion';
  manDownStatus: boolean;
  gpsQuality: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor' | 'gateway_estimated' | 'historical_estimated';
  qualityColor: string;
  positioningMethod: 'GPS' | 'Gateway' | 'Historical' | string;
  positioningMethodLabel: string;
  accuracyDescription: string;
  applicationName: string;
  deviceProfileName: string;
  dataRate?: string;
  adrEnabled: boolean;
  rssi?: number;
  snr?: number;
  gatewayId?: string;
  fCnt?: number;
  fPort?: number;
  payload?: string;
  rawPayload?: any;
  gatewaysData?: any[];
  gatewaysCount: number;
  siteId?: number;
  siteName?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayStatus {
  id: number;
  gatewayId: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  status: 'online' | 'offline' | 'maintenance';
  statusColor: string;
  lastSeen: string;
  lastSeenAt: Date;
  isOnline: boolean;
  connectedSensors: number;
  rssiAvg: number;
  snrAvg: number;
  uptime: number;
  firmwareVersion?: string;
  description?: string;
  metadata?: any;
}

export interface NetworkMetric {
  activeSensors: number;
  totalSensors: number;
  onlineGateways: number;
  totalGateways: number;
  avgGpsQuality: number;
  avgLatency: number;
  packetLossRate: number;
  positionAccuracy: number;
  systemAvailability: number;
  dataFreshness: number;
  recentActivity: any[];
  connectivity: {
    total_connections: number;
    active_connections: number;
    failed_connections: number;
  };
  data_transfer: {
    total_bytes_total: number;
    avg_bytes_per_hour: number;
  };
  latency: {
    avg_latency_ms: number;
    max_latency_ms: number;
  };
}

export interface LoRaMetric {
  operationMode: {
    periodic: number;
    normal: number;
    alert: number;
  };
  batteryStatus: {
    normal: number;
    low: number;
    critical: number;
  };
  dataRateDistribution: { [key: string]: number };
  positionSuccessRate: number;
  avgRssi: number;
  avgSnr: number;
  totalLinks: number;
  excellentLinks: number;
  goodLinks: number;
  poorLinks: number;
  criticalLinks: number;
}

export interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source: {
    type: 'animal' | 'gateway' | 'sensor' | 'system';
    id: number;
    name: string;
  };
  metadata?: any;
}

export interface CoverageArea {
  id: number;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  signal_strength: number;
}

export interface SensorPerformance {
  id: number;
  name: string;
  performance: {
    uptime: number;
    avg_response_time: number;
    data_frequency: number;
    battery_level: number;
    last_seen: string;
  };
  stats: {
    total_records: number;
    success_rate: number;
    error_rate: number;
  };
}

export interface SiteInfo {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  gmt: string;
  color?: string;
  sensorsCount: number;
  animalsCount: number;
}

export interface FilterOptions {
  gpsQuality?: string[];
  application?: string[];
  deviceProfile?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  siteId?: number;
  batteryStatus?: string[];
  movementStatus?: string[];
}

export interface ChirpStackTenant {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  deviceCount?: number;
}

export interface ChirpStackApplication {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  tenantName?: string;
  deviceCount?: number;
}

export interface DeviceReport {
  deviceName: string;
  devEUI: string;
  lastSeen: Date;
  uplinkCount: number;
  downlinkCount: number;
  status: 'active' | 'inactive';
}

export interface GatewayReport {
  gatewayId: string;
  name: string;
  location?: string;
  lastSeen: Date;
  rxPackets: number;
  txPackets: number;
  status: 'online' | 'offline';
}

export interface PerformanceMetrics {
  totalUplinkMessages: number;
  totalDownlinkMessages: number;
  averageSNR: number;
  averageRSSI: number;
  successRate: number;
  errorRate: number;
}

export interface NetworkServer {
  id: string;
  name: string;
  server: string;
  region: string;
  status: 'online' | 'offline';
}

export interface GatewayProfile {
  id: string;
  name: string;
  description?: string;
  channels: number;
  extraChannels: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private positionsSubject = new BehaviorSubject<AnimalPosition[]>([]);
  private gatewaysSubject = new BehaviorSubject<GatewayStatus[]>([]);
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private sitesSubject = new BehaviorSubject<SiteInfo[]>([]);
  private filterSubject = new BehaviorSubject<FilterOptions>({});
  private selectedAnimalSubject = new BehaviorSubject<AnimalPosition | null>(null);
  private selectedSiteSubject = new BehaviorSubject<SiteInfo | null>(null);

  positions$ = this.positionsSubject.asObservable();
  gateways$ = this.gatewaysSubject.asObservable();
  alerts$ = this.alertsSubject.asObservable();
  sites$ = this.sitesSubject.asObservable();
  filter$ = this.filterSubject.asObservable();
  selectedAnimal$ = this.selectedAnimalSubject.asObservable();
  selectedSite$ = this.selectedSiteSubject.asObservable();

  filteredPositions$ = combineLatest([
    this.positions$,
    this.filter$
  ]).pipe(
    map(([positions, filters]) => this.applyFilters(positions, filters))
  );

  constructor(private apiService: ApiService) {
    this.startRealTimeUpdates();
  }

  private startRealTimeUpdates(): void {
    // Polling toutes les 30 secondes pour les positions
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.loadAnimalPositions()),
      catchError(error => {
        console.error('Error in position polling:', error);
        return of([]);
      })
    ).subscribe();

    // Polling toutes les minutes pour les gateways
    interval(60000).pipe(
      startWith(0),
      switchMap(() => this.loadGatewayStatus()),
      catchError(error => {
        console.error('Error in gateway polling:', error);
        return of([]);
      })
    ).subscribe();

    // Polling toutes les 15 secondes pour les alertes
    interval(15000).pipe(
      startWith(0),
      switchMap(() => this.loadAlerts()),
      catchError(error => {
        console.error('Error in alert polling:', error);
        return of([]);
      })
    ).subscribe();

    // Charger les sites au démarrage
    interval(300000).pipe(
      startWith(0),
      switchMap(() => this.loadSites()),
      catchError(error => {
        console.error('Error in site polling:', error);
        return of([]);
      })
    ).subscribe();
  }

  loadAnimalPositions(): Observable<AnimalPosition[]> {
    return this.apiService.get('sensor-record/latest-positions').pipe(
      map(response => {
        const positions = this.mapApiToPositions((response.data as any)?.positions || []);
        this.positionsSubject.next(positions);
        return positions;
      }),
      catchError(error => {
        console.error('Error loading animal positions:', error);
        return of([]);
      })
    );
  }

  loadGatewayStatus(): Observable<GatewayStatus[]> {
    return this.apiService.get('gateways').pipe(
      map(response => {
        const gateways = this.mapApiToGateways((response.data as any)?.gateways || []);
        this.gatewaysSubject.next(gateways);
        return gateways;
      }),
      catchError(error => {
        console.error('Error loading gateway status:', error);
        return of([]);
      })
    );
  }

  loadSites(): Observable<SiteInfo[]> {
    return this.apiService.get('site/get-list-sites-for-user').pipe(
      map(response => {
        const sites = this.mapApiToSites((response as any).data?.sites || []);
        this.sitesSubject.next(sites);
        return sites;
      }),
      catchError(error => {
        console.error('Error loading sites:', error);
        return of([]);
      })
    );
  }

  loadNetworkMetrics(): Observable<NetworkMetric> {
    return this.apiService.get('monitoring/dashboard').pipe(
      map(response => this.mapApiToNetworkMetrics(response.data || {})),
      catchError(() => of(this.getDefaultMetrics()))
    );
  }

  loadLoRaMetrics(): Observable<LoRaMetric> {
    return this.apiService.get('monitoring/link-analysis').pipe(
      map(response => this.mapApiToLoRaMetrics(response.data || {})),
      catchError(() => of(this.getDefaultLoRaMetrics()))
    );
  }

  loadAlerts(): Observable<Alert[]> {
    return this.apiService.get('monitoring/alerts').pipe(
      map(response => {
        const alerts = this.mapApiToAlerts((response as any).data?.alerts || []);
        this.alertsSubject.next(alerts);
        return alerts;
      }),
      catchError(error => {
        console.error('Error loading alerts:', error);
        return of([]);
      })
    );
  }

  loadCoverageMap(): Observable<any> {
    return this.apiService.get('monitoring/coverage-map');
  }

  loadSensorPerformance(): Observable<SensorPerformance[]> {
    return this.apiService.get('monitoring/sensors-performance').pipe(
      map(response => (response as any).data?.sensors || [])
    );
  }

  loadGatewayReceptions(gatewayId: number): Observable<any> {
    return this.apiService.get(`gateways/${gatewayId}/recent-receptions`);
  }

  loadGatewayStats(gatewayId: number): Observable<any> {
    return this.apiService.get(`gateways/${gatewayId}/stats`);
  }

  loadDeadGateways(): Observable<GatewayStatus[]> {
    return this.apiService.get('gateways/dead-gateways').pipe(
      map(response => this.mapApiToGateways((response.data as any)?.gateways || []))
    );
  }

  getPositionsWithQuality(sensorId: number): Observable<any> {
    return this.apiService.get(`sensor-record/${sensorId}/positions-with-quality`);
  }

  getSensorTrajectory(sensorId: number): Observable<any> {
    return this.apiService.get(`sensor-record/${sensorId}/trajectory`);
  }

  getGpsQualityStats(sensorId: number): Observable<any> {
    return this.apiService.get(`sensor-record/${sensorId}/gps-quality-stats`);
  }

  getProblematicPositions(): Observable<AnimalPosition[]> {
    return this.apiService.get('sensor-record/problematic-positions').pipe(
      map(response => this.mapApiToPositions((response.data as any)?.positions || []))
    );
  }

  getAnimalsForSite(siteId: number): Observable<any> {
    return this.apiService.post('animal/get-animal-for-template', { site_id: siteId });
  }

  getSensorRecords(sensorId: number, startDate?: string, endDate?: string): Observable<any> {
    return this.apiService.post('sensor-record/find-by-sensor-id-and-period', {
      sensor_id: sensorId,
      start_date: startDate,
      end_date: endDate
    });
  }

  getAlertsByType(type: string): Observable<Alert[]> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(alert => alert.type === type))
    );
  }

  acknowledgeAlert(alertId: number): Observable<any> {
    return this.apiService.post('monitoring/alerts/acknowledge', { alert_id: alertId });
  }

  acknowledgeAllAlerts(): Observable<any> {
    return this.apiService.post('monitoring/alerts/acknowledge-all', {});
  }

  setFilters(filters: FilterOptions): void {
    this.filterSubject.next(filters);
  }

  exportPositions(format: 'json' | 'csv' | 'geojson'): Observable<Blob> {
    return this.apiService.downloadFile(
      `sensor-record/export?format=${format}`,
      { positions: this.positionsSubject.value }
    );
  }

  private mapApiToPositions(data: any[]): AnimalPosition[] {
    return data.map(item => ({
      id: item.id,
      sensorId: item.sensor_id,
      deviceName: item.device_name || `SENSOR_${item.sensor_id}`,
      devEui: item.dev_eui || `eui_${item.sensor_id}`,
      animalId: item.animal_id,
      animalName: item.animal_name || `ANIMAL_${item.animal_id || item.sensor_id}`,
      animalPhoto: item.animal_photo,
      animalSpecies: item.animal_species,
      animalBreed: item.animal_breed,
      animalHealth: item.animal_health,
      latitude: parseFloat(item.latitude) || 0,
      longitude: parseFloat(item.longitude) || 0,
      altitude: parseFloat(item.altitude),
      accuracy: parseFloat(item.accuracy_meters),
      pdop: parseFloat(item.pdop),
      hdop: parseFloat(item.hdop),
      vdop: parseFloat(item.vdop),
      positionTime: item.position_time || item.created_at,
      receivedAt: item.received_at || item.created_at,
      batteryLevel: parseFloat(item.battery) || 100,
      batteryVoltage: this.calculateVoltage(parseFloat(item.battery)),
      batteryStatus: this.getBatteryStatus(parseFloat(item.battery)),
      temperature: parseFloat(item.temperature),
      movementStatus: this.getMovementStatus(item.movement_status),
      manDownStatus: item.man_down_status === 'idle' || false,
      gpsQuality: item.gps_quality || 'moderate',
      qualityColor: item.quality_color || '#6B7280',
      positioningMethod: item.positioning_method || 'GPS',
      positioningMethodLabel: item.positioning_method_label || 'Méthode GPS',
      accuracyDescription: item.accuracy_description || 'Inconnue',
      applicationName: item.application_name || 'TRACKING ANIMAL',
      deviceProfileName: item.device_profile_name || 'LW001',
      dataRate: item.data_rate,
      adrEnabled: item.adr_enabled || false,
      rssi: parseFloat(item.rssi),
      snr: parseFloat(item.snr),
      gatewayId: item.gateway_id,
      fCnt: item.frame_counter,
      fPort: item.f_port,
      payload: item.payload,
      rawPayload: item.raw_payload,
      gatewaysData: item.gateways_data,
      gatewaysCount: item.gateways_count || 0,
      siteId: item.site_id,
      siteName: item.site_name,
      metadata: item.metadata,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  private mapApiToGateways(data: any[]): GatewayStatus[] {
    return data.map(item => ({
      id: item.id,
      gatewayId: item.gateway_id || `GW_${item.id}`,
      name: item.name || `Gateway ${item.id}`,
      latitude: parseFloat(item.latitude) || 0,
      longitude: parseFloat(item.longitude) || 0,
      altitude: parseFloat(item.altitude) || 0,
      status: this.getGatewayStatus(item.last_seen_at),
      statusColor: item.status_color || '#EF4444',
      lastSeen: item.last_seen_at || item.updated_at,
      lastSeenAt: new Date(item.last_seen_at || item.updated_at),
      isOnline: item.is_online || false,
      connectedSensors: item.connected_sensors || 0,
      rssiAvg: item.rssi_avg || -100,
      snrAvg: item.snr_avg || 0,
      uptime: item.uptime || 100,
      firmwareVersion: item.firmware_version,
      description: item.description,
      metadata: item.metadata
    }));
  }

  private mapApiToSites(data: any[]): SiteInfo[] {
    return data.map(item => ({
      id: item.id,
      name: item.name || `Site ${item.id}`,
      description: item.description || '',
      address: item.address || '',
      latitude: parseFloat(item.latitude) || 0,
      longitude: parseFloat(item.longitude) || 0,
      radius: parseFloat(item.radius) || 1000,
      gmt: item.gmt || '+01:00',
      color: item.color || '#3B82F6',
      sensorsCount: item.sensors_count || 0,
      animalsCount: item.animals_count || 0
    }));
  }

  private mapApiToNetworkMetrics(data: any): NetworkMetric {
    return {
      activeSensors: data.summary?.active_sensors || 0,
      totalSensors: data.summary?.total_sensors || 0,
      onlineGateways: data.summary?.active_gateways || 0,
      totalGateways: data.summary?.total_gateways || 0,
      avgGpsQuality: data.performance?.gps_quality_avg || 0,
      avgLatency: data.performance?.avg_response_time || 0,
      packetLossRate: data.performance?.packet_loss_rate || 0,
      positionAccuracy: data.performance?.position_accuracy || 0,
      systemAvailability: data.performance?.availability_rate || 0,
      dataFreshness: data.performance?.data_freshness || 0,
      recentActivity: data.recent_activity || [],
      connectivity: data.connectivity || {
        total_connections: 0,
        active_connections: 0,
        failed_connections: 0
      },
      data_transfer: data.data_transfer || {
        total_bytes_total: 0,
        avg_bytes_per_hour: 0
      },
      latency: data.latency || {
        avg_latency_ms: 0,
        max_latency_ms: 0
      }
    };
  }

  private mapApiToLoRaMetrics(data: any): LoRaMetric {
    return {
      operationMode: {
        periodic: data.operation_mode?.periodic || 85,
        normal: data.operation_mode?.normal || 12,
        alert: data.operation_mode?.alert || 3
      },
      batteryStatus: {
        normal: data.battery_status?.normal || 92,
        low: data.battery_status?.low || 6,
        critical: data.battery_status?.critical || 2
      },
      dataRateDistribution: data.data_rate_distribution || { DR5: 60, DR4: 25, DR3: 15 },
      positionSuccessRate: data.position_success_rate || 95,
      avgRssi: data.avg_rssi || -85,
      avgSnr: data.avg_snr || 8.5,
      totalLinks: data.summary?.total_links || 150,
      excellentLinks: data.summary?.excellent_links || 120,
      goodLinks: data.summary?.good_links || 20,
      poorLinks: data.summary?.poor_links || 8,
      criticalLinks: data.summary?.critical_links || 2
    };
  }

  private mapApiToAlerts(data: any[]): Alert[] {
    return data.map(item => ({
      id: item.id,
      type: item.type || 'info',
      title: item.title || 'Alerte',
      message: item.message || '',
      timestamp: item.timestamp || item.created_at,
      acknowledged: item.acknowledged || false,
      source: {
        type: item.source?.type || 'system',
        id: item.source?.id || 0,
        name: item.source?.name || 'Système'
      },
      metadata: item.metadata
    }));
  }

  private applyFilters(positions: AnimalPosition[], filters: FilterOptions): AnimalPosition[] {
    let filtered = [...positions];

    if (filters.gpsQuality?.length) {
      filtered = filtered.filter(pos => filters.gpsQuality!.includes(pos.gpsQuality));
    }

    if (filters.application?.length) {
      filtered = filtered.filter(pos => filters.application!.includes(pos.applicationName));
    }

    if (filters.deviceProfile?.length) {
      filtered = filtered.filter(pos => filters.deviceProfile!.includes(pos.deviceProfileName));
    }

    if (filters.batteryStatus?.length) {
      filtered = filtered.filter(pos => filters.batteryStatus!.includes(pos.batteryStatus));
    }

    if (filters.movementStatus?.length) {
      filtered = filtered.filter(pos => filters.movementStatus!.includes(pos.movementStatus));
    }

    if (filters.siteId) {
      filtered = filtered.filter(pos => pos.siteId === filters.siteId);
    }

    if (filters.timeRange) {
      filtered = filtered.filter(pos => {
        const posTime = new Date(pos.positionTime);
        return posTime >= filters.timeRange!.start && posTime <= filters.timeRange!.end;
      });
    }

    return filtered;
  }

  private getBatteryStatus(level: number): 'normal' | 'low' | 'critical' {
    if (level > 20) return 'normal';
    if (level > 10) return 'low';
    return 'critical';
  }

  private getMovementStatus(status: string): 'active' | 'idle' | 'no_motion' {
    if (status === 'active') return 'active';
    if (status === 'idle') return 'idle';
    return 'no_motion';
  }

  private getGatewayStatus(lastSeen: string): 'online' | 'offline' | 'maintenance' {
    if (!lastSeen) return 'offline';

    const lastSeenDate = new Date(lastSeen);
    const minutesSinceLastSeen = (Date.now() - lastSeenDate.getTime()) / (1000 * 60);

    return minutesSinceLastSeen < 5 ? 'online' : 'offline';
  }

  private calculateVoltage(batteryLevel: number): number {
    // Convert battery percentage to voltage (3.0V - 4.2V typical)
    return 3.0 + (batteryLevel / 100) * 1.2;
  }

  private getDefaultMetrics(): NetworkMetric {
    return {
      activeSensors: 35,
      totalSensors: 40,
      onlineGateways: 5,
      totalGateways: 6,
      avgGpsQuality: 78,
      avgLatency: 1.8,
      packetLossRate: 1.5,
      positionAccuracy: 22,
      systemAvailability: 99.7,
      dataFreshness: 14,
      recentActivity: [],
      connectivity: {
        total_connections: 1000,
        active_connections: 950,
        failed_connections: 50
      },
      data_transfer: {
        total_bytes_total: 52428800,
        avg_bytes_per_hour: 1024000
      },
      latency: {
        avg_latency_ms: 25.5,
        max_latency_ms: 150
      }
    };
  }

  private getDefaultLoRaMetrics(): LoRaMetric {
    return {
      operationMode: { periodic: 85, normal: 12, alert: 3 },
      batteryStatus: { normal: 92, low: 6, critical: 2 },
      dataRateDistribution: { DR5: 60, DR4: 25, DR3: 15 },
      positionSuccessRate: 95,
      avgRssi: -85,
      avgSnr: 8.5,
      totalLinks: 150,
      excellentLinks: 120,
      goodLinks: 20,
      poorLinks: 8,
      criticalLinks: 2
    };
  }

  // ChirpStack Management Methods
  getChirpStackTenants(): Observable<ChirpStackTenant[]> {
    return this.apiService.get('/chirpstack/tenants').pipe(
      map((response: any) => response.data || []),
      catchError(() => of(this.getMockTenants()))
    );
  }

  getChirpStackApplications(): Observable<ChirpStackApplication[]> {
    return this.apiService.get('/chirpstack/applications').pipe(
      map((response: any) => response.data || []),
      catchError(() => of(this.getMockApplications()))
    );
  }

  getDeviceReports(tenantId?: string, applicationId?: string, startDate?: Date, endDate?: Date): Observable<DeviceReport[]> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (applicationId) params.applicationId = applicationId;
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    return this.apiService.get('/chirpstack/reports/devices', params).pipe(
      map((response: any) => response.data || []),
      catchError(() => of(this.getMockDeviceReports()))
    );
  }

  getGatewayReports(tenantId?: string, startDate?: Date, endDate?: Date): Observable<GatewayReport[]> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    return this.apiService.get('/chirpstack/reports/gateways', params).pipe(
      map((response: any) => response.data || []),
      catchError(() => of(this.getMockGatewayReports()))
    );
  }

  getPerformanceMetrics(tenantId?: string, applicationId?: string, startDate?: Date, endDate?: Date): Observable<PerformanceMetrics> {
    const params: any = {};
    if (tenantId) params.tenantId = tenantId;
    if (applicationId) params.applicationId = applicationId;
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    return this.apiService.get('/chirpstack/reports/performance', params).pipe(
      map((response: any) => response.data || this.getMockPerformanceMetrics()),
      catchError(() => of(this.getMockPerformanceMetrics()))
    );
  }

  getNetworkServers(): Observable<NetworkServer[]> {
    return this.apiService.get('/chirpstack/network-servers').pipe(
      map((response: any) => response.data || []),
      catchError(() => of(this.getMockNetworkServers()))
    );
  }

  getGatewayProfiles(): Observable<GatewayProfile[]> {
    return this.apiService.get('/chirpstack/gateway-profiles').pipe(
      map((response: any) => response.data || []),
      catchError(() => of(this.getMockGatewayProfiles()))
    );
  }

  getNetworkConfig(): Observable<any> {
    return this.apiService.get('/chirpstack/config').pipe(
      map(response => response.data),
      catchError(() => of(this.getMockNetworkConfig()))
    );
  }

  saveNetworkConfig(config: any): Observable<any> {
    return this.apiService.post('/chirpstack/config', config);
  }

  testChirpStackConnection(config: any): Observable<{success: boolean}> {
    return this.apiService.post('/chirpstack/test-connection', config).pipe(
      map(() => ({ success: true })),
      catchError(() => of({ success: false }))
    );
  }

  deleteTenant(tenantId: string): Observable<any> {
    return this.apiService.delete(`/chirpstack/tenants/${tenantId}`);
  }

  deleteApplication(applicationId: string): Observable<any> {
    return this.apiService.delete(`/chirpstack/applications/${applicationId}`);
  }

  registerGateway(gatewayConfig: any): Observable<any> {
    return this.apiService.post('/chirpstack/gateways', gatewayConfig);
  }

  deleteGateway(gatewayId: string): Observable<any> {
    return this.apiService.delete(`/chirpstack/gateways/${gatewayId}`);
  }

  deleteNetworkServer(serverId: string): Observable<any> {
    return this.apiService.delete(`/chirpstack/network-servers/${serverId}`);
  }

  // Mock data methods
  private getMockTenants(): ChirpStackTenant[] {
    return [
      {
        id: '1',
        name: 'Tenant Principal',
        description: 'Tenant principal pour le suivi animal',
        createdAt: new Date('2023-01-01'),
        deviceCount: 150
      },
      {
        id: '2',
        name: 'Tenant Test',
        description: 'Tenant de test et développement',
        createdAt: new Date('2023-06-01'),
        deviceCount: 25
      }
    ];
  }

  private getMockApplications(): ChirpStackApplication[] {
    return [
      {
        id: '1',
        name: 'Application Bovins',
        description: 'Suivi des bovins',
        tenantId: '1',
        tenantName: 'Tenant Principal',
        deviceCount: 75
      },
      {
        id: '2',
        name: 'Application Ovins',
        description: 'Suivi des ovins',
        tenantId: '1',
        tenantName: 'Tenant Principal',
        deviceCount: 50
      },
      {
        id: '3',
        name: 'Application Test',
        description: 'Application de test',
        tenantId: '2',
        tenantName: 'Tenant Test',
        deviceCount: 10
      }
    ];
  }

  private getMockDeviceReports(): DeviceReport[] {
    return [
      {
        deviceName: 'Bovin-001',
        devEUI: '0016C001F0000001',
        lastSeen: new Date(),
        uplinkCount: 1450,
        downlinkCount: 23,
        status: 'active'
      },
      {
        deviceName: 'Bovin-002',
        devEUI: '0016C001F0000002',
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
        uplinkCount: 1380,
        downlinkCount: 18,
        status: 'active'
      }
    ];
  }

  private getMockGatewayReports(): GatewayReport[] {
    return [
      {
        gatewayId: '0016C001F0000000',
        name: 'Gateway-Site-1',
        location: '45.7640, 4.8357',
        lastSeen: new Date(),
        rxPackets: 12500,
        txPackets: 2340,
        status: 'online'
      },
      {
        gatewayId: '0016C001F0000001',
        name: 'Gateway-Site-2',
        location: '45.7500, 4.8500',
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        rxPackets: 11800,
        txPackets: 2100,
        status: 'online'
      }
    ];
  }

  private getMockPerformanceMetrics(): PerformanceMetrics {
    return {
      totalUplinkMessages: 25000,
      totalDownlinkMessages: 1250,
      averageSNR: 8.5,
      averageRSSI: -85,
      successRate: 96.5,
      errorRate: 3.5
    };
  }

  private getMockNetworkServers(): NetworkServer[] {
    return [
      {
        id: '1',
        name: 'ChirpStack Network Server',
        server: 'localhost:8000',
        region: 'EU868',
        status: 'online'
      }
    ];
  }

  private getMockGatewayProfiles(): GatewayProfile[] {
    return [
      {
        id: '1',
        name: 'Kerlink Gateway Profile',
        description: 'Profile pour passerelles Kerlink',
        channels: 8,
        extraChannels: []
      }
    ];
  }

  private getMockNetworkConfig(): any {
    return {
      serverUrl: 'https://chirpstack.example.com',
      apiToken: '',
      region: 'EU868',
      frequencyPlan: 'EU_863_870_TTN'
    };
  }
}
