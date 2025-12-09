import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';

export interface League {
  id: string;
  name: string;
  shortName: string;
  logo: string; // Base64 o URL
  country: string;
  season: string; // Ejemplo: "2024/2025"
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

@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  private readonly STORAGE_KEY = 'football_leagues';
  private leaguesSubject = new BehaviorSubject<League[]>([]);
  public leagues$: Observable<League[]> = this.leaguesSubject.asObservable();
  private useFirebase = true; // Toggle para usar Firebase

  constructor(private firebaseService: FirebaseService) {
    this.loadLeagues();
  }

  // ===================================
  // CREATE - Crear nueva liga
  // ===================================
  async createLeague(leagueData: Omit<League, 'id' | 'createdAt' | 'updatedAt'>): Promise<League> {
    const leagues = await this.getLeagues();
    
    const newLeague: League = {
      ...leagueData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    leagues.push(newLeague);
    await this.saveLeagues(leagues);
    
    // Sincronizar con Firebase SIEMPRE
    if (this.useFirebase) {
      try {
        await this.firebaseService.createLeague(newLeague);
        console.log('☁️ Liga sincronizada con Firebase');
      } catch (error) {
        console.error('⚠️ Error al sincronizar liga con Firebase:', error);
      }
    }
    
    console.log('✅ Liga creada:', newLeague.name);
    return newLeague;
  }

  // ===================================
  // READ - Obtener todas las ligas
  // ===================================
  async getLeagues(): Promise<League[]> {
    try {
      const result = await Preferences.get({ key: this.STORAGE_KEY });
      if (result.value) {
        const leagues = JSON.parse(result.value) as League[];
        return leagues;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener ligas:', error);
      return [];
    }
  }

  // ===================================
  // READ - Obtener liga por ID
  // ===================================
  async getLeagueById(id: string): Promise<League | null> {
    const leagues = await this.getLeagues();
    return leagues.find(league => league.id === id) || null;
  }

  // ===================================
  // READ - Buscar ligas
  // ===================================
  async searchLeagues(query: string): Promise<League[]> {
    const leagues = await this.getLeagues();
    const searchLower = query.toLowerCase();
    
    return leagues.filter(league => 
      league.name.toLowerCase().includes(searchLower) ||
      league.shortName.toLowerCase().includes(searchLower) ||
      league.country.toLowerCase().includes(searchLower) ||
      league.description.toLowerCase().includes(searchLower)
    );
  }

  // ===================================
  // READ - Filtrar por país
  // ===================================
  async getLeaguesByCountry(country: string): Promise<League[]> {
    const leagues = await this.getLeagues();
    return leagues.filter(league => 
      league.country.toLowerCase() === country.toLowerCase()
    );
  }

  // ===================================
  // READ - Filtrar por tipo
  // ===================================
  async getLeaguesByType(type: League['type']): Promise<League[]> {
    const leagues = await this.getLeagues();
    return leagues.filter(league => league.type === type);
  }

  // ===================================
  // READ - Filtrar por estado
  // ===================================
  async getLeaguesByStatus(status: League['status']): Promise<League[]> {
    const leagues = await this.getLeagues();
    return leagues.filter(league => league.status === status);
  }

  // ===================================
  // UPDATE - Actualizar liga
  // ===================================
  async updateLeague(id: string, updates: Partial<League>): Promise<League | null> {
    const leagues = await this.getLeagues();
    const index = leagues.findIndex(league => league.id === id);
    
    if (index === -1) {
      console.error('❌ Liga no encontrada:', id);
      return null;
    }

    leagues[index] = {
      ...leagues[index],
      ...updates,
      id: leagues[index].id, // Mantener ID original
      createdAt: leagues[index].createdAt, // Mantener fecha de creación
      updatedAt: new Date()
    };

    await this.saveLeagues(leagues);
    console.log('✅ Liga actualizada:', leagues[index].name);
    return leagues[index];
  }

  // ===================================
  // DELETE - Eliminar liga
  // ===================================
  async deleteLeague(id: string): Promise<boolean> {
    const leagues = await this.getLeagues();
    const filteredLeagues = leagues.filter(league => league.id !== id);
    
    if (leagues.length === filteredLeagues.length) {
      console.error('❌ Liga no encontrada:', id);
      return false;
    }

    await this.saveLeagues(filteredLeagues);
    console.log('✅ Liga eliminada:', id);
    return true;
  }

  // ===================================
  // UTILIDADES
  // ===================================
  private async saveLeagues(leagues: League[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(leagues)
      });
      this.leaguesSubject.next(leagues);
    } catch (error) {
      console.error('Error al guardar ligas:', error);
      throw error;
    }
  }

