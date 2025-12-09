import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'bet' | 'match' | 'transfer' | 'community' | 'system';
  icon: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly NOTIFICATIONS_KEY = 'user_notifications';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  constructor() {
    this.initializeNotifications();
  }

  /**
   * Inicializar notificaciones desde Preferences
   */
  private async initializeNotifications(): Promise<void> {
    await this.loadNotifications();
  }

  /**
   * Cargar notificaciones del usuario actual
   */
  private async loadNotifications(userId?: string): Promise<void> {
    try {
      const result = await Preferences.get({ key: this.NOTIFICATIONS_KEY });
      if (!result.value) {
        this.notificationsSubject.next([]);
        this.updateUnreadCount([]);
        return;
      }

      const allNotifications: Notification[] = JSON.parse(result.value);
      
      // Convertir timestamps a Date
      allNotifications.forEach(n => {
        if (n.timestamp) {
          n.timestamp = new Date(n.timestamp);
        }
      });

      // Filtrar por usuario si se proporciona
      const userNotifications = userId 
        ? allNotifications.filter(n => n.userId === userId)
        : allNotifications;

      // Ordenar por fecha (más reciente primero)
      userNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      this.notificationsSubject.next(userNotifications);
      this.updateUnreadCount(userNotifications);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      this.notificationsSubject.next([]);
      this.updateUnreadCount([]);
    }
  }

  /**
   * Guardar todas las notificaciones en Preferences
   */
  private async saveNotifications(notifications: Notification[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.NOTIFICATIONS_KEY,
        value: JSON.stringify(notifications)
      });
    } catch (error) {
      console.error('Error al guardar notificaciones:', error);
    }
  }

  /**
   * Actualizar contador de no leídas
   */
  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Obtener notificaciones del usuario actual
   */
  public async getNotificationsForUser(userId: string): Promise<Notification[]> {
    await this.loadNotifications(userId);
    return this.notificationsSubject.value;
  }

  /**
   * Agregar nueva notificación
   */
  public async addNotification(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'timestamp' | 'read'>): Promise<void> {
    try {
      // Cargar todas las notificaciones
      const result = await Preferences.get({ key: this.NOTIFICATIONS_KEY });
      let allNotifications: Notification[] = result.value ? JSON.parse(result.value) : [];

      // Crear nueva notificación
      const newNotification: Notification = {
        ...notification,
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        userId,
        timestamp: new Date(),
        read: false
      };

      // Agregar al inicio
      allNotifications.unshift(newNotification);

      // Guardar todas las notificaciones
      await this.saveNotifications(allNotifications);

      // Recargar notificaciones del usuario
      await this.loadNotifications(userId);

      console.log('✅ Notificación agregada:', newNotification.title);
    } catch (error) {
      console.error('Error al agregar notificación:', error);
    }
  }

  /**
   * Marcar notificación como leída
   */
  public async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const result = await Preferences.get({ key: this.NOTIFICATIONS_KEY });
      if (!result.value) return;

      let allNotifications: Notification[] = JSON.parse(result.value);
      
      const notification = allNotifications.find(n => n.id === notificationId && n.userId === userId);
      if (notification) {
        notification.read = true;
        await this.saveNotifications(allNotifications);
        await this.loadNotifications(userId);
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }

  /**
   * Marcar todas como leídas
   */
  public async markAllAsRead(userId: string): Promise<void> {
    try {
      const result = await Preferences.get({ key: this.NOTIFICATIONS_KEY });
      if (!result.value) return;

      let allNotifications: Notification[] = JSON.parse(result.value);
      
      allNotifications.forEach(n => {
        if (n.userId === userId && !n.read) {
          n.read = true;
        }
      });

      await this.saveNotifications(allNotifications);
      await this.loadNotifications(userId);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }

  /**
   * Eliminar notificación
   */
  public async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const result = await Preferences.get({ key: this.NOTIFICATIONS_KEY });
      if (!result.value) return;

      let allNotifications: Notification[] = JSON.parse(result.value);
      allNotifications = allNotifications.filter(n => !(n.id === notificationId && n.userId === userId));

      await this.saveNotifications(allNotifications);
      await this.loadNotifications(userId);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  }

  /**
   * Eliminar todas las notificaciones del usuario
   */
  public async clearAllNotifications(userId: string): Promise<void> {
    try {
      const result = await Preferences.get({ key: this.NOTIFICATIONS_KEY });
      if (!result.value) return;

      let allNotifications: Notification[] = JSON.parse(result.value);
      allNotifications = allNotifications.filter(n => n.userId !== userId);

      await this.saveNotifications(allNotifications);
      await this.loadNotifications(userId);
    } catch (error) {
      console.error('Error al limpiar notificaciones:', error);
    }
  }

  /**
   * Obtener contador de no leídas
   */
  public getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Generar notificaciones de ejemplo
   */
  public async generateSampleNotifications(userId: string): Promise<void> {
    const samples = [
      {
        title: '¡Apuesta Ganada!',
        message: 'Tu apuesta en Real Madrid vs Barcelona ha sido ganadora. +$500',
        type: 'bet' as const,
        icon: 'trophy'
      },
      {
        title: 'Partido en Vivo',
        message: 'El partido que sigues está por comenzar en 15 minutos',
        type: 'match' as const,
        icon: 'football'
      },
      {
        title: 'Nueva Transferencia',
        message: 'Cristiano Ronaldo ficha por Al-Nassr. ¡Conoce los detalles!',
        type: 'transfer' as const,
        icon: 'swap-horizontal'
      },
      {
        title: 'Comentario en tu publicación',
        message: 'Juan Pablo comentó en tu publicación sobre el partido',
        type: 'community' as const,
        icon: 'chatbubble'
      },
      {
        title: 'Actualización de Sistema',
        message: 'Nueva versión disponible con mejoras de rendimiento',
        type: 'system' as const,
        icon: 'information-circle'
      }
    ];

    for (const sample of samples) {
      await this.addNotification(userId, sample);
    }
  }
}
