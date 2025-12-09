import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { BetsService } from '../services/bets.service';
import { LeaguesService } from '../services/leagues.service';
import { TeamsService } from '../services/teams.service';
import { UserService } from '../services/user.service';
import { DataInitializerService } from '../services/data-initializer.service';
import { Preferences } from '@capacitor/preferences';

interface DataStats {
  bets: number;
  leagues: number;
  teams: number;
  users: number;
  totalStorage: string;
  lastUpdate: Date;
}

interface SystemInfo {
  platform: string;
  userAgent: string;
  language: string;
  screenResolution: string;
  storageQuota: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminPage implements OnInit {
  selectedTab: 'overview' | 'bets' | 'leagues' | 'teams' | 'users' | 'system' | 'raw' = 'overview';
  
  stats: DataStats = {
    bets: 0,
    leagues: 0,
    teams: 0,
    users: 0,
    totalStorage: '0 KB',
    lastUpdate: new Date()
  };

  systemInfo: SystemInfo = {
    platform: '',
    userAgent: '',
    language: '',
    screenResolution: '',
    storageQuota: ''
  };

  betsData: any[] = [];
  leaguesData: any[] = [];
  teamsData: any[] = [];
  usersData: any[] = [];
  rawData: any = {};
  allStorageKeys: string[] = [];
  allStorageData: any = {};
  jsonView: string = '';
  isJsonExpanded: boolean = false;
  currentUser: any = null;

  constructor(
    private betsService: BetsService,
    private leaguesService: LeaguesService,
    private teamsService: TeamsService,
    private userService: UserService,
    private dataInitializer: DataInitializerService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadAllData();
    this.loadSystemInfo();
  }

  async loadAllData() {
    try {
      this.betsData = await this.betsService.getBets();
      this.leaguesData = await this.leaguesService.getLeagues();
      this.teamsData = await this.teamsService.getTeams();
      
      this.userService.user$.subscribe(user => {
        this.currentUser = user;
      });
      
      await this.loadRawData();
      await this.loadAllStorageKeys();
      this.calculateStats();
      this.updateJsonView();
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('Error al cargar datos', 'danger');
    }
  }

  async loadRawData() {
    try {
      const keys = ['user_bets', 'user_leagues', 'user_teams', 'user_data'];
      this.rawData = {};
      
      for (const key of keys) {
        const result = await Preferences.get({ key });
        if (result.value) {
          this.rawData[key] = JSON.parse(result.value);
        }
      }
    } catch (error) {
      console.error('Error loading raw data:', error);
    }
  }

  async loadAllStorageKeys() {
    try {
      const possibleKeys = [
        'user_bets',
        'user_leagues', 
        'user_teams',
        'user_data',
        'users',
        'currentUser',
        'session',
        'auth_token',
        'preferences',
        'app_settings'
      ];
      
      this.allStorageData = {};
      this.allStorageKeys = [];
      
      for (const key of possibleKeys) {
        const result = await Preferences.get({ key });
        if (result.value) {
          this.allStorageKeys.push(key);
          try {
            this.allStorageData[key] = JSON.parse(result.value);
          } catch {
            this.allStorageData[key] = result.value;
          }
        }
      }
      
      if (this.allStorageData['users']) {
        this.usersData = Array.isArray(this.allStorageData['users']) 
          ? this.allStorageData['users'] 
          : [this.allStorageData['users']];
      } else if (this.allStorageData['user_data']) {
        this.usersData = [this.allStorageData['user_data']];
      }
      
    } catch (error) {
      console.error('Error loading storage keys:', error);
    }
  }

  loadSystemInfo() {
    this.systemInfo = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      storageQuota: 'Calculando...'
    };
    
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        this.systemInfo.storageQuota = `${this.formatBytes(used)} / ${this.formatBytes(quota)}`;
      });
    }
  }

  calculateStats() {
    this.stats.bets = this.betsData.length;
    this.stats.leagues = this.leaguesData.length;
    this.stats.teams = this.teamsData.length;
    this.stats.users = this.usersData.length;
    this.stats.lastUpdate = new Date();
    
    const dataSize = JSON.stringify(this.allStorageData).length;
    this.stats.totalStorage = this.formatBytes(dataSize);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  updateJsonView() {
    const viewData = {
      stats: this.stats,
      systemInfo: this.systemInfo,
      currentUser: this.currentUser,
      storageKeys: this.allStorageKeys,
      data: {
        bets: this.betsData,
        leagues: this.leaguesData,
        teams: this.teamsData,
        users: this.usersData,
      },
      allStorage: this.allStorageData
    };
    this.jsonView = JSON.stringify(viewData, null, 2);
  }

  async exportData() {
    const exportData = {
      exportDate: new Date().toISOString(),
      stats: this.stats,
      systemInfo: this.systemInfo,
      currentUser: this.currentUser,
      storageKeys: this.allStorageKeys,
      allData: this.allStorageData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `football-scoop-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast('Backup completo exportado', 'success');
  }

  async importData() {
    const alert = await this.alertController.create({
      header: 'Importar Datos',
      message: 'Esta función reemplazará todos los datos actuales. ¿Continuar?',
      inputs: [
        {
          name: 'fileInput',
          type: 'textarea',
          placeholder: 'Pega aquí el JSON exportado'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Importar',
          handler: async (data) => {
            try {
              const imported = JSON.parse(data.fileInput);
              
              for (const key in imported.allData) {
                await Preferences.set({
                  key,
                  value: JSON.stringify(imported.allData[key])
                });
              }
              
              await this.loadAllData();
              this.showToast('Datos importados correctamente', 'success');
            } catch (error) {
              console.error('Error importing:', error);
              this.showToast('Error al importar: JSON inválido', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async clearAllData() {
    const alert = await this.alertController.create({
      header: '⚠️ Eliminar Todos los Datos',
      message: 'Esta acción eliminará TODOS los datos de la aplicación y no se puede deshacer. ¿Estás seguro?',
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
              await Preferences.clear();
              await this.loadAllData();
              this.showToast('Todos los datos han sido eliminados', 'success');
            } catch (error) {
              console.error('Error clearing data:', error);
              this.showToast('Error al eliminar datos', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async refreshData() {
    await this.loadAllData();
    this.showToast('Datos actualizados', 'success');
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.jsonView).then(() => {
      this.showToast('JSON copiado al portapapeles', 'success');
    }).catch(() => {
      this.showToast('Error al copiar', 'danger');
    });
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

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'won': 'success',
      'lost': 'danger',
      'pending': 'warning',
      'cancelled': 'medium'
    };
    return colors[status] || 'medium';
  }

  getUserInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  maskPassword(password: string): string {
    if (!password) return '';
    return '•'.repeat(password.length);
  }

  maskEmail(email: string): string {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const masked = local.substring(0, 2) + '***' + local.substring(local.length - 1);
    return masked + '@' + domain;
  }

  async viewUserDetails(user: any) {
    const alert = await this.alertController.create({
      header: '👤 Detalles del Usuario',
      message: `
        <div style="text-align: left; color: white;">
          <p><strong>ID:</strong> ${user.id || 'N/A'}</p>
          <p><strong>Nombre:</strong> ${user.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
          <p><strong>Teléfono:</strong> ${user.phone || 'N/A'}</p>
          <p><strong>Fecha Registro:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
          <p><strong>Última Sesión:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
        </div>
      `,
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  /**
   * Inicializar Firebase con datos de ejemplo
   */
  async initializeFirebase() {
    const alert = await this.alertController.create({
      header: '🔥 Inicializar Firebase',
      message: '¿Deseas poblar la base de datos de Firebase con datos de ejemplo? Esto creará usuarios, ligas, equipos y apuestas de prueba.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Inicializar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Creando datos en Firebase...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              await this.dataInitializer.initializeDatabase();
              await loading.dismiss();
              await this.showToast('✅ Firebase inicializado correctamente', 'success');
              await this.loadAllData(); // Recargar datos
            } catch (error) {
              await loading.dismiss();
              console.error('Error inicializando Firebase:', error);
              await this.showToast('❌ Error al inicializar Firebase', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
