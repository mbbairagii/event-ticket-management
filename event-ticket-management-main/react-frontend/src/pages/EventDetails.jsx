import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await getEventById(id);
      setEvent(response.data);
    } catch (err) {
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsPaymentOpen(true);
  };

  const processBookingBackend = async () => {
    try {
      await createBooking({
        userId: user.id,
        eventId: event.id,
        quantity: quantity
      });
      setIsPaymentOpen(false);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setIsPaymentOpen(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;
  if (!event) return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {error && <div className="error-message" style={{ marginBottom: '2rem' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="event-details-hero" style={{ backgroundImage: `url(${event.imageUrl || '/images/event_music_festival.jpg'})` }}>
          <div className="event-details-hero-overlay">
            <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '1rem', marginBottom: '1rem', display: 'inline-block' }}>
              {event.category}
            </span>
            <h2 style={{ fontSize: '3rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{event.name}</h2>
          </div>
        </div>

        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About this Event</h3>
              <p className="text-secondary" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                {event.description}
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-secondary)', marginBottom: '1.5rem' }}>
                ₹{event.price.toFixed(2)}
              </div>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Event Details</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>📅</div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Date</div>
                    <div>{event.eventDate}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>📍</div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Location</div>
                    <div>{event.venue}</div>
                    <div>{event.city}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>🎟️</div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Availability</div>
                    <div style={{ color: event.availableSeats > 0 ? 'var(--accent-secondary)' : '#ef4444' }}>
                      {event.availableSeats} / {event.totalSeats} seats
                    </div>
                  </div>
                </div>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tickets</label>
                <input 
                  type="number" 
                  min="1" 
                  max={event.availableSeats}
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1.1rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span>₹{(event.price * quantity).toFixed(2)}</span>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                onClick={handleBook}
                disabled={event.availableSeats === 0 || quantity < 1 || quantity > event.availableSeats}
              >
                {event.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        amount={event.price * quantity} 
        userId={user?.id}
        onSuccess={processBookingBackend} 
      />
    </div>
  );
}

export default EventDetails;