  private async loadLeagues(): Promise<void> {
    const leagues = await this.getLeagues();
    this.leaguesSubject.next(leagues);
  }

  private generateId(): string {
    return `league_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===================================
  // DATOS DE EJEMPLO
  // ===================================
  async generateSampleLeagues(): Promise<void> {
    const sampleLeagues: Omit<League, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'La Liga',
        shortName: 'LALIGA',
        logo: '🇪🇸',
        country: 'España',
        season: '2024/2025',
        type: 'domestic',
        numberOfTeams: 20,
        currentMatchday: 15,
        description: 'Primera División de España, una de las ligas más competitivas del mundo',
        founded: 1929,
        status: 'active',
        colors: { primary: '#FF6B00', secondary: '#000000' }
      },
      {
        name: 'Premier League',
        shortName: 'EPL',
        logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        country: 'Inglaterra',
        season: '2024/2025',
        type: 'domestic',
        numberOfTeams: 20,
        currentMatchday: 16,
        description: 'La liga de fútbol más vista del mundo, conocida por su intensidad',
        founded: 1992,
        status: 'active',
        colors: { primary: '#3D195B', secondary: '#00FF87' }
      },
      {
        name: 'UEFA Champions League',
        shortName: 'UCL',
        logo: '🏆',
        country: 'Europa',
        season: '2024/2025',
        type: 'international',
        numberOfTeams: 36,
        currentMatchday: 6,
        description: 'El torneo de clubes más prestigioso de Europa',
        founded: 1955,
        status: 'active',
        colors: { primary: '#002766', secondary: '#FFFFFF' }
      },
      {
        name: 'Serie A',
        shortName: 'SERIE A',
        logo: '🇮🇹',
        country: 'Italia',
        season: '2024/2025',
        type: 'domestic',
        numberOfTeams: 20,
        currentMatchday: 14,
        description: 'Primera División italiana, conocida por su táctica defensiva',
        founded: 1898,
        status: 'active',
        colors: { primary: '#008FD7', secondary: '#000000' }
      },
      {
        name: 'Bundesliga',
        shortName: 'BL',
        logo: '🇩🇪',
        country: 'Alemania',
        season: '2024/2025',
        type: 'domestic',
        numberOfTeams: 18,
        currentMatchday: 13,
        description: 'Primera División alemana, famosa por su ambiente y afición',
        founded: 1963,
        status: 'active',
        colors: { primary: '#D20515', secondary: '#000000' }
      },
      {
        name: 'Copa del Rey',
        shortName: 'CDR',
        logo: '👑',
        country: 'España',
        season: '2024/2025',
        type: 'cup',
        numberOfTeams: 116,
        currentMatchday: 3,
        description: 'Torneo de copa nacional de España con sistema de eliminación directa',
        founded: 1903,
        status: 'active',
        colors: { primary: '#AA151B', secondary: '#F1BF00' }
      }
    ];

    for (const leagueData of sampleLeagues) {
      await this.createLeague(leagueData);
    }
    
    console.log('✅ Ligas de ejemplo generadas');
  }

  // ===================================
  // LIMPIAR DATOS
  // ===================================
  async clearAllLeagues(): Promise<void> {
    await Preferences.remove({ key: this.STORAGE_KEY });
    this.leaguesSubject.next([]);
    console.log('🗑️ Todas las ligas eliminadas');
  }
}
