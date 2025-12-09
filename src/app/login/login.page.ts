import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { FirebaseService } from '../services/firebase.service';
import { Preferences } from '@capacitor/preferences';
import { 
  IonContent, 
  IonInput, 
  IonIcon, 
  IonButton, 
  IonCheckbox,
  IonSpinner,
  ModalController,
  ToastController,
  MenuController
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

  constructor(
    private router: Router, 
    private modalController: ModalController,
    private userService: UserService,
    private firebaseService: FirebaseService,
    private toastController: ToastController,
    private menuController: MenuController
  ) {
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

  async ngOnInit() {
    // Cerrar el menú si está abierto
    await this.menuController.close();
    
    // Load remembered email if exists
    const result = await Preferences.get({ key: 'rememberedEmail' });
    if (result.value) {
      this.email = result.value;
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
      await this.showToast('Debes aceptar los términos y condiciones', 'warning');
      return;
    }

    this.regIsLoading = true;

    try {
      console.log('🔐 Registrando usuario con Firebase...');
      
      // Crear usuario en Firebase Auth y Realtime Database
      const newUser = await this.firebaseService.register(
        this.regEmail, 
        this.regPassword,
        {
          name: this.regFullName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(this.regFullName)}&background=random&size=256`,
          phone: '',
          balance: 1000.00,
          joinDate: new Date()
        }
      );

      console.log('✅ Usuario creado en Firebase:', newUser.email);

      // Actualizar UserService con el nuevo usuario
      await this.userService.setUser(newUser);
      console.log('✅ Usuario guardado en UserService');

      await this.showToast('¡Cuenta creada exitosamente! Bienvenido a Football Scoop', 'success');
      
      // Cerrar formulario de registro
      this.showRegister = false;
      this.regFullName = this.regEmail = this.regPassword = this.regConfirmPassword = '';
      this.regAcceptTerms = false;
      
      // Navegar a home
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('❌ Error al registrar usuario:', error);
      
      let errorMessage = 'Error al crear la cuenta. Intenta de nuevo.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este correo ya está registrado. Intenta iniciar sesión.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El correo electrónico no es válido.';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      await this.showToast(errorMessage, 'danger');
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
      console.log('🔐 Iniciando sesión con Firebase...');
      
      // Autenticar con Firebase
      const firebaseUser = await this.firebaseService.login(this.email, this.password);
      console.log('✅ Usuario autenticado:', firebaseUser.email);

      // Obtener datos del usuario desde Firebase Realtime Database
      const userData = await this.firebaseService.getUserById(firebaseUser.uid);
      
      if (userData) {
        // Actualizar UserService con los datos del usuario
        await this.userService.setUser(userData);
        console.log('✅ Usuario cargado:', userData.name);
      } else {
        console.warn('⚠️ Usuario no encontrado en base de datos');
      }

      // Save email if remember me is checked
      if (this.rememberMe) {
        await Preferences.set({ key: 'rememberedEmail', value: this.email });
      } else {
        await Preferences.remove({ key: 'rememberedEmail' });
      }

      await this.showToast(`¡Bienvenido de vuelta${userData ? ', ' + userData.name : ''}!`, 'success');
      
      // Navigate to home page
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('❌ Error de login:', error);
      
      let errorMessage = 'Credenciales incorrectas. Intenta de nuevo.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El correo electrónico no es válido.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta cuenta ha sido deshabilitada.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      this.passwordError = errorMessage;
      await this.showToast(errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
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

  /**
   * Show toast message
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}

