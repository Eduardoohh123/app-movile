import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  IonCheckbox,
  IonSpinner,
  ModalController,
  ActionSheetController,
  ToastController
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FirebaseService } from '../services/firebase.service';
import { UserService, User } from '../services/user.service';
import { ApiService } from '../services/api.service';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personAddOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  cameraOutline,
  personCircleOutline,
  footballOutline,
  trophyOutline,
  flameOutline,
  imagesOutline,
  closeOutline,
  syncOutline,
  trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonInput,
    IonIcon,
    IonCheckbox,
    IonSpinner,
    CommonModule,
    FormsModule
  ]
})
export class RegistrarPage implements OnInit {
  @Input() inline: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  
  // Form fields
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptTerms: boolean = false;

  // Profile photo
  profilePhoto: string | null = null;
  photoPreviewUrl: string | null = null;

  // UI state
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  // Validation
  fullNameTouched: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;
  fullNameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  constructor(
    private router: Router, 
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private firebaseService: FirebaseService,
    private userService: UserService,
    private apiService: ApiService,
    private toastController: ToastController
  ) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'person-add-outline': personAddOutline,
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'camera-outline': cameraOutline,
      'person-circle-outline': personCircleOutline,
      'football-outline': footballOutline,
      'trophy-outline': trophyOutline,
      'flame-outline': flameOutline,
      'images-outline': imagesOutline,
      'close-outline': closeOutline,
      'sync-outline': syncOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {}

  /**
   * Go back to login
   */
  goBack() {
    if (this.inline) {
      this.modalController.dismiss();
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Toggle password visibility
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Validate full name
   */
  validateFullName() {
    this.fullNameTouched = true;
    this.fullNameError = '';

    if (!this.fullName) {
      this.fullNameError = 'El nombre completo es requerido';
      return false;
    }

    if (this.fullName.trim().length < 3) {
      this.fullNameError = 'El nombre debe tener al menos 3 caracteres';
      return false;
    }

    return true;
  }

  /**
   * Validate email format
   */
  validateEmail() {
    this.emailTouched = true;
    this.emailError = '';

    if (!this.email) {
      this.emailError = 'El correo electrónico es requerido';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Ingresa un correo electrónico válido';
      return false;
    }

    return true;
  }

  /**
   * Validate password
   */
  validatePassword() {
    this.passwordTouched = true;
    this.passwordError = '';

    if (!this.password) {
      this.passwordError = 'La contraseña es requerida';
      return false;
    }

    if (this.password.length < 6) {
      this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(this.password);
    const hasLowerCase = /[a-z]/.test(this.password);
    const hasNumbers = /\d/.test(this.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      this.passwordError = 'La contraseña debe contener mayúsculas, minúsculas y números';
      return false;
    }

    return true;
  }

  /**
   * Validate confirm password
   */
  validateConfirmPassword() {
    this.confirmPasswordTouched = true;
    this.confirmPasswordError = '';

    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirma tu contraseña';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Las contraseñas no coinciden';
      return false;
    }

    return true;
  }

  /**
   * Handle form submission
   */
  async onRegister() {
    // Validate all fields
    const isFullNameValid = this.validateFullName();
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    const isConfirmPasswordValid = this.validateConfirmPassword();

    if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!this.acceptTerms) {
      await this.showToast('Debes aceptar los términos y condiciones', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      console.log('🚀 Registrando usuario en PostgreSQL (Spring Boot)...');
      
      // Generar username desde el email o nombre
      const username = this.email.split('@')[0];
      
      // Preparar datos para Spring Boot
      const userData = {
        username: username,
        name: this.fullName,
        email: this.email,
        password: this.password
      };

      console.log('📤 Enviando datos:', userData);

      // Registrar usuario usando ApiService (PostgreSQL)
      const response = await this.apiService.registerUser(userData).toPromise();

      console.log('✅ Usuario registrado en PostgreSQL:', response);

      await this.showToast('¡Cuenta creada exitosamente! Ya puedes iniciar sesión', 'success');
      
      // Limpiar formulario
      this.fullName = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.acceptTerms = false;
      this.photoPreviewUrl = null;

      // Navegar a login
      if (this.inline) {
        this.modalController.dismiss();
      }
      this.router.navigate(['/login']);
      
    } catch (error: any) {
      console.error('❌ Error al crear la cuenta:', error);
      
      let errorMessage = 'Error al crear la cuenta. Intenta de nuevo.';
      
      // Mensajes de error específicos
      if (error.message) {
        if (error.message.includes('username') || error.message.includes('usuario')) {
          errorMessage = 'El nombre de usuario ya está en uso.';
        } else if (error.message.includes('email') || error.message.includes('correo')) {
          errorMessage = 'Este correo ya está registrado.';
        } else if (error.message.includes('Backend no disponible') || error.message.includes('Connection')) {
          errorMessage = 'No se puede conectar con el servidor. Verifica que Spring Boot esté corriendo.';
        } else {
          errorMessage = error.message;
        }
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Show toast message
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  /**
   * Show terms and conditions
   */
  showTerms(event: Event) {
    event.preventDefault();
    alert('Términos y condiciones:\n\n1. Uso responsable de la plataforma\n2. Protección de datos personales\n3. Políticas de privacidad');
  }

  /**
   * Go to login page
   */
  goToLogin() {
    if (this.inline) {
      this.modalController.dismiss();
    } else {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Take picture for profile photo
   */
  async takePicture() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Foto de Perfil',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera-outline',
          handler: () => {
            this.selectImageSource(CameraSource.Camera);
          }
        },
        {
          text: 'Elegir de Galería',
          icon: 'images-outline',
          handler: () => {
            this.selectImageSource(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  /**
   * Select image from camera or gallery
   */
  async selectImageSource(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: source,
        width: 400,
        height: 400,
        correctOrientation: true,
        presentationStyle: 'fullscreen'
      });

      if (image.base64String) {
        this.profilePhoto = image.base64String;
        this.photoPreviewUrl = `data:image/${image.format};base64,${image.base64String}`;
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
    }
  }

  /**
   * Remove profile photo
   */
  removePhoto() {
    this.profilePhoto = null;
    this.photoPreviewUrl = null;
  }

  /**
   * Change/update profile photo
   */
  changePhoto() {
    this.takePicture();
  }
}
