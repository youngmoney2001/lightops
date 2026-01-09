 import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

export interface Site {
  id: number;
  name: string;
  location: string;
  animalsCount: number;
  sensorsCount: number;
  status: 'active' | 'inactive' | 'maintenance';
  lastAlert?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface MetricCard {
  title: string;
  value: number | string;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  details?: string;
}

export interface LiveEvent {
  id: number;
  timestamp: Date;
  type: 'battery' | 'geofence' | 'measurement' | 'connection' | 'alert';
  severity: 'info' | 'warning' | 'danger';
  message: string;
  sensorId?: number;
  animalId?: number;
  siteId?: number;
}

export interface Activity {
  id: number;
  user: {
    id: number;
    name: string;
    role: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: Date;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  // Récupérer les sites pour la carte
  getSites(): Observable<Site[]> {
    // Simulation de données
    const sites: Site[] = [
      {
        id: 1,
        name: 'Ferme de la Vallée',
        location: 'Normandie, FR',
        animalsCount: 42,
        sensorsCount: 15,
        status: 'active',
        lastAlert: 'Il y a 2h',
        coordinates: { lat: 49.1193, lng: 1.0908 }
      },
      {
        id: 2,
        name: 'Élevage des Collines',
        location: 'Bretagne, FR',
        animalsCount: 28,
        sensorsCount: 12,
        status: 'active',
        coordinates: { lat: 48.2020, lng: -2.9326 }
      },
      {
        id: 3,
        name: 'Ranch du Sud',
        location: 'Provence, FR',
        animalsCount: 35,
        sensorsCount: 10,
        status: 'maintenance',
        lastAlert: 'Hier',
        coordinates: { lat: 43.9352, lng: 4.8909 }
      }
    ];

    return of(sites).pipe(delay(500));
  }

  // Récupérer les métriques globales
  getGlobalMetrics(): Observable<MetricCard[]> {
    const metrics: MetricCard[] = [
      {
        title: 'Sites Actifs',
        value: 18,
        unit: 'sites',
        trend: 'up',
        trendValue: '+2 cette semaine',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: 'primary',
        details: 'sur 24 sites'
      },
      {
        title: 'Animaux Suivis',
        value: 342,
        trend: 'up',
        trendValue: '+12 cette semaine',
        icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        color: 'success'
      },
      {
        title: 'Alertes Actives',
        value: 3,
        trend: 'down',
        trendValue: '-1 depuis hier',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z',
        color: 'warning'
      },
      {
        title: 'Capteurs En Ligne',
        value: '98%',
        trend: 'neutral',
        trendValue: 'Stable',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        color: 'info',
        details: '145/148 capteurs'
      }
    ];

    return of(metrics).pipe(delay(300));
  }

  // Récupérer les événements en direct
  getLiveEvents(): Observable<LiveEvent[]> {
    const events: LiveEvent[] = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 2 * 60000),
        type: 'measurement',
        severity: 'info',
        message: 'Température normale pour Bella',
        animalId: 1
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 5 * 60000),
        type: 'battery',
        severity: 'warning',
        message: 'Batterie faible capteur TRK-015',
        sensorId: 15
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 10 * 60000),
        type: 'geofence',
        severity: 'danger',
        message: 'Vache #42 sortie de zone',
        animalId: 42,
        siteId: 1
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 15 * 60000),
        type: 'connection',
        severity: 'info',
        message: 'Capteur TRK-007 reconnecté',
        sensorId: 7
      }
    ];

    return of(events).pipe(delay(200));
  }

  // Récupérer les activités récentes
  getRecentActivities(): Observable<Activity[]> {
    const activities: Activity[] = [
      {
        id: 1,
        user: {
          id: 1,
          name: 'Jean Dupont',
          role: 'super-admin',
          avatar: ''
        },
        action: 'Création',
        target: 'Site "Ferme Nouvelle"',
        timestamp: new Date(Date.now() - 30 * 60000),
        details: 'Ajout de 15 capteurs'
      },
      {
        id: 2,
        user: {
          id: 2,
          name: 'Marie Martin',
          role: 'veterinary',
          avatar: ''
        },
        action: 'Examen',
        target: 'Animal #24',
        timestamp: new Date(Date.now() - 45 * 60000),
        details: 'Vaccination effectuée'
      },
      {
        id: 3,
        user: {
          id: 3,
          name: 'Pierre Bernard',
          role: 'site-manager',
          avatar: ''
        },
        action: 'Configuration',
        target: 'Capteur TRK-012',
        timestamp: new Date(Date.now() - 60 * 60000),
        details: 'Fréquence mise à jour: 15min'
      },
      {
        id: 4,
        user: {
          id: 4,
          name: 'Sophie Leroy',
          role: 'general-manager',
          avatar: ''
        },
        action: 'Export',
        target: 'Rapport mensuel',
        timestamp: new Date(Date.now() - 90 * 60000),
        details: 'Format PDF, 45 pages'
      }
    ];

    return of(activities).pipe(delay(400));
  }

  // Récupérer les statistiques pour les graphiques
  getStatistics(): Observable<any> {
    return this.apiService.get('monitoring/dashboard');
  }
}
