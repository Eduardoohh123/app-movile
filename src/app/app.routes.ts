import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'registrar',
    loadComponent: () => import('./registrar/registrar.page').then( m => m.RegistrarPage)
  },
  {
    path: 'google',
    loadComponent: () => import('./google/google.page').then( m => m.GooglePage)
  },
  {
    path: 'apple',
    loadComponent: () => import('./apple/apple.page').then( m => m.ApplePage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'news',
    loadComponent: () => import('./news/news.page').then( m => m.NewsPage)
  },
  {
    path: 'standings',
    loadComponent: () => import('./standings/standings.page').then( m => m.StandingsPage)
  },
  {
    path: 'matches',
    loadComponent: () => import('./matches/matches.page').then( m => m.MatchesPage)
  },
  {
    path: 'bets',
    loadComponent: () => import('./bets/bets.page').then( m => m.BetsPage)
  },
  {
    path: 'community',
    loadComponent: () => import('./community/community.page').then( m => m.CommunityPage)
  },
];
