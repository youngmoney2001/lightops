import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// COMPOSANTS DU DESIGN SYSTEM (standalone)
import { RoleBadgeComponent } from './components/role-badge/role-badge.component';
import { SensorStatusComponent } from './components/sensor-status/sensor-status.component';
import { DataCardComponent } from './components/data-card/data-card.component';
import { LoadingSkeletonComponent } from './components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { PermissionGateComponent } from './components/permission-gate/permission-gate.component';

// COMPOSANTS PARTAGÉS EXISTANTS (à créer)
// import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
// import { ErrorMessageComponent } from './components/error-message/error-message.component';
// import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
// import { SearchInputComponent } from './components/search-input/search-input.component';
// import { PaginationComponent } from './components/pagination/pagination.component';
// import { TableComponent } from './components/table/table.component';
// import { FilterDropdownComponent } from './components/filter-dropdown/filter-dropdown.component';
// import { StatusBadgeComponent } from './components/status-badge/status-badge.component';

// DIRECTIVES
// import { ClickOutsideDirective } from './directives/click-outside.directive';
// import { TooltipDirective } from './directives/tooltip.directive';
// import { CopyToClipboardDirective } from './directives/copy-to-clipboard.directive';

// PIPES
// import { FormatDatePipe } from './pipes/format-date.pipe';
// import { TruncatePipe } from './pipes/truncate.pipe';
// import { SafeHtmlPipe } from './pipes/safe-html.pipe';
// import { FilterByPropertyPipe } from './pipes/filter-by-property.pipe';
// import { SortByPipe } from './pipes/sort-by-property.pipe';

@NgModule({
  declarations: [
    // Composants déclarés (non standalone)
    // LoadingSpinnerComponent,
    // ErrorMessageComponent,
    // ConfirmModalComponent,
    // SearchInputComponent,
    // PaginationComponent,
    // TableComponent,
    // FilterDropdownComponent,
    // StatusBadgeComponent,

    // Directives
    // ClickOutsideDirective,
    // TooltipDirective,
    // CopyToClipboardDirective,

    // Pipes
    // FormatDatePipe,
    // TruncatePipe,
    // SafeHtmlPipe,
    // FilterByPropertyPipe,
    // SortByPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Import des composants standalone du Design System
    RoleBadgeComponent,
    SensorStatusComponent,
    DataCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    PermissionGateComponent
  ],
  exports: [
    // Modules Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Composants du Design System (standalone)
    RoleBadgeComponent,
    SensorStatusComponent,
    DataCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    PermissionGateComponent,

    // Composants partagés existants
    // LoadingSpinnerComponent,
    // ErrorMessageComponent,
    // ConfirmModalComponent,
    // SearchInputComponent,
    // PaginationComponent,
    // TableComponent,
    // FilterDropdownComponent,
    // StatusBadgeComponent,

    // Directives
    // ClickOutsideDirective,
    // TooltipDirective,
    // CopyToClipboardDirective,

    // Pipes
    // FormatDatePipe,
    // TruncatePipe,
    // SafeHtmlPipe,
    // FilterByPropertyPipe,
    // SortByPipe
  ]
})
export class SharedModule { }
