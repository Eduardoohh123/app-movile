import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';

export interface Bet {
  id: string;
  userId: string;
  matchId?: string;
  matchName: string; // Ej: "Real Madrid vs Barcelona"
  betType: 'winner' | 'score' | 'goals' | 'corners' | 'cards';
  prediction: string; // Ej: "Real Madrid", "2-1", "Más de 2.5"
  odds: number; // Cuota/Momio
  stake: number; // Monto apostado
  potentialWin: number; // Ganancia potencial
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  league: string;
  matchDate: Date;
  placedAt: Date;
  settledAt?: Date;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BetsService {
  private readonly STORAGE_KEY = 'user_bets';
  private betsSubject = new BehaviorSubject<Bet[]>([]);
  public bets$: Observable<Bet[]> = this.betsSubject.asObservable();
  private useFirebase = true; // Toggle para usar Firebase

  constructor(private firebaseService: FirebaseService) {
    this.loadBets();
  }

  // ===================================
  // CREATE - Crear nueva apuesta
  // ===================================
  async createBet(betData: Omit<Bet, 'id' | 'placedAt' | 'potentialWin'>): Promise<Bet> {
    const bets = await this.getBets();
    
    const newBet: Bet = {
      ...betData,
      id: this.generateId(),
      placedAt: new Date(),
      potentialWin: this.calculatePotentialWin(betData.stake, betData.odds)
    };

    // Guardar en Capacitor (local)
    bets.push(newBet);
    await this.saveBets(bets);
    
    // Guardar en Firebase (nube) SIEMPRE
    if (this.useFirebase) {
      try {
        await this.firebaseService.createBet(newBet);
        console.log('☁️ Apuesta sincronizada con Firebase');
      } catch (error) {
        console.error('⚠️ Error al sincronizar con Firebase:', error);
      }
    }
    
    console.log('✅ Apuesta creada:', newBet.matchName);
    return newBet;
  }

  // ===================================
  // READ - Obtener todas las apuestas
  // ===================================
  async getBets(): Promise<Bet[]> {
    try {
      const result = await Preferences.get({ key: this.STORAGE_KEY });
      if (result.value) {
        const bets = JSON.parse(result.value) as Bet[];
        return bets;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener apuestas:', error);
      return [];
    }
  }

  // ===================================
  // READ - Obtener apuesta por ID
  // ===================================
  async getBetById(id: string): Promise<Bet | null> {
    const bets = await this.getBets();
    return bets.find(bet => bet.id === id) || null;
  }

  // ===================================
  // READ - Obtener apuestas por usuario
  // ===================================
  async getBetsByUser(userId: string): Promise<Bet[]> {
    const bets = await this.getBets();
    return bets.filter(bet => bet.userId === userId);
  }

  // ===================================
  // READ - Buscar apuestas
  // ===================================
  async searchBets(query: string, userId?: string): Promise<Bet[]> {
    let bets = await this.getBets();
    
    if (userId) {
      bets = bets.filter(bet => bet.userId === userId);
    }
    
    const searchLower = query.toLowerCase();
    return bets.filter(bet => 
      bet.matchName.toLowerCase().includes(searchLower) ||
      bet.league.toLowerCase().includes(searchLower) ||
      bet.prediction.toLowerCase().includes(searchLower)
    );
  }

  // ===================================
  // READ - Filtrar por estado
  // ===================================
  async getBetsByStatus(status: Bet['status'], userId?: string): Promise<Bet[]> {
    let bets = await this.getBets();
    
    if (userId) {
      bets = bets.filter(bet => bet.userId === userId);
    }
    
    return bets.filter(bet => bet.status === status);
  }

  // ===================================
  // READ - Filtrar por tipo
  // ===================================
  async getBetsByType(betType: Bet['betType'], userId?: string): Promise<Bet[]> {
    let bets = await this.getBets();
    
    if (userId) {
      bets = bets.filter(bet => bet.userId === userId);
    }
    
    return bets.filter(bet => bet.betType === betType);
  }

  // ===================================
  // UPDATE - Actualizar apuesta
  // ===================================
  async updateBet(id: string, updates: Partial<Bet>): Promise<Bet | null> {
    const bets = await this.getBets();
    const index = bets.findIndex(bet => bet.id === id);
    
    if (index === -1) {
      console.error('❌ Apuesta no encontrada:', id);
      return null;
    }

    // Recalcular ganancia potencial si cambian stake u odds
    if (updates.stake !== undefined || updates.odds !== undefined) {
      const stake = updates.stake !== undefined ? updates.stake : bets[index].stake;
      const odds = updates.odds !== undefined ? updates.odds : bets[index].odds;
      updates.potentialWin = this.calculatePotentialWin(stake, odds);
    }

    bets[index] = {
      ...bets[index],
      ...updates,
      id: bets[index].id, // Mantener ID original
      placedAt: bets[index].placedAt // Mantener fecha de creación
    };

    await this.saveBets(bets);
    
    // Actualizar en Firebase SIEMPRE
    if (this.useFirebase) {
      try {
        await this.firebaseService.updateBet(id, updates);
        console.log('☁️ Apuesta actualizada en Firebase');
      } catch (error) {
        console.error('⚠️ Error al actualizar en Firebase:', error);
      }
    }
    
    console.log('✅ Apuesta actualizada:', bets[index].matchName);
    return bets[index];
  }

  // ===================================
  // UPDATE - Marcar apuesta como ganada
  // ===================================
  async settleBetAsWon(id: string): Promise<Bet | null> {
    return await this.updateBet(id, {
      status: 'won',
      settledAt: new Date()
    });
  }

  // ===================================
  // UPDATE - Marcar apuesta como perdida
  // ===================================
  async settleBetAsLost(id: string): Promise<Bet | null> {
    return await this.updateBet(id, {
      status: 'lost',
      settledAt: new Date()
    });
  }

  // ===================================
  // UPDATE - Cancelar apuesta
  // ===================================
  async cancelBet(id: string): Promise<Bet | null> {
    return await this.updateBet(id, {
      status: 'cancelled',
      settledAt: new Date()
    });
  }

  // ===================================
  // DELETE - Eliminar apuesta
  // ===================================
  async deleteBet(id: string): Promise<boolean> {
    const bets = await this.getBets();
    const filteredBets = bets.filter(bet => bet.id !== id);
    
    if (bets.length === filteredBets.length) {
      console.error('❌ Apuesta no encontrada:', id);
      return false;
    }

    await this.saveBets(filteredBets);
    
    // Eliminar de Firebase SIEMPRE
    if (this.useFirebase) {
      try {
        await this.firebaseService.deleteBet(id);
        console.log('☁️ Apuesta eliminada de Firebase');
      } catch (error) {
        console.error('⚠️ Error al eliminar de Firebase:', error);
      }
    }
    
    console.log('✅ Apuesta eliminada:', id);
    return true;
  }

  // ===================================
  // ESTADÍSTICAS
  // ===================================
  async getUserStats(userId: string) {
    const bets = await this.getBetsByUser(userId);
    
    const stats = {
      totalBets: bets.length,
      pending: bets.filter(b => b.status === 'pending').length,
      won: bets.filter(b => b.status === 'won').length,
      lost: bets.filter(b => b.status === 'lost').length,
      cancelled: bets.filter(b => b.status === 'cancelled').length,
      totalStaked: bets.reduce((sum, b) => sum + b.stake, 0),
      totalWon: bets.filter(b => b.status === 'won').reduce((sum, b) => sum + b.potentialWin, 0),
      totalLost: bets.filter(b => b.status === 'lost').reduce((sum, b) => sum + b.stake, 0),
      winRate: 0,
      profitLoss: 0
    };

    const settledBets = stats.won + stats.lost;
    if (settledBets > 0) {
      stats.winRate = (stats.won / settledBets) * 100;
    }

    stats.profitLoss = stats.totalWon - stats.totalLost;

    return stats;
  }

  // ===================================
  // UTILIDADES
  // ===================================
  private calculatePotentialWin(stake: number, odds: number): number {
    return stake * odds;
  }

  private async saveBets(bets: Bet[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(bets)
      });
      this.betsSubject.next(bets);
    } catch (error) {
      console.error('Error al guardar apuestas:', error);
      throw error;
    }
  }

