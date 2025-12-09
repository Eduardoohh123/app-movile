import { Injectable } from '@angular/core';

export interface News {
  id: number;
  title: string;
  summary: string;
  image: string;
  category: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private news: News[] = [
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
      summary: 'Los cuatro mejores equipos de Europa conocen a sus rivales en la pelea por la gloria continental. Real Madrid vs Bayern y City vs PSG son los duelos destacados.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop',
      category: 'Competiciones',
      time: 'Hace 1 hora'
    },
    {
      id: 3,
      title: 'Lesión de última hora afecta al equipo líder',
      summary: 'El delantero estrella estará fuera de las canchas por al menos 6 semanas según reportes médicos. Un duro golpe para las aspiraciones del club.',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop',
      category: 'Lesiones',
      time: 'Hace 2 horas'
    },
    {
      id: 4,
      title: 'Barcelona anuncia renovación de contrato de su joven promesa',
      summary: 'El club culé asegura el futuro de una de sus mayores joyas hasta 2028 con cláusula millonaria.',
      image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=250&fit=crop',
      category: 'Fichajes',
      time: 'Hace 3 horas'
    },
    {
      id: 5,
      title: 'Record histórico: Cristiano Ronaldo alcanza los 900 goles',
      summary: 'El astro portugués continúa escribiendo historia en el fútbol mundial con este increíble logro que pocos pueden igualar.',
      image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
      category: 'Records',
      time: 'Hace 4 horas'
    },
    {
      id: 6,
      title: 'Premier League: Arsenal toma ventaja en la tabla',
      summary: 'Los Gunners vencieron 3-1 al Chelsea y se colocan como líderes absolutos con 5 puntos de ventaja.',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=250&fit=crop',
      category: 'Competiciones',
      time: 'Hace 5 horas'
    },
    {
      id: 7,
      title: 'PSG prepara oferta millonaria por estrella del Liverpool',
      summary: 'El club parisino estaría dispuesto a pagar 150 millones por el mediocampista inglés en el próximo mercado de fichajes.',
      image: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=400&h=250&fit=crop',
      category: 'Fichajes',
      time: 'Hace 6 horas'
    },
    {
      id: 8,
      title: 'Balón de Oro 2024: Los 5 favoritos según los expertos',
      summary: 'Analizamos quiénes son los principales candidatos a llevarse el prestigioso galardón este año.',
      image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=250&fit=crop',
      category: 'Records',
      time: 'Hace 8 horas'
    },
    {
      id: 9,
      title: 'Sorpresa en La Liga: El Atlético ficha al goleador del momento',
      summary: 'Los colchoneros sorprenden al mercado con la contratación del delantero que lleva 25 goles en la temporada.',
      image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400&h=250&fit=crop',
      category: 'Fichajes',
      time: 'Hace 10 horas'
    },
    {
      id: 10,
      title: 'Copa del Rey: Definidos los cuartos de final',
      summary: 'Ya están confirmados todos los cruces para la próxima ronda del torneo más antiguo de España.',
      image: 'https://images.unsplash.com/photo-1624880357913-a8539238245b?w=400&h=250&fit=crop',
      category: 'Competiciones',
      time: 'Hace 12 horas'
    }
  ];

  constructor() { }

  /**
   * Obtiene todas las noticias
   */
  getAllNews(): News[] {
    return this.news;
  }

  /**
   * Obtiene las últimas N noticias
   */
  getLatestNews(limit: number = 3): News[] {
    return this.news.slice(0, limit);
  }

  /**
   * Obtiene una noticia por ID
   */
  getNewsById(id: number): News | undefined {
    return this.news.find(n => n.id === id);
  }

  /**
   * Obtiene el color de la categoría
   */
  getCategoryColor(category: string): string {
    const colors: any = {
      'Fichajes': 'success',
      'Competiciones': 'primary',
      'Lesiones': 'warning',
      'Records': 'tertiary'
    };
    return colors[category] || 'medium';
  }
}
