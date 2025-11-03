import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
  IonAvatar,
  IonFab,
  IonFabButton,
  IonFabList,
  IonMenu,
  IonList,
  IonItem,
  IonLabel,
  MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  menuOutline,
  notificationsOutline,
  calendarOutline,
  trendingUpOutline,
  trendingDownOutline,
  arrowForwardOutline,
  chevronForwardOutline,
  timeOutline,
  starOutline,
  add,
  documentTextOutline,
  cameraOutline,
  checkmarkCircleOutline,
  logOutOutline,
  logInOutline,
  statsChartOutline,
  peopleOutline,
  cartOutline,
  heartOutline,
  addCircleOutline,
  cubeOutline,
  barChartOutline,
  settingsOutline,
  personAddOutline,
  alertCircleOutline,
  homeOutline,
  personOutline,
  folderOpenOutline,
  logoFacebook,
  logoTwitter,
  logoInstagram,
  logoLinkedin,
  logoGithub,
  footballOutline,
  trophyOutline,
  flameOutline,
  newspaperOutline,
  swapHorizontalOutline,
  megaphoneOutline,
  videocamOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonBadge,
    IonAvatar,
    IonFab,
    IonFabButton,
    IonFabList,
    IonMenu,
    IonList,
    IonItem,
    IonLabel
  ],
})
export class HomePage implements OnInit {
  // User data
  userName: string = 'Eduardo Johnson';
  userAvatar: string = 'https://i.pravatar.cc/150?img=12';
  notificationCount: number = 3;
  currentDate: Date = new Date();
  currentYear: number = new Date().getFullYear();

  // Stats data
  stats = [
    {
      icon: 'football-outline',
      value: '156',
      label: 'Partidos Hoy',
      trend: 12.5
    },
    {
      icon: 'trophy-outline',
      value: '24',
      label: 'Ligas Activas',
      trend: 8.3
    },
    {
      icon: 'flame-outline',
      value: '89K',
      label: 'Usuarios Activos',
      trend: 15.7
    },
    {
      icon: 'notifications-outline',
      value: '342',
      label: 'Noticias Hoy',
      trend: 5.1
    }
  ];

  // Quick actions
  quickActions = [
    {
      id: 'matches',
      icon: 'football-outline',
      label: 'Partidos en Vivo'
    },
    {
      id: 'standings',
      icon: 'trophy-outline',
      label: 'Clasificación'
    },
    {
      id: 'news',
      icon: 'newspaper-outline',
      label: 'Noticias'
    },
    {
      id: 'transfers',
      icon: 'swap-horizontal-outline',
      label: 'Fichajes'
    }
  ];

  // Recent activity
  recentActivity = [
    {
      id: 1,
      icon: 'football-outline',
      title: 'Real Madrid vs Barcelona',
      description: 'El Clásico - LaLiga EA Sports',
      time: 'En 2 horas'
    },
    {
      id: 2,
      icon: 'megaphone-outline',
      title: 'Fichaje bomba confirmado',
      description: 'Manchester City cierra el fichaje de la temporada',
      time: 'Hace 15 minutos'
    },
    {
      id: 3,
      icon: 'trophy-outline',
      title: 'Liverpool campeón',
      description: 'Los Reds ganan la Premier League 2024/25',
      time: 'Hace 1 hora'
    }
  ];

  // Featured items
  featuredItems = [
    {
      id: 1,
      title: 'Champions League: Semifinales Definidas',
      description: 'Los cuatro equipos que lucharán por la gloria europea están confirmados',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop',
      badge: 'En Vivo',
      badgeColor: 'danger',
      duration: 'Champions',
      rating: '⭐ Destacado'
    },
    {
      id: 2,
      title: 'Análisis: Los mejores goles de la jornada',
      description: 'Repasa las jugadas más espectaculares del fin de semana',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
      badge: 'Trending',
      badgeColor: 'warning',
      duration: 'Top 10',
      rating: '🔥 Popular'
    },
    {
      id: 3,
      title: 'Copa América: Se vienen los cuartos',
      description: 'Todo lo que necesitas saber sobre la fase eliminatoria',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop',
      badge: 'Próximamente',
      badgeColor: 'success',
      duration: 'Copa América',
      rating: '⚽ Imperdible'
    }
  ];

