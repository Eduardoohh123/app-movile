import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface HealthStatus {
  application: string;
  status: string;
  timestamp: number;
}

export interface DatabaseStatus {
  database: string;
  status: string;
  url: string;
  username: string;
  databaseProductName: string;
  databaseProductVersion: string;
  timestamp: number;
}

export interface Stats {
  users: number;
  animes: number;
  categories: number;
  games: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {

  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  /**
   * Verificar estado de la aplicación
   */
  checkStatus(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.apiUrl}/health/status`);
  }

  /**
   * Verificar conexión con la base de datos
   */
  checkDatabase(): Observable<DatabaseStatus> {
    return this.http.get<DatabaseStatus>(`${this.apiUrl}/health/database`);
  }

  /**
   * Ping simple
   */
  ping(): Observable<string> {
    return this.http.get(`${this.apiUrl}/health/ping`, { responseType: 'text' });
  }

  /**
   * Obtener estadísticas
   */
  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/test/stats`);
  }

  /**
   * Insertar datos de prueba
   */
  seedTestData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/test/seed`, {});
  }
}
