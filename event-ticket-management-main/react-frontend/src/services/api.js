import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users
export const registerUser = (data) => api.post('/users/register', data);
export const loginUser = (data) => api.post('/users/login', data);

// Events
export const getEvents = (params) => api.get('/events', { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const getUserBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const getOrganizerBookings = (organizerId) => api.get(`/bookings/organizer/${organizerId}`);
export const getAllBookings = () => api.get('/bookings');

// Payments
export const createRazorpayOrder = (data) => api.post('/payments/create-order', data);
export const verifyRazorpayPayment = (data) => api.post('/payments/verify', data);