  private async loadBets(): Promise<void> {
    const bets = await this.getBets();
    this.betsSubject.next(bets);
  }

  private generateId(): string {
    return `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===================================
  // DATOS DE EJEMPLO
  // ===================================
  async generateSampleBets(userId: string): Promise<void> {
    const sampleBets: Omit<Bet, 'id' | 'placedAt' | 'potentialWin'>[] = [
      {
        userId,
        matchName: 'Real Madrid vs Barcelona',
        betType: 'winner',
        prediction: 'Real Madrid',
        odds: 2.5,
        stake: 50,
        status: 'pending',
        league: 'La Liga',
        matchDate: new Date('2025-12-15T20:00:00'),
        notes: 'Clásico español - Real Madrid en casa'
      },
      {
        userId,
        matchName: 'Liverpool vs Manchester United',
        betType: 'score',
        prediction: '2-1',
        odds: 8.0,
        stake: 25,
        status: 'won',
        league: 'Premier League',
        matchDate: new Date('2025-12-01T15:00:00'),
        settledAt: new Date('2025-12-01T17:00:00'),
        notes: '¡Resultado exacto!'
      },
      {
        userId,
        matchName: 'Bayern Munich vs Borussia Dortmund',
        betType: 'goals',
        prediction: 'Más de 2.5 goles',
        odds: 1.8,
        stake: 100,
        status: 'lost',
        league: 'Bundesliga',
        matchDate: new Date('2025-11-28T18:30:00'),
        settledAt: new Date('2025-11-28T20:30:00'),
        notes: 'Solo 2 goles en el partido'
      },
      {
        userId,
        matchName: 'PSG vs Marseille',
        betType: 'winner',
        prediction: 'PSG',
        odds: 1.5,
        stake: 200,
        status: 'won',
        league: 'Ligue 1',
        matchDate: new Date('2025-11-25T21:00:00'),
        settledAt: new Date('2025-11-25T23:00:00'),
        notes: 'Victoria clara del PSG'
      },
      {
        userId,
        matchName: 'Inter Milan vs AC Milan',
        betType: 'goals',
        prediction: 'Ambos equipos anotan',
        odds: 1.7,
        stake: 75,
        status: 'pending',
        league: 'Serie A',
        matchDate: new Date('2025-12-20T20:45:00'),
        notes: 'Derby della Madonnina'
      }
    ];

    for (const betData of sampleBets) {
      await this.createBet(betData);
    }
    
    console.log('✅ Apuestas de ejemplo generadas');
  }

  // ===================================
  // LIMPIAR DATOS
  // ===================================
  async clearAllBets(): Promise<void> {
    await Preferences.remove({ key: this.STORAGE_KEY });
    this.betsSubject.next([]);
    console.log('🗑️ Todas las apuestas eliminadas');
  }

  async clearUserBets(userId: string): Promise<void> {
    const bets = await this.getBets();
    const filteredBets = bets.filter(bet => bet.userId !== userId);
    await this.saveBets(filteredBets);
    console.log('🗑️ Apuestas del usuario eliminadas');
  }
}
