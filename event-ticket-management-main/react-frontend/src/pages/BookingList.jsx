import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking, refundPayment } from '../services/api';
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
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  X,
  RotateCcw
} from 'lucide-react';
import AlienLogo from '../components/AlienLogo';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Custom Project Modal States (No browser popups!)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'CANCEL' | 'REFUND'
    booking: null,
    title: '',
    description: '',
    policyNote: '',
    confirmText: 'CONFIRM'
  });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    const activeUser = user || JSON.parse(localStorage.getItem('user') || 'null');
    if (!activeUser || !activeUser.id) return;
    try {
      setLoading(true);
      const response = await getUserBookings(activeUser.id);
      const fetched = response.data || [];
      // Sort newest bookings first
      fetched.sort((a, b) => (b.id || 0) - (a.id || 0));
      setBookings(fetched);
    } catch (error) {
      console.error('Failed to fetch user bookings', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const activeUser = user || JSON.parse(localStorage.getItem('user') || 'null');
    if (!activeUser) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate, fetchBookings]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const getRefundPolicyText = (eventDate) => {
    if (!eventDate) return '100% refund available.';
    const days = Math.ceil((new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days > 7)  return 'Eligible for 100% full refund (event is more than 7 days away).';
    if (days >= 3) return 'Eligible for 50% partial refund (event is between 3 to 7 days away).';
    return '0% refund: Show takes place in less than 72 hours. Tickets are non-refundable.';
  };

  const promptCancel = (booking) => {
    setConfirmModal({
      isOpen: true,
      type: 'CANCEL',
      booking,
      title: 'CANCEL RESERVATION',
      description: `Are you sure you want to cancel pass #${booking.id} for "${booking.eventName || 'Live Event'}"?`,
      policyNote: 'Your held seats will be immediately released back into the public ticket pool.',
      confirmText: 'YES, CANCEL PASS'
    });
  };

  const promptRefund = (booking) => {
    const policy = getRefundPolicyText(booking.eventDate);
    const isNonRefundable = policy.startsWith('0%');

    setConfirmModal({
      isOpen: true,
      type: 'REFUND',
      booking,
      title: 'REQUEST TICKET REFUND',
      description: `Initiate automated refund for pass #${booking.id} (${booking.quantity} ticket(s) - ₹${Number(booking.totalAmount || 0).toFixed(2)})?`,
      policyNote: policy,
      confirmText: isNonRefundable ? 'CANCEL PASS ONLY' : 'CONFIRM REFUND'
    });
  };

  const handleModalConfirm = async () => {
    const { type, booking } = confirmModal;
    if (!booking) return;

    setActionLoading(true);
    try {
      if (type === 'CANCEL') {
        await cancelBooking(booking.id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('✓ Booking pass cancelled and seats restored to pool.');
        await fetchBookings();
      } else if (type === 'REFUND') {
        const policy = getRefundPolicyText(booking.eventDate);
        if (policy.startsWith('0%')) {
          // Non-refundable policy (>72 hrs) -> cancel booking and release seats
          await cancelBooking(booking.id);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          showToast('✓ Booking pass cancelled. (Non-refundable per policy: show is < 72 hrs away).');
          await fetchBookings();
        } else {
          const res = await refundPayment(booking.id);
          const pct = res.data?.refundPercentage ?? 100;
          const amt = res.data?.refundAmount;
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          showToast(`✓ Refund of ${pct}%${amt ? ` (₹${amt})` : ''} processed! Database and inventory updated.`);
          await fetchBookings();
        }
      }
    } catch (error) {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      setAlertModal({
        isOpen: true,
        title: 'OPERATION FAILED',
        message: error.response?.data?.message || error.response?.data?.error || 'Action could not be completed. Please try again.'
      });
    } finally {
      setActionLoading(false);
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

      {/* Custom Confirmation Modal (Replaces window.confirm) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0f16] border border-[#ccff00] p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(204,255,0,0.15)] relative">
            <button
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00]">
                {confirmModal.type === 'REFUND' ? <RotateCcw size={22} /> : <AlertTriangle size={22} />}
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-wider block">EVENTIFIED PROTOCOL</span>
                <h3 className="font-syne font-black text-xl uppercase tracking-tight text-white">{confirmModal.title}</h3>
              </div>
            </div>

            <p className="text-xs font-mono text-gray-300 leading-relaxed">
              {confirmModal.description}
            </p>

            {confirmModal.policyNote && (
              <div className="p-3 bg-white/5 border border-white/10 text-xs font-mono text-gray-400 space-y-1">
                <span className="text-[10px] text-[#ccff00] font-bold block uppercase tracking-wider">Policy Notice:</span>
                <span>{confirmModal.policyNote}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 font-syne font-bold text-xs">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={actionLoading}
                className="py-3 px-4 border border-white/20 text-gray-300 hover:text-white hover:border-white/40 uppercase tracking-widest cursor-pointer text-center"
              >
                GO BACK
              </button>
              <button
                type="button"
                onClick={handleModalConfirm}
                disabled={actionLoading}
                className="py-3 px-4 bg-[#ccff00] hover:bg-white text-black uppercase tracking-widest cursor-pointer text-center font-black"
              >
                {actionLoading ? 'PROCESSING...' : confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Error / Alert Modal (Replaces alert()) */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0f16] border border-red-500/50 p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block">ALERT</span>
                <h3 className="font-syne font-black text-xl uppercase tracking-tight text-white">{alertModal.title}</h3>
              </div>
            </div>

            <p className="text-xs font-mono text-gray-300 leading-relaxed">
              {alertModal.message}
            </p>

            <button
              type="button"
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
              className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-syne font-bold text-xs uppercase tracking-widest cursor-pointer"
            >
              DISMISS
            </button>
          </div>
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
              <span>SECURE DIGITAL PASS VAULT</span>
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
                          booking.status === 'CONFIRMED' 
                            ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/40' 
                            : booking.status === 'PENDING_PAYMENT'
                            ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/40'
                            : booking.status === 'EXPIRED'
                            ? 'bg-gray-500/15 text-gray-400 border border-gray-500/40'
                            : 'bg-red-500/15 text-red-400 border border-red-500/40'
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

                    {/* Actions for confirmed bookings */}
                    {isConfirmed && (
                      <div className="flex flex-col gap-2 w-full items-center">
                        <button
                          onClick={() => promptRefund(booking)}
                          className="w-full py-2.5 bg-[#ccff00]/10 border border-[#ccff00]/40 text-[#ccff00] hover:bg-[#ccff00]/20 font-mono text-[11px] uppercase tracking-widest transition-all cursor-pointer font-bold"
                        >
                          ↩ Request Refund
                        </button>
                        <button
                          onClick={() => promptCancel(booking)}
                          className="text-[10px] font-mono text-red-400/60 hover:text-red-400 underline cursor-pointer"
                        >
                          Cancel without refund
                        </button>
                      </div>
                    )}

                    {/* Actions for pending hold bookings */}
                    {booking.status === 'PENDING_PAYMENT' && (
                      <div className="w-full">
                        <button
                          onClick={() => promptCancel(booking)}
                          className="w-full py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-mono text-[11px] uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Cancel Hold
                        </button>
                      </div>
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
