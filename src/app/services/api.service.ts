import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Servicio base para comunicación con el backend Spring Boot
 * Maneja todas las peticiones HTTP, headers, errores y tokens de autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private readonly REQUEST_TIMEOUT = 30000; // 30 segundos

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los headers HTTP con autenticación
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Si tienes token de autenticación, añádelo aquí
    const token = this.getAuthToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Obtiene el token de autenticación (implementar según tu lógica)
   */
  private getAuthToken(): string | null {
    // Aquí deberías obtener el token desde donde lo guardes (localStorage, Capacitor Preferences, etc.)
    return localStorage.getItem('auth_token');
  }

  /**
   * Guarda el token de autenticación
   */
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Elimina el token de autenticación
   */
  clearAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * Petición GET
   * @param endpoint - Ruta del endpoint (ej: '/users', '/news')
   * @param params - Parámetros de query opcionales
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(url, { 
      headers: this.getHeaders(),
      params: httpParams 
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Petición POST
   * @param endpoint - Ruta del endpoint
   * @param body - Datos a enviar
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.post<T>(url, body, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Petición PUT
   * @param endpoint - Ruta del endpoint
   * @param body - Datos a actualizar
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.put<T>(url, body, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Petición PATCH
   * @param endpoint - Ruta del endpoint
   * @param body - Datos parciales a actualizar
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.patch<T>(url, body, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Petición DELETE
   * @param endpoint - Ruta del endpoint
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.delete<T>(url, { 
      headers: this.getHeaders() 
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Upload de archivos (multipart/form-data)
   * @param endpoint - Ruta del endpoint
   * @param formData - FormData con los archivos
   */
  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    
    // Para upload no enviamos Content-Type, el navegador lo configura automáticamente
    let headers = new HttpHeaders();
    const token = this.getAuthToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<T>(url, formData, { 
      headers 
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(this.handleError)
    );
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          break;
        case 401:
          errorMessage = error.error?.message || 'No autorizado. Por favor, inicia sesión nuevamente.';
          // Aquí podrías redirigir al login
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta de nuevo más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible. Intenta de nuevo más tarde.';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en petición HTTP:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Verifica si el backend está disponible
   */
  checkConnection(): Observable<boolean> {
    // Usar endpoint existente en el backend: /health/status o /health/ping
    return this.http.get(`${this.apiUrl}/health/status`, { 
      headers: this.getHeaders(),
      observe: 'response' 
    }).pipe(
      timeout(5000),
      map(() => true),
      catchError((err) => {
        // Loguear error y devolver un mensaje descriptivo para la UI
        console.warn('Backend no disponible o endpoint de salud no responde', err?.status);
        return throwError(() => new Error('Backend no disponible'));
      })
    );
  }

  // ============================================
  // MÉTODOS PARA USUARIOS (Spring Boot Backend)
  // ============================================

  /**
   * Registrar un nuevo usuario en Spring Boot
   * @param user - Datos del usuario {username, name, email, password}
   */
  registerUser(user: { username: string; name: string; email: string; password: string }): Observable<any> {
    return this.post('/test/users/register', user);
  }

  /**
   * Login de usuario - Usa Supabase Auth directamente
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   */
  loginUser(email: string, password: string): Observable<any> {
    // Importa SupabaseService en el constructor si aún no lo has hecho
    console.warn('loginUser debe usar SupabaseService.signIn() en lugar del API');
    return this.post('/test/users/login', { email, password });
  }

  /**
   * Obtener todos los usuarios (para panel de administración)
   */
  getAllUsers(): Observable<any[]> {
    return this.get('/users');
  }

  /**
   * Obtener información de un usuario por ID
   * @param id - ID del usuario
   */
  getUserById(id: number): Observable<any> {
    return this.get(`/users/${id}`);
  }

  /**
   * Crear un nuevo usuario (panel de administración)
   * Usa el mismo endpoint de registro
   * @param user - Datos del usuario {username, name, email, password, role}
   */
  createUser(user: any): Observable<any> {
    return this.registerUser(user);
  }

  /**
   * Actualizar información de un usuario
   * @param id - ID del usuario
   * @param user - Datos a actualizar
   */
  updateUser(id: number, user: any): Observable<any> {
    return this.put(`/users/${id}`, user);
  }

  /**
   * Eliminar un usuario
   * @param id - ID del usuario
   */
  deleteUser(id: number): Observable<any> {
    return this.delete(`/users/${id}`);
  }

  /**
   * Buscar usuarios por texto
   * @param query - Texto de búsqueda
   */
  searchUsers(query: string): Observable<any[]> {
    return this.get('/users/search', { q: query });
  }

  // ============================================
  // MÉTODOS PARA ANIMES (Spring Boot Backend)
  // ============================================

  /**
   * Obtener lista de animes
   */
  getAnimes(): Observable<any[]> {
    return this.get('/anime');
  }

  /**
   * Obtener un anime por ID
   * @param id - ID del anime
   */
  getAnimeById(id: number): Observable<any> {
    return this.get(`/anime/${id}`);
  }

  /**
   * Buscar animes por título
   * @param query - Texto de búsqueda
   */
  searchAnimes(query: string): Observable<any[]> {
    return this.get('/anime/search', { q: query });
  }

  // ============================================
  // MÉTODOS PARA GAMES (Spring Boot Backend)
  // ============================================

  /**
   * Obtener lista de juegos
   */
  getGames(): Observable<any[]> {
    return this.get('/games');
  }

  /**
   * Obtener un juego por ID
   * @param id - ID del juego
   */
  getGameById(id: number): Observable<any> {
    return this.get(`/games/${id}`);
  }
}
