import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { BetsService, Bet } from '../services/bets.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { BetDetailModalComponent } from './bet-detail-modal/bet-detail-modal.component';

@Component({
  selector: 'app-bets',
  templateUrl: './bets.page.html',
  styleUrls: ['./bets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BetsPage implements OnInit, OnDestroy {
  bets: Bet[] = [];
  filteredBets: Bet[] = [];
  searchQuery: string = '';
  selectedStatus: string = 'all';
  currentUserId: string = '';
  currentUserName: string = '';
  isSearchFocused: boolean = false;
  
  userStats: any = {
    totalBets: 0,
    won: 0,
    lost: 0,
    pending: 0,
    winRate: 0,
    profitLoss: 0,
    totalStaked: 0,
    totalWon: 0,
    totalLost: 0
  };

  private betsSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private betsService: BetsService,
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    // Subscribe to user for getting current userId
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.currentUserName = user.name || 'Usuario';
        this.loadBets();
        this.loadUserStats();
      }
    });

    // Subscribe to bets changes
    this.betsSubscription = this.betsService.bets$.subscribe(bets => {
      this.bets = bets.filter(bet => bet.userId === this.currentUserId);
      this.filterBets();
    });

    await this.loadBets();
    await this.loadUserStats();
  }

  ngOnDestroy() {
    if (this.betsSubscription) {
      this.betsSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async loadBets() {
    try {
      const allBets = await this.betsService.getBets();
      this.bets = allBets.filter(bet => bet.userId === this.currentUserId);
      this.filterBets();
    } catch (error) {
      console.error('Error loading bets:', error);
      this.showToast('Error al cargar las apuestas', 'danger');
    }
  }

  async loadUserStats() {
    try {
      this.userStats = await this.betsService.getUserStats(this.currentUserId);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  filterBets() {
    let filtered = [...this.bets];

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(bet =>
        bet.matchName.toLowerCase().includes(query) ||
        bet.league.toLowerCase().includes(query) ||
        bet.prediction.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(bet => bet.status === this.selectedStatus);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

    this.filteredBets = filtered;
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.filterBets();
  }

  onStatusChange(event: any) {
    this.selectedStatus = event.detail.value;
    this.filterBets();
  }

  async openBetDetail(bet?: Bet, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const modal = await this.modalController.create({
      component: BetDetailModalComponent,
      componentProps: {
        bet: bet,
        isEditMode: !!bet
      },
      backdropDismiss: true
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.saved) {
      await this.loadBets();
      await this.loadUserStats();
    }
  }

  async settleBet(bet: Bet, result: 'won' | 'lost', event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: '¿Liquidar apuesta?',
      message: `¿Marcar esta apuesta como ${result === 'won' ? 'ganada' : 'perdida'}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              if (result === 'won') {
                await this.betsService.settleBetAsWon(bet.id);
                this.showToast(`¡Apuesta ganada! +$${bet.potentialWin.toFixed(2)}`, 'success');
              } else {
                await this.betsService.settleBetAsLost(bet.id);
                this.showToast('Apuesta perdida', 'warning');
              }
              await this.loadUserStats();
            } catch (error) {
              console.error('Error settling bet:', error);
              this.showToast('Error al liquidar la apuesta', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelBet(bet: Bet, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: '¿Cancelar apuesta?',
      message: '¿Estás seguro de que deseas cancelar esta apuesta?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: async () => {
            try {
              await this.betsService.cancelBet(bet.id);
              this.showToast('Apuesta cancelada', 'warning');
              await this.loadUserStats();
            } catch (error) {
              console.error('Error cancelling bet:', error);
              this.showToast('Error al cancelar la apuesta', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteBet(bet: Bet, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: '¿Eliminar apuesta?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            try {
              await this.betsService.deleteBet(bet.id);
              this.showToast('Apuesta eliminada', 'success');
              await this.loadUserStats();
            } catch (error) {
              console.error('Error deleting bet:', error);
              this.showToast('Error al eliminar la apuesta', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async generateSampleData() {
    const alert = await this.alertController.create({
      header: 'Generar Ejemplos',
      message: '¿Deseas generar apuestas de ejemplo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Generar',
          handler: async () => {
            try {
              await this.betsService.generateSampleBets(this.currentUserId);
              this.showToast('Apuestas de ejemplo generadas', 'success');
              await this.loadUserStats();
            } catch (error) {
              console.error('Error generating samples:', error);
              this.showToast('Error al generar ejemplos', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async clearAllBets() {
    const alert = await this.alertController.create({
      header: '⚠️ Eliminar Todo',
      message: '¿Estás seguro de que deseas eliminar todas tus apuestas? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar Todo',
          cssClass: 'danger',
          handler: async () => {
            try {
              await this.betsService.clearUserBets(this.currentUserId);
              this.showToast('Todas las apuestas han sido eliminadas', 'success');
              this.userStats = {
                totalBets: 0,
                won: 0,
                lost: 0,
                pending: 0,
                winRate: 0,
                profitLoss: 0,
                totalStaked: 0,
                totalWon: 0,
                totalLost: 0
              };
            } catch (error) {
              console.error('Error clearing bets:', error);
              this.showToast('Error al eliminar las apuestas', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'Pendiente',
      'won': 'Ganada',
      'lost': 'Perdida',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'pending': 'warning',
      'won': 'success',
      'lost': 'danger',
      'cancelled': 'medium'
    };
    return colors[status] || 'medium';
  }

  getBetTypeLabel(type: string): string {
    const labels: any = {
      'winner': 'Ganador',
      'score': 'Resultado',
      'goals': 'Goles',
      'corners': 'Corners',
      'cards': 'Tarjetas'
    };
    return labels[type] || type;
  }

  formatDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
