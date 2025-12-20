import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { 
  IonContent, 
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput, 
  IonIcon, 
  IonButton, 
  IonCheckbox,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  mailOutline, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-spring-register',
  templateUrl: './spring-register.page.html',
  styleUrls: ['./spring-register.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonIcon,
    IonButton,
    IonCheckbox,
    IonSpinner,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    CommonModule,
    FormsModule
  ]
})
export class SpringRegisterPage implements OnInit {
  // Form fields
  fullName: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptTerms: boolean = false;

  // UI state
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  // Validation
  fullNameTouched: boolean = false;
  usernameTouched: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;

  fullNameError: string = '';
  usernameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {
    addIcons({
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'checkmark-circle-outline': checkmarkCircleOutline
    });
  }

  ngOnInit() {
    console.log('📝 Página de registro Spring Boot inicializada');
  }

  // Validaciones
  validateFullName(): boolean {
    this.fullNameTouched = true;
    this.fullNameError = '';
    
    if (!this.fullName) {
      this.fullNameError = 'El nombre completo es requerido';
      return false;
    }
    
    if (this.fullName.length < 3) {
      this.fullNameError = 'El nombre debe tener al menos 3 caracteres';
      return false;
    }
    
    return true;
  }

  validateUsername(): boolean {
    this.usernameTouched = true;
    this.usernameError = '';
    
    if (!this.username) {
      this.usernameError = 'El nombre de usuario es requerido';
      return false;
    }
    
    if (this.username.length < 3) {
      this.usernameError = 'El usuario debe tener al menos 3 caracteres';
      return false;
    }
    
    return true;
  }

  validateEmail(): boolean {
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

  validatePassword(): boolean {
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
    
    return true;
  }

  validateConfirmPassword(): boolean {
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

  // Toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Submit registration
  async onRegister() {
    // Validar todos los campos
    const validName = this.validateFullName();
    const validUsername = this.validateUsername();
    const validEmail = this.validateEmail();
    const validPassword = this.validatePassword();
    const validConfirm = this.validateConfirmPassword();

    if (!validName || !validUsername || !validEmail || !validPassword || !validConfirm) {
      await this.showToast('Por favor, completa todos los campos correctamente', 'warning');
      return;
    }

    if (!this.acceptTerms) {
      await this.showToast('Debes aceptar los términos y condiciones', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      console.log('🔐 Registrando usuario en Spring Boot...');

      // Preparar datos para Spring Boot
      const userData = {
        username: this.username,
        name: this.fullName,
        email: this.email,
        password: this.password
      };

      // Registrar usuario usando ApiService
      const response = await this.apiService.registerUser(userData).toPromise();

      console.log('✅ Usuario registrado exitosamente:', response);

      await this.showToast('¡Usuario registrado exitosamente! Ya puedes iniciar sesión', 'success');

      // Limpiar formulario
      this.fullName = '';
      this.username = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.acceptTerms = false;

      // Navegar al login o home después de 1 segundo
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

    } catch (error: any) {
      console.error('❌ Error al registrar usuario:', error);

      let errorMessage = 'Error al crear la cuenta';
      if (error.message) {
        errorMessage = error.message;
      }

      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  // Mostrar toast
  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      icon: color === 'success' ? 'checkmark-circle-outline' : undefined
    });
    await toast.present();
  }

  // Navegar al login
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
