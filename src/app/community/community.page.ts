import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonFab, IonFabButton, IonModal, IonCard, IonCardHeader,
  IonCardContent, IonAvatar, IonChip, IonTextarea, IonItem, IonLabel,
  IonInput, ActionSheetController, ToastController, IonBadge,
  IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import { addIcons } from 'ionicons';
import {
  add, arrowBack, camera, location, send, heart, chatbubble,
  shareOutline, bookmarkOutline, ellipsisHorizontal, personCircle,
  timeOutline, locationOutline, closeCircle, image, trash
} from 'ionicons/icons';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  image?: string;
  text: string;
  location?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface LiveMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonFab, IonFabButton, IonModal, IonCard, IonCardHeader,
    IonCardContent, IonAvatar, IonChip, IonTextarea, IonItem, IonLabel,
    IonInput, IonBadge, IonInfiniteScroll, IonInfiniteScrollContent
  ],
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss']
})
export class CommunityPage implements OnInit, OnDestroy {
  @ViewChild('newPostModal') newPostModal!: IonModal;
  @ViewChild('liveChatModal') liveChatModal!: IonModal;

  posts: Post[] = [];
  liveMessages: LiveMessage[] = [];
  newMessage: string = '';
  unreadMessages: number = 0;
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  newPost = {
    text: '',
    image: null as string | null,
    location: ''
  };

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private userService: UserService
  ) {
    addIcons({
      add, arrowBack, camera, location, send, heart, chatbubble,
      shareOutline, bookmarkOutline, ellipsisHorizontal, personCircle,
      timeOutline, locationOutline, closeCircle, image, trash
    });
  }

  ngOnInit() {
    // Cargar usuario actual
    this.currentUser = this.userService.getCurrentUser();
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadPosts();
    this.loadLiveChat();
    this.simulateLiveActivity();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadPosts() {
    this.posts = [
      {
        id: '1',
        userId: 'user-2',
        userName: 'Carlos Rodríguez',
        userAvatar: 'https://i.pravatar.cc/150?img=12',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
        text: '¡Increíble partido hoy! El Real Madrid demostró su clase una vez más. ⚽🔥',
        location: 'Santiago Bernabéu, Madrid',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        likes: 234,
        comments: 48,
        isLiked: false
      },
      {
        id: '2',
        userId: 'user-3',
        userName: 'María González',
        userAvatar: 'https://i.pravatar.cc/150?img=45',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
        text: 'Ambiente increíble en el estadio. La afición se siente como nunca. 🎉',
        location: 'Camp Nou, Barcelona',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        likes: 156,
        comments: 29,
        isLiked: true
      },
      {
        id: '3',
        userId: 'user-4',
        userName: 'Pedro Martínez',
        userAvatar: 'https://i.pravatar.cc/150?img=68',
        text: 'Mis predicciones para este fin de semana: Real Madrid 2-1, Barcelona 3-0, Atlético 1-1. ¿Qué piensan? 🤔',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        likes: 89,
        comments: 67,
        isLiked: false
      }
    ];
  }

  loadLiveChat() {
    this.liveMessages = [
      {
        id: '1',
        userId: 'user-5',
        userName: 'Ana López',
        userAvatar: 'https://i.pravatar.cc/150?img=20',
        message: '¡Goooool! ¿Vieron ese golazo?',
        timestamp: new Date(Date.now() - 1000 * 30)
      },
      {
        id: '2',
        userId: 'user-6',
        userName: 'Luis Torres',
        userAvatar: 'https://i.pravatar.cc/150?img=32',
        message: 'Increíble jugada 🔥',
        timestamp: new Date(Date.now() - 1000 * 20)
      }
    ];
  }

  simulateLiveActivity() {
    setInterval(() => {
      if (Math.random() > 0.7) {
        const messages = [
          '¡Qué partidazo!',
          '🔥🔥🔥',
          'Vamos equipo!',
          'No puedo creer lo que estoy viendo',
          'Increíble'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.addLiveMessage(randomMessage, true);
      }
    }, 5000);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  async openNewPostModal() {
    this.newPost = { text: '', image: null, location: '' };
    await this.newPostModal.present();
  }

  async openLiveChatModal() {
    this.unreadMessages = 0;
    await this.liveChatModal.present();
    setTimeout(() => this.scrollChatToBottom(), 300);
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar Imagen',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.openCamera();
          }
        },
        {
          text: 'Galería',
          icon: 'image',
          handler: () => {
            this.openGallery();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-circle',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  openCamera() {
    const mockImages = [
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800'
    ];
    this.newPost.image = mockImages[Math.floor(Math.random() * mockImages.length)];
    this.showToast('Foto capturada', 'success');
  }

  openGallery() {
    const mockImages = [
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800'
    ];
    this.newPost.image = mockImages[Math.floor(Math.random() * mockImages.length)];
    this.showToast('Imagen seleccionada', 'success');
  }

  removeImage() {
    this.newPost.image = null;
  }

  async getLocation() {
    await this.showToast('Obteniendo ubicación...', 'success');
    
    const locationData = await this.getCurrentLocation();
    
    if (locationData) {
      this.newPost.location = locationData.address;
      await this.showToast('Ubicación agregada', 'success');
    }
  }

  removeLocation() {
    this.newPost.location = '';
  }

  async getCurrentLocation(): Promise<{ lat: number, lng: number, address: string } | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      // Usar servicio de geocodificación inversa para obtener dirección
      const address = await this.reverseGeocode(lat, lng);
      
      return { lat, lng, address };
    } catch (error: any) {
      console.error('Error obteniendo ubicación:', error);
      
      if (error.message?.includes('denied')) {
        await this.showToast('Permisos de ubicación denegados', 'danger');
      } else {
        await this.showToast('No se pudo obtener la ubicación', 'warning');
      }
      
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      // Usar API de OpenStreetMap Nominatim para geocodificación inversa (gratuita)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BettingApp/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      // Construir dirección legible
      const address = data.address;
      let formattedAddress = '';
      
      if (address.road) formattedAddress += address.road;
      if (address.city) formattedAddress += (formattedAddress ? ', ' : '') + address.city;
      if (address.country) formattedAddress += (formattedAddress ? ', ' : '') + address.country;
      
      return formattedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  async publishPost() {
    if (!this.newPost.text.trim() && !this.newPost.image) {
      await this.showToast('Debes agregar texto o una imagen', 'warning');
      return;
    }

    if (!this.currentUser) {
      await this.showToast('Error: Usuario no encontrado', 'danger');
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      image: this.newPost.image || undefined,
      text: this.newPost.text,
      location: this.newPost.location || undefined,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false
    };

    this.posts.unshift(post);
    await this.showToast('¡Publicación compartida!', 'success');
    this.addLiveMessage(`${this.currentUser.name} ha compartido una nueva publicación`, false);
    this.newPostModal.dismiss();
  }

  toggleLike(post: Post) {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;
    this.addLiveMessage(this.newMessage, false);
    this.newMessage = '';
    this.scrollChatToBottom();
  }

  addLiveMessage(message: string, isSimulated: boolean) {
    const msg: LiveMessage = {
      id: Date.now().toString(),
      userId: isSimulated ? 'user-' + Math.floor(Math.random() * 100) : (this.currentUser?.id || 'unknown'),
      userName: isSimulated ? ['Juan', 'María', 'Pedro', 'Ana'][Math.floor(Math.random() * 4)] : (this.currentUser?.name || 'Usuario'),
      userAvatar: isSimulated ? `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` : (this.currentUser?.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg'),
      message: message,
      timestamp: new Date()
    };

    this.liveMessages.push(msg);
    
    if (!this.liveChatModal || !this.liveChatModal.isOpen) {
      this.unreadMessages++;
    }

    if (this.liveMessages.length > 50) {
      this.liveMessages = this.liveMessages.slice(-50);
    }
  }

  scrollChatToBottom() {
    setTimeout(() => {
      const chatContent = document.querySelector('.live-chat-messages');
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
      }
    }, 100);
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Ahora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  loadMore(event: any) {
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
