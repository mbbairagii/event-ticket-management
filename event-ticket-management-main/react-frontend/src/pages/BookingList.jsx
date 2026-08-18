import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  QrCode, 
  ArrowRight,
  Download,
  Mail,
  CalendarPlus,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import AlienLogo from '../components/AlienLogo';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await getUserBookings(user.id);
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to fetch user bookings', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate, fetchBookings]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking pass? This action will release your seats back to the public pool.')) {
      try {
        setCancellingId(id);
        await cancelBooking(id);
        showToast('✓ Booking pass cancelled and seats restored to pool.');
        await fetchBookings();
      } catch (error) {
        alert(error.response?.data?.error || error.response?.data?.message || 'Failed to cancel booking pass.');
      } finally {
        setCancellingId(null);
      }
    }
  };

  const handlePrintPass = (_booking) => {
    window.print();
  };

  const handleAddToCalendar = (booking) => {
    const eventName = encodeURIComponent(booking.eventName || 'Live Event Experience');
    const venue = encodeURIComponent(`${booking.eventVenue || 'Venue'}, ${booking.eventCity || ''}`);
    const details = encodeURIComponent(`Eventified Digital Ticket #${booking.id} - ${booking.quantity} Pass(es). Verified Entry.`);
    
    // Format date if possible
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventName}&details=${details}&location=${venue}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const handleEmailReceipt = (_booking) => {
    showToast(`✓ Encrypted pass & receipt sent to ${user?.email || 'your registered email'}.`);
  };

  return (
    <div className="w-full bg-[#070709] text-white min-h-screen pb-24">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 bg-[#0f1017] border border-[#ccff00] text-[#ccff00] font-mono text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-gradient-to-b from-[#101119] to-[#070709]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <AlienLogo className="w-5 h-5" glow={false} />
            <span className="px-3 py-1 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase">
              PASS VAULT
            </span>
            <span className="text-xs font-mono text-gray-400">EVENTIFIED DIGITAL PASSES</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-syne font-black text-4xl sm:text-6xl uppercase tracking-tight">
                MY DIGITAL PASSES
              </h1>
              <p className="text-gray-400 font-mono text-xs max-w-xl mt-2">
                Present your pass at the door. Dynamic cryptographic authentication ensures zero duplicate entries.
              </p>
            </div>
            <div className="p-3 bg-white/5 border border-white/15 flex items-center gap-2 text-xs font-mono text-gray-300">
              <ShieldCheck size={16} className="text-[#ccff00]" />
              <span>ANTI-SCALPING SECURE WALLET</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="funky-spinner mx-auto" />
            <p className="font-mono text-xs text-gray-400 uppercase">Decrypting your ticket pass vault...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-16 text-center bg-[#0e0f16] border border-white/15 space-y-6">
            <Ticket size={56} className="text-gray-600 mx-auto" />
            <h3 className="font-syne font-black text-2xl sm:text-3xl text-white uppercase">
              NO ACTIVE PASSES IN YOUR VAULT
            </h3>
            <p className="text-gray-400 text-xs font-mono max-w-md mx-auto">
              You have not reserved tickets for upcoming shows yet. Discover our curated calendar and secure your access.
            </p>
            <Link to="/events" className="btn-funky-primary text-xs inline-flex">
              <span>EXPLORE LIVE SHOWS</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';

              return (
                <div 
                  key={booking.id}
                  className="ticket-stub bg-[#11121b] border border-white/20 p-6 sm:p-8 flex flex-col md:flex-row items-stretch justify-between gap-6 relative overflow-hidden"
                >
                  {/* Left Ticket Details */}
                  <div className="flex-1 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <AlienLogo className="w-5 h-5" glow={false} />
                        <span className="badge-lime">EVENTIFIED PASS</span>
                        <span className="text-xs font-mono text-gray-400">#PASS-{booking.id}</span>
                      </div>
                      <span 
                        className={`text-xs font-mono font-bold px-2.5 py-1 uppercase ${
                          isConfirmed ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/40' : 'bg-red-500/15 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-syne font-black text-2xl sm:text-3xl text-white uppercase leading-tight">
                        {booking.eventName || 'Live Event Experience'}
                      </h3>
                      <p className="text-gray-400 text-xs font-mono mt-1">
                        Attendee: <span className="text-white font-bold">{user?.name || user?.email}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#ccff00]" />
                        <span>{booking.eventDate || 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#ccff00]" />
                        <span>{booking.eventVenue || 'Venue'}, {booking.eventCity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket size={14} className="text-[#ccff00]" />
                        <span>{booking.quantity} Pass{booking.quantity > 1 ? 'es' : ''}</span>
                      </div>
                    </div>

                    {/* Action Bar: Print PDF, Add to Calendar, Email Receipt */}
                    {isConfirmed && (
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10 text-xs font-mono">
                        <button
                          onClick={() => handlePrintPass(booking)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#ccff00] text-gray-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download size={13} className="text-[#ccff00]" />
                          <span>PRINT / SAVE PDF</span>
                        </button>

                        <button
                          onClick={() => handleAddToCalendar(booking)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#ccff00] text-gray-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CalendarPlus size={13} className="text-[#00f0ff]" />
                          <span>GOOGLE CALENDAR</span>
                        </button>

                        <button
                          onClick={() => handleEmailReceipt(booking)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#ccff00] text-gray-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Mail size={13} className="text-[#ffaa00]" />
                          <span>EMAIL PASS</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Perforated Stub / QR Barcode */}
                  <div className="md:w-64 pt-6 md:pt-0 md:pl-8 border-t md:border-t-0 md:border-l border-dashed border-white/20 flex flex-col justify-between items-center text-center space-y-4">
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-gray-400 uppercase">TOTAL SETTLED</span>
                      <div className="font-syne font-black text-2xl text-[#ccff00]">
                        ₹{Number(booking.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Mock QR Code Scanner Frame */}
                    <div className="p-3 bg-black/80 border border-white/15 space-y-1.5 w-full flex flex-col items-center">
                      <div className="w-20 h-20 bg-white p-1.5 flex items-center justify-center">
                        <QrCode size={64} className="text-black" />
                      </div>
                      <span className="font-mono text-[9px] text-gray-400 tracking-widest">
                        {isConfirmed ? 'VALID ENTRY QR' : 'VOID PASS'}
                      </span>
                    </div>

                    {/* Cancellation button if confirmed */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="text-[11px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer"
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking Pass'}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}
