import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';

/**
 * Interceptor HTTP funcional para standalone components
 * Maneja automáticamente tokens, loading y errores
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingController = inject(LoadingController);
  const toastController = inject(ToastController);
  
  let loading: HTMLIonLoadingElement | null = null;

  // Obtener token de autenticación
  const token = localStorage.getItem('auth_token');
  
  // Clonar request y añadir token si existe
  if (token && !req.headers.has('Authorization')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Mostrar loading (opcional, puedes comentar si no lo necesitas)
  const shouldShowLoading = !req.url.includes('/health') && !req.url.includes('/ping');
  
  if (shouldShowLoading) {
    loadingController.create({
      message: 'Cargando...',
      spinner: 'crescent',
      duration: 10000 // Timeout de 10 segundos
    }).then(l => {
      loading = l;
      loading.present();
    });
  }

  // Log de la petición en desarrollo
  if (!isProduction()) {
    console.log(`🔵 HTTP ${req.method}: ${req.url}`);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      handleError(error, toastController);
      return throwError(() => error);
    }),
    finalize(() => {
      // Ocultar loading
      if (loading) {
        loading.dismiss();
      }
    })
  );
};

/**
 * Maneja errores HTTP
 */
async function handleError(error: HttpErrorResponse, toastController: ToastController) {
  let message = 'Ha ocurrido un error';

  if (error.error instanceof ErrorEvent) {
    message = `Error: ${error.error.message}`;
  } else {
    switch (error.status) {
      case 0:
        message = 'No se pudo conectar con el servidor';
        break;
      case 400:
        message = error.error?.message || 'Solicitud incorrecta';
        break;
      case 401:
        message = 'Sesión expirada. Por favor, inicia sesión';
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

  // Mostrar toast
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: 'bottom',
    color: 'danger',
    buttons: [{
      text: 'Cerrar',
      role: 'cancel'
    }]
  });
  await toast.present();

  // Log en desarrollo
  if (!isProduction()) {
    console.error('🔴 HTTP Error:', error);
  }
}

/**
 * Verifica si está en producción
 */
function isProduction(): boolean {
  return false; // Cambiar según tu configuración
}
