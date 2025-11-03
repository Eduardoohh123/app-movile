import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonButton, 
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  logoApple,
  checkmarkCircle,
  mailOutline,
  logoGoogle,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-apple',
  templateUrl: './apple.page.html',
  styleUrls: ['./apple.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonButton, 
    IonIcon,
    IonSpinner,
    CommonModule, 
    FormsModule
  ]
})
export class ApplePage implements OnInit {
  isLoading = false;

  constructor(private router: Router) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'logo-apple': logoApple,
      'checkmark-circle': checkmarkCircle,
      'mail-outline': mailOutline,
      'logo-google': logoGoogle,
      'shield-checkmark-outline': shieldCheckmarkOutline
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  async loginWithApple() {
    this.isLoading = true;

    // Simulación de proceso OAuth con Apple
    // TODO: Implementar Sign in with Apple real
    // Ejemplo: Apple JS SDK, Capacitor Apple Sign In Plugin, etc.
    
    setTimeout(() => {
      this.isLoading = false;
      
      // Simular éxito de autenticación
      // Guardar token/datos de usuario en localStorage o servicio
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authProvider', 'apple');
      localStorage.setItem('userEmail', 'usuario@privaterelay.appleid.com'); // Esto vendría del OAuth real
      
      // Navegar a home
      this.router.navigate(['/home']);
    }, 2000);
  }

  goToEmail() {
    this.router.navigate(['/login']);
  }

  goToGoogle() {
    this.router.navigate(['/google']);
  }

  showPrivacyPolicy(event: Event) {
    event.preventDefault();
    // TODO: Mostrar modal con política de privacidad de Apple
    console.log('Mostrar política de privacidad de Apple');
  }

}
