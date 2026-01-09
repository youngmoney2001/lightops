import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    PageHeaderComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(SidebarComponent) sidebarComponent!: SidebarComponent;

  isSidebarCollapsed = false;
  isMobile = false;
  currentRoute = '';
  pageTitle = '';
  isLoading = false;
  showPageHeader = true;

  private routerSubscription!: Subscription;
  private loadingSubscription!: Subscription;
  private resizeSubscription!: Subscription;

  appName = 'LightOps';
  appVersion = environment.appVersion;
  user: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.checkMobile();
    this.subscribeToRouter();
    this.subscribeToLoading();
    this.getCurrentUser();

    // Écouter les changements de taille d'écran
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngAfterViewInit(): void {
    // Restaurer l'état du sidebar depuis localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isSidebarCollapsed = JSON.parse(savedState);
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  private subscribeToRouter(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
      this.updatePageTitle();
      this.updatePageHeaderVisibility();

      // Fermer le sidebar sur mobile après navigation
      if (this.isMobile && !this.isSidebarCollapsed) {
        this.toggleSidebar();
      }
    });
  }

  private subscribeToLoading(): void {
    this.loadingSubscription = this.loadingService.loading$
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  private getCurrentUser(): void {
    this.user = this.authService.getCurrentUser();
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }

  private onResize(): void {
    this.checkMobile();
  }

  private updatePageTitle(): void {
    const routes: { [key: string]: string } = {
      '/dashboard': 'Tableau de bord',
      '/sites': 'Gestion des sites',
      '/sensors': 'Capteurs',
      '/animals': 'Animaux',
      '/monitoring': 'Monitoring',
      '/reports': 'Rapports',
      '/settings': 'Paramètres',
      '/manager': 'Espace manager',
      '/admin': 'Administration'
    };

    // Trouver la route correspondante
    const route = Object.keys(routes).find(key =>
      this.currentRoute.startsWith(key)
    );

    this.pageTitle = route ? routes[route] : 'LightOps';
  }

  getPageDescription(): string {
    const descriptions: { [key: string]: string } = {
      '/dashboard': 'Vue d\'ensemble de vos données et métriques principales',
      '/sites': 'Gérer et surveiller vos sites de production',
      '/sensors': 'Configuration et monitoring des capteurs',
      '/animals': 'Suivi et gestion du cheptel',
      '/monitoring': 'Surveillance en temps réel des performances',
      '/reports': 'Génération et consultation des rapports',
      '/settings': 'Configuration de l\'application',
      '/manager': 'Outils de gestion avancés',
      '/admin': 'Administration système'
    };

    const route = Object.keys(descriptions).find(key =>
      this.currentRoute.startsWith(key)
    );

    return route ? descriptions[route] : 'Application de suivi et monitoring';
  }

  private updatePageHeaderVisibility(): void {
    // Routes où on ne veut pas afficher le PageHeader
    const hideHeaderRoutes = ['/settings/profile', '/settings/notifications'];
    this.showPageHeader = !hideHeaderRoutes.some(route =>
      this.currentRoute.includes(route)
    );
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;

    // Sauvegarder l'état
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isSidebarCollapsed));

    // Émettre un événement pour les autres composants
    window.dispatchEvent(new Event('sidebarToggled'));
  }

  onMobileOverlayClick(): void {
    if (this.isMobile && !this.isSidebarCollapsed) {
      this.toggleSidebar();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getUserRoleLabel(): string {
    if (!this.user?.roles) return 'Utilisateur';

    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'manager': 'Manager',
      'user': 'Utilisateur'
    };

    return roleMap[this.user.roles[0]] || 'Utilisateur';
  }

  isAuthRoute(): boolean {
    return this.currentRoute.startsWith('/auth');
  }
}
