import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isLogged(): boolean {
    return !!this.get();
  }
}
