import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences} from '@capacitor/preferences';
import { FirebaseService } from './firebase.service';
import { ApiService } from './api.service';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  balance: number;
  joinDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_STORAGE_KEY = 'currentUser';
  private readonly USERS_DB_KEY = 'registeredUsers'; // Base de datos de usuarios
  
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;
  private useFirebase = false; // Deshabilitado
  private useBackendAPI = true; // ✅ Usar Spring Boot (tu configuración original)
  private useSupabase = false; // Supabase disponible pero desactivado por defecto

  constructor(
    private firebaseService: FirebaseService,
    private apiService: ApiService,
    private supabaseService: SupabaseService
  ) {
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = this.userSubject.asObservable();
    
    // Cargar usuario de forma asíncrona
    this.initializeUser();
  }

  private async initializeUser(): Promise<void> {
    const storedUser = await this.loadUserFromStorage();
    
    console.log('🔍 Inicializando usuario:', storedUser ? {
      email: storedUser.email,
      hasAvatar: !!storedUser.avatar,
      avatarLength: storedUser.avatar?.length
    } : 'No hay usuario guardado');
    
    if (storedUser) {
      this.userSubject.next(storedUser);
    } else {
      // Si no hay usuario, crear uno por defecto
      await this.setDefaultUser();
    }
  }

  private async loadUserFromStorage(): Promise<User | null> {
    const result = await Preferences.get({ key: this.USER_STORAGE_KEY });
    if (result.value) {
      const user = JSON.parse(result.value);
      // Convertir joinDate string a Date
      if (user.joinDate) {
        user.joinDate = new Date(user.joinDate);
      }
      return user;
    }
    return null;
  }

  private async saveUserToStorage(user: User): Promise<void> {
    await Preferences.set({ 
      key: this.USER_STORAGE_KEY, 
      value: JSON.stringify(user) 
    });
  }

  private async setDefaultUser(): Promise<void> {
    const defaultUser: User = {
      id: 'user-' + Date.now(),
      name: 'Usuario',
      email: 'usuario@example.com',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      balance: 5000.00,
      joinDate: new Date()
    };
    await this.setUser(defaultUser);
  }

  public getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  public async setUser(user: User): Promise<void> {
    try {
      // 1. Actualizar el observable inmediatamente
      console.log('📝 Paso 1/3: Actualizando observable...');
      this.userSubject.next(user);
      
      // 2. Guardar en localStorage
      console.log('💾 Paso 2/3: Guardando en localStorage...');
      await this.saveUserToStorage(user);
      
      // 3. Sincronizar con Supabase (cloud database)
      if (this.useSupabase) {
        console.log('☁️ Paso 3/3: Sincronizando con Supabase...');
        await this.syncWithSupabase(user);
      } else if (this.useBackendAPI) {
        console.log('🐘 Paso 3/3: Sincronizando con PostgreSQL...');
        this.syncWithBackend(user).catch(error => {
          console.warn('⚠️ Error al sincronizar con PostgreSQL (no crítico):', error);
        });
      }
      
      // Emitir evento para que otros componentes se actualicen
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
      console.log('✅ Usuario actualizado completamente');
    } catch (error) {
      console.error('❌ Error en setUser:', error);
      throw error;
    }
  }
  
  /**
   * Sincronizar usuario con Supabase (método principal)
   */
  private async syncWithSupabase(user: User): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.updateUserProfile(user.id, {
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        balance: user.balance
      });

      if (error) {
        // Si no existe, crear el perfil
        console.log('⚠️ Usuario no existe en Supabase, creando...');
        const createResult = await this.supabaseService.createUserProfile({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          phone: user.phone,
          balance: user.balance
        });
        
        if (createResult.error) {
          console.warn('⚠️ No se pudo crear en Supabase:', createResult.error.message);
        } else {
          console.log('✅ Usuario creado en Supabase');
        }
      } else {
        console.log('✅ Usuario actualizado en Supabase');
      }
    } catch (error: any) {
      console.error('⚠️ Error al sincronizar con Supabase:', error.message);
      // No lanzar error para no bloquear la operación
    }
  }
  
  /**
   * Sincronizar usuario con Backend PostgreSQL (método asíncrono separado)
   */
  private async syncWithBackend(user: User): Promise<void> {
    try {
      // Convertir el ID string a number para el backend
      const userId = this.extractNumericId(user.id);
      
      // Preparar datos para el backend
      const backendUser = {
        id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        balance: user.balance,
        joinDate: user.joinDate
      };
      
      // Intentar actualizar, si falla crear nuevo
      this.apiService.updateUser(userId, backendUser).subscribe({
        next: () => {
          console.log('🐘 Usuario actualizado en PostgreSQL');
        },
        error: (error) => {
          // Si el error es 404 (no existe), intentar crear
          if (error.status === 404) {
            this.apiService.createUser(backendUser).subscribe({
              next: () => {
                console.log('🐘 Usuario creado en PostgreSQL');
              },
              error: (createError) => {
                console.error('⚠️ Error al crear usuario en PostgreSQL:', createError);
              }
            });
          } else {
            console.error('⚠️ Error al actualizar usuario en PostgreSQL:', error);
          }
        }
      });
    } catch (error) {
      console.error('⚠️ Error al sincronizar con PostgreSQL:', error);
      throw error;
    }
  }
  
  /**
   * Extraer ID numérico del usuario (convierte 'user-123456' a 123456)
   */
  private extractNumericId(id: string): number {
    const match = id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  public async updateUser(updates: Partial<User>): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      console.log('🔄 Actualizando usuario:', {
        email: updatedUser.email,
        hasAvatar: !!updatedUser.avatar,
        avatarLength: updatedUser.avatar?.length
      });
      
      try {
        await this.setUser(updatedUser);
        console.log('✅ Usuario actualizado exitosamente');
      } catch (error) {
        console.error('❌ Error al actualizar usuario:', error);
        throw error;
      }
    } else {
      const error = new Error('No hay usuario actual para actualizar');
      console.error('❌ Error:', error.message);
      throw error;
    }
  }

  public async updateAvatar(avatarUrl: string): Promise<void> {
    await this.updateUser({ avatar: avatarUrl });
  }

  public async updateName(name: string): Promise<void> {
    await this.updateUser({ name });
  }

  public async updateEmail(email: string): Promise<void> {
    await this.updateUser({ email });
  }

  public async updateBalance(balance: number): Promise<void> {
    await this.updateUser({ balance });
  }

  public async addToBalance(amount: number): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      await this.updateBalance(currentUser.balance + amount);
    }
  }

  public async subtractFromBalance(amount: number): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.balance >= amount) {
      await this.updateBalance(currentUser.balance - amount);
      return true;
    }
    return false;
  }

  public async clearUser(): Promise<void> {
    await Preferences.remove({ key: this.USER_STORAGE_KEY });
    this.userSubject.next(null);
  }

  public async logout(): Promise<void> {
    await this.clearUser();
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  }

  /**
   * Registrar un nuevo usuario
   */
  public async registerUser(name: string, email: string, password: string): Promise<User> {
    try {
      if (this.useBackendAPI) {
        // 🐘 Registrar vía Spring Boot
        console.log('📝 Registrando usuario en backend (Spring Boot)...');
        return new Promise((resolve, reject) => {
          const payload = { username: email.split('@')[0], name, email, password };
          this.apiService.registerUser(payload).subscribe({
            next: async (response: any) => {
              // Si backend devuelve token, guárdalo
              if (response.token) this.apiService.setAuthToken(response.token);

              const newUser: User = {
                id: response.id ? String(response.id) : 'user-' + Date.now(),
                name: response.name || name,
                email: response.email || email,
                avatar: response.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg',
                balance: response.balance || 5000.00,
                joinDate: response.joinDate ? new Date(response.joinDate) : new Date()
              };

              await this.setUser(newUser);
              console.log('✅ Usuario registrado en backend');
              resolve(newUser);
            },
            error: (err) => {
              console.error('❌ Error al registrar en backend:', err);
              reject(new Error('Error de registro en el servidor: ' + (err.message || err.statusText || err.status)));
            }
          });
        });
      }

      // Si no usamos backend, mantener comportamiento local (mantener supabase como opción futura)
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        await this.setUser(existingUser);
        return existingUser;
      }

      const newUser: User = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        balance: 5000.00,
        joinDate: new Date()
      };

      await this.saveUserToDatabase(newUser);
      await this.setUser(newUser);
      console.log('✅ Usuario registrado en modo local');
      return newUser;
    } catch (error: any) {
      console.error('❌ Error en registerUser:', error);
      throw error;
    }
  }

  /**
   * Autenticar usuario (usa backend Spring Boot cuando está habilitado)
   */
  public async loginUser(email: string, password: string): Promise<User> {
    // Si usamos el backend, delegar la autenticación al endpoint
    if (this.useBackendAPI) {
      return new Promise((resolve, reject) => {
        this.apiService.loginUser(email, password).subscribe({
          next: async (response: any) => {
            // El backend devuelve { message, status, user }
            const payload = response.user || response;

            const user: User = {
              id: payload.id ? String(payload.id) : 'user-' + Date.now(),
              name: payload.name || email.split('@')[0],
              email: email,
              avatar: payload.avatar || 'https://ionicframework.com/docs/img/demos/avatar.svg',
              balance: payload.balance || 5000.00,
              joinDate: payload.createdAt ? new Date(payload.createdAt) : (payload.joinDate ? new Date(payload.joinDate) : new Date())
            };

            // Guardar token si el backend lo envía
            if (response.token) {
              this.apiService.setAuthToken(response.token);
            }

            await this.setUser(user);
            resolve(user);
          },
          error: (err) => {
            console.error('❌ Error en login (backend):', err);
            reject(new Error('Error de conexión con el servidor: ' + (err.message || err.statusText || err.status)));
          }
        });
      });
    }

    // Fallback local (como antes)
    let user = await this.findUserByEmail(email);
    if (!user) {
      user = {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        balance: 5000.00,
        joinDate: new Date()
      };
      await this.saveUserToDatabase(user);
    }

    await this.setUser(user);
    return user;
  }

  /**
   * Buscar usuario por email en la base de datos
   */
  private async findUserByEmail(email: string): Promise<User | null> {
    const result = await Preferences.get({ key: this.USERS_DB_KEY });
    if (!result.value) return null;

    const users: User[] = JSON.parse(result.value);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.joinDate) {
      user.joinDate = new Date(user.joinDate);
    }
    
    return user || null;
  }

  /**
   * Guardar usuario en la base de datos
   */
  private async saveUserToDatabase(user: User): Promise<void> {
    const result = await Preferences.get({ key: this.USERS_DB_KEY });
    let users: User[] = [];
    
    if (result.value) {
      users = JSON.parse(result.value);
    }

    // Buscar si el usuario ya existe (por email)
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    
    if (existingIndex >= 0) {
      // Actualizar usuario existente
      users[existingIndex] = user;
    } else {
      // Agregar nuevo usuario
      users.push(user);
    }

    await Preferences.set({ 
      key: this.USERS_DB_KEY, 
      value: JSON.stringify(users) 
    });
  }

  /**
   * Actualizar usuario en la base de datos cuando cambian sus datos
   */
  private async updateUserInDatabase(user: User): Promise<void> {
    await this.saveUserToDatabase(user);
  }

  /**
   * Obtener todos los usuarios registrados (útil para debugging)
   */
  public async getAllRegisteredUsers(): Promise<User[]> {
    const result = await Preferences.get({ key: this.USERS_DB_KEY });
    if (!result.value) return [];

    const users: User[] = JSON.parse(result.value);
    return users.map(user => {
      if (user.joinDate) {
        user.joinDate = new Date(user.joinDate);
      }
      return user;
    });
  }

  /**
   * Eliminar todos los usuarios registrados (útil para debugging/reset)
   */
  public async clearAllUsers(): Promise<void> {
    await Preferences.remove({ key: this.USERS_DB_KEY });
    await this.clearUser();
  }
}
