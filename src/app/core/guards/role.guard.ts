import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requiredRoles = route.data['roles'] as Array<string>;
    const requiredPermissions = route.data['permissions'] as Array<string>;

    // Vérifier les rôles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some(role => this.authService.hasRole(role));
      if (!hasRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    // Vérifier les permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.some(permission =>
        this.authService.hasPermission(permission)
      );
      if (!hasPermission) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}
