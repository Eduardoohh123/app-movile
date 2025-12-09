import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { 
  IonMenu, IonHeader, IonToolbar, IonContent, 
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
  IonButton, IonAvatar, IonNote, IonListHeader,
  MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, newspaperOutline, footballOutline, peopleOutline,
  personOutline, settingsOutline, logOutOutline, trophyOutline,
  shieldOutline, cashOutline, logInOutline, personAddOutline,
  statsChartOutline, swapHorizontalOutline, podiumOutline, lockClosedOutline } from 'ionicons/icons';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonMenu, IonHeader, IonToolbar, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
    IonButton, IonAvatar, IonNote, IonListHeader
  ]
})
export class MenuComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;

  // Menú público (sin autenticación)
  publicMenuItems = [
    {
      title: 'Noticias',
      url: '/news',
      icon: 'newspaper-outline'
    },
    {
      title: 'Clasificaciones',
      url: '/standings',
      icon: 'podium-outline'
    },
    {
      title: 'Partidos',
      url: '/matches',
      icon: 'football-outline'
    }
  ];

  // Menú autenticado
  authenticatedMenuItems = [
    {
      title: 'Inicio',
      url: '/home',
      icon: 'home-outline'
    },
    {
      title: 'Mis Apuestas',
      url: '/bets',
      icon: 'cash-outline'
    },
    {
      title: 'Comunidad',
      url: '/community',
      icon: 'people-outline'
    },
    {
      title: 'Ligas',
      url: '/leagues',
      icon: 'trophy-outline'
    },
    {
      title: 'Equipos',
      url: '/teams',
      icon: 'shield-outline'
    },
    {
      title: 'Transferencias',
      url: '/transfers',
      icon: 'swap-horizontal-outline'
    },
    {
      title: 'Noticias',
      url: '/news',
      icon: 'newspaper-outline'
    },
    {
      title: 'Clasificaciones',
      url: '/standings',
      icon: 'podium-outline'
    },
    {
      title: 'Partidos',
      url: '/matches',
      icon: 'football-outline'
    }
  ];

  constructor(
    private userService: UserService,
    private router: Router,
    private menuController: MenuController
  ) {
    addIcons({cashOutline,personOutline,logInOutline,personAddOutline,statsChartOutline,logOutOutline,lockClosedOutline,homeOutline,newspaperOutline,footballOutline,peopleOutline,settingsOutline,trophyOutline,shieldOutline,swapHorizontalOutline,podiumOutline});
  }

  ngOnInit() {
    // Suscribirse a cambios en el usuario
    this.userService.user$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = this.checkAuthentication(user);
      console.log('👤 Estado de autenticación:', this.isAuthenticated);
    });
  }

  checkAuthentication(user: User | null): boolean {
    return user !== null && user.email !== 'usuario@example.com';
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  async goToLogin() {
    await this.menuController.close();
    this.router.navigate(['/login']);
  }

  async goToRegister() {
    await this.menuController.close();
    this.router.navigate(['/registrar']);
  }

  async logout() {
    await this.menuController.close();
    await this.userService.clearUser();
    this.router.navigate(['/login']);
    console.log('👋 Sesión cerrada');
  }
}
