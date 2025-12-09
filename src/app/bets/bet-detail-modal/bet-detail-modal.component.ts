import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { BetsService, Bet } from '../../services/bets.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-bet-detail-modal',
  templateUrl: './bet-detail-modal.component.html',
  styleUrls: ['./bet-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BetDetailModalComponent implements OnInit {
  @Input() bet?: Bet;
  @Input() isEditMode: boolean = false;

  betForm: {
    matchName: string;
    league: string;
    betType: 'winner' | 'score' | 'goals' | 'corners' | 'cards';
    prediction: string;
    odds: number;
    stake: number;
    matchDate: string;
    notes: string;
  } = {
    matchName: '',
    league: '',
    betType: 'winner',
    prediction: '',
    odds: 1.5,
    stake: 10,
    matchDate: new Date().toISOString(),
    notes: ''
  };

  currentUserId: string = '';
  potentialWin: number = 0;
  minDate: string = new Date().toISOString();

  constructor(
    private modalController: ModalController,
    private betsService: BetsService,
    private userService: UserService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.userService.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
      }
    });

    if (this.bet && this.isEditMode) {
      this.betForm = {
        matchName: this.bet.matchName,
        league: this.bet.league,
        betType: this.bet.betType,
        prediction: this.bet.prediction,
        odds: this.bet.odds,
        stake: this.bet.stake,
        matchDate: typeof this.bet.matchDate === 'string' ? this.bet.matchDate : this.bet.matchDate.toISOString(),
        notes: this.bet.notes || ''
      };
      this.calculatePotentialWin();
    }
  }

  calculatePotentialWin() {
    this.potentialWin = this.betForm.stake * this.betForm.odds;
  }

  onOddsChange() {
    this.calculatePotentialWin();
  }

  onStakeChange() {
    this.calculatePotentialWin();
  }

  async saveBet() {
    if (!this.validateForm()) {
      await this.showToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    try {
      if (this.isEditMode && this.bet) {
        // Update existing bet
        const updatedBet: Bet = {
          ...this.bet,
          matchName: this.betForm.matchName,
          league: this.betForm.league,
          betType: this.betForm.betType,
          prediction: this.betForm.prediction,
          odds: this.betForm.odds,
          stake: this.betForm.stake,
          potentialWin: this.potentialWin,
          matchDate: typeof this.betForm.matchDate === 'string' ? new Date(this.betForm.matchDate) : this.betForm.matchDate,
          notes: this.betForm.notes
        };
        await this.betsService.updateBet(updatedBet.id, updatedBet);
        await this.showToast('Apuesta actualizada correctamente', 'success');
      } else {
        // Create new bet
        const newBet: Omit<Bet, 'id'> = {
          userId: this.currentUserId,
          matchId: `match_${Date.now()}`,
          matchName: this.betForm.matchName,
          league: this.betForm.league,
          betType: this.betForm.betType,
          prediction: this.betForm.prediction,
          odds: this.betForm.odds,
          stake: this.betForm.stake,
          potentialWin: this.potentialWin,
          status: 'pending',
          matchDate: new Date(this.betForm.matchDate),
          placedAt: new Date(),
          notes: this.betForm.notes
        };
        await this.betsService.createBet(newBet);
        await this.showToast('Apuesta creada correctamente', 'success');
      }
      this.dismiss(true);
    } catch (error) {
      console.error('Error saving bet:', error);
      await this.showToast('Error al guardar la apuesta', 'danger');
    }
  }

  validateForm(): boolean {
    return !!(
      this.betForm.matchName.trim() &&
      this.betForm.league.trim() &&
      this.betForm.prediction.trim() &&
      this.betForm.odds > 0 &&
      this.betForm.stake > 0
    );
  }

  dismiss(saved: boolean = false) {
    this.modalController.dismiss({ saved });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  getBetTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'winner': 'Ganador',
      'score': 'Resultado Exacto',
      'goals': 'Cantidad de Goles',
      'both-teams-score': 'Ambos Equipos Anotan',
      'over-under': 'Más/Menos',
      'handicap': 'Hándicap'
    };
    return labels[type] || type;
  }
}
