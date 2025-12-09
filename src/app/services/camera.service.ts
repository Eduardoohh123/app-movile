import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Platform } from '@ionic/angular/standalone';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
}

export interface CameraResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  
  // Mock images para entorno web
  private mockImages = [
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800',
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800'
  ];

  constructor(private platform: Platform) {}

  /**
   * Verifica si está en plataforma nativa (iOS/Android)
   */
  private isNativePlatform(): boolean {
    return this.platform.is('capacitor') && 
           (this.platform.is('ios') || this.platform.is('android'));
  }

  /**
   * Toma una foto usando la cámara
   */
  async takePicture(options?: CameraOptions): Promise<CameraResult> {
    try {
      // En navegador web, usar selector de archivos
      if (!this.isNativePlatform()) {
        return await this.selectPhotoFromFile('camera');
      }

      // En dispositivo nativo, usar Capacitor Camera
      const image = await Camera.getPhoto({
        quality: options?.quality || 90,
        allowEditing: options?.allowEditing !== undefined ? options.allowEditing : true,
        resultType: options?.resultType || CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return {
        success: true,
        dataUrl: image.dataUrl
      };
    } catch (error) {
      console.error('Error al tomar foto:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Selecciona una foto de la galería
   */
  async selectFromGallery(options?: CameraOptions): Promise<CameraResult> {
    try {
      // En navegador web, usar selector de archivos
      if (!this.isNativePlatform()) {
        return await this.selectPhotoFromFile('gallery');
      }

      // En dispositivo nativo, usar Capacitor Camera
      const image = await Camera.getPhoto({
        quality: options?.quality || 90,
        allowEditing: options?.allowEditing !== undefined ? options.allowEditing : true,
        resultType: options?.resultType || CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      return {
        success: true,
        dataUrl: image.dataUrl
      };
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Permite al usuario elegir entre cámara o galería
   */
  async selectPhoto(options?: CameraOptions): Promise<CameraResult> {
    try {
      // En navegador web, usar selector de archivos
      if (!this.isNativePlatform()) {
        return await this.selectPhotoFromFile('gallery');
      }

      // En dispositivo nativo, usar Capacitor Camera con prompt
      const image = await Camera.getPhoto({
        quality: options?.quality || 90,
        allowEditing: options?.allowEditing !== undefined ? options.allowEditing : true,
        resultType: options?.resultType || CameraResultType.DataUrl,
        source: CameraSource.Prompt // Permite elegir entre cámara y galería
      });

      return {
        success: true,
        dataUrl: image.dataUrl
      };
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Verifica si hay permisos de cámara
   */
  async checkPermissions(): Promise<boolean> {
    try {
      if (!this.isNativePlatform()) {
        return true; // En web no se necesitan permisos
      }

      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Solicita permisos de cámara
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isNativePlatform()) {
        return true;
      }

      const permissions = await Camera.requestPermissions({
        permissions: ['camera', 'photos']
      });

      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  /**
   * Obtiene una imagen mock aleatoria (para web)
   */
  private getRandomMockImage(): string {
    const randomIndex = Math.floor(Math.random() * this.mockImages.length);
    return this.mockImages[randomIndex];
  }

  /**
   * Obtiene mensaje de error legible
   */
  private getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }

    // Errores comunes de Capacitor Camera
    if (error === 'User cancelled photos app') {
      return 'Operación cancelada por el usuario';
    }

    if (error === 'No camera available') {
      return 'No hay cámara disponible';
    }

    if (error === 'Permission denied') {
      return 'Permisos de cámara denegados';
    }

    return 'Error desconocido al usar la cámara';
  }

  /**
   * Selector de archivos para navegador web
   */
  private selectPhotoFromFile(source: 'camera' | 'gallery'): Promise<CameraResult> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      // Si es cámara, intentar abrir la cámara del dispositivo directamente
      if (source === 'camera') {
        (input as any).capture = 'environment'; // Usar cámara trasera
      }
      
      input.onchange = (event: any) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            resolve({
              success: true,
              dataUrl: e.target.result
            });
          };
          reader.onerror = () => {
            resolve({
              success: false,
              error: 'Error al leer el archivo'
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({
            success: false,
            error: 'No se seleccionó ningún archivo'
          });
        }
      };
      
      input.oncancel = () => {
        resolve({
          success: false,
          error: 'Operación cancelada por el usuario'
        });
      };
      
      // Simular click en el input
      input.click();
    });
  }

  /**
   * Agrega una imagen mock personalizada
   */
  addMockImage(url: string): void {
    if (!this.mockImages.includes(url)) {
      this.mockImages.push(url);
    }
  }

  /**
   * Obtiene todas las imágenes mock disponibles
   */
  getMockImages(): string[] {
    return [...this.mockImages];
  }
}
