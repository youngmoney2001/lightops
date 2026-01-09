import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LayoutConfig {
  sidebarCollapsed: boolean;
  showHeader: boolean;
  showFooter: boolean;
  pageTitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private configSubject = new BehaviorSubject<LayoutConfig>({
    sidebarCollapsed: false,
    showHeader: true,
    showFooter: true,
    pageTitle: 'Dashboard'
  });

  config$ = this.configSubject.asObservable();

  setSidebarCollapsed(collapsed: boolean): void {
    const config = this.configSubject.value;
    this.configSubject.next({ ...config, sidebarCollapsed: collapsed });
  }

  setPageTitle(title: string): void {
    const config = this.configSubject.value;
    this.configSubject.next({ ...config, pageTitle: title });
  }

  toggleSidebar(): void {
    const config = this.configSubject.value;
    this.configSubject.next({
      ...config,
      sidebarCollapsed: !config.sidebarCollapsed
    });
  }

  setHeaderVisibility(visible: boolean): void {
    const config = this.configSubject.value;
    this.configSubject.next({ ...config, showHeader: visible });
  }

  setFooterVisibility(visible: boolean): void {
    const config = this.configSubject.value;
    this.configSubject.next({ ...config, showFooter: visible });
  }
}
