import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TeamsService, Team } from '../services/teams.service';
import { LeaguesService } from '../services/leagues.service';
import { TeamDetailComponent } from './team-detail/team-detail.component';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.page.html',
  styleUrls: ['./teams.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TeamsPage implements OnInit, OnDestroy {
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  searchQuery: string = '';
  selectedLeague: string = 'all';
  leagues: any[] = [];
  
  private teamsSubscription?: Subscription;

  constructor(
    private teamsService: TeamsService,
    private leaguesService: LeaguesService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadLeagues();
    await this.loadTeams();
    
    // Suscribirse a cambios en tiempo real
    this.teamsSubscription = this.teamsService.teams$.subscribe(teams => {
      this.teams = teams;
      this.filterTeams();
    });
  }

  ngOnDestroy() {
    if (this.teamsSubscription) {
      this.teamsSubscription.unsubscribe();
    }
  }

  async loadTeams() {
    this.teams = await this.teamsService.getTeams();
    this.filterTeams();
  }

  async loadLeagues() {
    this.leagues = await this.leaguesService.getLeagues();
  }

  filterTeams() {
    let filtered = [...this.teams];

    // Filtrar por búsqueda
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(query) ||
        team.shortName.toLowerCase().includes(query) ||
        team.city.toLowerCase().includes(query) ||
        team.country.toLowerCase().includes(query)
      );
    }

    // Filtrar por liga
    if (this.selectedLeague !== 'all') {
      filtered = filtered.filter(team => team.league === this.selectedLeague);
    }

    this.filteredTeams = filtered;
  }

  onSearchChange(event: any) {
    this.searchQuery = event.target.value || '';
    this.filterTeams();
  }

  onLeagueChange(event: any) {
    this.selectedLeague = event.target.value;
    this.filterTeams();
  }

  async openTeamDetail(team?: Team) {
    const modal = await this.modalController.create({
      component: TeamDetailComponent,
      componentProps: {
        team: team ? { ...team } : null
      },
      cssClass: 'team-detail-modal'
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data?.action === 'save') {
      await this.loadTeams();
    }
  }

  async deleteTeam(team: Team, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertController.create({
      header: 'Eliminar Equipo',
      message: `¿Estás seguro de que deseas eliminar a ${team.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const success = await this.teamsService.deleteTeam(team.id);
            if (success) {
              await this.showToast('Equipo eliminado correctamente', 'success');
              await this.loadTeams();
            } else {
              await this.showToast('Error al eliminar el equipo', 'danger');
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
      message: '¿Deseas generar equipos de ejemplo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Generar',
          handler: async () => {
            await this.teamsService.generateSampleTeams();
            await this.showToast('Equipos de ejemplo generados', 'success');
            await this.loadTeams();
          }
        }
      ]
    });

    await alert.present();
  }

  async clearAllTeams() {
    const alert = await this.alertController.create({
      header: 'Eliminar Todos los Equipos',
      message: '⚠️ Esta acción eliminará todos los equipos. ¿Estás seguro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar Todo',
          role: 'destructive',
          handler: async () => {
            await this.teamsService.clearAllTeams();
            await this.showToast('Todos los equipos eliminados', 'success');
            await this.loadTeams();
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

  getLeagueName(leagueId: string): string {
    const league = this.leagues.find(l => l.id === leagueId);
    return league ? league.shortName : leagueId;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
