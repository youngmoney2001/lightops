import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Chart Libraries
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';

// Composants
import { MonitoringComponent } from './pages/monitoring/monitoring.component';
import { AnimalMapComponent } from './components/animal-map/animal-map.component';
import { MetricsDashboardComponent } from './components/metrics-dashboard/metrics-dashboard.component';
import { AnimalDetailsComponent } from './components/animal-details/animal-details.component';
import { NetworkMonitoringComponent } from './components/network-monitoring/network-monitoring.component';
import { AlertSystemComponent } from './components/alert-system/alert-system.component';
import { PayloadAnalyzerComponent } from './components/payload-analyzer/payload-analyzer.component';
import { ChirpstackReportsComponent } from './components/chirpstack-reports/chirpstack-reports.component';
import { NetworkAdminComponent } from './components/network-admin/network-admin.component';

// Services
import { MonitoringService } from './services/monitoring.service';
import { LoraDataService } from './services/lora-data.service';
import { WebsocketService } from './services/websocket.service';

// Pipes
import { GpsQualityPipe } from './pipes/gps-quality.pipe';
import { BatteryStatusPipe } from './pipes/battery-status.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { SignalStrengthPipe } from './pipes/signal-strength.pipe';

// ECharts import (for ngx-echarts)
import * as echarts from 'echarts';

@NgModule({
  declarations: [
    MonitoringComponent, // Ajouté - c'est probablement ce qui manquait
    AnimalMapComponent,
    MetricsDashboardComponent,
    AnimalDetailsComponent,
    NetworkMonitoringComponent,
    AlertSystemComponent,
    PayloadAnalyzerComponent,
    ChirpstackReportsComponent,
    NetworkAdminComponent,
    GpsQualityPipe,
    BatteryStatusPipe,
    TimeAgoPipe,
    SignalStrengthPipe
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MonitoringComponent,
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: MetricsDashboardComponent },
          { path: 'map', component: AnimalMapComponent },
          { path: 'animal/:id', component: AnimalDetailsComponent },
          { path: 'network', component: NetworkMonitoringComponent },
          { path: 'alerts', component: AlertSystemComponent },
          { path: 'analyzer', component: PayloadAnalyzerComponent },
          { path: 'reports', component: ChirpstackReportsComponent },
          { path: 'admin', component: NetworkAdminComponent }
        ]
      }
    ]),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatBadgeModule,
    MatChipsModule,
    MatExpansionModule,
    MatSliderModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSnackBarModule,
    // Charts
    NgChartsModule,
    // Configuration corrigée pour NgxEchartsModule
    NgxEchartsModule.forRoot({ echarts })
  ],
  providers: [
    MonitoringService,
    LoraDataService,
    WebsocketService,
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' } // Optionnel: définir la locale
  ]
})
export class MonitoringModule { }
