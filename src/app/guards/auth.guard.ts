import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  const currentUser = userService.getCurrentUser();
  
  if (currentUser && currentUser.email !== 'usuario@example.com') {
    // Usuario autenticado
    return true;
  }
  
  // Redirigir a login si no está autenticado
  console.log('🚫 Acceso denegado - Redirigiendo a login');
  router.navigate(['/login']);
  return false;
};

/**
 * Guard para rutas públicas (solo accesibles sin autenticación)
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  
  const currentUser = userService.getCurrentUser();
  
  if (!currentUser || currentUser.email === 'usuario@example.com') {
    // No autenticado o usuario por defecto
    return true;
  }
  
  // Ya está autenticado, redirigir a home
  console.log('✅ Usuario ya autenticado - Redirigiendo a home');
  router.navigate(['/home']);
  return false;
};
