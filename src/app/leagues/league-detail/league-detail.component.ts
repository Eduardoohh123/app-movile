import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { LeaguesService, League } from '../../services/leagues.service';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'app-league-detail',
  templateUrl: './league-detail.component.html',
  styleUrls: ['./league-detail.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LeagueDetailComponent implements OnInit {
  @Input() league?: League;
  
  isEditMode: boolean = false;
  
  formData = {
    name: '',
    shortName: '',
    logo: '🏆',
    country: '',
    season: '2024/2025',
    type: 'domestic' as 'domestic' | 'international' | 'cup',
    numberOfTeams: 20,
    currentMatchday: 1,
    description: '',
    founded: new Date().getFullYear(),
    status: 'active' as 'active' | 'finished' | 'upcoming',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF'
    }
  };

  constructor(
    private modalController: ModalController,
    private leaguesService: LeaguesService,
    private cameraService: CameraService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    if (this.league) {
      this.isEditMode = true;
      this.formData = {
        name: this.league.name,
        shortName: this.league.shortName,
        logo: this.league.logo,
        country: this.league.country,
        season: this.league.season,
        type: this.league.type,
        numberOfTeams: this.league.numberOfTeams,
        currentMatchday: this.league.currentMatchday,
        description: this.league.description,
        founded: this.league.founded,
        status: this.league.status,
        colors: { ...this.league.colors }
      };
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
      if (this.isEditMode && this.league) {
        await this.leaguesService.updateLeague(this.league.id, this.formData);
        await this.showToast('Liga actualizada correctamente', 'success');
      } else {
        await this.leaguesService.createLeague(this.formData);
        await this.showToast('Liga creada correctamente', 'success');
      }
      
      await this.modalController.dismiss({ action: 'save' });
    } catch (error) {
      await this.showToast('Error al guardar la liga', 'danger');
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
