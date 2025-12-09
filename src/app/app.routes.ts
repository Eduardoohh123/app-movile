import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta principal - Home (sin autenticación requerida)
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage)
  },
  
  // Rutas de autenticación
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
    canActivate: [publicGuard]
  },
  {
    path: 'registrar',
    loadComponent: () => import('./registrar/registrar.page').then( m => m.RegistrarPage),
    canActivate: [publicGuard]
  },
  {
    path: 'google',
    loadComponent: () => import('./google/google.page').then( m => m.GooglePage),
    canActivate: [publicGuard]
  },
  {
    path: 'apple',
    loadComponent: () => import('./apple/apple.page').then( m => m.ApplePage),
    canActivate: [publicGuard]
  },
  
  // Rutas protegidas (requieren autenticación)
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'bets',
    loadComponent: () => import('./bets/bets.page').then( m => m.BetsPage),
    canActivate: [authGuard]
  },
  {
    path: 'community',
    loadComponent: () => import('./community/community.page').then( m => m.CommunityPage),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage),
    canActivate: [authGuard]
  },
  {
    path: 'leagues',
    loadComponent: () => import('./leagues/leagues.page').then( m => m.LeaguesPage),
    canActivate: [authGuard]
  },
  {
    path: 'teams',
    loadComponent: () => import('./teams/teams.page').then( m => m.TeamsPage),
    canActivate: [authGuard]
  },
  {
    path: 'transfers',
    loadComponent: () => import('./transfers/transfers.page').then( m => m.TransfersPage),
    canActivate: [authGuard]
  },
  
  // Rutas semi-públicas (accesibles pero con funcionalidad limitada)
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
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
