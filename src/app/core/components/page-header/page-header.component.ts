import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() showBreadcrumb = true;
  @Input() actions: any[] = [];

  constructor(private router: Router) {}

  getBreadcrumbs(): { label: string; path?: string }[] {
    // Implémentez la logique de breadcrumb basée sur la route actuelle
    const route = this.router.url;
    const segments = route.split('/').filter(segment => segment);

    const breadcrumbs = [{ label: 'Tableau de bord', path: '/dashboard' }];

    segments.forEach((segment, index) => {
      if (segment !== 'dashboard') {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const label = this.formatSegment(segment);
        breadcrumbs.push({ label, path });
      }
    });

    return breadcrumbs;
  }

  private formatSegment(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
