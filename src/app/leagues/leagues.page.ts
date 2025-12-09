import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LeaguesService, League } from '../services/leagues.service';
import { LeagueDetailComponent } from './league-detail/league-detail.component';

@Component({
  selector: 'app-leagues',
  templateUrl: './leagues.page.html',
  styleUrls: ['./leagues.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LeaguesPage implements OnInit, OnDestroy {
  leagues: League[] = [];
  filteredLeagues: League[] = [];
  searchQuery: string = '';
  selectedType: string = 'all';
  selectedStatus: string = 'all';
  
  private leaguesSubscription?: Subscription;

  constructor(
    private leaguesService: LeaguesService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadLeagues();
    
    // Suscribirse a cambios en tiempo real
    this.leaguesSubscription = this.leaguesService.leagues$.subscribe(leagues => {
      this.leagues = leagues;
      this.filterLeagues();
    });
  }

  ngOnDestroy() {
    if (this.leaguesSubscription) {
      this.leaguesSubscription.unsubscribe();
    }
  }

  async loadLeagues() {
    this.leagues = await this.leaguesService.getLeagues();
    this.filterLeagues();
  }

  filterLeagues() {
    let filtered = [...this.leagues];

    // Filtrar por búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(league =>
        league.name.toLowerCase().includes(query) ||
        league.shortName.toLowerCase().includes(query) ||
        league.country.toLowerCase().includes(query) ||
        league.description.toLowerCase().includes(query)
      );
    }

    // Filtrar por tipo
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(league => league.type === this.selectedType);
    }

    // Filtrar por estado
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(league => league.status === this.selectedStatus);
    }

    this.filteredLeagues = filtered;
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value || '';
    this.filterLeagues();
  }

  onTypeChange(event: any) {
    this.selectedType = event.target.value;
    this.filterLeagues();
  }

  onStatusChange(event: any) {
    this.selectedStatus = event.target.value;
    this.filterLeagues();
  }

  async openLeagueDetail(league?: League) {
    const modal = await this.modalController.create({
      component: LeagueDetailComponent,
      componentProps: {
        league: league ? { ...league } : null
      },
      cssClass: 'league-detail-modal'
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data?.action === 'save') {
      await this.loadLeagues();
    }
  }

  async deleteLeague(league: League, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertController.create({
      header: 'Eliminar Liga',
      message: `¿Estás seguro de que deseas eliminar ${league.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const success = await this.leaguesService.deleteLeague(league.id);
            if (success) {
              await this.showToast('Liga eliminada correctamente', 'success');
              await this.loadLeagues();
            } else {
              await this.showToast('Error al eliminar la liga', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async generateSampleData() {
    const alert = await this.alertController.create({
      header: 'Generar Datos de Ejemplo',
      message: '¿Deseas generar ligas de ejemplo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Generar',
          handler: async () => {
            await this.leaguesService.generateSampleLeagues();
            await this.showToast('Ligas de ejemplo generadas', 'success');
            await this.loadLeagues();
          }
        }
      ]
    });

    await alert.present();
  }

  async clearAllLeagues() {
    const alert = await this.alertController.create({
      header: 'Eliminar Todas las Ligas',
      message: '⚠️ Esta acción eliminará todas las ligas. ¿Estás seguro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar Todo',
          role: 'destructive',
          handler: async () => {
            await this.leaguesService.clearAllLeagues();
            await this.showToast('Todas las ligas eliminadas', 'success');
            await this.loadLeagues();
          }
        }
      ]
    });

    await alert.present();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      active: 'Activa',
      finished: 'Finalizada',
      upcoming: 'Próximamente'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      active: 'success',
      finished: 'medium',
      upcoming: 'warning'
    };
    return colors[status] || 'medium';
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      domestic: 'Nacional',
      international: 'Internacional',
      cup: 'Copa'
    };
    return labels[type] || type;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
