import { Component, Input, TemplateRef, ViewChild, ViewContainerRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-permission-gate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permission-gate.component.html',
  styleUrls: ['./permission-gate.component.css']
})
export class PermissionGateComponent implements OnInit {
  @Input() roles: string[] = [];
  @Input() permissions: string[] = [];
  @Input() fallbackTemplate?: TemplateRef<any>;

  @ViewChild('content', { read: ViewContainerRef }) contentContainer!: ViewContainerRef;
  @ViewChild('defaultTemplate', { read: TemplateRef }) defaultTemplate!: TemplateRef<any>;

  hasAccess = false;
  showDebugInfo = false;
  currentUserRoles: string[] = [];
  currentUserPermissions: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.checkAccess();
    this.loadDebugInfo();
  }

  private checkAccess(): void {
    let hasRoleAccess = true;
    let hasPermissionAccess = true;

    if (this.roles.length > 0) {
      hasRoleAccess = this.roles.some(role => this.authService.hasRole(role));
    }

    if (this.permissions.length > 0) {
      hasPermissionAccess = this.permissions.some(permission =>
        this.authService.hasPermission(permission)
      );
    }

    this.hasAccess = hasRoleAccess && hasPermissionAccess;
  }

  private loadDebugInfo(): void {
    // Load current user roles and permissions for debug display
    const user = this.authService.getCurrentUser();
    this.currentUserRoles = user?.roles || [];
    this.currentUserPermissions = user?.permissions || [];
  }

  getRoleBadgeClass(role: string): string {
    const roleClasses: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800',
      'manager': 'bg-blue-100 text-blue-800',
      'user': 'bg-green-100 text-green-800',
      'viewer': 'bg-gray-100 text-gray-800'
    };
    return roleClasses[role] || 'bg-gray-100 text-gray-800';
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'admin': 'Administrateur',
      'manager': 'Gestionnaire',
      'user': 'Utilisateur',
      'viewer': 'Observateur'
    };
    return roleNames[role] || role;
  }

  goToDashboard(): void {
    // Navigate to dashboard
    console.log('Navigate to dashboard');
  }

  contactSupport(): void {
    // Contact support
    console.log('Contact support');
  }

  ngOnChanges(): void {
    this.checkAccess();
  }
}
