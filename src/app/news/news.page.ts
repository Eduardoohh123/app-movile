import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { NewsService, News } from '../services/news.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class NewsPage implements OnInit {

  news: News[] = [];

  constructor(
    private router: Router,
    private newsService: NewsService
  ) { }

  ngOnInit() {
    this.news = this.newsService.getAllNews();
  }

  getCategoryColor(category: string): string {
    return this.newsService.getCategoryColor(category);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  navigateToTransfers() {
    this.router.navigate(['/transfers']);
  }

  openNews(newsId: number) {
    console.log('Opening news:', newsId);
  }

}
