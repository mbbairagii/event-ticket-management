import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getEventById, createBooking, cancelBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import AlienLogo from '../components/AlienLogo';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [reserving, setReserving] = useState(false);
  const paymentCompletedRef = useRef(false);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getEventById(id);
      setEvent(response.data);
    } catch (err) {
      console.error('Fetch event error', err);
      setError('Event not found or failed to load.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Immediately release seat hold if user closes browser tab, reloads, or navigates away
  useEffect(() => {
    if (!pendingBooking) return;
    paymentCompletedRef.current = false;

    const releaseSeatHold = () => {
      if (paymentCompletedRef.current) return;
      const cancelUrl = `http://localhost:8080/api/bookings/${pendingBooking.id}/cancel`;
      if (navigator.sendBeacon) {
        navigator.sendBeacon(cancelUrl);
      } else {
        fetch(cancelUrl, { method: 'POST', keepalive: true }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', releaseSeatHold);
    window.addEventListener('pagehide', releaseSeatHold);

    return () => {
      window.removeEventListener('beforeunload', releaseSeatHold);
      window.removeEventListener('pagehide', releaseSeatHold);
      if (!paymentCompletedRef.current && pendingBooking) {
        cancelBooking(pendingBooking.id).catch(() => {});
      }
    };
  }, [pendingBooking]);

  const isOrganizer = user && (user.role === 'ORGANIZER' || user.role === 'organizer');

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isOrganizer) {
      setError('Organizers cannot book passes. Please sign in with an Attendee account.');
      return;
    }

    setError('');
    setReserving(true);

    try {
      // 1. Temporarily hold and reserve the seats in Event Service
      const response = await createBooking({
        userId: user.id,
        eventId: event.id,
        quantity: quantity
      });

      setPendingBooking(response.data);
      setIsPaymentOpen(true);
    } catch (err) {
      let errorMsg = 'Unable to reserve seats. Please try again.';
      const resData = err.response?.data;
      
      if (resData) {
        if (typeof resData === 'string') {
          errorMsg = resData;
        } else if (resData.error && resData.error !== 'Internal Server Error') {
          errorMsg = resData.error;
        } else if (resData.message) {
          errorMsg = resData.message;
        } else if (resData.error) {
          errorMsg = resData.error;
        }
      }

      setError(errorMsg);
      // Refresh event to display current seat availability
      fetchEvent();
    } finally {
      setReserving(false);
    }
  };

  const handleClosePayment = async () => {
    setIsPaymentOpen(false);
    if (pendingBooking) {
      try {
        // Release the seat hold immediately if user cancels checkout
        await cancelBooking(pendingBooking.id);
      } catch (err) {
        console.warn('Seat release on close error', err);
      }
      setPendingBooking(null);
      fetchEvent();
    }
  };

  const onPaymentSuccess = () => {
    paymentCompletedRef.current = true;
    setIsPaymentOpen(false);
    setPendingBooking(null);
    navigate('/bookings');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#070709] text-white">
        <div className="funky-spinner mb-4" />
        <p className="font-mono text-xs text-gray-400 uppercase">Synchronizing event access token...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#070709] text-white p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="font-syne font-black text-3xl mb-2">SHOW NOT FOUND</h2>
        <p className="text-gray-400 font-mono text-xs mb-6">{error || 'This event does not exist.'}</p>
        <Link to="/events" className="btn-funky-primary text-xs">
          BACK TO SHOW CALENDAR
        </Link>
      </div>
    );
  }

  const isSoldOut = event.availableSeats === 0;
  const totalPrice = (event.price || 0) * quantity;

  return (
    <div className="w-full bg-[#070709] text-white min-h-screen pb-24">
      
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link 
          to="/events" 
          className="inline-flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-[#ccff00] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>BACK TO ALL SHOWS</span>
        </Link>
      </div>

      {/* Hero Showcase Poster */}
      <section className="relative mt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative min-h-[400px] sm:min-h-[480px] w-full border border-white/15 flex flex-col justify-end p-6 sm:p-12 overflow-hidden bg-[#141520]">
          
          {/* Hero Poster Image */}
          <img
            src={event.imageUrl || '/concert-background-dark.png'}
            alt={event.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/concert-background-dark.png';
            }}
          />
          
          {/* Overlay Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-black/65 to-black/30 pointer-events-none" />
          
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="badge-lime">{event.category || 'LIVE SHOW'}</span>
              <span className="badge-dark">OFFICIAL PASS</span>
              {isSoldOut && <span className="badge-orange">SOLD OUT</span>}
            </div>

            <h1 className="font-syne font-black text-3xl sm:text-5xl md:text-6xl text-white uppercase leading-[0.95] tracking-tight">
              {event.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-gray-300 pt-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#ccff00]" />
                <span>{event.eventDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#ccff00]" />
                <span>{event.venue}, {event.city}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Details + Booking Pass Box */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Information & specs */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Description */}
            <div className="space-y-4">
              <h2 className="font-syne font-bold text-2xl uppercase tracking-tight text-[#ccff00]">
                ABOUT THIS EXPERIENCE
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-light whitespace-pre-line bg-black/40 p-4 border-l-2 border-[#ccff00]">
                {event.description}
              </p>
            </div>

            {/* Event Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
              <div className="p-4 bg-[#111218] border border-white/10 space-y-1">
                <span className="text-gray-500 uppercase">VENUE LOCATION</span>
                <div className="font-bold text-white text-sm">{event.venue}</div>
                <div className="text-[#ccff00]">{event.city}</div>
              </div>

              <div className="p-4 bg-[#111218] border border-white/10 space-y-1">
                <span className="text-gray-500 uppercase">SEAT CAPACITY</span>
                <div className="font-bold text-white text-sm">
                  {event.availableSeats} Available
                </div>
                <div className="text-gray-400">Total: {event.totalSeats} Passes</div>
              </div>
            </div>

            {/* Security Guarantees */}
            <div className="p-6 bg-[#0c0d14] border border-[#ccff00]/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#ccff00] uppercase font-bold">
                <ShieldCheck size={16} />
                <span>EVENTIFIED TICKET PROTOCOL</span>
              </div>
              <ul className="space-y-2 text-xs font-mono text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#ccff00]" />
                  <span>100% Guaranteed admission with dynamic QR digital stub</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#ccff00]" />
                  <span>Instant verified cryptographic door admission</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#ccff00]" />
                  <span>Direct settlement with event organizer</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Sticky Booking Ticket Box */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-8 bg-[#101119] border border-white/20 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">PRICE PER PASS</span>
                  <span className="font-syne font-black text-4xl text-[#ccff00]">
                    ₹{Number(event.price || 0).toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">CAPACITY</span>
                  <span className={`font-mono text-xs font-bold ${event.availableSeats > 0 ? 'text-[#ccff00]' : 'text-red-400'}`}>
                    {event.availableSeats > 0 ? `${event.availableSeats} LEFT` : 'SOLD OUT'}
                  </span>
                </div>
              </div>

              {/* Quantity selector */}
              {!isSoldOut && (
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase text-gray-400 flex items-center justify-between">
                    <span>SELECT NUMBER OF PASSES</span>
                    <span>MAX: {Math.min(event.availableSeats, 10)}</span>
                  </label>
                  <div className="flex items-center border border-white/20 bg-black/40">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-3 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="flex-1 text-center font-syne font-bold text-xl text-white">
                      {quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.min(event.availableSeats, Math.min(10, q + 1)))}
                      disabled={quantity >= event.availableSeats || quantity >= 10}
                      className="p-3 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Total summary */}
              <div className="p-4 bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Passes ({quantity}x)</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Platform Booking Fee</span>
                  <span className="text-[#ccff00]">₹0.00 (FREE)</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-[#ccff00] font-syne font-black text-xl">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleBook}
                disabled={isSoldOut || event.availableSeats < quantity || reserving || isOrganizer}
                className="w-full py-4 bg-[#ccff00] hover:bg-white text-black font-syne font-black text-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {reserving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>LOCKING SEATS...</span>
                  </>
                ) : isOrganizer ? (
                  <span>ORGANIZERS CANNOT BOOK PASSES</span>
                ) : (
                  <>
                    <Ticket size={18} />
                    <span>{isSoldOut ? 'SHOW IS SOLD OUT' : 'SECURE PASSES NOW'}</span>
                  </>
                )}
              </button>

              {isOrganizer && (
                <p className="text-[11px] font-mono text-center text-yellow-400/90">
                  * You are signed in with an Organizer account. Only attendees can purchase tickets.
                </p>
              )}

              {!user && (
                <p className="text-[11px] font-mono text-center text-gray-400">
                  * You will be prompted to login/register to attach passes to your account.
                </p>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Razorpay Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={handleClosePayment} 
        amount={pendingBooking ? pendingBooking.totalAmount : totalPrice} 
        userId={user?.id}
        bookingId={pendingBooking?.id}
        expiresAt={pendingBooking?.expiresAt}
        eventName={event.name}
        onSuccess={onPaymentSuccess} 
      />

    </div>
  );
}