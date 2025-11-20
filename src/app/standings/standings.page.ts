import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.page.html',
  styleUrls: ['./standings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class StandingsPage implements OnInit {

  selectedLeague = 'premier';

  leagues = [
    { id: 'premier', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'laliga', name: 'La Liga', flag: '🇪🇸' },
    { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
    { id: 'seriea', name: 'Serie A', flag: '🇮🇹' }
  ];

  standings = [
    {
      position: 1,
      team: 'Manchester City',
      played: 30,
      won: 23,
      drawn: 4,
      lost: 3,
      gf: 75,
      ga: 28,
      gd: 47,
      points: 73,
      form: ['W', 'W', 'W', 'D', 'W']
    },
    {
      position: 2,
      team: 'Arsenal',
      played: 30,
      won: 22,
      drawn: 5,
      lost: 3,
      gf: 70,
      ga: 30,
      gd: 40,
      points: 71,
      form: ['W', 'W', 'D', 'W', 'W']
    },
    {
      position: 3,
      team: 'Liverpool',
      played: 30,
      won: 21,
      drawn: 6,
      lost: 3,
      gf: 68,
      ga: 32,
      gd: 36,
      points: 69,
      form: ['W', 'D', 'W', 'W', 'D']
    },
    {
      position: 4,
      team: 'Manchester United',
      played: 30,
      won: 19,
      drawn: 7,
      lost: 4,
      gf: 62,
      ga: 35,
      gd: 27,
      points: 64,
      form: ['W', 'W', 'L', 'D', 'W']
    },
    {
      position: 5,
      team: 'Chelsea',
      played: 30,
      won: 17,
      drawn: 8,
      lost: 5,
      gf: 58,
      ga: 38,
      gd: 20,
      points: 59,
      form: ['D', 'W', 'W', 'L', 'D']
    },
    {
      position: 18,
      team: 'Everton',
      played: 30,
      won: 6,
      drawn: 8,
      lost: 16,
      gf: 28,
      ga: 52,
      gd: -24,
      points: 26,
      form: ['L', 'L', 'D', 'L', 'L']
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {}

  changeLeague(event: any) {
    this.selectedLeague = event.detail.value;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  openTeamDetail(team: string) {
    console.log('Opening team detail:', team);
  }

}
