import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { NewsService, News } from '../services/news.service';
import { Subscription } from 'rxjs';
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
  MenuController,
  ModalController
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
  personCircleOutline,
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
  videocamOutline,
  cashOutline,
  shieldOutline,
  ribbonOutline
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
    IonFabList
  ],
})
export class HomePage implements OnInit, OnDestroy {
  // User data
  currentUser: User | null = null;
  isAuthenticated: boolean = false;
  private userSubscription?: Subscription;
  
  // Notificaciones
  unreadCount: number = 0;
  private unreadCountSubscription?: Subscription;
  notificationCount: number = 3;
  currentDate: Date = new Date();
  currentYear: number = new Date().getFullYear();
  
  // Flag para controlar inicialización
  private isInitialized = false;

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

  // Featured items (noticias)
  featuredItems: News[] = [];

  constructor(
    private router: Router,
    private menuController: MenuController,
    private userService: UserService,
    private notificationService: NotificationService,
    private modalController: ModalController,
    public newsService: NewsService
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
      'videocam-outline': videocamOutline,
      'cash-outline': cashOutline,
      'person-circle-outline': personCircleOutline,
      'shield-outline': shieldOutline,
      'ribbon-outline': ribbonOutline
    });
  }

  ngOnInit() {
    // Inicialización básica solamente
    console.log('🏠 HomePage: ngOnInit');
  }

  ionViewWillEnter() {
    // Esta función se ejecuta cada vez que la vista va a entrar
    console.log('🏠 HomePage: ionViewWillEnter');
    
    // Cerrar el menú al entrar
    this.menuController.close('main-menu');
    
    // Cargar datos del usuario solo si no está inicializado
    if (!this.isInitialized) {
      this.initializeData();
      this.isInitialized = true;
    } else {
      // Solo actualizar datos del usuario
      this.currentUser = this.userService.getCurrentUser();
      this.isAuthenticated = this.currentUser !== null;
    }
  }

  ionViewWillLeave() {
    // Esta función se ejecuta cada vez que la vista va a salir
    console.log('🏠 HomePage: ionViewWillLeave');
    // Cerrar el menú al salir
    this.menuController.close('main-menu');
  }

  private initializeData() {
    // Load user data from UserService
    this.currentUser = this.userService.getCurrentUser();
    this.isAuthenticated = this.currentUser !== null;
    
    // Cargar las últimas 3 noticias
    this.featuredItems = this.newsService.getLatestNews(3);
    
    // Limpiar suscripciones anteriores si existen
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
    
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = user !== null;
      
      // Cerrar menú cuando cambia el estado de autenticación
      if (user) {
        this.menuController.close('main-menu');
        this.loadNotifications(user.id);
      }
    });
    
    // Suscribirse al contador de notificaciones
    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      count => {
        this.unreadCount = count;
      }
    );
  }

  ngOnDestroy() {
    console.log('🏠 HomePage: ngOnDestroy');
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
    this.isInitialized = false;
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
   * Load user profile from localStorage
   */
  loadUserProfile() {
    // Ya no es necesario, se maneja con el servicio
    this.currentUser = this.userService.getCurrentUser();
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
    this.router.navigate(['/profile']);
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
   * Logout user and clear data
   */
  async logout() {
    await this.closeMenu();
    console.log('Logging out...');
    
    // Clear user data usando el servicio
    await this.userService.logout();
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  /**
   * Cargar notificaciones del usuario
   */
  async loadNotifications(userId: string) {
    await this.notificationService.getNotificationsForUser(userId);
  }

  /**
   * Abrir modal de notificaciones
   */
  async openNotifications() {
    const { NotificationsModalComponent } = await import('../notifications-modal/notifications-modal.component');
    
    const modal = await this.modalController.create({
      component: NotificationsModalComponent,
      cssClass: 'notifications-modal'
    });

    await modal.present();
  }

  /**
   * Generar notificaciones de prueba (solo para desarrollo)
   */
  async generateTestNotifications() {
    if (this.currentUser) {
      await this.notificationService.generateSampleNotifications(this.currentUser.id);
      console.log('✅ Notificaciones de prueba generadas');
    }
  }

  /**
   * Navigate to a specific page
   */
  async navigateToPage(page: string) {
    await this.closeMenu();
    this.router.navigate([page]);
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
