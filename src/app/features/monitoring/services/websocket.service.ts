import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../../../environments/environment';
import { Subject, interval, retryWhen, delay, takeUntil } from 'rxjs';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$!: WebSocketSubject<any>;
  private messagesSubject = new Subject<WebSocketMessage>();
  private reconnect$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.setupReconnection();
  }

  connect(): void {
    this.socket$ = webSocket({
      url: environment.websocketUrl || 'ws://localhost:8080/ws',
      openObserver: {
        next: () => {
          console.log('WebSocket connection established');
          this.authenticate();
        }
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket connection closed');
          this.scheduleReconnect();
        }
      }
    });

    this.socket$.subscribe({
      next: (message: WebSocketMessage) => this.messagesSubject.next(message),
      error: (error) => {
        console.error('WebSocket error:', error);
        this.scheduleReconnect();
      }
    });
  }

  private authenticate(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.send({
        type: 'auth',
        token: token
      });
    }
  }

  send(message: any): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(message);
    }
  }

  private scheduleReconnect(): void {
    this.reconnect$.next();
  }

  private setupReconnection(): void {
    this.reconnect$
      .pipe(
        delay(5000), // Wait 5 seconds before reconnecting
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.connect();
      });
  }

  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.socket$ && !this.socket$.closed) {
      this.socket$.complete();
    }
  }

  subscribeToChannel(channel: string): void {
    this.send({
      type: 'subscribe',
      channel: channel
    });
  }

  unsubscribeFromChannel(channel: string): void {
    this.send({
      type: 'unsubscribe',
      channel: channel
    });
  }
}
