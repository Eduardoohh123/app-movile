import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoadingController, ToastController } from '@ionic/angular';

/**
 * Interceptor HTTP para manejar automáticamente:
 * - Tokens de autenticación
 * - Loading indicators
 * - Manejo global de errores
 * - Logging de peticiones
 */
@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  private requestsInProgress = 0;
  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Incrementar contador de peticiones
    this.requestsInProgress++;
    
    // Mostrar loading solo si es necesario
    if (this.requestsInProgress === 1 && this.shouldShowLoading(request)) {
      this.showLoading();
    }

    // Añadir token de autenticación si existe
    const token = this.getAuthToken();
    if (token && !request.headers.has('Authorization')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Log de la petición (solo en desarrollo)
    if (!this.isProduction()) {
      console.log(`🔵 HTTP Request: ${request.method} ${request.url}`, request.body);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      }),
      finalize(() => {
        // Decrementar contador y ocultar loading si es necesario
        this.requestsInProgress--;
        if (this.requestsInProgress === 0) {
          this.hideLoading();
        }
      })
    );
  }

  /**
   * Obtiene el token de autenticación
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Determina si se debe mostrar el loading indicator
   */
  private shouldShowLoading(request: HttpRequest<any>): boolean {
    // No mostrar loading para peticiones específicas
    const skipLoadingUrls = ['/health', '/ping'];
    return !skipLoadingUrls.some(url => request.url.includes(url));
  }

  /**
   * Muestra el loading indicator
   */
  private async showLoading() {
    this.loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'crescent'
    });
    await this.loading.present();
  }

  /**
   * Oculta el loading indicator
   */
  private async hideLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  /**
   * Maneja errores HTTP globalmente
   */
  private async handleError(error: HttpErrorResponse) {
    let message = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      message = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 0:
          message = 'No se pudo conectar con el servidor';
          break;
        case 400:
          message = error.error?.message || 'Solicitud incorrecta';
          break;
        case 401:
          message = 'Sesión expirada. Por favor, inicia sesión nuevamente';
          // Aquí podrías redirigir al login
          break;
        case 403:
          message = 'No tienes permisos para esta acción';
          break;
        case 404:
          message = 'Recurso no encontrado';
          break;
        case 500:
          message = 'Error del servidor';
          break;
        case 503:
          message = 'Servicio no disponible';
          break;
        default:
          message = error.error?.message || `Error: ${error.status}`;
      }
    }

    // Mostrar toast con el error
    await this.showToast(message, 'danger');

    // Log del error (solo en desarrollo)
    if (!this.isProduction()) {
      console.error('🔴 HTTP Error:', error);
    }
  }

  /**
   * Muestra un toast con un mensaje
   */
  private async showToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Verifica si está en modo producción
   */
  private isProduction(): boolean {
    // Importar environment dinámicamente o usar una variable global
    return false; // Cambiar según tu configuración
  }
}
