import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  events: any[] = [];
  bookings: any[] = [];
  activeTab = 'events';

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.user || (this.user.role !== 'ADMIN' && this.user.role !== 'ORGANIZER')) {
      this.router.navigate(['/']);
      return;
    }
    this.fetchData();
  }

  get user() {
    return this.authService.user;
  }

  fetchData() {
    if (this.user.role === 'ADMIN') {
      forkJoin({
        eventsRes: this.apiService.getEvents({ size: 100 }),
        bookingsRes: this.apiService.getAllBookings()
      }).subscribe({
        next: (result: any) => {
          this.events = result.eventsRes.content || result.eventsRes;
          this.bookings = result.bookingsRes;
        },
        error: (err) => console.error('Error fetching dashboard data', err)
      });
    } else if (this.user.role === 'ORGANIZER') {
      forkJoin({
        eventsRes: this.apiService.getEvents({ organizerId: this.user.id, size: 100 }),
        bookingsRes: this.apiService.getOrganizerBookings(this.user.id)
      }).subscribe({
        next: (result: any) => {
          this.events = result.eventsRes.content || result.eventsRes;
          this.bookings = result.bookingsRes;
        },
        error: (err) => console.error('Error fetching dashboard data', err)
      });
    }
  }

  handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.apiService.deleteEvent(id).subscribe({
        next: () => {
          this.fetchData();
        },
        error: () => alert('Failed to delete event')
      });
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
