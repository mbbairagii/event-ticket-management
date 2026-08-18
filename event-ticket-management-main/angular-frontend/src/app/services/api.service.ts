import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_BASE_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Users
  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/users/register`, data);
  }

  loginUser(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/users/login`, data);
  }

  // Events
  getEvents(paramsObj: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach(key => {
      if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
        params = params.set(key, paramsObj[key]);
      }
    });
    return this.http.get(`${this.API_BASE_URL}/events`, { params });
  }

  getEventById(id: number): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/events/${id}`);
  }

  createEvent(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/events`, data);
  }

  updateEvent(id: number, data: any): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/events/${id}`, data);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/events/${id}`);
  }

  // Bookings
  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/bookings`, data);
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/bookings/${id}/cancel`, {});
  }

  getUserBookings(userId: number): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/bookings/user/${userId}`);
  }

  getOrganizerBookings(organizerId: number): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/bookings/organizer/${organizerId}`);
  }

  getAllBookings(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/bookings`);
  }

  // Payments
  createRazorpayOrder(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/payments/create-order`, data);
  }

  verifyRazorpayPayment(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/payments/verify`, data);
  }
}
