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
  IonSpinner
} from '@ionic/angular/standalone';
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

  constructor(private router: Router) {
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

  ngOnInit() {
    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
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
  onSignUp() {
    console.log('Sign up clicked');
    this.router.navigate(['/registrar']);
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
}

