import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  IonCheckbox,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personAddOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline
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
  // Form fields
  fullName: string = '';
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
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;
  fullNameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  constructor(private router: Router) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'person-add-outline': personAddOutline,
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline
    });
  }

  ngOnInit() {}

  /**
   * Go back to login
   */
  goBack() {
    this.router.navigate(['/login']);
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
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    this.isLoading = true;

    try {
      // Simulate API call
      await this.simulateRegister();

      // Navigate to login or home
      alert('¡Cuenta creada exitosamente!');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Register error:', error);
      alert('Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Simulate register API call
   */
  private simulateRegister(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    });
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
    this.router.navigate(['/login']);
  }
}
