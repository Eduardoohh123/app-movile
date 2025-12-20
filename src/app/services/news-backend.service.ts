import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface News {
  id: number;
  title: string;
  summary: string;
  image: string;
  category: string;
  time: string;
}

/**
 * Servicio de noticias que consume el backend Spring Boot
 * Mantiene datos mock como fallback si el backend no está disponible
 */
@Injectable({
  providedIn: 'root'
})
export class NewsService {

  // Datos mock como fallback
  private mockNews: News[] = [
    {
      id: 1,
      title: 'Fichaje bomba: Manchester City cierra la contratación del año',
      summary: 'El equipo inglés confirma la llegada de una de las estrellas más prometedoras del fútbol mundial por una cifra récord de 120 millones de euros.',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop',
      category: 'Fichajes',
      time: 'Hace 15 minutos'
    },
    {
      id: 2,
      title: 'Champions League: Definidos los cruces de semifinales',
      summary: 'Los cuatro mejores equipos de Europa conocen a sus rivales en la pelea por la gloria continental.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
      category: 'Competiciones',
      time: 'Hace 1 hora'
    },
    {
      id: 3,
      title: 'Lesión de última hora afecta al equipo líder',
      summary: 'El delantero estrella estará fuera de las canchas por al menos 6 semanas según reportes médicos.',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop',
      category: 'Lesiones',
      time: 'Hace 2 horas'
    }
  ];

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todas las noticias desde el backend
   * Fallback a datos mock si falla
   */
  getNews(): Observable<News[]> {
    return this.apiService.get<News[]>('/news').pipe(
      catchError(error => {
        console.warn('Error al obtener noticias del backend, usando datos mock:', error);
        return of(this.mockNews);
      })
    );
  }

  /**
   * Obtiene una noticia por ID desde el backend
   */
  getNewsById(id: number): Observable<News | undefined> {
    return this.apiService.get<News>(`/news/${id}`).pipe(
      catchError(error => {
        console.warn('Error al obtener noticia del backend, usando datos mock:', error);
        return of(this.mockNews.find(n => n.id === id));
      })
    );
  }

  /**
   * Obtiene noticias filtradas por categoría
   */
  getNewsByCategory(category: string): Observable<News[]> {
    return this.apiService.get<News[]>('/news', { category }).pipe(
      catchError(error => {
        console.warn('Error al filtrar noticias, usando datos mock:', error);
        return of(this.mockNews.filter(n => n.category === category));
      })
    );
  }

  /**
   * Crea una nueva noticia
   */
  createNews(news: Omit<News, 'id'>): Observable<News> {
    return this.apiService.post<News>('/news', news);
  }

  /**
   * Actualiza una noticia existente
   */
  updateNews(id: number, news: Partial<News>): Observable<News> {
    return this.apiService.put<News>(`/news/${id}`, news);
  }

  /**
   * Elimina una noticia
   */
  deleteNews(id: number): Observable<void> {
    return this.apiService.delete<void>(`/news/${id}`);
  }

  /**
   * Obtiene las categorías disponibles
   */
  getCategories(): Observable<string[]> {
    return this.apiService.get<string[]>('/news/categories').pipe(
      catchError(() => {
        const categories = [...new Set(this.mockNews.map(n => n.category))];
        return of(categories);
      })
    );
  }
}
