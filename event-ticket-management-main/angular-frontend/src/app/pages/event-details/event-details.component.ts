import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaymentModalComponent],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  event: any = null;
  loading = true;
  quantity = 1;
  error = '';
  isPaymentOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchEvent(Number(id));
    }
  }

  fetchEvent(id: number) {
    this.apiService.getEventById(id).subscribe({
      next: (response) => {
        this.event = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Event not found';
        this.loading = false;
      }
    });
  }

  get user() {
    return this.authService.user;
  }

  handleBook() {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.isPaymentOpen = true;
  }

  processBookingBackend() {
    this.apiService.createBooking({
      userId: this.user.id,
      eventId: this.event.id,
      quantity: this.quantity
    }).subscribe({
      next: () => {
        this.isPaymentOpen = false;
        this.router.navigate(['/bookings']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Booking failed';
        this.isPaymentOpen = false;
      }
    });
  }
}
