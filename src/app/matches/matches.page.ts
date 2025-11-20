import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.page.html',
  styleUrls: ['./matches.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MatchesPage implements OnInit {

  selectedSegment = 'live';

  liveMatches = [
    {
      id: 1,
      league: 'Premier League',
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      homeScore: 2,
      awayScore: 1,
      time: "67'",
      status: 'En Vivo'
    },
    {
      id: 2,
      league: 'La Liga',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      homeScore: 3,
      awayScore: 3,
      time: "82'",
      status: 'En Vivo'
    }
  ];

  upcomingMatches = [
    {
      id: 3,
      league: 'Champions League',
      homeTeam: 'Bayern Munich',
      awayTeam: 'PSG',
      date: 'Hoy 20:00',
      stadium: 'Allianz Arena'
    },
    {
      id: 4,
      league: 'Premier League',
      homeTeam: 'Chelsea',
      awayTeam: 'Arsenal',
      date: 'Mañana 15:30',
      stadium: 'Stamford Bridge'
    }
  ];

  finishedMatches = [
    {
      id: 5,
      league: 'La Liga',
      homeTeam: 'Atlético Madrid',
      awayTeam: 'Sevilla',
      homeScore: 2,
      awayScore: 0,
      date: 'Ayer'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {}

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  openMatchDetail(matchId: number) {
    console.log('Opening match detail:', matchId);
  }

}
