import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: any[] = [];
  loading = true;
  filters = { name: '', city: '', category: '' };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents() {
    this.loading = true;
    
    // Only include non-empty filters
    const params: any = {};
    if (this.filters.name) params.name = this.filters.name;
    if (this.filters.city) params.city = this.filters.city;
    if (this.filters.category) params.category = this.filters.category;

    this.apiService.getEvents(params).subscribe({
      next: (response) => {
        this.events = response.content || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch events', error);
        this.loading = false;
      }
    });
  }

  handleSearch() {
    this.fetchEvents();
  }
}
