import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;

  constructor() {
    const storedUser = this.loadUserFromStorage();
    this.userSubject = new BehaviorSubject<User | null>(storedUser);
    this.user$ = this.userSubject.asObservable();

    // Si no hay usuario, crear uno por defecto
    if (!storedUser) {
      this.setDefaultUser();
    }
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_STORAGE_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      // Convertir joinDate string a Date
      if (user.joinDate) {
        user.joinDate = new Date(user.joinDate);
      }
      return user;
    }
    return null;
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  private setDefaultUser(): void {
    const defaultUser: User = {
      id: 'user-' + Date.now(),
      name: 'Usuario',
      email: 'usuario@example.com',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      balance: 5000.00,
      joinDate: new Date()
    };
    this.setUser(defaultUser);
  }

  public getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  public setUser(user: User): void {
    this.userSubject.next(user);
    this.saveUserToStorage(user);
    
    // Emitir evento para que otros componentes se actualicen
    window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
  }

  public updateUser(updates: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  }

  public updateAvatar(avatarUrl: string): void {
    this.updateUser({ avatar: avatarUrl });
  }

  public updateName(name: string): void {
    this.updateUser({ name });
  }

  public updateEmail(email: string): void {
    this.updateUser({ email });
  }

  public updateBalance(balance: number): void {
    this.updateUser({ balance });
  }

  public addToBalance(amount: number): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.updateBalance(currentUser.balance + amount);
    }
  }

  public subtractFromBalance(amount: number): boolean {
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.balance >= amount) {
      this.updateBalance(currentUser.balance - amount);
      return true;
    }
    return false;
  }

  public clearUser(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.userSubject.next(null);
  }

  public logout(): void {
    this.clearUser();
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  }
}
