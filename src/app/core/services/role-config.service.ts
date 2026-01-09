import { Injectable } from '@angular/core';
import { AuthService, User } from './auth.service';

export interface DashboardSection {
  id: string;
  title: string;
  type: 'map' | 'metrics' | 'realtime' | 'activities' | 'health' | 'analytics' | 'alerts' | 'medical' | 'dossier' | 'reproduction' | 'operational';
  columns: number; // 1-12
  order: number;
  config: any;
  roles: string[]; // Rôles autorisés
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  role: string;
  sections: DashboardSection[];
  gridColumns: number; // 1-4
}

@Injectable({
  providedIn: 'root'
})
export class RoleConfigService {

  constructor(private authService: AuthService) {}

  // Configuration des dashboards par rôle
  private readonly DASHBOARD_LAYOUTS: DashboardLayout[] = [
    // SUPER ADMIN
    {
      id: 'super-admin',
      name: 'Dashboard Super Admin',
      description: 'Vue globale complète du système',
      role: 'super-admin',
      gridColumns: 4,
      sections: [
        {
          id: 'global-map',
          title: 'Carte Globale des Sites',
          type: 'map',
          columns: 12,
          order: 1,
          roles: ['super-admin'],
          config: {
            showAllSites: true,
            showClusters: true,
            showSensorPositions: true,
            showHeatmap: true,
            filters: ['region', 'status', 'type'],
            controls: ['search', 'zoom', 'layers']
          }
        },
        {
          id: 'global-metrics',
          title: 'Métriques Globales',
          type: 'metrics',
          columns: 6,
          order: 2,
          roles: ['super-admin', 'general-manager'],
          config: {
            metrics: [
              { key: 'totalSites', label: 'Sites Totaux', color: 'blue' },
              { key: 'animalsTracked', label: 'Animaux Suivis', color: 'green' },
              { key: 'activeAlerts', label: 'Alertes Actives', color: 'orange' },
              { key: 'sensorsOnline', label: 'Capteurs En Ligne', color: 'blue-light' }
            ],
            showSparkline: true
          }
        },
        {
          id: 'realtime-monitoring',
          title: 'Monitoring Temps Réel',
          type: 'realtime',
          columns: 6,
          order: 3,
          roles: ['super-admin'],
          config: {
            websocketEvents: true,
            eventTypes: ['record.sent', 'low.battery.alert', 'geofence.violation.alert'],
            autoScroll: true,
            showSeverity: true
          }
        },
        {
          id: 'recent-activities',
          title: 'Activités Récentes',
          type: 'activities',
          columns: 12,
          order: 4,
          roles: ['super-admin'],
          config: {
            showFilters: true,
            exportable: true,
            pagination: true,
            userFilter: true
          }
        }
      ]
    },

    // SITE MANAGER
    {
      id: 'site-manager',
      name: 'Dashboard Responsable Site',
      description: 'Vue détaillée du site assigné',
      role: 'site-manager',
      gridColumns: 3,
      sections: [
        {
          id: 'site-map',
          title: 'Vue du Site',
          type: 'map',
          columns: 12,
          order: 1,
          roles: ['site-manager', 'general-manager'],
          config: {
            showGeofencing: true,
            showAnimalPositions: true,
            animalColorsBy: 'health',
            showControls: true,
            layers: ['zones', 'animals', 'sensors']
          }
        },
        {
          id: 'site-health',
          title: 'Santé du Site',
          type: 'health',
          columns: 6,
          order: 2,
          roles: ['site-manager'],
          config: {
            showHealthScore: true,
            metrics: [
              { key: 'animalsOutOfZone', label: 'Animaux Hors Zone', color: 'red' },
              { key: 'lowBatterySensors', label: 'Capteurs Batterie Faible', color: 'orange' },
              { key: 'pregnantAnimals', label: 'Animaux en Gestation', color: 'purple' },
              { key: 'animalsNeedingCare', label: 'Animaux à Soigner', color: 'yellow' }
            ]
          }
        },
        {
          id: 'physiological-analysis',
          title: 'Analyses Physiologiques',
          type: 'analytics',
          columns: 6,
          order: 3,
          roles: ['site-manager', 'veterinary'],
          config: {
            charts: [
              { type: 'stepFrequency', period: '7d' },
              { type: 'fertilityPeriod', showTimeline: true },
              { type: 'pregnancyStatus', showProgress: true },
              { type: 'bodyTemperature', showThresholds: true }
            ]
          }
        },
        {
          id: 'priority-alerts',
          title: 'Alertes Prioritaires',
          type: 'alerts',
          columns: 12,
          order: 4,
          roles: ['site-manager'],
          config: {
            sortBy: 'severity',
            quickActions: ['assignVet', 'ignore', 'resolve'],
            showPriority: true
          }
        }
      ]
    },

    // VETERINARY
    {
      id: 'veterinary',
      name: 'Dashboard Vétérinaire',
      description: 'Interface médicale des animaux',
      role: 'veterinary',
      gridColumns: 2,
      sections: [
        {
          id: 'medical-list',
          title: 'Liste Animaux Médicale',
          type: 'medical',
          columns: 12,
          order: 1,
          roles: ['veterinary'],
          config: {
            showHealthIndicators: true,
            columns: ['name', 'temperature', 'heartRate', 'reproductionStatus', 'alerts'],
            filters: ['toExamine', 'inTreatment', 'stable'],
            quickFilters: true
          }
        },
        {
          id: 'animal-dossier',
          title: 'Dossier Animal',
          type: 'dossier',
          columns: 8,
          order: 2,
          roles: ['veterinary'],
          config: {
            showHistory: true,
            showObservationForm: true,
            showGallery: true,
            showPrescriptions: true
          }
        },
        {
          id: 'reproduction-planning',
          title: 'Planning Reproductif',
          type: 'reproduction',
          columns: 4,
          order: 3,
          roles: ['veterinary'],
          config: {
            showFertilityCalendar: true,
            showInseminationAlerts: true,
            trackPregnancy: true,
            showSuccessStats: true
          }
        }
      ]
    },

    // GENERAL MANAGER
    {
      id: 'general-manager',
      name: 'Dashboard Responsable Général',
      description: 'Monitoring opérationnel avec restrictions',
      role: 'general-manager',
      gridColumns: 3,
      sections: [
        {
          id: 'operational-monitoring',
          title: 'Monitoring Opérationnel',
          type: 'operational',
          columns: 12,
          order: 1,
          roles: ['general-manager'],
          config: {
            showAnimalPositions: true,
            showProductionMetrics: true,
            showTeamTasks: true,
            showActivityReports: true,
            restricted: true
          }
        },
        {
          id: 'manager-metrics',
          title: 'Métriques de Site',
          type: 'metrics',
          columns: 6,
          order: 2,
          roles: ['general-manager'],
          config: {
            metrics: [
              { key: 'sitePerformance', label: 'Performance Site', color: 'blue' },
              { key: 'animalHealth', label: 'Santé Animaux', color: 'green' },
              { key: 'sensorStatus', label: 'Statut Capteurs', color: 'orange' },
              { key: 'alertsToday', label: 'Alertes Aujourd\'hui', color: 'red' }
            ],
            restricted: true
          }
        },
        {
          id: 'team-activities',
          title: 'Activités Équipe',
          type: 'activities',
          columns: 6,
          order: 3,
          roles: ['general-manager'],
          config: {
            showFilters: false,
            exportable: false,
            pagination: true,
            userFilter: false,
            restricted: true
          }
        }
      ]
    }
  ];

