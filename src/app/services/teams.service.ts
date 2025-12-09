import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string; // Base64 o URL
  country: string;
  city: string;
  stadium: string;
  founded: number;
  league: string; // ID de la liga
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
export class TeamsService {
  private readonly STORAGE_KEY = 'football_teams';
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  public teams$: Observable<Team[]> = this.teamsSubject.asObservable();
  private useFirebase = true; // Toggle para usar Firebase

  constructor(private firebaseService: FirebaseService) {
    this.loadTeams();
  }

  // ===================================
  // CREATE - Crear nuevo equipo
  // ===================================
  async createTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const teams = await this.getTeams();
    
    const newTeam: Team = {
      ...teamData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    teams.push(newTeam);
    await this.saveTeams(teams);
    
    // Sincronizar con Firebase SIEMPRE
    if (this.useFirebase) {
      try {
        await this.firebaseService.createTeam(newTeam);
        console.log('☁️ Equipo sincronizado con Firebase');
      } catch (error) {
        console.error('⚠️ Error al sincronizar equipo con Firebase:', error);
      }
    }
    
    console.log('✅ Equipo creado:', newTeam.name);
    return newTeam;
  }

  // ===================================
  // READ - Obtener todos los equipos
  // ===================================
  async getTeams(): Promise<Team[]> {
    try {
      const result = await Preferences.get({ key: this.STORAGE_KEY });
      if (result.value) {
        const teams = JSON.parse(result.value) as Team[];
        return teams;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      return [];
    }
  }

  // ===================================
  // READ - Obtener equipo por ID
  // ===================================
  async getTeamById(id: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find(team => team.id === id) || null;
  }

  // ===================================
  // READ - Buscar equipos
  // ===================================
  async searchTeams(query: string): Promise<Team[]> {
    const teams = await this.getTeams();
    const searchLower = query.toLowerCase();
    
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchLower) ||
      team.shortName.toLowerCase().includes(searchLower) ||
      team.city.toLowerCase().includes(searchLower) ||
      team.country.toLowerCase().includes(searchLower)
    );
  }

  // ===================================
  // READ - Filtrar por liga
  // ===================================
  async getTeamsByLeague(leagueId: string): Promise<Team[]> {
    const teams = await this.getTeams();
    return teams.filter(team => team.league === leagueId);
  }

  // ===================================
  // UPDATE - Actualizar equipo
  // ===================================
  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
    const teams = await this.getTeams();
    const index = teams.findIndex(team => team.id === id);
    
    if (index === -1) {
      console.error('❌ Equipo no encontrado:', id);
      return null;
    }

    teams[index] = {
      ...teams[index],
      ...updates,
      id: teams[index].id, // Mantener ID original
      createdAt: teams[index].createdAt, // Mantener fecha de creación
      updatedAt: new Date()
    };

    await this.saveTeams(teams);
    console.log('✅ Equipo actualizado:', teams[index].name);
    return teams[index];
  }

  // ===================================
  // DELETE - Eliminar equipo
  // ===================================
  async deleteTeam(id: string): Promise<boolean> {
    const teams = await this.getTeams();
    const filteredTeams = teams.filter(team => team.id !== id);
    
    if (teams.length === filteredTeams.length) {
      console.error('❌ Equipo no encontrado:', id);
      return false;
    }

    await this.saveTeams(filteredTeams);
    console.log('✅ Equipo eliminado:', id);
    return true;
  }

  // ===================================
  // UTILIDADES
  // ===================================
  private async saveTeams(teams: Team[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(teams)
      });
      this.teamsSubject.next(teams);
    } catch (error) {
      console.error('Error al guardar equipos:', error);
      throw error;
    }
  }

  private async loadTeams(): Promise<void> {
    const teams = await this.getTeams();
    this.teamsSubject.next(teams);
  }

  private generateId(): string {
    return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===================================
  // DATOS DE EJEMPLO
  // ===================================
  async generateSampleTeams(): Promise<void> {
    const sampleTeams: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Real Madrid',
        shortName: 'RMA',
        logo: '🏆',
        country: 'España',
        city: 'Madrid',
        stadium: 'Santiago Bernabéu',
        founded: 1902,
        league: 'la_liga',
        colors: { primary: '#FFFFFF', secondary: '#004170' },
        stats: { wins: 28, draws: 5, losses: 5, goalsFor: 85, goalsAgainst: 32 }
      },
      {
        name: 'FC Barcelona',
        shortName: 'FCB',
        logo: '⚽',
        country: 'España',
        city: 'Barcelona',
        stadium: 'Camp Nou',
        founded: 1899,
        league: 'la_liga',
        colors: { primary: '#A50044', secondary: '#004D98' },
        stats: { wins: 25, draws: 8, losses: 5, goalsFor: 78, goalsAgainst: 35 }
      },
      {
        name: 'Manchester United',
        shortName: 'MUN',
        logo: '👹',
        country: 'Inglaterra',
        city: 'Manchester',
        stadium: 'Old Trafford',
        founded: 1878,
        league: 'premier_league',
        colors: { primary: '#DA291C', secondary: '#FBE122' },
        stats: { wins: 22, draws: 10, losses: 6, goalsFor: 70, goalsAgainst: 42 }
      },
      {
        name: 'Liverpool FC',
        shortName: 'LIV',
        logo: '🔴',
        country: 'Inglaterra',
        city: 'Liverpool',
        stadium: 'Anfield',
        founded: 1892,
        league: 'premier_league',
        colors: { primary: '#C8102E', secondary: '#00B2A9' },
        stats: { wins: 26, draws: 7, losses: 5, goalsFor: 82, goalsAgainst: 38 }
      }
    ];

    for (const teamData of sampleTeams) {
      await this.createTeam(teamData);
    }
    
    console.log('✅ Equipos de ejemplo generados');
  }

  // ===================================
  // LIMPIAR DATOS
  // ===================================
  async clearAllTeams(): Promise<void> {
    await Preferences.remove({ key: this.STORAGE_KEY });
    this.teamsSubject.next([]);
    console.log('🗑️ Todos los equipos eliminados');
  }
}
