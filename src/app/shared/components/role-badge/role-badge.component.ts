import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type UserRole = 'super-admin' | 'site-manager' | 'veterinary' | 'general-manager' | string;

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-badge.component.html',
  styleUrls: ['./role-badge.component.css']
})
export class RoleBadgeComponent {
  @Input() role: UserRole = 'site-manager';
  @Input() showIcon = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  roleConfig: { [key: string]: { label: string; color: string; icon: string } } = {
    'super-admin': {
      label: 'Super Admin',
      color: 'bg-role-super-admin text-yellow-900',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
    'site-manager': {
      label: 'Responsable Site',
      color: 'bg-role-site-manager text-blue-900',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    'veterinary': {
      label: 'Vétérinaire',
      color: 'bg-role-veterinary text-green-900',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    },
    'general-manager': {
      label: 'Responsable Général',
      color: 'bg-role-general-manager text-purple-900',
      icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2'
    }
  };

  get config() {
    return this.roleConfig[this.role] || this.roleConfig['site-manager'];
  }

  get sizeClasses() {
    return {
      'sm': 'px-2 py-0.5 text-xs',
      'md': 'px-3 py-1 text-sm',
      'lg': 'px-4 py-1.5 text-base'
    }[this.size];
  }

  showTooltip = false;

  showTooltipInfo(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showTooltip = !this.showTooltip;
  }

  getRoleDescription(role: UserRole): string {
    const descriptions: { [key: string]: string } = {
      'super-admin': 'Accès complet à toutes les fonctionnalités et paramètres système',
      'site-manager': 'Gestion complète d\'un site spécifique avec accès aux données et configurations',
      'veterinary': 'Accès aux fonctionnalités vétérinaires et suivi des animaux',
      'general-manager': 'Supervision générale avec accès à plusieurs sites et rapports globaux'
    };
    return descriptions[role] || 'Rôle utilisateur standard';
  }

  get iconSize() {
    return {
      'sm': 'h-3 w-3',
      'md': 'h-4 w-4',
      'lg': 'h-5 w-5'
    }[this.size];
  }
}
