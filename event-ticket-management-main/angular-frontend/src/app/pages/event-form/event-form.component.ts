import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  id: string | null = null;
  error = '';
  
  formData = {
    name: '',
    description: '',
    venue: '',
    city: '',
    eventDate: '',
    totalSeats: 0,
    availableSeats: 0,
    price: 0.0,
    category: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.user || (this.user.role !== 'ADMIN' && this.user.role !== 'ORGANIZER')) {
      this.router.navigate(['/']);
      return;
    }

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetchEventData(Number(this.id));
    }
  }

  get user() {
    return this.authService.user;
  }

  fetchEventData(id: number) {
    this.apiService.getEventById(id).subscribe({
      next: (response) => {
        this.formData = response;
      },
      error: () => {
        this.error = 'Failed to fetch event data';
      }
    });
  }

  handleTotalSeatsChange() {
    if (!this.id) {
      this.formData.availableSeats = this.formData.totalSeats;
    }
  }

  handleSubmit() {
    const submissionData = { ...this.formData, organizerId: this.user.id };
    
    if (this.id) {
      this.apiService.updateEvent(Number(this.id), submissionData).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => this.error = err.error?.message || 'Failed to update event'
      });
    } else {
      this.apiService.createEvent(submissionData).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => this.error = err.error?.message || 'Failed to create event'
      });
    }
  }

  cancel() {
    this.router.navigate(['/dashboard']);
  }
}
