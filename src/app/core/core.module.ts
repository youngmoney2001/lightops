import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Services
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { NotificationService } from './services/notification.service';
import { LoadingService } from './services/loading.service';
import { LayoutService } from './services/layout.service';

// Layouts
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

// Components
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';

@NgModule({
  declarations: [
    // Components are now standalone and imported instead
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    MainLayoutComponent,
    AuthLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    PageHeaderComponent
  ],
  exports: [
    MainLayoutComponent,
    AuthLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    PageHeaderComponent
  ],
  providers: [
    // Services
    ApiService,
    StorageService,
    NotificationService,
    LoadingService,
    LayoutService,

    // Guards
    AuthGuard,
    RoleGuard,

    // Interceptors (ordre important)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only.'
      );
    }
  }
}
