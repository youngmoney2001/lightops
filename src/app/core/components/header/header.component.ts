import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  roles?: string[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  @Input() pageTitle = '';
  @Input() user: User | null = null;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  showUserMenu = false;
  showNotifications = false;
  showSearch = false;
  searchQuery = '';
  notificationsCount = 3; // À remplacer par un service
  unreadNotifications = 3;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Fermer les menus quand on clique ailleurs
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.user-menu') && !target.closest('.user-menu-button')) {
      this.showUserMenu = false;
    }

    if (!target.closest('.notifications-menu') && !target.closest('.notifications-button')) {
      this.showNotifications = false;
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implémenter la recherche
    }
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.showSearch = false;
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name
      .split(' ')
      .map(n => n[0])
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

  getPageSubtitle(): string {
    // Retourner un sous-titre basé sur le titre de la page
    const subtitleMap: { [key: string]: string } = {
      'Tableau de bord': 'Vue d\'ensemble de vos données',
      'Gestion des sites': 'Administration des sites',
      'Capteurs': 'Monitoring des équipements',
      'Animaux': 'Suivi du cheptel',
      'Monitoring': 'Surveillance en temps réel',
      'Rapports': 'Analyse et statistiques',
      'Paramètres': 'Configuration système',
      'Administration': 'Gestion avancée'
    };

    return subtitleMap[this.pageTitle] || 'Application LightOps';
  }

  getAvatarUrl(): string {
    if (this.user?.avatar) {
      return this.user.avatar;
    }
    // Générer une couleur basée sur l'ID utilisateur
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600',
      'bg-pink-600', 'bg-indigo-600', 'bg-teal-600'
    ];
    const colorIndex = this.user ? this.user.id % colors.length : 0;
    return colors[colorIndex];
  }

  markAllNotificationsAsRead(): void {
    this.unreadNotifications = 0;
    this.notificationService.showInfo('Toutes les notifications ont été marquées comme lues');
  }
}
