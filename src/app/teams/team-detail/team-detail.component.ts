import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { TeamsService, Team } from '../../services/teams.service';
import { LeaguesService } from '../../services/leagues.service';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TeamDetailComponent implements OnInit {
  @Input() team?: Team;
  
  isEditMode: boolean = false;
  leagues: any[] = [];
  
  formData = {
    name: '',
    shortName: '',
    logo: '⚽',
    country: '',
    city: '',
    stadium: '',
    founded: new Date().getFullYear(),
    league: '',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF'
    },
    stats: {
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0
    }
  };

  constructor(
    private modalController: ModalController,
    private teamsService: TeamsService,
    private leaguesService: LeaguesService,
    private cameraService: CameraService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadLeagues();
    
    if (this.team) {
      this.isEditMode = true;
      this.formData = {
        name: this.team.name,
        shortName: this.team.shortName,
        logo: this.team.logo,
        country: this.team.country,
        city: this.team.city,
        stadium: this.team.stadium,
        founded: this.team.founded,
        league: this.team.league,
        colors: { ...this.team.colors },
        stats: { ...this.team.stats }
      };
    }
  }

  async loadLeagues() {
    this.leagues = await this.leaguesService.getLeagues();
    if (this.leagues.length > 0 && !this.formData.league) {
      this.formData.league = this.leagues[0].id;
    }
  }

  async selectLogo() {
    const result = await this.cameraService.selectFromGallery();
    if (result.success && result.dataUrl) {
      this.formData.logo = result.dataUrl;
    }
  }

  async save() {
    // Validación básica
    if (!this.formData.name || !this.formData.shortName) {
      await this.showToast('Por favor completa los campos requeridos', 'warning');
      return;
    }

    try {
      if (this.isEditMode && this.team) {
        await this.teamsService.updateTeam(this.team.id, this.formData);
        await this.showToast('Equipo actualizado correctamente', 'success');
      } else {
        await this.teamsService.createTeam(this.formData);
        await this.showToast('Equipo creado correctamente', 'success');
      }
      
      await this.modalController.dismiss({ action: 'save' });
    } catch (error) {
      await this.showToast('Error al guardar el equipo', 'danger');
    }
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

  close() {
    this.modalController.dismiss();
  }
}
