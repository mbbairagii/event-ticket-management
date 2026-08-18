import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Ticket, 
  X,
  Navigation
} from 'lucide-react';
import { getEvents } from '../services/api';
import { useUserLocation } from '../hooks/useUserLocation';
import AlienLogo from '../components/AlienLogo';

const POPULAR_HUBS = ['All Cities', 'Delhi', 'Noida', 'Mumbai', 'Goa', 'Bengaluru', 'Amsterdam', 'London', 'Berlin'];
const CATEGORIES = ['All Genres', 'Concerts', 'Electronic', 'Jazz', 'Art', 'Comedy', 'Tech', 'Festival'];

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    category: ''
  });
  const [selectedCityTab, setSelectedCityTab] = useState('All Cities');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All Genres');
  
  const { location, loading: locationLoading, detectLocation, getDistanceToEvent, setManualCity } = useUserLocation();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(filters).filter(([_, val]) => val && val.trim() !== '')
      );
      cleanParams.size = 50;

      const response = await getEvents(cleanParams);
      setEvents(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCitySelect = (cityName) => {
    setSelectedCityTab(cityName);
    if (cityName === 'All Cities') {
      setFilters(prev => ({ ...prev, city: '' }));
    } else {
      setFilters(prev => ({ ...prev, city: cityName }));
      setManualCity(cityName);
    }
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategoryTab(catName);
    setFilters(prev => ({ ...prev, category: catName === 'All Genres' ? '' : catName }));
  };

  const handleApplyDetectedCity = () => {
    if (location?.city) {
      setSelectedCityTab(location.city);
      setFilters(prev => ({ ...prev, city: location.city }));
    } else {
      detectLocation(true);
    }
  };

  const handleClearFilters = () => {
    setFilters({ name: '', city: '', category: '' });
    setSelectedCityTab('All Cities');
    setSelectedCategoryTab('All Genres');
  };

  return (
    <div className="w-full bg-[#070709] text-white min-h-screen">
      
      {/* 1. Header Hero Banner with High Contrast & Perfect Readability */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden bg-gradient-to-b from-[#101119] to-[#070709]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <AlienLogo className="w-5 h-5" glow={false} />
            <span className="px-3 py-1 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase">
              SHOW CALENDAR
            </span>
            <span className="text-xs font-mono text-gray-400">DISCOVER REAL-TIME PASSES</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-syne font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter">
                ALL LIVE <br />
                <span className="stroke-text-lime">EXPERIENCES.</span>
              </h1>
            </div>

            {/* Auto-Location Quick Filter Pill */}
            <div className="p-4 bg-white/5 border border-white/15 backdrop-blur-md flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#ccff00]" />
                <span className="text-xs font-mono text-gray-300">
                  {location?.city ? `Detected: ${location.city}` : 'Auto-detect nearest shows'}
                </span>
              </div>
              <button
                onClick={handleApplyDetectedCity}
                className="px-3 py-1.5 bg-[#ccff00] text-black font-mono text-xs font-bold uppercase hover:bg-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Navigation size={12} />
                <span>{locationLoading ? 'Locating...' : 'Filter Near Me'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filters & Search Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        {/* Search & Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative flex items-center">
            <Search size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="SEARCH BY EVENT NAME, VENUE, OR ARTIST..."
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              className="funky-input input-with-icon text-xs font-mono"
            />
          </div>

          <div className="md:col-span-4 relative flex items-center">
            <MapPin size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="SEARCH CITY (E.G. DELHI, GOA, AMSTERDAM)..."
              value={filters.city}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, city: e.target.value }));
                setSelectedCityTab('Custom');
              }}
              className="funky-input input-with-icon text-xs font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleClearFilters}
              className="w-full h-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-gray-300 uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X size={14} />
              <span>CLEAR</span>
            </button>
          </div>
        </div>

        {/* Quick City Hub Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-mono text-gray-500 shrink-0 mr-2 uppercase">HUBS:</span>
          {POPULAR_HUBS.map((city) => (
            <button
              key={city}
              onClick={() => handleCitySelect(city)}
              className={`px-3 py-1 text-xs font-mono uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedCityTab === city
                  ? 'bg-[#ccff00] text-black font-bold border border-[#ccff00]'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Quick Category Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-mono text-gray-500 shrink-0 mr-2 uppercase">GENRE:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1 text-xs font-mono uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryTab === cat
                  ? 'bg-white text-black font-bold border border-white'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </section>

      {/* 3. Event Cards Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        
        {/* Results Counter */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 text-xs font-mono text-gray-400">
          <span>SHOWING {events.length} AVAILABLE PASSES</span>
          {filters.city && <span>FILTERED BY: {filters.city.toUpperCase()}</span>}
        </div>

        {loading ? (
          <div className="py-32 text-center space-y-4">
            <div className="funky-spinner mx-auto" />
            <p className="font-mono text-xs text-gray-400 uppercase">Scanning live event grid...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center bg-[#0d0e15] border border-white/10 space-y-4 max-w-xl mx-auto">
            <Ticket size={48} className="text-gray-600 mx-auto" />
            <h3 className="font-syne font-bold text-2xl text-white">NO SHOWS MATCHED</h3>
            <p className="text-gray-400 text-xs font-mono">
              Try adjusting your city filter or search terms.
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-funky-primary text-xs mt-2"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const distance = getDistanceToEvent(event.city);
              const isSoldOut = event.availableSeats === 0;

              return (
                <Link
                  to={`/events/${event.id}`}
                  key={event.id}
                  className="group bg-[#101118] border border-white/10 hover:border-[#ccff00]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Full Length Poster Image */}
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#141520]">
                      <img
                        src={event.imageUrl || '/concert-background-dark.png'}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = '/concert-background-dark.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101118] via-black/25 to-transparent pointer-events-none" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="badge-lime">{event.category || 'LIVE SHOW'}</span>
                        {distance && (
                          <span className="badge-dark text-[10px]">
                            📍 {distance} km away
                          </span>
                        )}
                      </div>
                      
                      {isSoldOut && (
                        <div className="absolute top-3 right-3 badge-orange">
                          SOLD OUT
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-syne font-extrabold text-2xl text-white group-hover:text-[#ccff00] transition-colors leading-tight">
                        {event.name}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 font-light leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="p-6 pt-0 space-y-4">
                    <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs font-mono text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#ccff00]" />
                        <span>{event.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <MapPin size={13} />
                        <span>{event.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs font-mono">
                        {event.availableSeats > 0 ? (
                          <span className="text-[#ccff00]">{event.availableSeats} of {event.totalSeats} seats</span>
                        ) : (
                          <span className="text-red-400 font-bold">SOLD OUT</span>
                        )}
                      </div>
                      <div className="font-syne font-black text-2xl text-white group-hover:text-[#ccff00] transition-colors">
                        ₹{Number(event.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}