import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonBadge, IonNote, IonItemSliding,
  IonItemOptions, IonItemOption, ModalController, IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  close, checkmarkDone, trash, notifications, 
  trophy, football, swapHorizontal, chatbubble, informationCircle, ellipse } from 'ionicons/icons';
import { NotificationService, Notification } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications-modal',
  templateUrl: './notifications-modal.component.html',
  styleUrls: ['./notifications-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonList, IonItem, IonLabel, IonBadge, IonNote, IonItemSliding,
    IonItemOptions, IonItemOption, IonAvatar
  ]
})
export class NotificationsModalComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  currentUserId: string | null = null;
  
  private notificationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  constructor(
    private modalController: ModalController,
    private notificationService: NotificationService,
    private userService: UserService
  ) {
    addIcons({close,notifications,checkmarkDone,trash,ellipse,trophy,football,'swapHorizontal':swapHorizontal,chatbubble,'informationCircle':informationCircle});
  }

  async ngOnInit() {
    // Obtener usuario actual
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
      
      // Cargar notificaciones del usuario
      await this.notificationService.getNotificationsForUser(currentUser.id);
      
      // Suscribirse a cambios en notificaciones
      this.notificationsSubscription = this.notificationService.notifications$.subscribe(
        notifications => {
          this.notifications = notifications;
        }
      );

      // Suscribirse a contador de no leídas
      this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
        count => {
          this.unreadCount = count;
        }
      );
    }
  }

  ngOnDestroy() {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }

  /**
   * Cerrar modal
   */
  closeModal() {
    this.modalController.dismiss();
  }

  /**
   * Manejar click en notificación
   */
  async onNotificationClick(notification: Notification) {
    if (!notification.read && this.currentUserId) {
      await this.notificationService.markAsRead(notification.id, this.currentUserId);
    }
    
    // Aquí puedes agregar navegación según el tipo de notificación
    console.log('Notificación clickeada:', notification);
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead() {
    if (this.currentUserId) {
      await this.notificationService.markAllAsRead(this.currentUserId);
    }
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notification: Notification, slidingItem: IonItemSliding) {
    if (this.currentUserId) {
      await this.notificationService.deleteNotification(notification.id, this.currentUserId);
      await slidingItem.close();
    }
  }

  /**
   * Limpiar todas las notificaciones
   */
  async clearAll() {
    if (this.currentUserId) {
      await this.notificationService.clearAllNotifications(this.currentUserId);
    }
  }

  /**
   * Obtener color según tipo de notificación
   */
  getNotificationColor(type: string): string {
    switch (type) {
      case 'bet': return 'success';
      case 'match': return 'primary';
      case 'transfer': return 'warning';
      case 'community': return 'tertiary';
      case 'system': return 'medium';
      default: return 'medium';
    }
  }

  /**
   * Formatear tiempo relativo
   */
  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} d`;
    
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }
}
