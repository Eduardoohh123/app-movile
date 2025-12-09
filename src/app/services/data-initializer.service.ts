import { Injectable } from '@angular/core';
import { FirebaseService, User, Bet, League, Team } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class DataInitializerService {

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Inicializar base de datos con datos de ejemplo
   */
  async initializeDatabase(): Promise<void> {
    try {
      console.log('🚀 Iniciando población de datos...');

      // 1. Crear usuarios de prueba
      await this.createSampleUsers();
      
      // 2. Crear ligas
      await this.createSampleLeagues();
      
      // 3. Crear equipos
      await this.createSampleTeams();
      
      // 4. Crear apuestas
      await this.createSampleBets();

      console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      throw error;
    }
  }

  /**
   * Crear usuarios de ejemplo
   */
  private async createSampleUsers(): Promise<void> {
    console.log('👥 Creando usuarios de ejemplo...');

    const users: Omit<User, 'id'>[] = [
      {
        name: 'Eduardo González',
        email: 'eduardo@footballscoop.com',
        avatar: 'https://i.pravatar.cc/150?img=12',
        phone: '+34 612 345 678',
        balance: 1500.00,
        joinDate: new Date('2024-01-15'),
        firebaseUid: 'user-eduardo-123'
      },
      {
        name: 'María Rodríguez',
        email: 'maria@footballscoop.com',
        avatar: 'https://i.pravatar.cc/150?img=5',
        phone: '+34 623 456 789',
        balance: 2300.50,
        joinDate: new Date('2024-02-20'),
        firebaseUid: 'user-maria-456'
      },
      {
        name: 'Carlos Pérez',
        email: 'carlos@footballscoop.com',
        avatar: 'https://i.pravatar.cc/150?img=33',
        phone: '+34 634 567 890',
        balance: 850.75,
        joinDate: new Date('2024-03-10'),
        firebaseUid: 'user-carlos-789'
      }
    ];

    for (const user of users) {
      try {
        const userId = await this.firebaseService.createUser({ ...user, id: '' } as User);
        console.log(`  ✅ Usuario creado: ${user.name} (${userId})`);
      } catch (error) {
        console.error(`  ❌ Error creando usuario ${user.name}:`, error);
      }
    }
  }

  /**
   * Crear ligas de ejemplo
   */
  private async createSampleLeagues(): Promise<void> {
    console.log('🏆 Creando ligas de ejemplo...');

    const leagues: Omit<League, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Premier League',
        shortName: 'EPL',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg',
        country: 'England',
        season: '2024/2025',
        type: 'domestic',
        numberOfTeams: 20,
        currentMatchday: 15,
        description: 'The top tier of English football',
        founded: 1992,
        status: 'active',
        colors: {
          primary: '#3d195b',
          secondary: '#00ff87'
        }
      },
      {
        name: 'La Liga',
        shortName: 'LaLiga',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/LaLiga.svg',
        country: 'Spain',
        season: '2024/2025',
        type: 'domestic',
        numberOfTeams: 20,
        currentMatchday: 16,
        description: 'Spanish premier football league',
        founded: 1929,
        status: 'active',
        colors: {
          primary: '#ee8707',
          secondary: '#333333'
        }
      },
      {
        name: 'UEFA Champions League',
        shortName: 'UCL',
        logo: 'https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg',
        country: 'Europe',
        season: '2024/2025',
        type: 'international',
        numberOfTeams: 32,
        currentMatchday: 6,
        description: 'Europe\'s premier club competition',
        founded: 1955,
        status: 'active',
        colors: {
          primary: '#002b5c',
          secondary: '#0e73ba'
        }
      }
    ];

    for (const league of leagues) {
      try {
        const leagueId = await this.firebaseService.createLeague(league);
        console.log(`  ✅ Liga creada: ${league.name} (${leagueId})`);
      } catch (error) {
        console.error(`  ❌ Error creando liga ${league.name}:`, error);
      }
    }
  }

  /**
   * Crear equipos de ejemplo
   */
  private async createSampleTeams(): Promise<void> {
    console.log('⚽ Creando equipos de ejemplo...');

    const teams: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Manchester City',
        shortName: 'MCI',
        logo: 'https://resources.premierleague.com/premierleague/badges/t43.svg',
        country: 'England',
        city: 'Manchester',
        stadium: 'Etihad Stadium',
        founded: 1880,
        league: 'premier-league',
        colors: {
          primary: '#6cabdd',
          secondary: '#1c2c5b'
        },
        stats: {
          wins: 11,
          draws: 2,
          losses: 2,
          goalsFor: 35,
          goalsAgainst: 15
        }
      },
      {
        name: 'Real Madrid',
        shortName: 'RMA',
        logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
        country: 'Spain',
        city: 'Madrid',
        stadium: 'Santiago Bernabéu',
        founded: 1902,
        league: 'la-liga',
        colors: {
          primary: '#ffffff',
          secondary: '#febe10'
        },
        stats: {
          wins: 12,
          draws: 3,
          losses: 1,
          goalsFor: 38,
          goalsAgainst: 12
        }
      },
      {
        name: 'FC Barcelona',
        shortName: 'BAR',
        logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
        country: 'Spain',
        city: 'Barcelona',
        stadium: 'Camp Nou',
        founded: 1899,
        league: 'la-liga',
        colors: {
          primary: '#a50044',
          secondary: '#004d98'
        },
        stats: {
          wins: 11,
          draws: 2,
          losses: 3,
          goalsFor: 42,
          goalsAgainst: 18
        }
      },
      {
        name: 'Liverpool FC',
        shortName: 'LIV',
        logo: 'https://resources.premierleague.com/premierleague/badges/t14.svg',
        country: 'England',
        city: 'Liverpool',
        stadium: 'Anfield',
        founded: 1892,
        league: 'premier-league',
        colors: {
          primary: '#c8102e',
          secondary: '#00b2a9'
        },
        stats: {
          wins: 13,
          draws: 1,
          losses: 1,
          goalsFor: 39,
          goalsAgainst: 13
        }
      }
    ];

    for (const team of teams) {
      try {
        const teamId = await this.firebaseService.createTeam(team);
        console.log(`  ✅ Equipo creado: ${team.name} (${teamId})`);
      } catch (error) {
        console.error(`  ❌ Error creando equipo ${team.name}:`, error);
      }
    }
  }

  /**
   * Crear apuestas de ejemplo
   */
  private async createSampleBets(): Promise<void> {
    console.log('🎲 Creando apuestas de ejemplo...');

    const bets: Omit<Bet, 'id' | 'placedAt'>[] = [
      {
        userId: 'user-eduardo-123',
        matchName: 'Manchester City vs Liverpool',
        betType: 'winner',
        prediction: 'Liverpool to win',
        odds: 2.5,
        stake: 50,
        potentialWin: 125,
        status: 'pending',
        league: 'Premier League',
        matchDate: new Date('2024-12-15T15:00:00Z')
      },
      {
        userId: 'user-eduardo-123',
        matchName: 'Real Madrid vs Barcelona',
        betType: 'score',
        prediction: '2-1',
        odds: 7.5,
        stake: 25,
        potentialWin: 187.5,
        status: 'pending',
        league: 'La Liga',
        matchDate: new Date('2024-12-14T20:00:00Z')
      },
      {
        userId: 'user-maria-456',
        matchName: 'Bayern Munich vs PSG',
        betType: 'goals',
        prediction: 'Over 2.5 goals',
        odds: 1.8,
        stake: 100,
        potentialWin: 180,
        status: 'won',
        league: 'UEFA Champions League',
        matchDate: new Date('2024-12-05T20:00:00Z'),
        settledAt: new Date('2024-12-05T22:30:00Z')
      },
      {
        userId: 'user-carlos-789',
        matchName: 'Arsenal vs Chelsea',
        betType: 'winner',
        prediction: 'Arsenal to win',
        odds: 2.2,
        stake: 30,
        potentialWin: 66,
        status: 'lost',
        league: 'Premier League',
        matchDate: new Date('2024-12-01T17:30:00Z'),
        settledAt: new Date('2024-12-01T19:30:00Z')
      },
      {
        userId: 'user-maria-456',
        matchName: 'Atletico Madrid vs Sevilla',
        betType: 'goals',
        prediction: 'Under 2.5 goals',
        odds: 2.1,
        stake: 40,
        potentialWin: 84,
        status: 'pending',
        league: 'La Liga',
        matchDate: new Date('2024-12-16T18:00:00Z')
      }
    ];

    for (const bet of bets) {
      try {
        const betId = await this.firebaseService.createBet(bet);
        console.log(`  ✅ Apuesta creada: ${bet.matchName} (${betId})`);
      } catch (error) {
        console.error(`  ❌ Error creando apuesta ${bet.matchName}:`, error);
      }
    }
  }

  /**
   * Limpiar toda la base de datos (usar con cuidado)
   */
  async clearDatabase(): Promise<void> {
    console.warn('⚠️ Esta función eliminará TODOS los datos. Úsala solo en desarrollo.');
    // Implementar si es necesario
  }
}
