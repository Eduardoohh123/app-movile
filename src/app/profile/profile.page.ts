import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { CameraService } from '../services/camera.service';
import { PermissionsService } from '../services/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit, OnDestroy {

  isEditing = false;
  originalData: any = {};
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  profileData = {
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    city: '',
    country: '',
    bio: '',
    avatar: ''
  };

  defaultAvatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private userService: UserService,
    private cameraService: CameraService,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit() {
    // Suscribirse al observable del usuario para recibir actualizaciones
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileData = {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          birthdate: '',
          city: '',
          country: '',
          bio: '',
          avatar: user.avatar
        };
        this.originalData = { ...this.profileData };
      }
    });
  }

  ngOnDestroy() {
    // Limpiar suscripción para evitar memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async changePhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Foto de Perfil',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: 'Seleccionar de Galería',
          icon: 'images',
          handler: () => {
            this.selectFromGallery();
          }
        },
        {
          text: 'Ver Foto',
          icon: 'eye',
          handler: () => {
            this.viewPhoto();
          }
        },
        {
          text: 'Eliminar Foto',
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.deletePhoto();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async takePicture() {
    try {
      // Verificar permisos primero
      const permissionStatus = await this.permissionsService.checkCameraPermission();
      
      if (!permissionStatus.granted) {
        this.showErrorToast(permissionStatus.message || 'Permiso de cámara denegado');
        return;
      }

      const result = await this.cameraService.takePicture({
        quality: 90,
        allowEditing: true
      });

      if (result.success && result.dataUrl) {
        this.profileData.avatar = result.dataUrl;
        await this.saveToLocalStorage();
        this.showSuccessToast('Foto actualizada correctamente');
      } else if (result.error) {
        this.showErrorToast(result.error);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      this.showErrorToast('Error al tomar foto');
    }
  }

  async selectFromGallery() {
    try {
      // Verificar permisos primero
      const permissionStatus = await this.permissionsService.checkCameraPermission();
      
      if (!permissionStatus.granted) {
        this.showErrorToast(permissionStatus.message || 'Permiso de galería denegado');
        return;
      }

      const result = await this.cameraService.selectFromGallery({
        quality: 90,
        allowEditing: true
      });

      if (result.success && result.dataUrl) {
        this.profileData.avatar = result.dataUrl;
        await this.saveToLocalStorage();
        this.showSuccessToast('Foto actualizada correctamente');
      } else if (result.error) {
        this.showErrorToast(result.error);
      }
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      this.showErrorToast('Error al seleccionar foto');
    }
  }

  async viewPhoto() {
    const alert = await this.alertController.create({
      header: 'Foto de Perfil',
      message: `<img src="${this.profileData.avatar}" style="width: 100%; border-radius: 12px; margin-top: 10px;">`,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async deletePhoto() {
    const alert = await this.alertController.create({
      header: '¿Eliminar foto?',
      message: '¿Estás seguro de que deseas eliminar tu foto de perfil?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.profileData.avatar = this.defaultAvatar;
            this.saveToLocalStorage();
            this.showSuccessToast('Foto eliminada correctamente');
          }
        }
      ]
    });

    await alert.present();
  }

  // Método alternativo para web usando input file
  selectPhotoFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profileData.avatar = e.target.result;
          this.saveToLocalStorage();
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }

  // Detectar si es plataforma nativa
  isNativePlatform(): boolean {
    return (window as any).Capacitor?.isNativePlatform() || false;
  }

  toggleEdit() {
    if (this.isEditing) {
      // Cancelar edición - restaurar datos originales
      this.profileData = { ...this.originalData };
      this.isEditing = false;
    } else {
      // Activar modo edición
      this.originalData = { ...this.profileData };
      this.isEditing = true;
    }
  }

  async saveProfile() {
    if (!this.isEditing) return;

    // Validar datos antes de guardar
    if (!this.profileData.name || !this.profileData.email) {
      this.showErrorAlert('Por favor completa los campos obligatorios');
      return;
    }

    try {
      await this.saveToLocalStorage();
      this.isEditing = false;
      this.originalData = { ...this.profileData };
      
      // Mostrar mensaje de éxito
      this.showSuccessToast('✅ Perfil guardado exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar perfil:', error);
      this.showErrorAlert('Error al guardar el perfil. Por favor verifica tu conexión e intenta nuevamente.');
    }
  }

  async saveToLocalStorage() {
    // Actualizar el usuario en el servicio centralizado
    if (this.currentUser) {
      try {
        console.log('💾 Guardando perfil del usuario:', {
          name: this.profileData.name,
          email: this.profileData.email,
          hasAvatar: !!this.profileData.avatar,
          avatarLength: this.profileData.avatar?.length
        });
        
        await this.userService.updateUser({
          name: this.profileData.name,
          email: this.profileData.email,
          phone: this.profileData.phone,
          avatar: this.profileData.avatar
        });
        
        console.log('✅ Perfil guardado correctamente');
      } catch (error) {
        console.error('❌ Error al guardar perfil:', error);
        this.showErrorToast('Error al guardar el perfil. Por favor intenta nuevamente.');
        throw error;
      }
    } else {
      const errorMsg = 'No hay usuario actual para guardar';
      console.error('❌', errorMsg);
      this.showErrorToast(errorMsg);
      throw new Error(errorMsg);
    }
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

}
