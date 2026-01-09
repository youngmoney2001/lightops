import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpResponse,
  HttpEventType
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  meta?: {
    current_page?: number;
    from?: number;
    last_page?: number;
    per_page?: number;
    to?: number;
    total?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  // ------------------- Méthodes HTTP -------------------

  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, {
      params: this.buildHttpParams(params)
    }) as unknown as Observable<ApiResponse<T>>;
  }

  post<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data, options) as unknown as Observable<ApiResponse<T>>;
  }

  put<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data, options) as unknown as Observable<ApiResponse<T>>;
  }

  patch<T>(endpoint: string, data: any, options?: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, data, options) as unknown as Observable<ApiResponse<T>>;
  }

  delete<T>(endpoint: string, options?: any): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, options) as unknown as Observable<ApiResponse<T>>;
  }

  // ------------------- Upload / Download -------------------

  uploadFile<T = any>(endpoint: string, file: File, fieldName: string = 'file'): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter(event => event.type === HttpEventType.Response),
      map((event: any) => event.body)
    );
  }

  downloadFile(endpoint: string, params?: any): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      params: this.buildHttpParams(params),
      responseType: 'blob'
    });
  }

  // ------------------- WebSocket / Pusher -------------------

  getWebSocketConfig(): Observable<ApiResponse> {
    return this.get('websocket/channels');
  }
}
