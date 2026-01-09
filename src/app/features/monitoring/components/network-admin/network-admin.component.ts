import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MonitoringService, ChirpStackTenant, ChirpStackApplication, NetworkServer, GatewayProfile } from '../../services/monitoring.service';

interface NetworkConfig {
  serverUrl: string;
  apiToken: string;
  region: string;
  frequencyPlan: string;
}

interface GatewayConfig {
  gatewayId: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  channels: number[];
  txPower: number;
}

@Component({
  selector: 'app-network-admin',
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
    MatDialogModule,
    MatSnackBarModule,
    MatSlideToggleModule
  ],
  templateUrl: './network-admin.component.html',
  styleUrl: './network-admin.component.css'
})
export class NetworkAdminComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // Data observables - initialisation correcte
  tenants$: Observable<ChirpStackTenant[]> = new Observable();
  applications$: Observable<ChirpStackApplication[]> = new Observable();
  networkServers$: Observable<NetworkServer[]> = new Observable();
  gatewayProfiles$: Observable<GatewayProfile[]> = new Observable();

  // Configuration
  networkConfig: NetworkConfig = {
    serverUrl: '',
    apiToken: '',
    region: 'EU868',
    frequencyPlan: 'EU_863_870_TTN'
  };

  gatewayConfig: GatewayConfig = {
    gatewayId: '',
    name: '',
    description: '',
    location: {
      latitude: 0,
      longitude: 0,
      altitude: 0
    },
    channels: [],
    txPower: 14
  };

  // UI state
  loading = false;
  selectedTab = 0;

  // Table columns
  tenantColumns = ['name', 'description', 'createdAt', 'deviceCount', 'actions'];
  applicationColumns = ['name', 'description', 'tenantName', 'deviceCount', 'actions'];
  serverColumns = ['name', 'server', 'region', 'status', 'actions'];

  constructor(
    private monitoringService: MonitoringService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.loadNetworkConfig();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadInitialData(): void {
    this.tenants$ = this.monitoringService.getChirpStackTenants();
    this.applications$ = this.monitoringService.getChirpStackApplications();
    this.networkServers$ = this.monitoringService.getNetworkServers();
    this.gatewayProfiles$ = this.monitoringService.getGatewayProfiles();
  }

  private loadNetworkConfig(): void {
    // Load saved configuration from service/storage
    this.subscriptions.push(
      this.monitoringService.getNetworkConfig().subscribe(config => {
        if (config) {
          this.networkConfig = config;
        }
      })
    );
  }

  // Network Configuration Methods
  saveNetworkConfig(): void {
    this.loading = true;
    this.subscriptions.push(
      this.monitoringService.saveNetworkConfig(this.networkConfig).subscribe({
        next: () => {
          this.snackBar.open('Configuration réseau sauvegardée', 'Fermer', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      })
    );
  }

  testConnection(): void {
    this.loading = true;
    this.subscriptions.push(
      this.monitoringService.testChirpStackConnection(this.networkConfig).subscribe({
        next: (result: any) => {
          if (result.success) {
            this.snackBar.open('Connexion réussie', 'Fermer', { duration: 3000 });
          } else {
            this.snackBar.open('Échec de connexion', 'Fermer', { duration: 3000 });
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur de connexion:', error);
          this.snackBar.open('Erreur de connexion', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      })
    );
  }

  // Tenant Management
  createTenant(): void {
    // Implementation for creating new tenant
    this.snackBar.open('Fonctionnalité à implémenter', 'Fermer', { duration: 3000 });
  }

  editTenant(tenant: ChirpStackTenant): void {
    // Implementation for editing tenant
    this.snackBar.open('Fonctionnalité à implémenter', 'Fermer', { duration: 3000 });
  }

  deleteTenant(tenant: ChirpStackTenant): void {
    if (confirm(`Supprimer le tenant "${tenant.name}" ?`)) {
      this.subscriptions.push(
        this.monitoringService.deleteTenant(tenant.id).subscribe({
          next: () => {
            this.snackBar.open('Tenant supprimé', 'Fermer', { duration: 3000 });
            this.loadInitialData();
          },
          error: (error: any) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        })
      );
    }
  }

  // Application Management
  createApplication(): void {
    // Implementation for creating new application
    this.snackBar.open('Fonctionnalité à implémenter', 'Fermer', { duration: 3000 });
  }

  editApplication(app: ChirpStackApplication): void {
    // Implementation for editing application
    this.snackBar.open('Fonctionnalité à implémenter', 'Fermer', { duration: 3000 });
  }

  deleteApplication(app: ChirpStackApplication): void {
    if (confirm(`Supprimer l'application "${app.name}" ?`)) {
      this.subscriptions.push(
        this.monitoringService.deleteApplication(app.id).subscribe({
          next: () => {
            this.snackBar.open('Application supprimée', 'Fermer', { duration: 3000 });
            this.loadInitialData();
          },
          error: (error: any) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        })
      );
    }
  }

  // Gateway Management
  registerGateway(): void {
    this.loading = true;
    this.subscriptions.push(
      this.monitoringService.registerGateway(this.gatewayConfig).subscribe({
        next: () => {
          this.snackBar.open('Passerelle enregistrée', 'Fermer', { duration: 3000 });
          this.resetGatewayConfig();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur lors de l\'enregistrement:', error);
          this.snackBar.open('Erreur lors de l\'enregistrement', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      })
    );
  }

  updateGateway(gateway: any): void {
    // Implementation for updating gateway
    this.snackBar.open('Fonctionnalité à implémenter', 'Fermer', { duration: 3000 });
  }

  deleteGateway(gateway: any): void {
    if (confirm(`Supprimer la passerelle "${gateway.name}" ?`)) {
      this.subscriptions.push(
        this.monitoringService.deleteGateway(gateway.id).subscribe({
          next: () => {
            this.snackBar.open('Passerelle supprimée', 'Fermer', { duration: 3000 });
            this.loadInitialData();
          },
          error: (error: any) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        })
      );
    }
  }

  // Network Server Management
  addNetworkServer(): void {
    // Implementation for adding network server
    this.snackBar.open('Fonctionnalité à implémenter', 'Fermer', { duration: 3000 });
  }

  editNetworkServer(server: NetworkServer): void {
    // Implementation for editing network server
    this.snackBar.open('Fonctionnalité à implémenter', 'Fermer', { duration: 3000 });
  }

  deleteNetworkServer(server: NetworkServer): void {
    if (confirm(`Supprimer le serveur réseau "${server.name}" ?`)) {
      this.subscriptions.push(
        this.monitoringService.deleteNetworkServer(server.id).subscribe({
          next: () => {
            this.snackBar.open('Serveur réseau supprimé', 'Fermer', { duration: 3000 });
            this.loadInitialData();
          },
          error: (error: any) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        })
      );
    }
  }

  // Utility Methods
  private resetGatewayConfig(): void {
    this.gatewayConfig = {
      gatewayId: '',
      name: '',
      description: '',
      location: {
        latitude: 0,
        longitude: 0,
        altitude: 0
      },
      channels: [],
      txPower: 14
    };
  }

  refreshData(): void {
    this.loadInitialData();
    this.snackBar.open('Données actualisées', 'Fermer', { duration: 2000 });
  }
}
