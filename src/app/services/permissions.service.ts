import { Injectable } from '@angular/core';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';

export interface PermissionStatus {
  granted: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(private alertController: AlertController) { }

  /**
   * Verificar y solicitar permisos de cámara
   */
  async checkCameraPermission(): Promise<PermissionStatus> {
    try {
      const permissions = await Camera.checkPermissions();
      
      if (permissions.camera === 'granted' || permissions.camera === 'limited') {
        return { granted: true };
      }

      if (permissions.camera === 'denied') {
        // Permiso denegado permanentemente
        await this.showPermissionDeniedAlert('Cámara', 'camera');
        return { granted: false, message: 'Permiso de cámara denegado' };
      }

      // Solicitar permiso
      const result = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
      
      if (result.camera === 'granted' || result.camera === 'limited') {
        return { granted: true };
      } else {
        return { granted: false, message: 'Permiso de cámara denegado' };
      }
    } catch (error) {
      console.error('Error al verificar permisos de cámara:', error);
      return { granted: false, message: 'Error al verificar permisos' };
    }
  }

  /**
   * Verificar y solicitar permisos de ubicación
   */
  async checkLocationPermission(): Promise<PermissionStatus> {
    try {
      const permissions = await Geolocation.checkPermissions();
      
      if (permissions.location === 'granted' || permissions.coarseLocation === 'granted') {
        return { granted: true };
      }

      if (permissions.location === 'denied') {
        // Permiso denegado permanentemente
        await this.showPermissionDeniedAlert('Ubicación', 'location');
        return { granted: false, message: 'Permiso de ubicación denegado' };
      }

      // Solicitar permiso
      const result = await Geolocation.requestPermissions();
      
      if (result.location === 'granted' || result.coarseLocation === 'granted') {
        return { granted: true };
      } else {
        return { granted: false, message: 'Permiso de ubicación denegado' };
      }
    } catch (error) {
      console.error('Error al verificar permisos de ubicación:', error);
      return { granted: false, message: 'Error al verificar permisos' };
    }
  }

  /**
   * Mostrar alerta cuando un permiso está denegado permanentemente
   */
  private async showPermissionDeniedAlert(permissionName: string, permissionType: 'camera' | 'location') {
    const alert = await this.alertController.create({
      header: `Permiso de ${permissionName} Denegado`,
      message: `Para usar esta función, necesitas habilitar el permiso de ${permissionName.toLowerCase()} en la configuración de la aplicación.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Abrir Configuración',
          handler: () => {
            this.openAppSettings();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Abrir la configuración de la aplicación
   */
  async openAppSettings() {
    try {
      // Mostrar instrucciones para abrir configuración manualmente
      const alert = await this.alertController.create({
        header: 'Configurar Permisos',
        message: 'Para usar esta función, necesitas habilitar los permisos:<br><br>' +
                 '<strong>Pasos:</strong><br>' +
                 '1. Ve a Configuración de tu dispositivo<br>' +
                 '2. Busca "Aplicaciones"<br>' +
                 '3. Selecciona "Football Scoop"<br>' +
                 '4. Toca en "Permisos"<br>' +
                 '5. Habilita Cámara y Ubicación',
        buttons: ['Entendido']
      });

      await alert.present();
    } catch (error) {
      console.error('Error al mostrar instrucciones:', error);
    }
  }

  /**
   * Verificar si un permiso está disponible
   */
  async isPermissionGranted(type: 'camera' | 'location'): Promise<boolean> {
    try {
      if (type === 'camera') {
        const permissions = await Camera.checkPermissions();
        return permissions.camera === 'granted' || permissions.camera === 'limited';
      } else {
        const permissions = await Geolocation.checkPermissions();
        return permissions.location === 'granted' || permissions.coarseLocation === 'granted';
      }
    } catch (error) {
      console.error(`Error al verificar permiso de ${type}:`, error);
      return false;
    }
  }
}
