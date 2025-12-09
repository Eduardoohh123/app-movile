import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences} from '@capacitor/preferences';
import { FirebaseService } from './firebase.service';

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
  private useFirebase = true; // Toggle para usar Firebase

  constructor(private firebaseService: FirebaseService) {
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
    this.userSubject.next(user);
    await this.saveUserToStorage(user);
    
    // También actualizar en la base de datos para persistir cambios
    await this.updateUserInDatabase(user);
    
    // Sincronizar con Firebase SIEMPRE (sin verificar autenticación)
    if (this.useFirebase) {
      try {
        const existingUser = await this.firebaseService.getUserById(user.id);
        if (existingUser) {
          await this.firebaseService.updateUser(user.id, user);
          console.log('☁️ Usuario actualizado en Firebase');
        } else {
          await this.firebaseService.createUser(user);
          console.log('☁️ Usuario creado en Firebase');
        }
      } catch (error) {
        console.error('⚠️ Error al sincronizar usuario con Firebase:', error);
      }
    }
    
    // Emitir evento para que otros componentes se actualicen
    window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
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
      await this.setUser(updatedUser);
    } else {
      console.error('❌ No se puede actualizar: no hay usuario actual');
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
    // Verificar si el usuario ya existe
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      // Si existe, cargar ese usuario
      await this.setUser(existingUser);
      return existingUser;
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: name,
      email: email,
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      balance: 5000.00,
      joinDate: new Date()
    };
    
    // Guardar en la base de datos de usuarios
    await this.saveUserToDatabase(newUser);
    
    // Establecer como usuario actual
    await this.setUser(newUser);
    return newUser;
  }

  /**
   * Autenticar usuario (simulado)
   */
  public async loginUser(email: string, password: string): Promise<User> {
    // Buscar usuario existente en la base de datos
    let user = await this.findUserByEmail(email);
    
    if (!user) {
      // Si no existe, crear uno nuevo (para compatibilidad)
      user = {
        id: 'user-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
        balance: 5000.00,
        joinDate: new Date()
      };
      
      // Guardar en la base de datos
      await this.saveUserToDatabase(user);
    }
    
    // Establecer como usuario actual
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
