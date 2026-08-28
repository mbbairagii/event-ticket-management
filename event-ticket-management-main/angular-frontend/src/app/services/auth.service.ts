import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userSignal = signal<any>(null);

  constructor() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSignal.set(JSON.parse(storedUser));
    }
  }

  get user() {
    return this.userSignal();
  }

  login(userData: any) {
    this.userSignal.set(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  logout() {
    this.userSignal.set(null);
    localStorage.removeItem('user');
  }
}
