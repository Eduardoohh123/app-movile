import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HealthCheckService, HealthStatus, DatabaseStatus, Stats } from '../../services/health-check.service';

@Component({
  selector: 'app-connection-test',
  templateUrl: './connection-test.page.html',
  styleUrls: ['./connection-test.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ConnectionTestPage implements OnInit {

  appStatus: HealthStatus | null = null;
  dbStatus: DatabaseStatus | null = null;
  stats: Stats | null = null;
  
  loading = false;
  error: string | null = null;

  constructor(private healthService: HealthCheckService) { }

  ngOnInit() {
    this.checkAll();
  }

  /**
   * Verificar todas las conexiones
   */
  checkAll() {
    this.checkAppStatus();
    this.checkDatabaseStatus();
    this.loadStats();
  }

  /**
   * Verificar estado de la aplicación
   */
  checkAppStatus() {
    this.loading = true;
    this.error = null;
    
    this.healthService.checkStatus().subscribe({
      next: (data) => {
        this.appStatus = data;
        this.loading = false;
        console.log('✅ App Status:', data);
      },
      error: (err) => {
        this.error = 'Error al conectar con el servidor: ' + err.message;
        this.loading = false;
        console.error('❌ Error:', err);
      }
    });
  }

  /**
   * Verificar conexión con base de datos
   */
  checkDatabaseStatus() {
    this.healthService.checkDatabase().subscribe({
      next: (data) => {
        this.dbStatus = data;
        console.log('✅ Database Status:', data);
      },
      error: (err) => {
        console.error('❌ Database Error:', err);
      }
    });
  }

  /**
   * Cargar estadísticas
   */
  loadStats() {
    this.healthService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        console.log('📊 Stats:', data);
      },
      error: (err) => {
        console.error('❌ Stats Error:', err);
      }
    });
  }

  /**
   * Insertar datos de prueba
   */
  seedData() {
    this.loading = true;
    
    this.healthService.seedTestData().subscribe({
      next: (data) => {
        console.log('✅ Datos insertados:', data);
        this.loading = false;
        // Recargar estadísticas
        this.loadStats();
      },
      error: (err) => {
        this.error = 'Error al insertar datos: ' + err.message;
        this.loading = false;
        console.error('❌ Error:', err);
      }
    });
  }

  /**
   * Refrescar todo
   */
  refresh(event?: any) {
    this.checkAll();
    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }
}
