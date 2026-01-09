import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  showCancel?: boolean;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
  @Input() config: ConfirmModalConfig = {
    title: 'Confirmation',
    message: 'Êtes-vous sûr de vouloir effectuer cette action ?',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    type: 'danger',
    showCancel: true
  };

  @Input() isOpen = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  get buttonColor(): string {
    const colors = {
      'danger': 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      'warning': 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      'info': 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    };
    return colors[this.config.type || 'danger'];
  }

  onConfirm(): void {
    this.confirm.emit();
    this.closeModal();
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}
