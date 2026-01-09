import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Composants
import { DashboardComponent } from '../dashboard/pages/dashboard/dashboard.component';

// Services
import { DashboardService } from './services/dashboard.service';

// Composants partagés
import { RoleBadgeComponent } from '../../shared/components/role-badge/role-badge.component';
import { SensorStatusComponent } from '../../shared/components/sensor-status/sensor-status.component';
import { DataCardComponent } from '../../shared/components/data-card/data-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PermissionGateComponent } from '../../shared/components/permission-gate/permission-gate.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  declarations: [
    // DashboardComponent is now standalone
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    // Composants standalone
    DashboardComponent,
    RoleBadgeComponent,
    SensorStatusComponent,
    DataCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    PermissionGateComponent
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }
