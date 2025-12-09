import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser, updateProfile, sendPasswordResetEmail, updateEmail, updatePassword } from '@angular/fire/auth';
import { Database, ref, set, get, update, remove, onValue, push, DataSnapshot } from '@angular/fire/database';
import { Storage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable, UploadTask } from '@angular/fire/storage';
import { BehaviorSubject, Observable, from, map } from 'rxjs';

// ===================================
// INTERFACES DE LA APLICACIÓN
// ===================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  balance: number;
  joinDate: Date;
  firebaseUid?: string; // UID de Firebase Auth
}

export interface Bet {
  id: string;
  userId: string;
  matchId?: string;
  matchName: string;
  betType: 'winner' | 'score' | 'goals' | 'corners' | 'cards';
  prediction: string;
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  league: string;
  matchDate: Date;
  placedAt: Date;
  settledAt?: Date;
  notes?: string;
}

export interface League {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  season: string;
  type: 'domestic' | 'international' | 'cup';
  numberOfTeams: number;
  currentMatchday: number;
  description: string;
  founded: number;
  status: 'active' | 'finished' | 'upcoming';
  colors: {
    primary: string;
    secondary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  city: string;
  stadium: string;
  founded: number;
  league: string;
  colors: {
    primary: string;
    secondary: string;
  };
  stats: {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  
  // Collections
  private readonly USERS_COLLECTION = 'users';
  private readonly BETS_COLLECTION = 'bets';
  private readonly LEAGUES_COLLECTION = 'leagues';
  private readonly TEAMS_COLLECTION = 'teams';

  // Observable del usuario autenticado
  private currentUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private database: Database,
    private storage: Storage
  ) {
    // Escuchar cambios en el estado de autenticación
    this.auth.onAuthStateChanged(user => {
      this.currentUserSubject.next(user);
    });
    
    console.log('🔥 Firebase Service inicializado');
    console.log('📊 Realtime Database URL:', this.database.app.options.databaseURL);
  }

  // ===================================
  // AUTHENTICATION
  // ===================================

  /**
   * Registrar nuevo usuario con perfil
   */
  async register(email: string, password: string, userData: Omit<User, 'id' | 'email' | 'firebaseUid'>): Promise<User> {
    try {
      console.log('🔐 Iniciando registro con Firebase Auth...');
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password?.length);
      console.log('👤 User data:', { name: userData.name, avatar: userData.avatar?.substring(0, 50) });
      
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Usuario creado en Firebase Auth:', credential.user.uid);
      
      // Actualizar perfil de Firebase Auth
      await updateProfile(credential.user, {
        displayName: userData.name,
        photoURL: userData.avatar
      });
      console.log('✅ Perfil de Firebase Auth actualizado');

      // Crear documento de usuario en Realtime Database
      const newUser: User = {
        id: credential.user.uid,
        firebaseUid: credential.user.uid,
        email: email,
        ...userData,
        joinDate: new Date()
      };

      await this.createUser(newUser);
      console.log('✅ Usuario guardado en Realtime Database');
      
      return newUser;
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<FirebaseUser> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario actual de Firebase Auth
   */
  getCurrentAuthUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Verificar si hay usuario autenticado
   */
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      throw error;
    }
  }

  /**
   * Actualizar email del usuario
   */
  async updateUserEmail(newEmail: string): Promise<void> {
    try {
      if (this.auth.currentUser) {
        await updateEmail(this.auth.currentUser, newEmail);
      }
    } catch (error) {
      console.error('Error al actualizar email:', error);
      throw error;
    }
  }

  /**
   * Actualizar contraseña
   */
  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      if (this.auth.currentUser) {
        await updatePassword(this.auth.currentUser, newPassword);
      }
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }

  // ===================================
  // USERS - Gestión de Usuarios
  // ===================================

  /**
   * Crear usuario en Realtime Database
   */
  async createUser(user: User): Promise<string> {
    try {
      const userRef = ref(this.database, `${this.USERS_COLLECTION}/${user.id}`);
      await set(userRef, this.serializeData(user));
      console.log('✅ Usuario creado en Realtime Database:', user.id);
      return user.id;
    } catch (error) {
      console.error('❌ Error creando usuario en Realtime Database:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID desde Realtime Database
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = ref(this.database, `${this.USERS_COLLECTION}/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return this.deserializeData({ id: userId, ...snapshot.val() }) as User;
      }
      console.log('Usuario no encontrado:', userId);
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por email desde Realtime Database
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersRef = ref(this.database, this.USERS_COLLECTION);
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        const userEntry = Object.entries(users).find(([_, user]: [string, any]) => user.email === email);
        
        if (userEntry) {
          const [userId, userData] = userEntry;
          return this.deserializeData({ id: userId, ...(userData as object) }) as User;
        }
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario por email:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios desde Realtime Database
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = ref(this.database, this.USERS_COLLECTION);
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.entries(users).map(([id, data]: [string, any]) => 
          this.deserializeData({ id, ...data }) as User
        );
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario en Realtime Database
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = ref(this.database, `${this.USERS_COLLECTION}/${userId}`);
      await update(userRef, this.serializeData(updates));
      console.log('✅ Usuario actualizado en Realtime Database:', userId);
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar balance del usuario
   */
  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    await this.updateUser(userId, { balance: newBalance });
  }

  /**
   * Añadir al balance
   */
  async addToUserBalance(userId: string, amount: number): Promise<void> {
    const user = await this.getUserById(userId);
    if (user) {
      await this.updateUserBalance(userId, user.balance + amount);
    }
  }

  /**
   * Restar del balance
   */
  async subtractFromUserBalance(userId: string, amount: number): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (user && user.balance >= amount) {
      await this.updateUserBalance(userId, user.balance - amount);
      return true;
    }
    return false;
  }

  /**
   * Eliminar usuario de Realtime Database
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = ref(this.database, `${this.USERS_COLLECTION}/${userId}`);
      await remove(userRef);
      console.log('✅ Usuario eliminado de Realtime Database:', userId);
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      throw error;
    }
  }

  // ===================================
  // BETS - Gestión de Apuestas
  // ===================================

  /**
   * Crear apuesta en Realtime Database
   */
  async createBet(bet: Omit<Bet, 'id' | 'placedAt'>): Promise<string> {
    try {
      const betsRef = ref(this.database, this.BETS_COLLECTION);
      const newBetRef = push(betsRef);
      const newBet = {
        ...bet,
        placedAt: new Date().toISOString(),
        potentialWin: this.calculatePotentialWin(bet.stake, bet.odds)
      };
      
      await set(newBetRef, this.serializeData(newBet));
      console.log('✅ Apuesta creada en Realtime Database:', newBetRef.key);
      return newBetRef.key!;
    } catch (error) {
      console.error('❌ Error creando apuesta:', error);
      throw error;
    }
  }

  /**
   * Obtener apuesta por ID desde Realtime Database
   */
  async getBetById(betId: string): Promise<Bet | null> {
    try {
      const betRef = ref(this.database, `${this.BETS_COLLECTION}/${betId}`);
      const snapshot = await get(betRef);
      
      if (snapshot.exists()) {
        return this.deserializeData({ id: betId, ...snapshot.val() }) as Bet;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo apuesta:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las apuestas desde Realtime Database
   */
  async getAllBets(): Promise<Bet[]> {
    try {
      const betsRef = ref(this.database, this.BETS_COLLECTION);
      const snapshot = await get(betsRef);
      
      if (snapshot.exists()) {
        const bets = snapshot.val();
        return Object.entries(bets)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as Bet)
          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo apuestas:', error);
      throw error;
    }
  }

  /**
   * Obtener apuestas por usuario desde Realtime Database
   */
  async getBetsByUserId(userId: string): Promise<Bet[]> {
    try {
      const betsRef = ref(this.database, this.BETS_COLLECTION);
      const snapshot = await get(betsRef);
      
      if (snapshot.exists()) {
        const bets = snapshot.val();
        return Object.entries(bets)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as Bet)
          .filter(bet => bet.userId === userId)
          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo apuestas por usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener apuestas por estado desde Realtime Database
   */
  async getBetsByStatus(status: Bet['status'], userId?: string): Promise<Bet[]> {
    try {
      const betsRef = ref(this.database, this.BETS_COLLECTION);
      const snapshot = await get(betsRef);
      
      if (snapshot.exists()) {
        const bets = snapshot.val();
        return Object.entries(bets)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as Bet)
          .filter(bet => {
            const matchesStatus = bet.status === status;
            const matchesUser = !userId || bet.userId === userId;
            return matchesStatus && matchesUser;
          })
          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo apuestas por estado:', error);
      throw error;
    }
  }

  /**
   * Obtener apuestas por tipo desde Realtime Database
   */
  async getBetsByType(betType: Bet['betType'], userId?: string): Promise<Bet[]> {
    try {
      const betsRef = ref(this.database, this.BETS_COLLECTION);
      const snapshot = await get(betsRef);
      
      if (snapshot.exists()) {
        const bets = snapshot.val();
        return Object.entries(bets)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as Bet)
          .filter(bet => {
            const matchesType = bet.betType === betType;
            const matchesUser = !userId || bet.userId === userId;
            return matchesType && matchesUser;
          })
          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo apuestas por tipo:', error);
      throw error;
    }
  }

  /**
   * Buscar apuestas
   */
  async searchBets(searchTerm: string, userId?: string): Promise<Bet[]> {
    // Nota: Firestore no soporta búsqueda de texto completo nativamente
    // Esta es una implementación básica que obtiene todos y filtra en cliente
    const allBets = userId ? await this.getBetsByUserId(userId) : await this.getAllBets();
    
    const searchLower = searchTerm.toLowerCase();
    return allBets.filter(bet => 
      bet.matchName.toLowerCase().includes(searchLower) ||
      bet.league.toLowerCase().includes(searchLower) ||
      bet.prediction.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Actualizar apuesta en Realtime Database
   */
  async updateBet(betId: string, updates: Partial<Bet>): Promise<void> {
    try {
      // Recalcular ganancia potencial si cambian stake u odds
      if (updates.stake !== undefined || updates.odds !== undefined) {
        const currentBet = await this.getBetById(betId);
        if (currentBet) {
          const stake = updates.stake !== undefined ? updates.stake : currentBet.stake;
          const odds = updates.odds !== undefined ? updates.odds : currentBet.odds;
          updates.potentialWin = this.calculatePotentialWin(stake, odds);
        }
      }

      const betRef = ref(this.database, `${this.BETS_COLLECTION}/${betId}`);
      await update(betRef, this.serializeData(updates));
      console.log('✅ Apuesta actualizada en Realtime Database:', betId);
    } catch (error) {
      console.error('❌ Error actualizando apuesta:', error);
      throw error;
    }
  }

  /**
   * Marcar apuesta como ganada
   */
  async settleBetAsWon(betId: string): Promise<void> {
    await this.updateBet(betId, {
      status: 'won',
      settledAt: new Date()
    });
  }

  /**
   * Marcar apuesta como perdida
   */
  async settleBetAsLost(betId: string): Promise<void> {
    await this.updateBet(betId, {
      status: 'lost',
      settledAt: new Date()
    });
  }

  /**
   * Cancelar apuesta
   */
  async cancelBet(betId: string): Promise<void> {
    await this.updateBet(betId, {
      status: 'cancelled',
      settledAt: new Date()
    });
  }

  /**
   * Eliminar apuesta de Realtime Database
   */
  async deleteBet(betId: string): Promise<void> {
    try {
      const betRef = ref(this.database, `${this.BETS_COLLECTION}/${betId}`);
      await remove(betRef);
      console.log('✅ Apuesta eliminada de Realtime Database:', betId);
    } catch (error) {
      console.error('❌ Error eliminando apuesta:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de apuestas del usuario
   */
  async getUserBetStats(userId: string): Promise<{
    total: number;
    pending: number;
    won: number;
    lost: number;
    cancelled: number;
    totalStaked: number;
    totalWon: number;
    winRate: number;
  }> {
    const userBets = await this.getBetsByUserId(userId);
    
    const stats = {
      total: userBets.length,
      pending: userBets.filter(b => b.status === 'pending').length,
      won: userBets.filter(b => b.status === 'won').length,
      lost: userBets.filter(b => b.status === 'lost').length,
      cancelled: userBets.filter(b => b.status === 'cancelled').length,
      totalStaked: userBets.reduce((sum, b) => sum + b.stake, 0),
      totalWon: userBets.filter(b => b.status === 'won').reduce((sum, b) => sum + b.potentialWin, 0),
      winRate: 0
    };

    const settledBets = stats.won + stats.lost;
    stats.winRate = settledBets > 0 ? (stats.won / settledBets) * 100 : 0;

    return stats;
  }

  // ===================================
  // LEAGUES - Gestión de Ligas
  // ===================================

  /**
   * Crear liga en Realtime Database
   */
  async createLeague(league: Omit<League, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const leaguesRef = ref(this.database, this.LEAGUES_COLLECTION);
      const newLeagueRef = push(leaguesRef);
      const newLeague = {
        ...league,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(newLeagueRef, this.serializeData(newLeague));
      console.log('✅ Liga creada en Realtime Database:', newLeagueRef.key);
      return newLeagueRef.key!;
    } catch (error) {
      console.error('❌ Error creando liga:', error);
      throw error;
    }
  }

  /**
   * Obtener liga por ID desde Realtime Database
   */
  async getLeagueById(leagueId: string): Promise<League | null> {
    try {
      const leagueRef = ref(this.database, `${this.LEAGUES_COLLECTION}/${leagueId}`);
      const snapshot = await get(leagueRef);
      
      if (snapshot.exists()) {
        return this.deserializeData({ id: leagueId, ...snapshot.val() }) as League;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo liga:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las ligas desde Realtime Database
   */
  async getAllLeagues(): Promise<League[]> {
    try {
      const leaguesRef = ref(this.database, this.LEAGUES_COLLECTION);
      const snapshot = await get(leaguesRef);
      
      if (snapshot.exists()) {
        const leagues = snapshot.val();
        return Object.entries(leagues)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as League)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo ligas:', error);
      throw error;
    }
  }

  /**
   * Obtener ligas por país desde Realtime Database
   */
  async getLeaguesByCountry(country: string): Promise<League[]> {
    try {
      const leaguesRef = ref(this.database, this.LEAGUES_COLLECTION);
      const snapshot = await get(leaguesRef);
      
      if (snapshot.exists()) {
        const leagues = snapshot.val();
        return Object.entries(leagues)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as League)
          .filter(league => league.country === country)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo ligas por país:', error);
      throw error;
    }
  }

  /**
   * Obtener ligas por estado desde Realtime Database
   */
  async getLeaguesByStatus(status: League['status']): Promise<League[]> {
    try {
      const leaguesRef = ref(this.database, this.LEAGUES_COLLECTION);
      const snapshot = await get(leaguesRef);
      
      if (snapshot.exists()) {
        const leagues = snapshot.val();
        return Object.entries(leagues)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as League)
          .filter(league => league.status === status)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo ligas por estado:', error);
      throw error;
    }
  }

  /**
   * Actualizar liga en Realtime Database
   */
  async updateLeague(leagueId: string, updates: Partial<League>): Promise<void> {
    try {
      const leagueRef = ref(this.database, `${this.LEAGUES_COLLECTION}/${leagueId}`);
      await update(leagueRef, this.serializeData({
        ...updates,
        updatedAt: new Date().toISOString()
      }));
      console.log('✅ Liga actualizada en Realtime Database:', leagueId);
    } catch (error) {
      console.error('❌ Error actualizando liga:', error);
      throw error;
    }
  }

  /**
   * Eliminar liga de Realtime Database
   */
  async deleteLeague(leagueId: string): Promise<void> {
    try {
      const leagueRef = ref(this.database, `${this.LEAGUES_COLLECTION}/${leagueId}`);
      await remove(leagueRef);
      console.log('✅ Liga eliminada de Realtime Database:', leagueId);
    } catch (error) {
      console.error('❌ Error eliminando liga:', error);
      throw error;
    }
  }

  // ===================================
  // TEAMS - Gestión de Equipos
  // ===================================

  /**
   * Crear equipo en Realtime Database
   */
  async createTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const teamsRef = ref(this.database, this.TEAMS_COLLECTION);
      const newTeamRef = push(teamsRef);
      const newTeam = {
        ...team,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await set(newTeamRef, this.serializeData(newTeam));
      console.log('✅ Equipo creado en Realtime Database:', newTeamRef.key);
      return newTeamRef.key!;
    } catch (error) {
      console.error('❌ Error creando equipo:', error);
      throw error;
    }
  }

  /**
   * Obtener equipo por ID desde Realtime Database
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    try {
      const teamRef = ref(this.database, `${this.TEAMS_COLLECTION}/${teamId}`);
      const snapshot = await get(teamRef);
      
      if (snapshot.exists()) {
        return this.deserializeData({ id: teamId, ...snapshot.val() }) as Team;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo equipo:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los equipos desde Realtime Database
   */
  async getAllTeams(): Promise<Team[]> {
    try {
      const teamsRef = ref(this.database, this.TEAMS_COLLECTION);
      const snapshot = await get(teamsRef);
      
      if (snapshot.exists()) {
        const teams = snapshot.val();
        return Object.entries(teams)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as Team)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo equipos:', error);
      throw error;
    }
  }

  /**
   * Obtener equipos por liga desde Realtime Database
   */
  async getTeamsByLeague(leagueId: string): Promise<Team[]> {
    try {
      const teamsRef = ref(this.database, this.TEAMS_COLLECTION);
      const snapshot = await get(teamsRef);
      
      if (snapshot.exists()) {
        const teams = snapshot.val();
        return Object.entries(teams)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as Team)
          .filter(team => team.league === leagueId)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo equipos por liga:', error);
      throw error;
    }
  }

  /**
   * Obtener equipos por país desde Realtime Database
   */
  async getTeamsByCountry(country: string): Promise<Team[]> {
    try {
      const teamsRef = ref(this.database, this.TEAMS_COLLECTION);
      const snapshot = await get(teamsRef);
      
      if (snapshot.exists()) {
        const teams = snapshot.val();
        return Object.entries(teams)
          .map(([id, data]: [string, any]) => this.deserializeData({ id, ...data }) as Team)
          .filter(team => team.country === country)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo equipos por país:', error);
      throw error;
    }
  }

  /**
   * Actualizar equipo en Realtime Database
   */
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
    try {
      const teamRef = ref(this.database, `${this.TEAMS_COLLECTION}/${teamId}`);
      await update(teamRef, this.serializeData({
        ...updates,
        updatedAt: new Date().toISOString()
      }));
      console.log('✅ Equipo actualizado en Realtime Database:', teamId);
    } catch (error) {
      console.error('❌ Error actualizando equipo:', error);
      throw error;
    }
  }

  /**
   * Actualizar estadísticas del equipo
   */
  async updateTeamStats(teamId: string, stats: Partial<Team['stats']>): Promise<void> {
    const team = await this.getTeamById(teamId);
    if (team) {
      await this.updateTeam(teamId, {
        stats: { ...team.stats, ...stats }
      });
    }
  }

  /**
   * Eliminar equipo de Realtime Database
   */
  async deleteTeam(teamId: string): Promise<void> {
    try {
      const teamRef = ref(this.database, `${this.TEAMS_COLLECTION}/${teamId}`);
      await remove(teamRef);
      console.log('✅ Equipo eliminado de Realtime Database:', teamId);
    } catch (error) {
      console.error('❌ Error eliminando equipo:', error);
      throw error;
    }
  }


  // ===================================
  // STORAGE - Gestión de Archivos
  // ===================================

  /**
   * Subir avatar de usuario
   */
  async uploadUserAvatar(userId: string, file: File): Promise<string> {
    try {
      const path = `avatars/${userId}/${Date.now()}_${file.name}`;
      const fileRef = storageRef(this.storage, path);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error subiendo avatar:', error);
      throw error;
    }
  }

  /**
   * Subir logo de liga
   */
  async uploadLeagueLogo(leagueId: string, file: File): Promise<string> {
    try {
      const path = `leagues/${leagueId}/${Date.now()}_${file.name}`;
      const fileRef = storageRef(this.storage, path);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error subiendo logo de liga:', error);
      throw error;
    }
  }

  /**
   * Subir logo de equipo
   */
  async uploadTeamLogo(teamId: string, file: File): Promise<string> {
    try {
      const path = `teams/${teamId}/${Date.now()}_${file.name}`;
      const fileRef = storageRef(this.storage, path);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error subiendo logo de equipo:', error);
      throw error;
    }
  }

  /**
   * Subir archivo con progreso
   */
  uploadFileWithProgress(path: string, file: File): { 
    task: UploadTask, 
    progress$: Observable<number>,
    url$: Observable<string>
  } {
    const fileRef = storageRef(this.storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);
    
    const progress$ = new Observable<number>(observer => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next(progress);
        },
        (error) => observer.error(error),
        () => observer.complete()
      );
    });

    const url$ = from(uploadTask.then(() => getDownloadURL(fileRef))) as Observable<string>;

    return { task: uploadTask, progress$, url$ };
  }

  /**
   * Obtener URL de descarga
   */
  async getFileURL(path: string): Promise<string> {
    try {
      const fileRef = storageRef(this.storage, path);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error obteniendo URL:', error);
      throw error;
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const fileRef = storageRef(this.storage, path);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  }

  /**
   * Eliminar avatar de usuario
   */
  async deleteUserAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      // Extraer el path del URL
      const path = this.getPathFromURL(avatarUrl);
      if (path) {
        await this.deleteFile(path);
      }
    } catch (error) {
      console.error('Error eliminando avatar:', error);
      throw error;
    }
  }

  // ===================================
  // REALTIME DATABASE - Sincronización en Tiempo Real
  // ===================================

  /**
   * Escribir datos en tiempo real
   */
  async writeRealtimeData(path: string, data: any): Promise<void> {
    try {
      const dbRef = ref(this.database, path);
      await set(dbRef, data);
    } catch (error) {
      console.error('Error escribiendo en Realtime Database:', error);
      throw error;
    }
  }

  /**
   * Leer datos en tiempo real
   */
  async readRealtimeData(path: string): Promise<any> {
    try {
      const dbRef = ref(this.database, path);
      const snapshot = await get(dbRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error leyendo de Realtime Database:', error);
      throw error;
    }
  }

  /**
   * Actualizar datos en tiempo real
   */
  async updateRealtimeData(path: string, data: any): Promise<void> {
    try {
      const dbRef = ref(this.database, path);
      await update(dbRef, data);
    } catch (error) {
      console.error('Error actualizando en Realtime Database:', error);
      throw error;
    }
  }

  /**
   * Eliminar datos en tiempo real
   */
  async deleteRealtimeData(path: string): Promise<void> {
    try {
      const dbRef = ref(this.database, path);
      await remove(dbRef);
    } catch (error) {
      console.error('Error eliminando de Realtime Database:', error);
      throw error;
    }
  }

  /**
   * Escuchar cambios en tiempo real
   */
  listenRealtimeChanges(path: string, callback: (data: any) => void): () => void {
    const dbRef = ref(this.database, path);
    const unsubscribe = onValue(dbRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      callback(data);
    });
    
    // Retornar función para desuscribirse
    return unsubscribe;
  }

  /**
   * Agregar con ID automático (push)
   */
  async pushRealtimeData(path: string, data: any): Promise<string> {
    try {
      const dbRef = ref(this.database, path);
      const newRef = push(dbRef);
      await set(newRef, data);
      return newRef.key || '';
    } catch (error) {
      console.error('Error haciendo push en Realtime Database:', error);
      throw error;
    }
  }

  /**
   * Sincronizar estado de apuesta en tiempo real
   */
  async syncBetStatus(betId: string): Promise<() => void> {
    const path = `bets/${betId}/status`;
    return this.listenRealtimeChanges(path, async (status) => {
      if (status) {
        await this.updateBet(betId, { status });
      }
    });
  }

  /**
   * Sincronizar balance de usuario en tiempo real
   */
  async syncUserBalance(userId: string): Promise<() => void> {
    const path = `users/${userId}/balance`;
    return this.listenRealtimeChanges(path, async (balance) => {
      if (balance !== null && balance !== undefined) {
        await this.updateUser(userId, { balance });
      }
    });
  }

  // ===================================
  // BATCH OPERATIONS - Operaciones por Lote
  // ===================================

  /**
   * Operaciones por lote para Realtime Database
   * Nota: Realtime Database usa update con múltiples rutas en lugar de batch writes
   */
  async batchOperation(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    id?: string;
    data?: any;
  }>): Promise<void> {
    try {
      const updates: { [key: string]: any } = {};

      for (const op of operations) {
        const itemId = op.id || push(ref(this.database, op.collection)).key;
        const path = `${op.collection}/${itemId}`;

        switch (op.type) {
          case 'create':
          case 'update':
            updates[path] = this.serializeData(op.data);
            break;
          case 'delete':
            updates[path] = null; // En Realtime DB, null elimina el dato
            break;
        }
      }

      // Ejecutar todas las actualizaciones en una sola operación atómica
      await update(ref(this.database), updates);
      console.log('✅ Operación batch completada en Realtime Database');
    } catch (error) {
      console.error('❌ Error en operación por lote:', error);
      throw error;
    }
  }

  /**
   * Eliminar múltiples documentos
   */
  async deleteMultipleBets(betIds: string[]): Promise<void> {
    const operations = betIds.map(id => ({
      type: 'delete' as const,
      collection: this.BETS_COLLECTION,
      id
    }));
    
    await this.batchOperation(operations);
  }

  // ===================================
  // UTILITY METHODS - Métodos de Utilidad
  // ===================================

  /**
   * Calcular ganancia potencial
   */
  private calculatePotentialWin(stake: number, odds: number): number {
    return stake * odds;
  }

  /**
   * Serializar datos para Realtime Database (convertir Dates a strings ISO)
   */
  private serializeData(data: any): any {
    if (!data) return data;
    
    const serialized: any = {};
    
    for (const key in data) {
      if (data[key] instanceof Date) {
        serialized[key] = data[key].toISOString();
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        serialized[key] = this.serializeData(data[key]);
      } else {
        serialized[key] = data[key];
      }
    }
    
    return serialized;
  }

  /**
   * Deserializar datos de Realtime Database (convertir strings ISO a Dates)
   */
  private deserializeData(data: any): any {
    if (!data) return data;
    
    const deserialized: any = {};
    
    for (const key in data) {
      // Detectar strings ISO de fechas
      if (typeof data[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data[key])) {
        deserialized[key] = new Date(data[key]);
      } else if (typeof data[key] === 'object' && data[key] !== null && 'seconds' in data[key]) {
        // Manejar Timestamps legacy que puedan existir (compatibilidad con Firestore)
        deserialized[key] = new Date(data[key].seconds * 1000);
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        deserialized[key] = this.deserializeData(data[key]);
      } else {
        deserialized[key] = data[key];
      }
    }
    
    return deserialized;
  }

  /**
   * Extraer path de URL de Storage
   */
  private getPathFromURL(url: string): string | null {
    try {
      const regex = /\/o\/(.+?)\?/;
      const match = url.match(regex);
      return match ? decodeURIComponent(match[1]) : null;
    } catch (error) {
      console.error('Error extrayendo path de URL:', error);
      return null;
    }
  }

  /**
   * Manejar errores de autenticación
   */
  private handleAuthError(error: any): Error {
    let message = 'Error desconocido';
    
    console.error('🔴 Firebase Auth Error Details:', {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'El email ya está registrado';
        break;
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operación no permitida. Verifica que Email/Password esté habilitado en Firebase Console';
        break;
      case 'auth/weak-password':
        message = 'Contraseña débil (mínimo 6 caracteres)';
        break;
      case 'auth/user-disabled':
        message = 'Usuario deshabilitado';
        break;
      case 'auth/user-not-found':
        message = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Intenta más tarde';
        break;
      case 'auth/network-request-failed':
        message = 'Error de conexión';
        break;
      default:
        message = error.message || 'Error desconocido al autenticar';
    }
    
    const customError = new Error(message);
    (customError as any).code = error.code;
    return customError;
  }

  /**
   * Generar ID único
   */
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
