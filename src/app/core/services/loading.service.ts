import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private loadingMessages: string[] = [];
  private messageSubject = new BehaviorSubject<string>('');
  public message$ = this.messageSubject.asObservable();

  private loadingCount = 0;

  setLoading(isLoading: boolean, message: string = ''): void {
    if (isLoading) {
      this.loadingCount++;
      this.loadingSubject.next(true);

      if (message) {
        this.loadingMessages.push(message);
        this.messageSubject.next(message);
      }
    } else {
      this.loadingCount = Math.max(0, this.loadingCount - 1);

      if (message && this.loadingMessages.includes(message)) {
        this.loadingMessages = this.loadingMessages.filter(m => m !== message);
      }

      if (this.loadingCount === 0) {
        this.loadingSubject.next(false);
        this.loadingMessages = [];
        this.messageSubject.next('');
      } else if (this.loadingMessages.length > 0) {
        this.messageSubject.next(this.loadingMessages[this.loadingMessages.length - 1]);
      }
    }
  }

  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentMessage(): string {
    return this.messageSubject.value;
  }
}