  // Récupérer la configuration du dashboard selon le rôle
  getDashboardConfig(role: string): DashboardLayout {
    const layout = this.DASHBOARD_LAYOUTS.find(layout => layout.role === role);

    if (!layout) {
      // Fallback au dashboard super-admin si rôle non trouvé
      return this.DASHBOARD_LAYOUTS.find(layout => layout.role === 'super-admin')!;
    }

    return layout;
  }

  // Récupérer les sections filtrées pour l'utilisateur
  getSectionsForUser(user: User): DashboardSection[] {
    const layout = this.getDashboardConfig(user.roles?.[0] || 'user');

    return layout.sections.filter(section =>
      section.roles.includes(user.roles?.[0] || 'user')
    ).sort((a, b) => a.order - b.order);
  }

  // Vérifier si une section est visible pour le rôle
  isSectionVisible(sectionId: string, userRole: string): boolean {
    const layout = this.getDashboardConfig(userRole);
    const section = layout.sections.find(s => s.id === sectionId);

    return section ? section.roles.includes(userRole) : false;
  }

  // Récupérer la configuration d'une section
  getSectionConfig(sectionId: string, userRole: string): any {
    const layout = this.getDashboardConfig(userRole);
    const section = layout.sections.find(s => s.id === sectionId);

    return section ? section.config : null;
  }

  // Vérifier les restrictions pour le responsable général
  isRestricted(sectionId: string, userRole: string): boolean {
    const config = this.getSectionConfig(sectionId, userRole);
    return config?.restricted || false;
  }

  // Obtenir le nom du rôle formaté
  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'super-admin': 'Super Admin',
      'site-manager': 'Responsable Site',
      'veterinary': 'Vétérinaire',
      'general-manager': 'Responsable Général',
      'user': 'Utilisateur'
    };

    return roleNames[role] || role;
  }

  // Obtenir la couleur du rôle
  getRoleColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      'super-admin': 'bg-role-super-admin text-yellow-900',
      'site-manager': 'bg-role-site-manager text-blue-900',
      'veterinary': 'bg-role-veterinary text-green-900',
      'general-manager': 'bg-role-general-manager text-purple-900',
      'user': 'bg-gray-100 text-gray-800'
    };

    return roleColors[role] || roleColors['user'] || 'bg-gray-100 text-gray-800'; // Utilisateur par défaut si rôle non trouvé ou user;
  }
}
