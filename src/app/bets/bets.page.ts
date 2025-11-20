import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { Subscription } from 'rxjs';

interface Bet {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueBadge: string;
  date: string;
  time: string;
  isLive?: boolean;
  score?: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  category: string;
  featured?: boolean;
}

interface ActiveBet {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  bet: string;
  betType: 'home' | 'draw' | 'away';
  amount: number;
  odds: number;
  potential: number;
  status: 'pending' | 'live';
  date: string;
  time?: string;
}

interface HistoryBet {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  bet: string;
  amount: number;
  odds: number;
  result: number;
  status: 'won' | 'lost';
  date: string;
  finalScore?: string;
}

@Component({
  selector: 'app-bets',
  templateUrl: './bets.page.html',
  styleUrls: ['./bets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BetsPage implements OnInit, OnDestroy {

  selectedTab = 'available';
  currentUser: User | null = null;
  private userSubscription?: Subscription;
  selectedCategory = 'all';
  
  // Carrito de apuestas
  betSlip: any[] = [];
  betSlipOpen = false;

  categories = [
    { id: 'all', name: 'Todas', icon: 'apps-outline' },
    { id: 'football', name: 'Fútbol', icon: 'football-outline' },
    { id: 'basketball', name: 'Basket', icon: 'basketball-outline' },
    { id: 'tennis', name: 'Tenis', icon: 'tennisball-outline' }
  ];

  availableBets: Bet[] = [
    {
      id: 1,
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      league: 'La Liga',
      leagueBadge: '🇪🇸',
      date: 'Hoy',
      time: '20:00',
      isLive: false,
      odds: { home: 2.10, draw: 3.40, away: 3.20 },
      category: 'football',
      featured: true
    },
    {
      id: 2,
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      league: 'Premier League',
      leagueBadge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      date: 'Hoy',
      time: '17:30',
      isLive: true,
      score: '1 - 1',
      odds: { home: 2.50, draw: 3.10, away: 2.80 },
      category: 'football'
    },
    {
      id: 3,
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      league: 'Bundesliga',
      leagueBadge: '🇩🇪',
      date: 'Mañana',
      time: '18:30',
      odds: { home: 1.75, draw: 3.80, away: 4.20 },
      category: 'football'
    },
    {
      id: 4,
      homeTeam: 'PSG',
      awayTeam: 'Marseille',
      league: 'Ligue 1',
      leagueBadge: '🇫🇷',
      date: 'Mañana',
      time: '21:00',
      odds: { home: 1.45, draw: 4.50, away: 6.00 },
      category: 'football'
    },
    {
      id: 5,
      homeTeam: 'Inter Milan',
      awayTeam: 'Juventus',
      league: 'Serie A',
      leagueBadge: '🇮🇹',
      date: '21 Nov',
      time: '19:45',
      odds: { home: 2.25, draw: 3.20, away: 3.10 },
      category: 'football'
    },
    {
      id: 6,
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      league: 'NBA',
      leagueBadge: '🏀',
      date: 'Hoy',
      time: '02:00',
      odds: { home: 1.90, draw: 0, away: 1.95 },
      category: 'basketball'
    }
  ];

  myBets: ActiveBet[] = [
    {
      id: 101,
      homeTeam: 'Bayern Munich',
      awayTeam: 'PSG',
      league: 'Champions League',
      bet: 'Bayern Munich',
      betType: 'home',
      amount: 100,
      odds: 1.95,
      potential: 195,
      status: 'pending',
      date: '22 Nov',
      time: '21:00'
    },
    {
      id: 102,
      homeTeam: 'Atlético Madrid',
      awayTeam: 'Sevilla',
      league: 'La Liga',
      bet: 'Empate',
      betType: 'draw',
      amount: 50,
      odds: 3.20,
      potential: 160,
      status: 'live',
      date: 'Hoy',
      time: 'En vivo'
    }
  ];

  betHistory: HistoryBet[] = [
    {
      id: 201,
      homeTeam: 'Chelsea',
      awayTeam: 'Arsenal',
      league: 'Premier League',
      bet: 'Chelsea',
      amount: 50,
      odds: 2.20,
      result: 110,
      status: 'won',
      date: '18 Nov',
      finalScore: '2 - 1'
    },
    {
      id: 202,
      homeTeam: 'Juventus',
      awayTeam: 'Milan',
      league: 'Serie A',
      bet: 'Empate',
      amount: 75,
      odds: 3.50,
      result: -75,
      status: 'lost',
      date: '17 Nov',
      finalScore: '1 - 2'
    },
    {
      id: 203,
      homeTeam: 'Barcelona',
      awayTeam: 'Real Sociedad',
      league: 'La Liga',
      bet: 'Barcelona',
      amount: 100,
      odds: 1.65,
      result: 165,
      status: 'won',
      date: '15 Nov',
      finalScore: '3 - 0'
    },
    {
      id: 204,
      homeTeam: 'Liverpool',
      awayTeam: 'Manchester City',
      league: 'Premier League',
      bet: 'Manchester City',
      amount: 80,
      odds: 2.80,
      result: -80,
      status: 'lost',
      date: '14 Nov',
      finalScore: '1 - 0'
    }
  ];

  // Estadísticas
  stats = {
    totalBets: 24,
    wonBets: 15,
    lostBets: 9,
    winRate: 62.5,
    totalProfit: 450.00
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.userSubscription = this.userService.user$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadBetsData();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadBetsData() {
    // Aquí podrías cargar datos desde un servicio/API
    console.log('Bets data loaded');
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }

  filterByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
  }

  getFilteredBets() {
    if (this.selectedCategory === 'all') {
      return this.availableBets;
    }
    return this.availableBets.filter(bet => bet.category === this.selectedCategory);
  }

  async placeBet(bet: Bet, type: 'home' | 'draw' | 'away') {
    const teamName = type === 'home' ? bet.homeTeam : type === 'away' ? bet.awayTeam : 'Empate';
    const odds = bet.odds[type];

    const alert = await this.alertController.create({
      header: '💰 Realizar Apuesta',
      message: `<strong>${teamName}</strong><br>Cuota: ${odds}`,
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Monto a apostar',
          min: 10,
          max: this.currentUser?.balance || 0
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Apostar',
          handler: (data) => {
            if (data.amount && data.amount >= 10 && data.amount <= (this.currentUser?.balance || 0)) {
              this.confirmBet(bet, type, teamName, odds, parseFloat(data.amount));
              return true;
            } else {
              this.showToast('Monto inválido', 'danger');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  confirmBet(bet: Bet, type: 'home' | 'draw' | 'away', teamName: string, odds: number, amount: number) {
    const potential = amount * odds;
    this.userService.subtractFromBalance(amount);

    const newBet: ActiveBet = {
      id: Date.now(),
      homeTeam: bet.homeTeam,
      awayTeam: bet.awayTeam,
      league: bet.league,
      bet: teamName,
      betType: type,
      amount: amount,
      odds: odds,
      potential: potential,
      status: 'pending',
      date: bet.date,
      time: bet.time
    };

    this.myBets.unshift(newBet);
    this.showToast(`¡Apuesta realizada! Ganancia potencial: $${potential.toFixed(2)}`, 'success');
    
    // Guardar en localStorage
    this.saveBetsToStorage();
  }

  async cancelBet(betId: number) {
    const alert = await this.alertController.create({
      header: 'Cancelar Apuesta',
      message: '¿Estás seguro de cancelar esta apuesta?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          handler: () => {
            const betIndex = this.myBets.findIndex(b => b.id === betId);
            if (betIndex !== -1) {
              const bet = this.myBets[betIndex];
              this.userService.addToBalance(bet.amount);
              this.myBets.splice(betIndex, 1);
              this.showToast('Apuesta cancelada y saldo devuelto', 'warning');
              this.saveBetsToStorage();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showDepositModal() {
    const alert = await this.alertController.create({
      header: '💳 Depositar Fondos',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Monto a depositar',
          min: 10
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Depositar',
          handler: (data) => {
            if (data.amount && data.amount >= 10) {
              this.userService.addToBalance(parseFloat(data.amount));
              this.showToast(`$${data.amount} depositados exitosamente`, 'success');
              this.saveBetsToStorage();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'top',
      color: color,
      cssClass: 'custom-toast'
    });
    toast.present();
  }

  saveBetsToStorage() {
    // El balance ahora se guarda automáticamente en UserService
    localStorage.setItem('myBets', JSON.stringify(this.myBets));
    localStorage.setItem('betHistory', JSON.stringify(this.betHistory));
  }

  getTotalPotential(): number {
    return this.myBets.reduce((sum, bet) => sum + bet.potential, 0);
  }

  getTotalStaked(): number {
    return this.myBets.reduce((sum, bet) => sum + bet.amount, 0);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

}
