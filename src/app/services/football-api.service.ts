import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class FootballApiService {
  private apiUrl = 'https://api-football-v1.p.rapidapi.com/v3';
  private apiKey: string;
  private transfersCache: any = null;
  private cacheTimestamp: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private useMockData = true; // Por defecto usa datos de demostración
  
  constructor(private http: HttpClient) {
    this.apiKey = 'a2198010fecd70bfae6b31f3d8c4a216';
    this.initializeSettings();
  }

  /**
   * Inicializar configuración desde Preferences
   */
  private async initializeSettings(): Promise<void> {
    // Intentar obtener la API Key de Preferences
    const storedKeyResult = await Preferences.get({ key: 'football_api_key' });
    if (storedKeyResult.value) {
      this.apiKey = storedKeyResult.value;
    } else {
      // Si no hay key guardada, guardar la predeterminada
      await Preferences.set({ key: 'football_api_key', value: this.apiKey });
    }
    
    // Verificar el modo de datos (demo o API real)
    const useMockResult = await Preferences.get({ key: 'use_mock_data' });
    this.useMockData = useMockResult.value === null ? true : useMockResult.value === 'true';
  }

  /**
   * Configura la API Key
   */
  async setApiKey(key: string): Promise<void> {
    this.apiKey = key;
    await Preferences.set({ key: 'football_api_key', value: key });
  }

  /**
   * Obtiene la API Key actual
   */
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Verifica si hay una API Key configurada
   */
  hasApiKey(): boolean {
    return !!(this.apiKey && this.apiKey.length > 0);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    });
  }

  /**
   * Obtiene los últimos fichajes y traspasos
   * @param season Temporada (ej: 2024)
   * @param team ID del equipo (opcional)
   * @param forceApi Fuerza el uso de la API real (consume 1 consulta)
   */
  getTransfers(season: number = 2024, team?: number, forceApi: boolean = false): Observable<any> {
    // Si usa modo demo y no se fuerza la API, retornar datos mock
    if (this.useMockData && !forceApi) {
      console.log('📦 Usando datos de demostración (no consume consultas de API)');
      return of(this.getMockTransfers());
    }

    // Verificar caché primero
    const now = Date.now();
    if (this.transfersCache && !forceApi && (now - this.cacheTimestamp < this.CACHE_DURATION)) {
      console.log('💾 Usando datos del caché (no consume consultas de API)');
      return of(this.transfersCache);
    }

    console.log('🌐 ⚠️ LLAMANDO A API-FOOTBALL (consumirá 1 consulta de tu límite)');
    console.log('API Key:', this.apiKey ? 'Configurada ✓' : 'No configurada ✗');
    
    const url = `${this.apiUrl}/transfers`;
    const params: any = { season: season.toString() };
    
    if (team) {
      params.team = team.toString();
    }
    
    return this.http.get(url, { headers: this.getHeaders(), params }).pipe(
      map((response: any) => {
        console.log('✅ Datos recibidos de la API');
        const transformed = this.transformTransfersData(response);
        // Guardar en caché
        this.transfersCache = transformed;
        this.cacheTimestamp = Date.now();
        return transformed;
      }),
      catchError(error => {
        console.error('❌ Error en API:', error);
        if (error.status === 429) {
          console.error('⚠️ Límite de consultas excedido. Usando datos de demostración.');
          return of(this.getMockTransfers());
        }
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        return of([]);
      })
    );
  }

  /**
   * Obtiene información de un jugador específico
   * @param playerId ID del jugador
   */
  getPlayerInfo(playerId: number): Observable<any> {
    if (!this.hasApiKey()) {
      return of(null);
    }

    const url = `${this.apiUrl}/players`;
    const params = { id: playerId.toString(), season: '2024' };
    
    return this.http.get(url, { headers: this.getHeaders(), params }).pipe(
      catchError(error => {
        console.error('Error fetching player info:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene información de un equipo
   * @param teamId ID del equipo
   */
  getTeamInfo(teamId: number): Observable<any> {
    if (!this.hasApiKey()) {
      return of(null);
    }

    const url = `${this.apiUrl}/teams`;
    const params = { id: teamId.toString() };
    
    return this.http.get(url, { headers: this.getHeaders(), params }).pipe(
      catchError(error => {
        console.error('Error fetching team info:', error);
        return of(null);
      })
    );
  }

  /**
   * Transforma los datos de la API al formato de la app
   */
  private transformTransfersData(apiResponse: any): any[] {
    if (!apiResponse || !apiResponse.response || apiResponse.response.length === 0) {
      console.warn('No hay datos de fichajes disponibles o la API no respondió correctamente');
      return [];
    }

    console.log(`Transformando ${apiResponse.response.length} fichajes de la API`);

    return apiResponse.response.map((transfer: any, index: number) => {
      const transformed = {
        id: index + 1,
        playerName: transfer.player?.name || 'Jugador Desconocido',
        playerPhoto: transfer.player?.photo || 'https://via.placeholder.com/150?text=Jugador',
        position: this.translatePosition(transfer.player?.position),
        age: transfer.player?.age || 0,
        nationality: this.getCountryFlag(transfer.player?.nationality) + ' ' + (transfer.player?.nationality || 'Desconocido'),
        fromClub: transfer.teams?.out?.name || 'Club Anterior',
        fromClubLogo: transfer.teams?.out?.logo || 'https://via.placeholder.com/60?text=Club',
        toClub: transfer.teams?.in?.name || 'Club Destino',
        toClubLogo: transfer.teams?.in?.logo || 'https://via.placeholder.com/60?text=Club',
        fee: this.formatFee(transfer.transfer?.type, transfer.transfer?.fee),
        status: this.determineStatus(transfer.transfer?.type),
        date: this.formatDate(transfer.transfer?.date)
      };
      
      console.log(`Fichaje ${index + 1}:`, {
        nombre: transformed.playerName,
        de: transformed.fromClub,
        a: transformed.toClub,
        monto: transformed.fee
      });
      
      return transformed;
    });
  }

  /**
   * Formatea el monto del traspaso
   */
  private formatFee(type: string, fee: string): string {
    if (type === 'Free' || type === 'free') {
      return 'Gratis';
    }
    if (type === 'Loan' || type === 'loan') {
      return 'Préstamo';
    }
    if (fee && fee !== 'N/A') {
      // Si el fee viene con formato de moneda, lo limpiamos
      const cleanFee = fee.replace(/[^\d]/g, '');
      if (cleanFee) {
        return '€' + this.formatNumber(parseInt(cleanFee));
      }
    }
    return 'No revelado';
  }

  /**
   * Formatea números grandes (millones)
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }

  /**
   * Determina el estado del fichaje según el tipo
   */
  private determineStatus(type: string): string {
    if (!type) return 'confirmado';
    
    const lowerType = type.toLowerCase();
    
    if (lowerType === 'free' || lowerType === 'loan' || lowerType === '€') {
      return 'confirmado';
    }
    
    return 'confirmado';
  }

  /**
   * Traduce posiciones al español
   */
  private translatePosition(position: string): string {
    const positions: any = {
      'Goalkeeper': 'Portero',
      'Defender': 'Defensa',
      'Midfielder': 'Mediocampista',
      'Attacker': 'Delantero',
      'Forward': 'Delantero'
    };
    return positions[position] || position || 'N/A';
  }

  /**
   * Obtiene emoji de bandera por país
   */
  private getCountryFlag(country: string): string {
    if (!country) return '🌍';
    
    const flags: any = {
      'France': '🇫🇷',
      'Norway': '🇳🇴',
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Nigeria': '🇳🇬',
      'Spain': '🇪🇸',
      'Brazil': '🇧🇷',
      'Portugal': '🇵🇹',
      'Argentina': '🇦🇷',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'Belgium': '🇧🇪',
      'Netherlands': '🇳🇱',
      'Croatia': '🇭🇷',
      'Poland': '🇵🇱',
      'Uruguay': '🇺🇾',
      'Colombia': '🇨🇴',
      'Mexico': '🇲🇽',
      'Egypt': '🇪🇬',
      'Morocco': '🇲🇦',
      'Algeria': '🇩🇿',
      'Senegal': '🇸🇳',
      'Ghana': '🇬🇭',
      'Ivory Coast': '🇨🇮',
      'Cameroon': '🇨🇲',
      'Japan': '🇯🇵',
      'Korea Republic': '🇰🇷',
      'Australia': '🇦🇺',
      'USA': '🇺🇸',
      'Canada': '🇨🇦',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Denmark': '🇩🇰',
      'Sweden': '🇸🇪',
      'Serbia': '🇷🇸',
      'Turkey': '🇹🇷',
      'Ukraine': '🇺🇦',
      'Czech Republic': '🇨🇿',
      'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      'Ireland': '🇮🇪',
      'Chile': '🇨🇱',
      'Peru': '🇵🇪',
      'Ecuador': '🇪🇨',
      'Venezuela': '🇻🇪',
      'Paraguay': '🇵🇾',
      'Costa Rica': '🇨🇷',
      'Iran': '🇮🇷',
      'Saudi Arabia': '🇸🇦',
      'Qatar': '🇶🇦'
    };
    return flags[country] || '🌍';
  }

  /**
   * Formatea fecha
   */
  private formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Activa o desactiva el modo de datos de demostración
   */
  async setMockDataMode(useMock: boolean): Promise<void> {
    this.useMockData = useMock;
    await Preferences.set({ key: 'use_mock_data', value: useMock.toString() });
    console.log(`Modo de datos: ${useMock ? 'Demostración' : 'API Real'}`);
  }

  /**
   * Verifica si está en modo de demostración
   */
  isMockDataMode(): boolean {
    return this.useMockData;
  }

  /**
   * Limpia el caché de datos
   */
  clearCache(): void {
    this.transfersCache = null;
    this.cacheTimestamp = 0;
    console.log('Caché limpiado');
  }

  /**
   * Obtiene datos de demostración (no consume API)
   */
  private getMockTransfers(): any[] {
    return [
      {
        id: 1,
        playerName: 'Kylian Mbappé',
        playerPhoto: 'https://media.api-sports.io/football/players/276.png',
        position: 'Delantero',
        age: 25,
        nationality: '🇫🇷 Francia',
        fromClub: 'Paris Saint-Germain',
        fromClubLogo: 'https://media.api-sports.io/football/teams/85.png',
        toClub: 'Real Madrid',
        toClubLogo: 'https://media.api-sports.io/football/teams/541.png',
        fee: 'Gratis',
        date: '1 Junio 2024',
        status: 'confirmado'
      },
      {
        id: 2,
        playerName: 'Jude Bellingham',
        playerPhoto: 'https://media.api-sports.io/football/players/1100.png',
        position: 'Mediocampista',
        age: 21,
        nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra',
        fromClub: 'Borussia Dortmund',
        fromClubLogo: 'https://media.api-sports.io/football/teams/165.png',
        toClub: 'Real Madrid',
        toClubLogo: 'https://media.api-sports.io/football/teams/541.png',
        fee: '€103.0M',
        date: '14 Junio 2023',
        status: 'confirmado'
      },
      {
        id: 3,
        playerName: 'Harry Kane',
        playerPhoto: 'https://media.api-sports.io/football/players/184.png',
        position: 'Delantero',
        age: 30,
        nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra',
        fromClub: 'Tottenham',
        fromClubLogo: 'https://media.api-sports.io/football/teams/47.png',
        toClub: 'Bayern München',
        toClubLogo: 'https://media.api-sports.io/football/teams/157.png',
        fee: '€100.0M',
        date: '12 Agosto 2023',
        status: 'confirmado'
      },
      {
        id: 4,
        playerName: 'Declan Rice',
        playerPhoto: 'https://media.api-sports.io/football/players/1463.png',
        position: 'Mediocampista',
        age: 25,
        nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra',
        fromClub: 'West Ham',
        fromClubLogo: 'https://media.api-sports.io/football/teams/48.png',
        toClub: 'Arsenal',
        toClubLogo: 'https://media.api-sports.io/football/teams/42.png',
        fee: '€116.0M',
        date: '15 Julio 2023',
        status: 'confirmado'
      },
      {
        id: 5,
        playerName: 'Moises Caicedo',
        playerPhoto: 'https://media.api-sports.io/football/players/162268.png',
        position: 'Mediocampista',
        age: 22,
        nationality: '🇪🇨 Ecuador',
        fromClub: 'Brighton',
        fromClubLogo: 'https://media.api-sports.io/football/teams/51.png',
        toClub: 'Chelsea',
        toClubLogo: 'https://media.api-sports.io/football/teams/49.png',
        fee: '€116.0M',
        date: '14 Agosto 2023',
        status: 'confirmado'
      },
      {
        id: 6,
        playerName: 'Victor Osimhen',
        playerPhoto: 'https://media.api-sports.io/football/players/329.png',
        position: 'Delantero',
        age: 25,
        nationality: '🇳🇬 Nigeria',
        fromClub: 'Napoli',
        fromClubLogo: 'https://media.api-sports.io/football/teams/492.png',
        toClub: 'Manchester United',
        toClubLogo: 'https://media.api-sports.io/football/teams/33.png',
        fee: '€120.0M',
        date: '1 Agosto 2024',
        status: 'rumor'
      },
      {
        id: 7,
        playerName: 'Florian Wirtz',
        playerPhoto: 'https://media.api-sports.io/football/players/162159.png',
        position: 'Mediocampista',
        age: 21,
        nationality: '🇩🇪 Alemania',
        fromClub: 'Bayer Leverkusen',
        fromClubLogo: 'https://media.api-sports.io/football/teams/168.png',
        toClub: 'Bayern München',
        toClubLogo: 'https://media.api-sports.io/football/teams/157.png',
        fee: '€130.0M',
        date: '1 Julio 2024',
        status: 'rumor'
      },
      {
        id: 8,
        playerName: 'Erling Haaland',
        playerPhoto: 'https://media.api-sports.io/football/players/1100.png',
        position: 'Delantero',
        age: 24,
        nationality: '🇳🇴 Noruega',
        fromClub: 'Manchester City',
        fromClubLogo: 'https://media.api-sports.io/football/teams/50.png',
        toClub: 'Real Madrid',
        toClubLogo: 'https://media.api-sports.io/football/teams/541.png',
        fee: '€180.0M',
        date: '1 Julio 2025',
        status: 'rumor'
      }
    ];
  }
}
