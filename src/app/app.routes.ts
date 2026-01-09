import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // Auth routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  // Main app with layout (protected)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'sites',
        loadChildren: () => import('./features/sites/sites.module').then(m => m.SitesModule)
      },
      {
        path: 'sensors',
        loadChildren: () => import('./features/sensors/sensors.module').then(m => m.SensorsModule)
      },
      {
        path: 'animals',
        loadChildren: () => import('./features/animals/animals.module').then(m => m.AnimalsModule)
      },
      {
        path: 'monitoring',
        loadChildren: () => import('./features/monitoring/monitoring.module').then(m => m.MonitoringModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
      }
    ]
  },

  // Manager area (protected + role)
  {
    path: 'manager',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['manager', 'admin'] },
    loadChildren: () => import('./features/manager/manager.module').then(m => m.ManagerModule)
  },

  // Admin area (protected + role)
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },

  // Fallback routes
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
