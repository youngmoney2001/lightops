import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoringService, AnimalPosition, GatewayStatus, SiteInfo, FilterOptions } from '../../services/monitoring.service';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-animal-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animal-map.component.html',
  styleUrls: ['./animal-map.component.css']
})
export class AnimalMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private map!: L.Map;
  private animalMarkers: L.Marker[] = [];
  private gatewayMarkers: L.Marker[] = [];
  private siteLayers: L.Layer[] = [];
  private animalLayerGroup!: L.LayerGroup;
  private gatewayLayerGroup!: L.LayerGroup;
  private siteLayerGroup!: L.LayerGroup;
  private trajectoryLayerGroup!: L.LayerGroup;
  private subscriptions: Subscription[] = [];

  positions$: Observable<AnimalPosition[]>;
  gateways$: Observable<GatewayStatus[]>;
  sites$: Observable<SiteInfo[]>;
  selectedAnimal$: Observable<AnimalPosition | null>;

  currentZoom = 12;
  mapCenter: [number, number] = [48.8566, 2.3522]; // Paris par défaut
  selectedAnimal: AnimalPosition | null = null;
  showAnimalTrajectories = false;
  showGateways = true;
  showSites = true;
  showCoverageHeatmap = false;

  constructor(private monitoringService: MonitoringService) {
    this.positions$ = monitoringService.filteredPositions$;
    this.gateways$ = monitoringService.gateways$;
    this.sites$ = monitoringService.sites$;
    this.selectedAnimal$ = monitoringService.selectedAnimal$;
  }

  ngOnInit(): void {
    this.initMap();
    this.setupSubscriptions();
  }

  ngAfterViewInit(): void {
    this.initMapLayers();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(this.mapCenter, this.currentZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Couches de groupes
    this.animalLayerGroup = L.layerGroup().addTo(this.map);
    this.gatewayLayerGroup = L.layerGroup().addTo(this.map);
    this.siteLayerGroup = L.layerGroup().addTo(this.map);
    this.trajectoryLayerGroup = L.layerGroup().addTo(this.map);
  }

  private initMapLayers(): void {
    // Initialiser les marqueurs
    this.subscriptions.push(
      this.positions$.pipe(debounceTime(300)).subscribe(positions => {
        this.updateAnimalMarkers(positions);
      })
    );

    this.subscriptions.push(
      this.gateways$.pipe(debounceTime(300)).subscribe(gateways => {
        this.updateGatewayMarkers(gateways);
      })
    );

    this.subscriptions.push(
      this.sites$.pipe(debounceTime(300)).subscribe(sites => {
        this.updateSiteLayers(sites);
      })
    );

    this.subscriptions.push(
      this.selectedAnimal$.subscribe(animal => {
        this.selectedAnimal = animal;
        if (animal && this.showAnimalTrajectories) {
          this.showAnimalTrajectory(animal.id);
        }
      })
    );
  }

  private setupSubscriptions(): void {
    // Mettre à jour le centre de la carte si un animal est sélectionné
    this.subscriptions.push(
      this.selectedAnimal$.subscribe(animal => {
        if (animal) {
          this.map.setView([animal.latitude, animal.longitude], 15);
        }
      })
    );
  }

  private updateAnimalMarkers(positions: AnimalPosition[]): void {
    this.animalLayerGroup.clearLayers();
    this.animalMarkers = [];

    positions.forEach(position => {
      const marker = this.createAnimalMarker(position);
      marker.addTo(this.animalLayerGroup);
      this.animalMarkers.push(marker);
    });
  }

  private createAnimalMarker(position: AnimalPosition): L.Marker {
    const qualityColors: { [key: string]: string } = {
      'excellent': '#10B981',
      'good': '#3B82F6',
      'moderate': '#F59E0B',
      'poor': '#EF4444',
      'very_poor': '#7C3AED',
      'gateway_estimated': '#8B5CF6',
      'historical_estimated': '#6B7280'
    };

    const color = qualityColors[position.gpsQuality] || '#6B7280';

    const icon = L.divIcon({
      html: `
        <div class="relative animal-marker" style="cursor: pointer;">
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
               style="background-color: ${color}">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-semibold whitespace-nowrap">
            ${position.animalName}
            <div class="text-xs text-gray-500">${position.batteryLevel}%</div>
          </div>
        </div>
      `,
      className: 'custom-animal-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    const marker = L.marker([position.latitude, position.longitude], {
      icon: icon,
      title: position.animalName
    });

    marker.on('click', () => {
      this.onAnimalSelect(position);
    });

    return marker;
  }

  private updateGatewayMarkers(gateways: GatewayStatus[]): void {
    this.gatewayLayerGroup.clearLayers();
    this.gatewayMarkers = [];

    if (!this.showGateways) return;

    gateways.forEach(gateway => {
      const marker = this.createGatewayMarker(gateway);
      marker.addTo(this.gatewayLayerGroup);
      this.gatewayMarkers.push(marker);
    });
  }

  private createGatewayMarker(gateway: GatewayStatus): L.Marker {
    const statusColor = gateway.status === 'online' ? '#10B981' : '#EF4444';

    const icon = L.divIcon({
      html: `
        <div class="relative gateway-marker" style="cursor: pointer;">
          <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
               style="background-color: ${statusColor}">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-semibold whitespace-nowrap">
            ${gateway.name}
          </div>
        </div>
      `,
      className: 'custom-gateway-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    const marker = L.marker([gateway.latitude, gateway.longitude], {
      icon: icon,
      title: gateway.name
    });

    marker.on('click', () => {
      this.showGatewayPopup(gateway);
    });

    return marker;
  }

  private updateSiteLayers(sites: SiteInfo[]): void {
    this.siteLayerGroup.clearLayers();
    this.siteLayers = [];

    if (!this.showSites) return;

    sites.forEach(site => {
      const layers = this.createSiteLayers(site);
      layers.forEach(layer => layer.addTo(this.siteLayerGroup));
      this.siteLayers.push(...layers);
    });
  }

  private createSiteLayers(site: SiteInfo): L.Layer[] {
    const layers: L.Layer[] = [];
    const color = site.color || '#3B82F6';

    // Cercle du site
    const siteCircle = L.circle([site.latitude, site.longitude], {
      radius: site.radius,
      color: color,
      fillColor: color,
      fillOpacity: 0.1,
      weight: 2
    });

    // Marqueur central
    const siteMarker = L.marker([site.latitude, site.longitude], {
      icon: L.divIcon({
        html: `<div class="site-marker" style="background-color: ${color}">
                 <span>${site.name}</span>
               </div>`,
        className: 'custom-site-marker',
        iconSize: [100, 30],
        iconAnchor: [50, 15]
      })
    });

    // Popup avec infos du site
    const popupContent = `
      <div class="p-2">
        <h4 class="font-bold text-lg mb-2">${site.name}</h4>
        <p class="text-gray-600 mb-2">${site.description}</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="font-semibold">Animaux:</div>
          <div>${site.animalsCount}</div>
          <div class="font-semibold">Capteurs:</div>
          <div>${site.sensorsCount}</div>
          <div class="font-semibold">Rayon:</div>
          <div>${site.radius}m</div>
        </div>
      </div>
    `;

    siteMarker.bindPopup(popupContent);
    siteCircle.bindPopup(popupContent);

    layers.push(siteMarker, siteCircle);
    return layers;
  }

  private showAnimalTrajectory(animalId: number): void {
    this.trajectoryLayerGroup.clearLayers();

    this.subscriptions.push(
      this.monitoringService.getSensorTrajectory(animalId).subscribe(trajectory => {
        if (trajectory?.data?.positions?.length > 1) {
          const points = trajectory.data.positions.map((pos: any) =>
            [parseFloat(pos.latitude), parseFloat(pos.longitude)]
          );

          const polyline = L.polyline(points as [number, number][], {
            color: '#3B82F6',
            weight: 3,
            opacity: 0.7
          }).addTo(this.trajectoryLayerGroup);

          // Ajouter des marqueurs pour chaque point de la trajectoire
          trajectory.data.positions.forEach((pos: any, index: number) => {
            const marker = L.circleMarker([parseFloat(pos.latitude), parseFloat(pos.longitude)], {
              radius: 4,
              color: '#1D4ED8',
              fillColor: '#3B82F6',
              fillOpacity: 0.8
            }).bindTooltip(`Point ${index + 1}<br>${pos.position_time || ''}`);

            marker.addTo(this.trajectoryLayerGroup);
          });

          this.map.fitBounds(polyline.getBounds());
        }
      })
    );
  }

  private showGatewayPopup(gateway: GatewayStatus): void {
    const popupContent = `
      <div class="p-3">
        <h4 class="font-bold text-lg mb-2">${gateway.name}</h4>
        <div class="grid grid-cols-2 gap-2 text-sm mb-3">
          <div class="font-semibold">ID:</div>
          <div class="font-mono">${gateway.gatewayId}</div>
          <div class="font-semibold">Statut:</div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${gateway.status === 'online' ? '#10B981' : '#EF4444'}"></div>
            ${gateway.status === 'online' ? 'En ligne' : 'Hors ligne'}
          </div>
          <div class="font-semibold">Dernière activité:</div>
          <div>${new Date(gateway.lastSeen).toLocaleString()}</div>
          <div class="font-semibold">Sensors connectés:</div>
          <div>${gateway.connectedSensors || 0}</div>
          <div class="font-semibold">RSSI moyen:</div>
          <div>${gateway.rssiAvg || 'N/A'} dBm</div>
          <div class="font-semibold">SNR moyen:</div>
          <div>${gateway.snrAvg || 'N/A'}</div>
        </div>
        ${gateway.description ? `<p class="text-gray-600 text-sm">${gateway.description}</p>` : ''}
      </div>
    `;

    L.popup()
      .setLatLng([gateway.latitude, gateway.longitude])
      .setContent(popupContent)
      .openOn(this.map);
  }

  onAnimalSelect(animal: AnimalPosition): void {
    this.monitoringService.setSelectedAnimal(animal);
    this.showAnimalPopup(animal);
  }

  private showAnimalPopup(animal: AnimalPosition): void {
    const qualityColors: { [key: string]: string } = {
      'excellent': '#10B981',
      'good': '#3B82F6',
      'moderate': '#F59E0B',
      'poor': '#EF4444',
      'very_poor': '#7C3AED',
      'gateway_estimated': '#8B5CF6',
      'historical_estimated': '#6B7280'
    };

    const color = qualityColors[animal.gpsQuality] || '#6B7280';

    const popupContent = `
      <div class="p-3 max-w-sm">
        <div class="flex items-center mb-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
               style="background-color: ${color}">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div>
            <h4 class="font-bold text-lg">${animal.animalName}</h4>
            <p class="text-sm text-gray-600">${animal.deviceName}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-sm mb-3">
          <div class="font-semibold">Qualité GPS:</div>
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${color}"></div>
            ${animal.gpsQuality || 'N/A'}
          </div>
          <div class="font-semibold">Précision:</div>
          <div>${animal.accuracyDescription || 'N/A'}</div>
          <div class="font-semibold">Batterie:</div>
          <div>
            <div class="flex items-center">
              <div class="w-16 h-2 bg-gray-200 rounded-full mr-2">
                <div class="h-full rounded-full ${animal.batteryStatus === 'critical' ? 'bg-red-500' : animal.batteryStatus === 'low' ? 'bg-yellow-500' : 'bg-green-500'}"
                     style="width: ${animal.batteryLevel || 0}%"></div>
              </div>
              ${animal.batteryLevel || 0}%
            </div>
          </div>
          <div class="font-semibold">Température:</div>
          <div>${animal.temperature || 'N/A'}°C</div>
          <div class="font-semibold">Dernière position:</div>
          <div>${animal.positionTime ? new Date(animal.positionTime).toLocaleString() : 'N/A'}</div>
          <div class="font-semibold">Passerelles:</div>
          <div>${animal.gatewaysCount || 0}</div>
        </div>
      </div>
    `;

    L.popup()
      .setLatLng([animal.latitude, animal.longitude])
      .setContent(popupContent)
      .openOn(this.map);
  }

  toggleAnimalTrajectories(): void {
    this.showAnimalTrajectories = !this.showAnimalTrajectories;
    if (!this.showAnimalTrajectories) {
      this.trajectoryLayerGroup.clearLayers();
    } else if (this.selectedAnimal) {
      this.showAnimalTrajectory(this.selectedAnimal.id);
    }
  }

  toggleGateways(): void {
    this.showGateways = !this.showGateways;
    if (this.showGateways) {
      this.gateways$.subscribe(gateways => this.updateGatewayMarkers(gateways));
    } else {
      this.gatewayLayerGroup.clearLayers();
    }
  }

  toggleSites(): void {
    this.showSites = !this.showSites;
    if (this.showSites) {
      this.sites$.subscribe(sites => this.updateSiteLayers(sites));
    } else {
      this.siteLayerGroup.clearLayers();
    }
  }

  toggleCoverageHeatmap(): void {
    this.showCoverageHeatmap = !this.showCoverageHeatmap;
    // Implémentation de la heatmap à ajouter
  }

  fitToBounds(): void {
    const markers: L.LatLng[] = [
      ...this.animalMarkers.map(marker => marker.getLatLng()),
      ...this.gatewayMarkers.map(marker => marker.getLatLng())
    ].filter(latlng => latlng !== undefined);

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      this.map.fitBounds(bounds.pad(0.1));
    }
  }

  zoomIn(): void {
    this.map.zoomIn();
  }

  zoomOut(): void {
    this.map.zoomOut();
  }

  recenter(): void {
    if (this.selectedAnimal) {
      this.map.setView([this.selectedAnimal.latitude, this.selectedAnimal.longitude], 15);
    } else if (this.animalMarkers.length > 0) {
      this.fitToBounds();
    } else {
      this.map.setView(this.mapCenter, this.currentZoom);
    }
  }
}
