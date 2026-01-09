import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | Date, format: 'short' | 'medium' | 'long' | 'relative' = 'medium'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;

    if (format === 'relative') {
      return this.getRelativeTime(date);
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? 'short' : 'long',
      day: 'numeric',
      hour: format !== 'short' ? '2-digit' : undefined,
      minute: format !== 'short' ? '2-digit' : undefined
    };

    return date.toLocaleDateString('fr-FR', options);
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'À l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHour < 24) return `Il y a ${diffHour} h`;
    if (diffDay === 1) return 'Hier';
    if (diffDay < 7) return `Il y a ${diffDay} jours`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
