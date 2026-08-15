import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await getUserBookings(user.id);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id);
        fetchBookings(); // Refresh the list
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>You haven't booked any tickets yet.</p>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map(booking => (
            <div key={booking.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>{booking.event.name}</h3>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>📅 {booking.event.eventDate}</span>
                  <span>📍 {booking.event.venue}</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
                  <span>Tickets: <strong>{booking.quantity}</strong></span>
                  <span>Total: <strong>₹{booking.totalAmount.toFixed(2)}</strong></span>
                  <span>Status: 
                    <strong style={{ 
                      marginLeft: '0.5rem',
                      color: booking.status === 'CONFIRMED' ? '#2ed573' : '#ff4757'
                    }}>
                      {booking.status}
                    </strong>
                  </span>
                </div>
              </div>
              
              <div>
                {booking.status === 'CONFIRMED' && (
                  <button 
                    className="btn" 
                    onClick={() => handleCancel(booking.id)}
                    style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingList;
