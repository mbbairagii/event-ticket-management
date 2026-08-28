import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { EventListComponent } from './pages/event-list/event-list.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { BookingListComponent } from './pages/booking-list/booking-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EventFormComponent } from './pages/event-form/event-form.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailsComponent },
  { path: 'bookings', component: BookingListComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'dashboard/event/new', component: EventFormComponent },
  { path: 'dashboard/event/edit/:id', component: EventFormComponent },
  { path: '**', redirectTo: '' }
];
