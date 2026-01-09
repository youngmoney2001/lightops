import { Injectable } from '@angular/core';

export enum StorageType {
  Local = 'local',
  Session = 'session',
  Cookie = 'cookie'
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Méthodes pour localStorage
  setItem(key: string, value: any, storage: StorageType = StorageType.Local): void {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    switch (storage) {
      case StorageType.Local:
        localStorage.setItem(key, stringValue);
        break;
      case StorageType.Session:
        sessionStorage.setItem(key, stringValue);
        break;
      case StorageType.Cookie:
        this.setCookie(key, stringValue, 7); // 7 jours par défaut
        break;
    }
  }

  getItem<T = any>(key: string, storage: StorageType = StorageType.Local): T | null {
    let value: string | null = null;

    switch (storage) {
      case StorageType.Local:
        value = localStorage.getItem(key);
        break;
      case StorageType.Session:
        value = sessionStorage.getItem(key);
        break;
      case StorageType.Cookie:
        value = this.getCookie(key);
        break;
    }

    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  removeItem(key: string, storage: StorageType = StorageType.Local): void {
    switch (storage) {
      case StorageType.Local:
        localStorage.removeItem(key);
        break;
      case StorageType.Session:
        sessionStorage.removeItem(key);
        break;
      case StorageType.Cookie:
        this.deleteCookie(key);
        break;
    }
  }

  clear(storage: StorageType = StorageType.Local): void {
    switch (storage) {
      case StorageType.Local:
        localStorage.clear();
        break;
      case StorageType.Session:
        sessionStorage.clear();
        break;
      case StorageType.Cookie:
        // Pour les cookies, on ne peut pas tous les effacer facilement
        // On efface seulement ceux qu'on connaît
        break;
    }
  }

  // Méthodes pour les cookies
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length);
      }
    }
    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
  }

  // Stockage sécurisé pour les tokens
  setSecureItem(key: string, value: string): void {
    try {
      // Dans une application réelle, vous pourriez utiliser le chiffrement ici
      const encrypted = btoa(encodeURIComponent(value)); // Simple base64 pour l'exemple
      this.setItem(key, encrypted);
    } catch (error) {
      console.error('Error setting secure item:', error);
    }
  }

  getSecureItem(key: string): string | null {
    try {
      const encrypted = this.getItem<string>(key);
      if (!encrypted) return null;

      return decodeURIComponent(atob(encrypted));
    } catch (error) {
      console.error('Error getting secure item:', error);
      return null;
    }
  }
}
