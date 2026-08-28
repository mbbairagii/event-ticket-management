import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredEvents: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchFeatured();
  }

  fetchFeatured() {
    this.apiService.getEvents({ size: 3 }).subscribe({
      next: (res) => {
        this.featuredEvents = res.content || res;
      },
      error: (e) => console.error(e)
    });
  }
}
