import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.css']
})
export class SearchInputComponent {
  @Input() placeholder = 'Rechercher...';
  @Input() value = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() debounceTime = 300;

  // Propriétés optionnelles pour les fonctionnalités avancées
  @Input() isSearching = false;
  @Input() showResultsCount = false;
  @Input() resultsCount?: number;
  @Input() enableVoiceSearch = false;
  @Input() isListening = false;
  @Input() showSuggestions = false;
  @Input() suggestions: string[] = [];

  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() voiceSearchStart = new EventEmitter<void>();
  @Output() voiceSearchStop = new EventEmitter<void>();
  @Output() suggestionSelected = new EventEmitter<string>();

  private debounceTimer: any;

  get sizeClasses(): string {
    const sizes = {
      'sm': 'px-3 py-1.5 text-sm',
      'md': 'px-4 py-2.5 text-sm',
      'lg': 'px-4 py-3 text-base'
    };
    return sizes[this.size];
  }

  onInput(value: string): void {
    // Mettre à jour la valeur locale pour la liaison bidirectionnelle
    this.value = value;
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.search.emit(value);
    }, this.debounceTime);
  }

  onClear(): void {
    this.value = '';
    this.clear.emit();
    this.search.emit('');
  }

  // Méthodes pour la recherche vocale
  startVoiceSearch(): void {
    if (!this.disabled && this.enableVoiceSearch) {
      this.voiceSearchStart.emit();
    }
  }

  stopVoiceSearch(): void {
    this.voiceSearchStop.emit();
  }

  // Méthode pour sélectionner une suggestion
  selectSuggestion(suggestion: string): void {
    this.value = suggestion;
    this.suggestionSelected.emit(suggestion);
    this.search.emit(suggestion);
  }
}
