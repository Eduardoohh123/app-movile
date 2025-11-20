import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class NewsPage implements OnInit {

  news = [
    {
      id: 1,
      title: 'Fichaje bomba: Manchester City cierra la contratación del año',
      summary: 'El equipo inglés confirma la llegada de una de las estrellas más prometedoras del fútbol mundial.',
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

  constructor(private router: Router) { }

  ngOnInit() {}

  getCategoryColor(category: string): string {
    const colors: any = {
      'Fichajes': 'success',
      'Competiciones': 'primary',
      'Lesiones': 'warning',
      'Records': 'tertiary'
    };
    return colors[category] || 'medium';
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  openNews(newsId: number) {
    console.log('Opening news:', newsId);
  }

}
