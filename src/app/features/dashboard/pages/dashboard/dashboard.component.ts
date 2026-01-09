import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import * as L from 'leaflet';
import 'leaflet.markercluster';

// Services
import { DashboardService, Site, MetricCard, LiveEvent, Activity } from '../../services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';

// Composants
import { RoleBadgeComponent } from '../../../../shared/components/role-badge/role-badge.component';
import { SensorStatusComponent } from '../../../../shared/components/sensor-status/sensor-status.component';
import { DataCardComponent } from '../../../../shared/components/data-card/data-card.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PermissionGateComponent } from '../../../../shared/components/permission-gate/permission-gate.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RoleBadgeComponent,
    SensorStatusComponent,
    DataCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    PermissionGateComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  // État du chargement
  isLoading = true;

  // Données
  sites: Site[] = [];
  metrics: MetricCard[] = [];
  liveEvents: LiveEvent[] = [];
  activities: Activity[] = [];

  // Filtres
  searchQuery = '';
  statusFilter: string[] = ['active'];
  regionFilter = '';
  typeFilter = '';

  // Carte
  private map!: L.Map;
  private markersLayer!: L.LayerGroup;
  private clusters!: L.MarkerClusterGroup;

  // Monitoring temps réel
  isLiveMonitoringPaused = false;
  autoScrollEnabled = true;

  // Pagination activités
  currentPage = 1;
  itemsPerPage = 10;
  activityTypes = ['Tous', 'Création', 'Modification', 'Suppression', 'Examen', 'Configuration', 'Export'];
  selectedActivityType = 'Tous';

  // Abonnements
  private subscriptions: Subscription[] = [];
  private mapInitialized = false;

  // User info
  currentUser: any = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();

    // Simuler les mises à jour en temps réel
    const updateSubscription = interval(30000).subscribe(() => {
      if (!this.isLiveMonitoringPaused) {
        this.loadLiveEvents();
      }
    });

    this.subscriptions.push(updateSubscription);
  }

  ngAfterViewInit(): void {
    if (!this.mapInitialized) {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  private loadData(): void {
    this.isLoading = true;

    // Charger les données en parallèle
    const metricsSub = this.dashboardService.getGlobalMetrics()
      .subscribe(metrics => {
        this.metrics = metrics;
        this.checkLoadingComplete();
      });

    const sitesSub = this.dashboardService.getSites()
      .subscribe(sites => {
        this.sites = sites;
        if (this.map) {
          this.updateMapMarkers();
        }
        this.checkLoadingComplete();
      });

    const eventsSub = this.dashboardService.getLiveEvents()
      .subscribe(events => {
        this.liveEvents = events;
        this.checkLoadingComplete();
      });

    const activitiesSub = this.dashboardService.getRecentActivities()
      .subscribe(activities => {
        this.activities = activities;
        this.checkLoadingComplete();
      });

    this.subscriptions.push(metricsSub, sitesSub, eventsSub, activitiesSub);
  }

  private checkLoadingComplete(): void {
    if (this.metrics.length > 0 &&
        this.sites.length > 0 &&
        this.liveEvents.length > 0 &&
        this.activities.length > 0) {
      this.isLoading = false;
    }
  }

  private initializeMap(): void {
    if (!this.mapContainer || this.mapInitialized) return;

    // Initialiser la carte
    this.map = L.map(this.mapContainer.nativeElement).setView([46.603354, 1.888334], 6);

    // Ajouter le fond de carte
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(this.map);

    // Initialiser les couches
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.clusters = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: this.createClusterIcon.bind(this)
    }).addTo(this.map);

    // Ajouter les marqueurs
    this.updateMapMarkers();

    // Ajouter les contrôles
    this.addMapControls();

    this.mapInitialized = true;
  }

  private updateMapMarkers(): void {
    if (!this.map || !this.markersLayer || !this.clusters) return;

    // Nettoyer les anciens marqueurs
    this.markersLayer.clearLayers();
    this.clusters.clearLayers();

    // Filtrer les sites selon les filtres actuels
    const filteredSites = this.filterSites();

    // Ajouter les marqueurs
    filteredSites.forEach(site => {
      const marker = L.marker([site.coordinates.lat, site.coordinates.lng], {
        icon: this.createSiteIcon(site)
      });

      // Popup d'information
      const popupContent = this.createPopupContent(site);
      marker.bindPopup(popupContent);

      // Ajouter au cluster
      this.clusters.addLayer(marker);
    });

    // Ajuster la vue si nécessaire
    if (filteredSites.length > 0) {
      const bounds = L.latLngBounds(filteredSites.map(s => [s.coordinates.lat, s.coordinates.lng]));
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  private createSiteIcon(site: Site): L.DivIcon {
    const statusColors = {
      'active': '#10B981',
      'inactive': '#6B7280',
      'maintenance': '#F59E0B'
    };

    const color = statusColors[site.status] || '#6B7280';

    return L.divIcon({
      html: `
        <div class="relative">
          <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg"
               style="background-color: ${color}">
          </div>
          <div class="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 text-xs
                      flex items-center justify-center font-semibold shadow-sm">
            ${site.animalsCount}
          </div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  private createClusterIcon(cluster: any): L.DivIcon {
    const childCount = cluster.getChildCount();
    const size = childCount < 10 ? 'small' : childCount < 100 ? 'medium' : 'large';

    const sizes = {
      small: { diameter: 40, fontSize: 12 },
      medium: { diameter: 50, fontSize: 14 },
      large: { diameter: 60, fontSize: 16 }
    };

    const { diameter, fontSize } = sizes[size];

    return L.divIcon({
      html: `<div class="cluster-marker"
                    style="width: ${diameter}px; height: ${diameter}px;
                           font-size: ${fontSize}px;">
               <span>${childCount}</span>
             </div>`,
      className: 'custom-cluster',
      iconSize: [diameter, diameter],
      iconAnchor: [diameter / 2, diameter / 2]
    });
  }

  private createPopupContent(site: Site): string {
    return `
      <div class="p-3 min-w-[250px]">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900 text-base">${site.name}</h3>
            <p class="text-sm text-gray-600">${site.location}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${site.status === 'active' ? 'bg-green-100 text-green-800' :
                        site.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}">
            ${site.status === 'active' ? 'Actif' :
              site.status === 'maintenance' ? 'Maintenance' : 'Inactif'}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="text-center p-2 bg-blue-50 rounded-lg">
            <div class="text-lg font-bold text-blue-600">${site.animalsCount}</div>
            <div class="text-xs text-gray-600">Animaux</div>
          </div>
          <div class="text-center p-2 bg-green-50 rounded-lg">
            <div class="text-lg font-bold text-green-600">${site.sensorsCount}</div>
            <div class="text-xs text-gray-600">Capteurs</div>
          </div>
        </div>

        ${site.lastAlert ? `
          <div class="mb-3 p-2 bg-red-50 rounded border border-red-100">
            <div class="flex items-center">
              <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-sm text-red-700">Dernière alerte: ${site.lastAlert}</span>
            </div>
          </div>
        ` : ''}

        <button onclick="window.location.href='/sites/${site.id}'"
                class="w-full btn-primary py-2 text-sm">
          Voir détails
        </button>
      </div>
    `;
  }

  private addMapControls(): void {
    // Contrôle de recherche
    const SearchControl = L.Control.extend({
      options: {
        position: 'topright'
      },

      onAdd: (map: L.Map) => {
        const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-search');
        div.innerHTML = `
          <div class="bg-white p-2 rounded-lg shadow-lg w-64">
            <div class="relative">
              <input type="text"
                     placeholder="Rechercher un site..."
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            focus:border-blue-500 text-sm"
                     id="map-search-input">
              <div class="absolute right-2 top-2">
                <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        `;

        // Ajouter l'événement de recherche
        const input = div.querySelector('#map-search-input') as HTMLInputElement;
        input.addEventListener('input', (e) => {
          this.searchQuery = (e.target as HTMLInputElement).value;
          this.updateMapMarkers();
        });

        return div;
      }
    });

    const searchControl = new SearchControl();
    searchControl.addTo(this.map);

    // Contrôle des filtres
    const FilterControl = L.Control.extend({
      options: {
        position: 'topright'
      },

      onAdd: (map: L.Map) => {
      const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-control-filters mt-2');
      div.innerHTML = `
        <div class="bg-white p-3 rounded-lg shadow-lg w-64">
          <h4 class="font-medium text-gray-900 mb-2 text-sm">Filtres</h4>

          <div class="space-y-2">
            <div>
              <label class="flex items-center text-sm">
                <input type="checkbox"
                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                       ${this.statusFilter.includes('active') ? 'checked' : ''}
                       onchange="this.dispatchEvent(new CustomEvent('filterChange', {
                         detail: { type: 'status', value: 'active', checked: this.checked }
                       }))">
                <span class="ml-2">Sites actifs</span>
              </label>
            </div>

            <div>
              <label class="flex items-center text-sm">
                <input type="checkbox"
                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                       ${this.statusFilter.includes('maintenance') ? 'checked' : ''}
                       onchange="this.dispatchEvent(new CustomEvent('filterChange', {
                         detail: { type: 'status', value: 'maintenance', checked: this.checked }
                       }))">
                <span class="ml-2">En maintenance</span>
              </label>
            </div>
          </div>
        </div>
      `;

      // Ajouter les événements de filtrage
      const checkboxes = div.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('filterChange', (e: any) => {
          const { type, value, checked } = e.detail;
          if (type === 'status') {
            if (checked) {
              this.statusFilter.push(value);
            } else {
              this.statusFilter = this.statusFilter.filter(v => v !== value);
            }
            this.updateMapMarkers();
          }
        });
      });

      return div;
      }
    });

    const filterControl = new FilterControl();
    filterControl.addTo(this.map);
  }

  private filterSites(): Site[] {
    return this.sites.filter(site => {
      // Filtre de recherche
      if (this.searchQuery && !site.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          !site.location.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return false;
      }

      // Filtre de statut
      if (this.statusFilter.length > 0 && !this.statusFilter.includes(site.status)) {
        return false;
      }

      // Filtre de région
      if (this.regionFilter && !site.location.includes(this.regionFilter)) {
        return false;
      }

      return true;
    });
  }

  private loadLiveEvents(): void {
    this.dashboardService.getLiveEvents().subscribe(events => {
      this.liveEvents = events;
      if (this.autoScrollEnabled) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  scrollToBottom(): void {
    const container = document.getElementById('live-events-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  toggleLiveMonitoring(): void {
    this.isLiveMonitoringPaused = !this.isLiveMonitoringPaused;
  }

  toggleAutoScroll(): void {
    this.autoScrollEnabled = !this.autoScrollEnabled;
  }

  getEventIcon(type: string): string {
    const icons = {
      'battery': 'M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z',
      'geofence': 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
      'measurement': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'connection': 'M13 10V3L4 14h7v7l9-11h-7z',
      'alert': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z'
    };
    return icons[type as keyof typeof icons] || icons.alert;
  }

  getSeverityColor(severity: string): string {
    const colors = {
      'info': 'bg-blue-100 text-blue-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'danger': 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  }

  getSeverityLabel(severity: string): string {
    const labels = {
      'info': 'Info',
      'warning': 'Avertissement',
      'danger': 'Critique'
    };
    return labels[severity as keyof typeof labels] || labels.info;
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins === 1) return 'Il y a 1 minute';
    if (diffMins < 60) return `Il y a ${diffMins} minutes`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Il y a 1 heure';
    if (diffHours < 24) return `Il y a ${diffHours} heures`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  }

  get filteredActivities(): Activity[] {
    let filtered = this.activities;

    if (this.selectedActivityType !== 'Tous') {
      filtered = filtered.filter(activity =>
        activity.action === this.selectedActivityType
      );
    }

    return filtered;
  }

  get paginatedActivities(): Activity[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredActivities.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredActivities.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  exportToCSV(): void {
    // Implémentation simplifiée de l'export CSV
    const headers = ['Utilisateur', 'Action', 'Cible', 'Timestamp', 'Détails'];
    const rows = this.filteredActivities.map(activity => [
      activity.user.name,
      activity.action,
      activity.target,
      activity.timestamp.toLocaleString('fr-FR'),
      activity.details || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `activites-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  refreshData(): void {
    this.isLoading = true;
    this.loadData();
  }

  // Helper methods for template expressions
  getActiveSitesCount(): number {
    return this.sites.filter(s => s.status === 'active').length;
  }

  getTotalAnimalsCount(): number {
    return this.sites.reduce((sum, site) => sum + (site.animalsCount || 0), 0);
  }

  formatTimeAgo(date: Date): string {
    // Simple implementation
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
  }

  get lastUpdate(): Date {
    return new Date();
  }
}
