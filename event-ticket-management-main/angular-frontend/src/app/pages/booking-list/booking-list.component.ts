import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit {
  bookings: any[] = [];
  loading = true;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchBookings();
  }

  get user() {
    return this.authService.user;
  }

  fetchBookings() {
    this.apiService.getUserBookings(this.user.id).subscribe({
      next: (response) => {
        this.bookings = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch bookings', error);
        this.loading = false;
      }
    });
  }

  handleCancel(id: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.apiService.cancelBooking(id).subscribe({
        next: () => {
          this.fetchBookings();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to cancel booking');
        }
      });
    }
  }
}
