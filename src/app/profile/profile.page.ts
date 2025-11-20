import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  isEditing = false;
  originalData: any = {};
  currentUser: User | null = null;

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
    private userService: UserService
  ) { }

  ngOnInit() {
    // Cargar datos del usuario desde UserService
    this.currentUser = this.userService.getCurrentUser();
    if (this.currentUser) {
      this.profileData = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone || '',
        birthdate: '',
        city: '',
        country: '',
        bio: '',
        avatar: this.currentUser.avatar
      };
    }
    this.originalData = { ...this.profileData };
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
      if (!this.isNativePlatform()) {
        this.selectPhotoFromFile();
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        this.profileData.avatar = image.dataUrl;
        this.saveToLocalStorage();
        this.showSuccessToast('Foto actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
    }
  }

  async selectFromGallery() {
    try {
      if (!this.isNativePlatform()) {
        this.selectPhotoFromFile();
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        this.profileData.avatar = image.dataUrl;
        this.saveToLocalStorage();
        this.showSuccessToast('Foto actualizada correctamente');
      }
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
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

  saveProfile() {
    if (!this.isEditing) return;

    // Validar datos antes de guardar
    if (!this.profileData.name || !this.profileData.email) {
      this.showErrorAlert('Por favor completa los campos obligatorios');
      return;
    }

    this.saveToLocalStorage();
    this.isEditing = false;
    this.originalData = { ...this.profileData };
    
    // Mostrar mensaje de éxito
    this.showSuccessToast('✅ Perfil guardado exitosamente');
  }

  saveToLocalStorage() {
    // Actualizar el usuario en el servicio centralizado
    if (this.currentUser) {
      this.userService.updateUser({
        name: this.profileData.name,
        email: this.profileData.email,
        phone: this.profileData.phone,
        avatar: this.profileData.avatar
      });
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
