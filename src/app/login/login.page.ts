import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { FirebaseService } from '../services/firebase.service';
import { ApiService } from '../services/api.service';
import { SupabaseService } from '../services/supabase.service';  // ⭐ AGREGADO
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
export class LoginPage implements OnInit, OnDestroy {
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
    private apiService: ApiService,
    private supabaseService: SupabaseService,  // ⭐ AGREGADO
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

    // Expose debug helper to window for quick testing from DevTools
    (window as any).debugSupabase = this.debugSupabase.bind(this);
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
    // Delegar el registro al backend Spring Boot para consistencia
    await this.registerInSpringBoot();
  }

  /**
   * Registrar usuario en Spring Boot backend
   * Esta función registra el usuario en la base de datos H2 del backend
   */
  async registerInSpringBoot() {
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
      console.log('🔐 Registrando usuario en Spring Boot...');
      
      // Preparar datos para Spring Boot
      const userData = {
        username: this.regEmail.split('@')[0], // Usar parte del email como username
        name: this.regFullName,
        email: this.regEmail,
        password: this.regPassword
      };

      // Registrar en Spring Boot usando ApiService
      const response = await this.apiService.registerUser(userData).toPromise();
      
      console.log('✅ Usuario registrado en Spring Boot:', response);
      console.log('✅ Datos enviados:', { ...userData, password: '***' });

      await this.showToast('¡Usuario registrado exitosamente en la base de datos!', 'success');

      // Cerrar formulario de registro
      this.showRegister = false;
      this.regFullName = this.regEmail = this.regPassword = this.regConfirmPassword = '';
      this.regAcceptTerms = false;
      
      // Opcionalmente navegar a home o mostrar login
      // this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('❌ Error al registrar en Spring Boot:', error);
      
      let errorMessage = 'Error al crear la cuenta en el servidor';
      if (error.message) {
        errorMessage = error.message;
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
   * Handle form submission - USANDO SUPABASE AUTH ⭐
   */
  async onLogin() {
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();

    if (!isEmailValid || !isPasswordValid) return;

    this.isLoading = true;

    // Verificar que el backend esté disponible antes de intentar login
    try {
      await this.apiService.checkConnection().toPromise();
    } catch (connErr) {
      this.isLoading = false;
      console.error('❌ Backend no disponible:', connErr);
      await this.showToast('No se pudo conectar con el servidor. Revisa la conexión, el firewall o WARP.', 'danger');
      return;
    }

    try {
      // Primero intentamos login contra Supabase directamente
      console.log('🔐 Probando conexión a Supabase...');
      const supaTest = await this.supabaseService.testAuthWithHeaders();

      if (supaTest.ok) {
        console.log('🔐 Iniciando sesión con Supabase');
        const { data, error } = await this.supabaseService.signIn(this.email, this.password);

        if (error) {
          // Error de Supabase (puede ser credenciales o net)
          console.error('❌ Supabase signIn error:', error);
          // Si parece un problema de conexión, fallback al backend
          const isNetworkError = String(error).toLowerCase().includes('network') || (error?.message && String(error.message).toLowerCase().includes('network'));
          if (isNetworkError) {
            console.warn('⚠️ Supabase no disponible, intentando login por backend...');
            const user = await this.userService.loginUser(this.email, this.password);
            await this.onSuccessfulLogin(user.name);
            return;
          }

          // Credenciales incorrectas u otro error de Supabase
          this.passwordError = error?.message || 'Error al iniciar sesión con Supabase';
          await this.showToast(this.passwordError, 'danger');
          return;
        }

        if (data?.user) {
          // Login correcto vía Supabase: crear perfil local si hace falta y navegar
          await Preferences.set({ key: 'rememberedEmail', value: this.rememberMe ? this.email : '' });
          await this.showToast(`¡Bienvenido de vuelta, ${data.user.email}!`, 'success');
          this.router.navigate(['/home']);
          return;
        }
      } else {
        console.warn('⚠️ Supabase no responde, fallback a backend');
        // Fallback: intentar login con el backend Spring Boot
        const user = await this.userService.loginUser(this.email, this.password);
        await this.onSuccessfulLogin(user.name);
        return;
      }
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);
      let message = 'Error al iniciar sesión. Intenta de nuevo.';
      if (error?.message) message = error.message;
      this.passwordError = message;
      await this.showToast(message, 'danger');
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
   * Método de diagnóstico: prueba la conectividad a Supabase y muestra un toast/console
   * Úsalo desde DevTools (Chrome): ng.getComponent(document.querySelector('app-login')).debugSupabase()
   */
  async debugSupabase() {
    // Ejecutar varias pruebas y mostrar resultados
    const c1 = await this.supabaseService.testConnectivity();
    const aNo = await this.supabaseService.testAuthWithoutHeaders();
    const aYes = await this.supabaseService.testAuthWithHeaders();
    const rYes = await this.supabaseService.testRestWithHeaders();

    console.log('🔧 Supabase tests:', { c1, aNo, aYes, rYes });

    const messages = [
      `root: ${c1.status ?? 'ERR'}`,
      `/auth w/o headers: ${aNo.status ?? 'ERR'}`,
      `/auth w/ headers: ${aYes.status ?? 'ERR'}`,
      `/rest w/ headers: ${rYes.status ?? 'ERR'}`
    ].join(' | ');

    const ok = (aYes.ok || rYes.ok);
    await this.showToast(`Supabase: ${ok ? 'OK' : 'FAIL'} — ${messages}`, ok ? 'success' : 'danger');
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

  /**
   * Centraliza acciones tras un login exitoso (backend fallback)
   */
  private async onSuccessfulLogin(name: string) {
    if (this.rememberMe) {
      await Preferences.set({ key: 'rememberedEmail', value: this.email });
    } else {
      await Preferences.remove({ key: 'rememberedEmail' });
    }

    await this.showToast(`¡Bienvenido de vuelta, ${name}!`, 'success');
    this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    // Clean up global helper
    try { delete (window as any).debugSupabase; } catch (e) { /* ignore */ }
  }
}

