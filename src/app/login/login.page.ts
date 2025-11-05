import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonInput, 
  IonIcon, 
  IonButton, 
  IonCheckbox,
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { RegistrarPage } from '../registrar/registrar.page';
import { addIcons } from 'ionicons';
import { 
  mailOutline, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline,
  logoGoogle,
  logoApple,
  rocketOutline, footballOutline, trophyOutline, flameOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonInput, 
    IonIcon, 
    IonButton, 
    IonCheckbox,
    IonSpinner,
    CommonModule, 
    FormsModule
  ]
})
export class LoginPage implements OnInit {
  // Form fields
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  
  // UI state
  showPassword: boolean = false;
  isLoading: boolean = false;
  
  // Validation
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  emailError: string = '';
  passwordError: string = '';

  constructor(private router: Router, private modalController: ModalController) {
    // Register icons
    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'logo-google': logoGoogle,
      'logo-apple': logoApple,
      'rocket-outline': rocketOutline,
      'football-outline': footballOutline,
      'trophy-outline': trophyOutline,
      'flame-outline': flameOutline
    });
  }

  // Inline register toggle
  showRegister: boolean = false;

  // Inline register form fields and state
  regFullName: string = '';
  regEmail: string = '';
  regPassword: string = '';
  regConfirmPassword: string = '';
  regAcceptTerms: boolean = false;

  regShowPassword: boolean = false;
  regShowConfirmPassword: boolean = false;
  regIsLoading: boolean = false;

  regFullNameTouched: boolean = false;
  regEmailTouched: boolean = false;
  regPasswordTouched: boolean = false;
  regConfirmPasswordTouched: boolean = false;

  regFullNameError: string = '';
  regEmailError: string = '';
  regPasswordError: string = '';
  regConfirmPasswordError: string = '';

  ngOnInit() {
    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
    }
  }

  // --- Inline register helpers ---
  toggleRegPassword() {
    this.regShowPassword = !this.regShowPassword;
  }

  toggleRegConfirmPassword() {
    this.regShowConfirmPassword = !this.regShowConfirmPassword;
  }

  validateRegFullName() {
    this.regFullNameTouched = true;
    this.regFullNameError = '';
    if (!this.regFullName) {
      this.regFullNameError = 'El nombre completo es requerido';
      return false;
    }
    if (this.regFullName.trim().length < 3) {
      this.regFullNameError = 'El nombre debe tener al menos 3 caracteres';
      return false;
    }
    return true;
  }

  validateRegEmail() {
    this.regEmailTouched = true;
    this.regEmailError = '';
    if (!this.regEmail) {
      this.regEmailError = 'El correo electrónico es requerido';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.regEmail)) {
      this.regEmailError = 'Ingresa un correo electrónico válido';
      return false;
    }
    return true;
  }

  validateRegPassword() {
    this.regPasswordTouched = true;
    this.regPasswordError = '';
    if (!this.regPassword) {
      this.regPasswordError = 'La contraseña es requerida';
      return false;
    }
    if (this.regPassword.length < 6) {
      this.regPasswordError = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(this.regPassword);
    const hasLowerCase = /[a-z]/.test(this.regPassword);
    const hasNumbers = /\d/.test(this.regPassword);
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      this.regPasswordError = 'La contraseña debe contener mayúsculas, minúsculas y números';
      return false;
    }
    return true;
  }

  validateRegConfirmPassword() {
    this.regConfirmPasswordTouched = true;
    this.regConfirmPasswordError = '';
    if (!this.regConfirmPassword) {
      this.regConfirmPasswordError = 'Confirma tu contraseña';
      return false;
    }
    if (this.regPassword !== this.regConfirmPassword) {
      this.regConfirmPasswordError = 'Las contraseñas no coinciden';
      return false;
    }
    return true;
  }

  async onRegisterInline() {
    const vName = this.validateRegFullName();
    const vEmail = this.validateRegEmail();
    const vPass = this.validateRegPassword();
    const vConfirm = this.validateRegConfirmPassword();
    if (!vName || !vEmail || !vPass || !vConfirm) return;
    if (!this.regAcceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    this.regIsLoading = true;
    try {
      await new Promise((r) => setTimeout(r, 1200));
      alert('¡Cuenta creada exitosamente!');
      // close inline form and reset fields
      this.showRegister = false;
      this.regFullName = this.regEmail = this.regPassword = this.regConfirmPassword = '';
      this.regAcceptTerms = false;
    } catch (e) {
      console.error(e);
      alert('Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      this.regIsLoading = false;
    }
  }

  /**
   * Toggle password visibility
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
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

    return true;
  }

  /**
   * Handle form submission
   */
  async onLogin() {
    // Validate all fields
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    this.isLoading = true;

    try {
      // Simulate API call
      await this.simulateLogin();

      // Save email if remember me is checked
      if (this.rememberMe) {
        localStorage.setItem('rememberedEmail', this.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Navigate to home page
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Login error:', error);
      this.passwordError = 'Credenciales incorrectas. Intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Simulate login API call (replace with real API)
   */
  private simulateLogin(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success for demo purposes
        // Replace with actual authentication logic
        if (this.email && this.password) {
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1500);
    });
  }

  /**
   * Handle forgot password
   */
  onForgotPassword() {
    console.log('Forgot password clicked');
    // TODO: Navigate to forgot password page or show modal
    // this.router.navigate(['/forgot-password']);
  }

  /**
   * Handle sign up
   */
  async onSignUp() {
    console.log('Sign up clicked - opening modal');
    await this.openRegisterModal();
  }

  /**
   * Open register modal
   */
  async openRegisterModal() {
    const modal = await this.modalController.create({
      component: RegistrarPage,
      componentProps: {
        inline: true
      }
    });
    await modal.present();
  }

  /**
   * Handle Google login
   */
  async loginWithGoogle() {
    console.log('Login with Google clicked');
    this.router.navigate(['/google']);
  }

  /**
   * Handle Apple login
   */
  async loginWithApple() {
    console.log('Login with Apple clicked');
    this.router.navigate(['/apple']);
  }

  toggleRegister() {
    this.showRegister = !this.showRegister;
  }

  closeRegister() {
    this.showRegister = false;
  }
}

