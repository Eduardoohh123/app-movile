import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FootballApiService } from '../services/football-api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.page.html',
  styleUrls: ['./transfers.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
  providers: [FootballApiService]
})
export class TransfersPage implements OnInit {
  loading = false;
  selectedFilter = 'all';
  transfers: any[] = [];
  showApiKeyModal = false;
  apiKeyInput = '';
  isDemoMode = true; // Modo demostración activo

  constructor(
    private router: Router,
    private footballApiService: FootballApiService
  ) {}

  ngOnInit() {
    console.log('Transfers page initialized');
    this.isDemoMode = this.footballApiService.isMockDataMode();
    // Forzar la carga directa sin verificar modal
    this.loadTransfers();
  }

  checkApiKeyAndLoad() {
    if (this.footballApiService.hasApiKey()) {
      this.loadTransfers();
    } else {
      this.apiKeyInput = this.footballApiService.getApiKey();
      this.showApiKeyModal = true;
    }
  }

  saveApiKey() {
    if (this.apiKeyInput && this.apiKeyInput.trim().length > 0) {
      this.footballApiService.setApiKey(this.apiKeyInput.trim());
      this.showApiKeyModal = false;
      this.loadTransfers();
    }
  }

  openApiKeyModal() {
    this.apiKeyInput = this.footballApiService.getApiKey();
    this.showApiKeyModal = true;
  }

  closeApiKeyModal() {
    this.showApiKeyModal = false;
  }

  loadTransfers() {
    this.loading = true;
    // No forzar API por defecto, usar el modo actual (demo o API)
    this.footballApiService.getTransfers(2024, undefined, false).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.transfers = data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transfers:', error);
        this.loading = false;
      }
    });
  }

  // Cambiar entre modo demo y API real
  toggleDataMode() {
    this.isDemoMode = !this.isDemoMode;
    this.footballApiService.setMockDataMode(this.isDemoMode);
    if (!this.isDemoMode) {
      // Si cambia a API real, limpiar caché y mostrar advertencia
      this.footballApiService.clearCache();
    }
    this.loadTransfers();
  }

  // Recargar forzando uso de API (solo si no está en modo demo)
  reloadFromApi() {
    if (this.isDemoMode) {
      // Si está en modo demo, simplemente recargar datos demo
      this.loadTransfers();
    } else {
      // Si está en modo API, forzar una nueva consulta (consume 1 request)
      this.loading = true;
      this.footballApiService.getTransfers(2024, undefined, true).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.transfers = data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading transfers:', error);
          this.loading = false;
        }
      });
    }
  }

  filterTransfers(event: any) {
    this.selectedFilter = event.detail.value;
  }

  get filteredTransfers() {
    if (this.selectedFilter === 'all') {
      return this.transfers;
    }
    return this.transfers.filter(t => t.status === this.selectedFilter);
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'confirmado': 'success',
      'rumor': 'warning',
      'negociando': 'primary'
    };
    return colors[status] || 'medium';
  }

  getStatusText(status: string): string {
    const texts: any = {
      'confirmado': 'Confirmado',
      'rumor': 'Rumor',
      'negociando': 'Negociando'
    };
    return texts[status] || status;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  viewTransferDetail(transferId: number) {
    console.log('Viewing transfer detail:', transferId);
  }
}
