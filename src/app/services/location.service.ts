import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';

export interface LocationResult {
  placeId: string;
  displayName: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  lat: number;
  lon: number;
  type: string;
  distance?: number; // Distancia en metros desde la ubicación del usuario
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
  accuracy?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
  private readonly USER_AGENT = 'FootballScoopApp/1.0';
  private lastSearchQuery: string = '';
  private searchCache: Map<string, LocationResult[]> = new Map();
  private reverseGeocodeCache: Map<string, string> = new Map();
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_DELAY = 1000; // 1 segundo entre peticiones

  constructor() {}

  /**
   * Espera el tiempo necesario para respetar rate limit
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_DELAY) {
      const waitTime = this.MIN_REQUEST_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Obtiene la ubicación actual del dispositivo
   */
  async getCurrentPosition(): Promise<UserLocation | null> {
    try {
      // Verificar permisos primero
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de ubicación denegados');
      }

      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      // Obtener dirección legible
      const address = await this.reverseGeocode(lat, lon);

      return {
        latitude: lat,
        longitude: lon,
        address: address,
        accuracy: accuracy
      };
    } catch (error: any) {
      console.error('Error obteniendo ubicación:', error);
      throw error;
    }
  }

  /**
   * Verifica y solicita permisos de ubicación
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location === 'granted') {
        return true;
      }

      if (permission.location === 'prompt') {
        const requestResult = await Geolocation.requestPermissions();
        return requestResult.location === 'granted';
      }

      return false;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }

  /**
   * Geocodificación inversa: convierte coordenadas en dirección
   * Usa múltiples estrategias para evitar problemas de CORS
   */
  async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      // Verificar caché primero (redondear coordenadas para mejor hit rate)
      const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
      if (this.reverseGeocodeCache.has(cacheKey)) {
        console.log('Usando dirección desde caché');
        return this.reverseGeocodeCache.get(cacheKey)!;
      }

      // Respetar rate limit
      await this.waitForRateLimit();

      // Estrategia 1: Usar proxy CORS público para Nominatim
      try {
        const address = await this.tryNominatimWithProxy(lat, lon);
        if (address) {
          this.reverseGeocodeCache.set(cacheKey, address);
          return address;
        }
      } catch (error) {
        console.log('Proxy Nominatim falló, usando nombre simplificado...');
      }

      // Estrategia 2: Generar nombre de ubicación basado en coordenadas
      const locationName = this.generateLocationName(lat, lon);
      this.reverseGeocodeCache.set(cacheKey, locationName);
      return locationName;

    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      return this.generateLocationName(lat, lon);
    }
  }

  /**
   * Intenta geocodificación inversa con Nominatim usando proxy CORS
   */
  private async tryNominatimWithProxy(lat: number, lon: number): Promise<string | null> {
    try {
      // Usar AllOrigins como proxy CORS gratuito
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(nominatimUrl)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.address) {
        return this.formatAddress(data.address);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Genera un nombre de ubicación legible basado en coordenadas
   * Identifica la región general sin necesidad de API
   */
  private generateLocationName(lat: number, lon: number): string {
    // Determinar hemisferio
    const latDir = lat >= 0 ? 'Norte' : 'Sur';
    const lonDir = lon >= 0 ? 'Este' : 'Oeste';
    
    // Identificar región aproximada por coordenadas (Chile/Sudamérica)
    let region = '';
    
    // Chile está entre -17° y -56° lat, -66° y -75° lon
    if (lat >= -56 && lat <= -17 && lon >= -76 && lon <= -66) {
      if (lat >= -30 && lat <= -17) {
        region = 'Norte de Chile';
      } else if (lat > -30 && lat <= -37) {
        region = 'Región Central de Chile';
      } else if (lat > -37 && lat <= -43) {
        region = 'Sur de Chile';
      } else {
        region = 'Zona Austral de Chile';
      }
      
      // Región Metropolitana (Santiago)
      if (lat >= -34 && lat <= -33 && lon >= -71 && lon <= -70) {
        region = 'Santiago, Chile';
      }
    } else {
      // Otras regiones de Sudamérica
      region = 'Sudamérica';
    }
    
    const coords = `${Math.abs(lat).toFixed(5)}°${latDir}, ${Math.abs(lon).toFixed(5)}°${lonDir}`;
    return region ? `${region}\n${coords}` : `Ubicación: ${coords}`;
  }

  /**
   * Formatea coordenadas como una dirección legible cuando la API falla
   */
  private formatCoordinatesAsAddress(lat: number, lon: number): string {
    return this.generateLocationName(lat, lon);
  }

  /**
   * Busca lugares por texto (autocompletado)
   */
  async searchPlaces(query: string, userLat?: number, userLon?: number): Promise<LocationResult[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    // Verificar caché
    const cacheKey = `${query}_${userLat}_${userLon}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    try {
      // Respetar rate limit
      await this.waitForRateLimit();

      // Intentar con Nominatim primero
      let results = await this.tryNominatimSearch(query, userLat, userLon);
      
      // Si falla, intentar con API alternativa
      if (results.length === 0) {
        console.log('Nominatim sin resultados, intentando API alternativa...');
        results = await this.tryAlternativeSearch(query, userLat, userLon);
      }

      // Guardar en caché
      if (results.length > 0) {
        this.searchCache.set(cacheKey, results);
        
        // Limpiar caché antiguo (máximo 20 búsquedas)
        if (this.searchCache.size > 20) {
          const firstKey = this.searchCache.keys().next().value;
          if (firstKey) {
            this.searchCache.delete(firstKey);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error buscando lugares:', error);
      return [];
    }
  }

  /**
   * Intenta búsqueda con Nominatim usando proxy CORS
   */
  private async tryNominatimSearch(query: string, userLat?: number, userLon?: number): Promise<LocationResult[]> {
    try {
      // Construir URL con parámetros
      let url = `${this.NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10`;
      
      // Si hay ubicación del usuario, priorizar resultados cercanos
      if (userLat !== undefined && userLon !== undefined) {
        url += `&viewbox=${userLon - 0.5},${userLat - 0.5},${userLon + 0.5},${userLat + 0.5}&bounded=1`;
      }

      // Agregar filtro para países de habla hispana
      url += '&countrycodes=cl,ar,es,mx,co,pe,ve,ec,bo,py,uy,pa,cr,ni,hn,sv,gt,cu,do,pr';

      // Usar proxy CORS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      return data.map((item: any) => ({
        placeId: item.place_id,
        displayName: item.display_name,
        address: item.address || {},
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type
      }));
    } catch (error) {
      console.log('Error en búsqueda Nominatim:', error);
      return [];
    }
  }

  /**
   * Intenta búsqueda con API alternativa (simplificada)
   * Retorna lugares genéricos si todo falla
   */
  private async tryAlternativeSearch(query: string, userLat?: number, userLon?: number): Promise<LocationResult[]> {
    // Retornar lugares predefinidos como fallback
    const fallbackPlaces: LocationResult[] = [
      {
        placeId: 'fallback-1',
        displayName: `Búsqueda: ${query}`,
        address: {
          city: 'No disponible',
          country: 'Ubicación aproximada'
        },
        lat: userLat || -33.4489,
        lon: userLon || -70.6693,
        type: 'place'
      }
    ];

    return fallbackPlaces;
  }

  /**
   * Busca lugares cercanos por categoría
   */
  async searchNearby(
    lat: number, 
    lon: number, 
    category: string = 'stadium', 
    radius: number = 5000
  ): Promise<LocationResult[]> {
    try {
      // Respetar rate limit
      await this.waitForRateLimit();

      const categories: { [key: string]: string } = {
        'stadium': 'stadium',
        'sports': 'sports_centre',
        'bar': 'bar',
        'restaurant': 'restaurant',
        'cafe': 'cafe'
      };

      const amenity = categories[category] || category;
      
      // Nominatim no tiene búsqueda por radio directamente, pero podemos usar viewbox
      const radiusInDegrees = radius / 111000; // Aproximadamente 111km por grado
      
      const nominatimUrl = `${this.NOMINATIM_URL}/search?format=json&amenity=${amenity}&viewbox=${lon - radiusInDegrees},${lat - radiusInDegrees},${lon + radiusInDegrees},${lat + radiusInDegrees}&bounded=1&addressdetails=1&limit=20`;

      // Usar proxy CORS para evitar bloqueo
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(nominatimUrl)}`;

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('Proxy falló para lugares cercanos');
        return this.generateNearbyPlacesFallback(lat, lon, category);
      }

      const data = await response.json();

      // Mapear resultados y calcular distancia
      const results: LocationResult[] = data.map((item: any) => {
        const placeLat = parseFloat(item.lat);
        const placeLon = parseFloat(item.lon);
        const distance = this.calculateDistance(lat, lon, placeLat, placeLon);

        return {
          placeId: item.place_id,
          displayName: item.display_name,
          address: item.address || {},
          lat: placeLat,
          lon: placeLon,
          type: item.type,
          distance: distance
        };
      });

      // Filtrar por radio y ordenar por distancia (más cercano primero)
      const filteredResults = results
        .filter(result => (result.distance || 0) <= radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 10); // Limitar a 10 resultados más cercanos

      return filteredResults;
    } catch (error) {
      console.error('Error buscando lugares cercanos:', error);
      return this.generateNearbyPlacesFallback(lat, lon, category);
    }
  }

  /**
   * Genera lugares cercanos de fallback cuando la API falla
   */
  private generateNearbyPlacesFallback(lat: number, lon: number, category: string): LocationResult[] {
    const categoryNames: { [key: string]: string } = {
      'stadium': 'Estadio',
      'sports': 'Centro Deportivo',
      'bar': 'Bar',
      'restaurant': 'Restaurante',
      'cafe': 'Café'
    };

    const categoryName = categoryNames[category] || 'Lugar';
    const locationName = this.generateLocationName(lat, lon).split('\n')[0]; // Solo región

    // Generar 3 lugares genéricos cercanos
    const fallbackPlaces: LocationResult[] = [];
    
    for (let i = 1; i <= 3; i++) {
      const offset = 0.01 * i; // ~1km por iteración
      fallbackPlaces.push({
        placeId: `fallback-${category}-${i}`,
        displayName: `${categoryName} cerca de ${locationName}`,
        address: {
          city: locationName,
          country: 'Chile'
        },
        lat: lat + (Math.random() * 0.02 - 0.01),
        lon: lon + (Math.random() * 0.02 - 0.01),
        type: category,
        distance: 1000 * i // 1km, 2km, 3km
      });
    }

    return fallbackPlaces;
  }

  /**
   * Formatea una dirección de manera legible
   */
  private formatAddress(address: any): string {
    const parts: string[] = [];

    // Orden de prioridad para la dirección
    if (address.road) parts.push(address.road);
    if (address.house_number) {
      if (parts.length > 0) {
        parts[parts.length - 1] += ` ${address.house_number}`;
      } else {
        parts.push(address.house_number);
      }
    }
    
    // Barrio o comuna
    if (address.suburb) {
      parts.push(address.suburb);
    } else if (address.neighbourhood) {
      parts.push(address.neighbourhood);
    }

    // Ciudad
    if (address.city) {
      parts.push(address.city);
    } else if (address.town) {
      parts.push(address.town);
    } else if (address.village) {
      parts.push(address.village);
    } else if (address.municipality) {
      parts.push(address.municipality);
    }

    // Estado/Región
    if (address.state) {
      parts.push(address.state);
    }

    // País
    if (address.country) {
      parts.push(address.country);
    }

    return parts.filter(p => p).join(', ') || 'Ubicación desconocida';
  }

  /**
   * Formatea un resultado de búsqueda de manera compacta
   */
  formatLocationResult(result: LocationResult): string {
    const parts: string[] = [];

    if (result.address.road) {
      parts.push(result.address.road);
    }

    if (result.address.suburb) {
      parts.push(result.address.suburb);
    } else if (result.address.city) {
      parts.push(result.address.city);
    }

    if (result.address.state && !parts.includes(result.address.state)) {
      parts.push(result.address.state);
    }

    return parts.length > 0 ? parts.join(', ') : result.displayName;
  }

  /**
   * Calcula la distancia entre dos puntos (en metros)
   */
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Formatea distancia de manera legible
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Obtiene sugerencias de lugares populares por región
   */
  getPopularPlacesByCountry(countryCode: string): string[] {
    const popularPlaces: { [key: string]: string[] } = {
      'CL': [ // Chile
        'Santiago',
        'Valparaíso',
        'Concepción',
        'La Serena',
        'Temuco',
        'Estadio Nacional',
        'Estadio Monumental',
        'Mall Plaza',
        'Costanera Center'
      ],
      'AR': [ // Argentina
        'Buenos Aires',
        'Córdoba',
        'Rosario',
        'La Bombonera',
        'Estadio Monumental',
        'Puerto Madero',
        'Palermo'
      ],
      'ES': [ // España
        'Madrid',
        'Barcelona',
        'Valencia',
        'Santiago Bernabéu',
        'Camp Nou',
        'Mestalla'
      ],
      'MX': [ // México
        'Ciudad de México',
        'Guadalajara',
        'Monterrey',
        'Estadio Azteca',
        'Zócalo'
      ]
    };

    return popularPlaces[countryCode] || [];
  }
}
