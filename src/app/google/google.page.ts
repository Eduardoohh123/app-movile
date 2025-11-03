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
  logoGoogle,
  checkmarkCircle,
  mailOutline,
  logoApple,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-google',
  templateUrl: './google.page.html',
  styleUrls: ['./google.page.scss'],
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
export class GooglePage implements OnInit {
  isLoading = false;

  constructor(private router: Router) {
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'logo-google': logoGoogle,
      'checkmark-circle': checkmarkCircle,
      'mail-outline': mailOutline,
      'logo-apple': logoApple,
      'shield-checkmark-outline': shieldCheckmarkOutline
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  async loginWithGoogle() {
    this.isLoading = true;

    // Simulación de proceso OAuth
    // TODO: Implementar Google OAuth real
    // Ejemplo: Google Sign-In API, Firebase Auth, etc.
    
    setTimeout(() => {
      this.isLoading = false;
      
      // Simular éxito de autenticación
      // Guardar token/datos de usuario en localStorage o servicio
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authProvider', 'google');
      localStorage.setItem('userEmail', 'usuario@gmail.com'); // Esto vendría del OAuth real
      
      // Navegar a home
      this.router.navigate(['/home']);
    }, 2000);
  }

  goToEmail() {
    this.router.navigate(['/login']);
  }

  goToApple() {
    this.router.navigate(['/apple']);
  }

  showPrivacyPolicy(event: Event) {
    event.preventDefault();
    // TODO: Mostrar modal con política de privacidad
    console.log('Mostrar política de privacidad');
  }

}
