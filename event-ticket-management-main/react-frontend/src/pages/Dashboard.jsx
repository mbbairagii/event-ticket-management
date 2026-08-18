import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getEvents, 
  deleteEvent, 
  getAllBookings, 
  getOrganizerBookings 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  Trash2, 
  Edit
} from 'lucide-react';
import AlienLogo from '../components/AlienLogo';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  const isAuthorized = user && (user.role === 'ADMIN' || user.role === 'ORGANIZER' || user.role === 'admin' || user.role === 'organizer');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const isAdmin = user.role === 'ADMIN' || user.role === 'admin';
      
      const eventsCall = isAdmin 
        ? getEvents({ size: 100 }) 
        : getEvents({ organizerId: user.id, size: 100 });

      const bookingsCall = isAdmin
        ? getAllBookings()
        : getOrganizerBookings(user.id);

      const [eventsRes, bookingsRes] = await Promise.allSettled([eventsCall, bookingsCall]);

      if (eventsRes.status === 'fulfilled') {
        setEvents(eventsRes.value.data?.content || eventsRes.value.data || []);
      }
      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.data || []);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isAuthorized) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate, isAuthorized, fetchData]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this event? This action will remove all associated ticket listings.')) {
      try {
        await deleteEvent(id);
        await fetchData();
      } catch (err) {
        console.error('Delete error', err);
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete event.';
        alert(errorMsg);
      }
    }
  };

  if (!isAuthorized) return null;

  // Compute summary metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalSeatsSold = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);

  return (
    <div className="w-full bg-[#070709] text-white min-h-screen pb-24">
      
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-gradient-to-b from-[#10111a] to-[#070709]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlienLogo className="w-5 h-5" glow={false} />
              <span className="px-3 py-1 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase">
                {user.role === 'ADMIN' ? 'ADMIN CONSOLE' : 'ORGANIZER CONTROL TOWER'}
              </span>
              <span className="text-xs font-mono text-gray-400">HOST ID: #{user.id}</span>
            </div>
            <h1 className="font-syne font-black text-4xl sm:text-5xl uppercase tracking-tight">
              EVENT MANAGEMENT
            </h1>
          </div>

          <Link to="/dashboard/event/new" className="btn-funky-primary text-xs">
            <PlusCircle size={16} />
            <span>CREATE NEW EVENT</span>
          </Link>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-5 bg-[#0f1017] border border-white/10 space-y-1">
            <div className="text-gray-400 uppercase">ACTIVE SHOWS HOSTED</div>
            <div className="font-syne font-black text-3xl text-white">{events.length}</div>
          </div>
          <div className="p-5 bg-[#0f1017] border border-white/10 space-y-1">
            <div className="text-gray-400 uppercase">TOTAL PASSES SOLD</div>
            <div className="font-syne font-black text-3xl text-[#ccff00]">{totalSeatsSold}</div>
          </div>
          <div className="p-5 bg-[#0f1017] border border-white/10 space-y-1">
            <div className="text-gray-400 uppercase">GROSS PASS SETTLEMENT</div>
            <div className="font-syne font-black text-3xl text-[#00f0ff]">₹{totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </section>

      {/* Tabs & Tables */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Tab Buttons */}
        <div className="flex items-center gap-3 border-b border-white/10 mb-6 font-mono text-xs">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 px-4 font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'text-[#ccff00] border-b-2 border-[#ccff00]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Manage Hosted Shows ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'text-[#ccff00] border-b-2 border-[#ccff00]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Guest Bookings ({bookings.length})
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="funky-spinner mx-auto" />
            <p className="font-mono text-xs text-gray-400 uppercase">Loading control tower...</p>
          </div>
        ) : activeTab === 'events' ? (
          /* Events Table */
          <div className="bg-[#0f1017] border border-white/10 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black/60 border-b border-white/10 text-gray-400 uppercase">
                <tr>
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Venue / City</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500">
                      No hosted events found. Click "Create New Event" to launch your first show.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ev.imageUrl || '/concert-background-dark.png'}
                            alt={ev.name}
                            className="w-12 h-12 object-cover border border-white/20 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/concert-background-dark.png';
                            }}
                          />
                          <div>
                            <div className="font-syne font-bold text-sm text-white">{ev.name}</div>
                            <div className="text-[11px] text-[#ccff00]">{ev.category || 'LIVE'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{ev.eventDate}</td>
                      <td className="p-4 text-gray-300">{ev.venue}, {ev.city}</td>
                      <td className="p-4">
                        <span className="text-[#ccff00] font-bold">{ev.availableSeats}</span> / {ev.totalSeats} seats
                      </td>
                      <td className="p-4 font-bold text-white">₹{Number(ev.price || 0).toFixed(2)}</td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          to={`/dashboard/event/edit/${ev.id}`}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase inline-flex items-center gap-1"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-black font-mono text-xs uppercase inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Bookings Table */
          <div className="bg-[#0f1017] border border-white/10 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black/60 border-b border-white/10 text-gray-400 uppercase">
                <tr>
                  <th className="p-4">Pass ID</th>
                  <th className="p-4">Attendee Guest</th>
                  <th className="p-4">Event Name</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Settlement</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500">
                      No guest bookings recorded yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-[#ccff00]">#PASS-{b.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{b.user?.name || 'Guest'}</div>
                        <div className="text-[10px] text-gray-400">{b.user?.email}</div>
                      </td>
                      <td className="p-4 text-gray-300">{b.event?.name || `Event #${b.eventId}`}</td>
                      <td className="p-4 font-bold text-white">{b.quantity} pass{b.quantity > 1 ? 'es' : ''}</td>
                      <td className="p-4 font-bold text-[#ccff00]">₹{Number(b.totalAmount || 0).toFixed(2)}</td>
                      <td className="p-4">
                        <span 
                          className={`px-2.5 py-1 text-[10px] uppercase font-bold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </section>

    </div>
  );
}