  constructor(
    private router: Router,
    private menuController: MenuController
  ) {
    // Register icons
    addIcons({
      'menu-outline': menuOutline,
      'notifications-outline': notificationsOutline,
      'calendar-outline': calendarOutline,
      'trending-up-outline': trendingUpOutline,
      'trending-down-outline': trendingDownOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'time-outline': timeOutline,
      'star-outline': starOutline,
      'add': add,
      'document-text-outline': documentTextOutline,
      'camera-outline': cameraOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'log-out-outline': logOutOutline,
      'log-in-outline': logInOutline,
      'stats-chart-outline': statsChartOutline,
      'people-outline': peopleOutline,
      'cart-outline': cartOutline,
      'heart-outline': heartOutline,
      'add-circle-outline': addCircleOutline,
      'cube-outline': cubeOutline,
      'bar-chart-outline': barChartOutline,
      'settings-outline': settingsOutline,
      'person-add-outline': personAddOutline,
      'alert-circle-outline': alertCircleOutline,
      'home-outline': homeOutline,
      'person-outline': personOutline,
      'folder-open-outline': folderOpenOutline,
      'logo-facebook': logoFacebook,
      'logo-twitter': logoTwitter,
      'logo-instagram': logoInstagram,
      'logo-linkedin': logoLinkedin,
      'logo-github': logoGithub,
      'football-outline': footballOutline,
      'trophy-outline': trophyOutline,
      'flame-outline': flameOutline,
      'newspaper-outline': newspaperOutline,
      'swap-horizontal-outline': swapHorizontalOutline,
      'megaphone-outline': megaphoneOutline,
      'videocam-outline': videocamOutline
    });
  }

  ngOnInit() {
    // Load user data from storage or API
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      this.userName = savedUserName;
    }
  }

  /**
   * Get personalized greeting based on time of day
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }

  /**
   * Open menu/sidebar
   */
  async openMenu() {
    await this.menuController.open();
  }

  /**
   * Close menu
   */
  async closeMenu() {
    await this.menuController.close();
  }

  /**
   * Handle content click to close menu
   */
  async onContentClick(event: Event) {
    const isMenuOpen = await this.menuController.isOpen();
    if (isMenuOpen) {
      await this.closeMenu();
    }
  }

  /**
   * Navigate to home (close menu)
   */
  async navigateToHome() {
    await this.closeMenu();
    // Already on home page
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.closeMenu();
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to profile/edit information
   */
  async navigateToProfile() {
    await this.closeMenu();
    console.log('Navigating to profile...');
    // TODO: Create profile page and navigate
    // this.router.navigate(['/profile']);
    alert('La página de perfil estará disponible próximamente');
  }

  /**
   * Navigate to projects
   */
  async navigateToProjects() {
    await this.closeMenu();
    console.log('Navigating to projects...');
    // TODO: Create projects page and navigate
    // this.router.navigate(['/projects']);
    alert('La página de proyectos estará disponible próximamente');
  }

  /**
   * Navigate to settings
   */
  async navigateToSettings() {
    await this.closeMenu();
    console.log('Navigating to settings...');
    // TODO: Create settings page and navigate
    // this.router.navigate(['/settings']);
    alert('La página de configuración estará disponible próximamente');
  }

  /**
   * Open notifications
   */
  openNotifications() {
    console.log('Notifications opened');
    // TODO: Navigate to notifications page
  }

  /**
   * Open user profile
   */
  async openProfile() {
    console.log('Profile opened');
    await this.navigateToProfile();
  }

  /**
   * View all actions
   */
  viewAllActions() {
    console.log('View all actions');
    // TODO: Navigate to actions page
  }

  /**
   * Handle quick action click
   */
  handleAction(actionId: string) {
    console.log('Action clicked:', actionId);
    // TODO: Navigate or perform action based on actionId
  }

  /**
   * View all activity
   */
  viewAllActivity() {
    console.log('View all activity');
    // TODO: Navigate to activity page
  }

  /**
   * Handle activity item click
   */
  handleActivity(activityId: number) {
    console.log('Activity clicked:', activityId);
    // TODO: Navigate to activity detail
  }

  /**
   * Open featured item
   */
  openFeatured(itemId: number) {
    console.log('Featured item opened:', itemId);
    // TODO: Navigate to featured item detail
  }

  /**
   * Open create menu
   */
  openCreateMenu() {
    console.log('Create menu opened');
  }

  /**
   * Create new item
   */
  createNew(type: string) {
    console.log('Create new:', type);
    // TODO: Navigate to create page based on type
  }

  /**
   * Logout user
   */
  async logout() {
    await this.closeMenu();
    console.log('Logging out...');
    // Clear user data
    localStorage.clear();
    // Navigate to login
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to a specific page
   */
  navigateToPage(page: string) {
    console.log('Navigating to:', page);
    // TODO: Implement navigation
    alert(`Navegando a: ${page}`);
  }

  /**
   * Open social media link
   */
  openSocialLink(platform: string) {
    console.log('Opening social link:', platform);
    const urls: { [key: string]: string } = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  }
}
