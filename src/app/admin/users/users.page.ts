import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSearchbar,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonFab,
  IonFabButton,
  IonSpinner,
  AlertController,
  ModalController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { SupabaseService } from '../../services/supabase.service';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  trashOutline, 
  createOutline, 
  searchOutline,
  personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSearchbar,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonFab,
    IonFabButton,
    IonSpinner,
    CommonModule, 
    FormsModule
  ]
})
export class UsersPage implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  private useSupabase = false; // ✅ Usar BACKEND Spring por defecto (refleja cambios en Supabase via Admin API)

  constructor(
    private apiService: ApiService,
    private supabaseService: SupabaseService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      'add-outline': addOutline,
      'trash-outline': trashOutline,
      'create-outline': createOutline,
      'search-outline': searchOutline,
      'person-outline': personOutline
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  /**
   * Cargar todos los usuarios
   */
  async loadUsers() {
    this.isLoading = true;
    try {
      if (this.useSupabase) {
        // ☁️ Cargar desde Supabase
        const { data, error } = await this.supabaseService.getAllUsers();
        if (error) {
          throw new Error(error.message);
        }
        this.users = data || [];
        console.log('✅ Usuarios cargados desde Supabase:', this.users.length);
      } else {
        // 🐘 Cargar desde API local
        const users = await this.apiService.getAllUsers().toPromise();
        this.users = users || [];
        console.log('✅ Usuarios cargados desde API:', this.users.length);
      }
      
      this.filteredUsers = [...this.users];
    } catch (error: any) {
      console.error('❌ Error al cargar usuarios:', error);
      await this.showToast(
        this.useSupabase 
          ? 'Error al conectar con Supabase. Verifica tu conexión a internet.' 
          : 'Error al cargar usuarios', 
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Buscar usuarios
   */
  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.searchTerm = query;

    if (!query) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  }

  /**
   * Abrir modal para crear usuario
   */
  async openCreateUserModal() {
    const alert = await this.alertController.create({
      header: 'Crear Usuario',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Nombre de usuario'
        },
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre completo'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Contraseña'
        },
        {
          name: 'role',
          type: 'text',
          placeholder: 'Rol (USER/ADMIN)',
          value: 'USER'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: (data) => {
            this.createUser(data);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Crear un nuevo usuario
   */
  async createUser(userData: any) {
    const loading = await this.loadingController.create({
      message: 'Creando usuario...'
    });
    await loading.present();

    try {
      const response = await this.apiService.createUser(userData).toPromise();

      // Backend devuelve DTO con id cuando se creó correctamente
      if (response && response.id) {
        await this.showToast('Usuario creado exitosamente', 'success');
        await this.loadUsers(); // Recargar lista
      } else if (response && response.status === 'success') {
        await this.showToast('Usuario creado exitosamente', 'success');
        await this.loadUsers();
      } else {
        await this.showToast(response?.message || 'Error al crear usuario', 'danger');
      }
    } catch (error: any) {
      console.error('❌ Error al crear usuario:', error);
      await this.showToast(error.message || 'Error al crear usuario', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Abrir modal para editar usuario
   */
  async openEditUserModal(user: any) {
    const alert = await this.alertController.create({
      header: 'Editar Usuario',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Nombre de usuario',
          value: user.username
        },
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre completo',
          value: user.name
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
          value: user.email
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Nueva contraseña (dejar vacío para no cambiar)'
        },
        {
          name: 'role',
          type: 'text',
          placeholder: 'Rol (USER/ADMIN)',
          value: user.role
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: (data) => {
            this.updateUser(user.id, data);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Actualizar un usuario
   */
  async updateUser(userId: number, userData: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando usuario...'
    });
    await loading.present();

    try {
      const response = await this.apiService.updateUser(userId, userData).toPromise();
      
      if (response) {
        await this.showToast('Usuario actualizado exitosamente', 'success');
        await this.loadUsers(); // Recargar lista
      } else {
        await this.showToast('Error al actualizar usuario', 'danger');
      }
    } catch (error: any) {
      console.error('❌ Error al actualizar usuario:', error);
      
      // Extraer mensaje de error del servidor
      let errorMessage = 'Error al actualizar usuario';
      if (error.message) {
        if (error.message.includes('username ya está en uso')) {
          errorMessage = 'El nombre de usuario ya está en uso';
        } else if (error.message.includes('email ya está en uso')) {
          errorMessage = 'El correo electrónico ya está en uso';
        } else {
          errorMessage = error.message;
        }
      }
      
      await this.showToast(errorMessage, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Confirmar eliminación de usuario
   */
  async confirmDeleteUser(user: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario <strong>${user.name}</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteUser(user.id);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(userId: number) {
    const loading = await this.loadingController.create({
      message: 'Eliminando usuario...'
    });
    await loading.present();

    try {
      const response: any = await this.apiService.deleteUser(userId).toPromise();
      
      // Verificar que la respuesta tenga status 'success'
      if (response && response.status === 'success') {
        await this.showToast('Usuario eliminado exitosamente', 'success');
        await this.loadUsers(); // Recargar lista
      } else {
        await this.showToast(response?.message || 'Error al eliminar usuario', 'danger');
      }
    } catch (error: any) {
      console.error('❌ Error al eliminar usuario:', error);
      await this.showToast(error.message || 'Error al eliminar usuario', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Mostrar toast
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

