import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Ticket, 
  MapPin, 
  Calendar, 
  ArrowUpRight, 
  Navigation,
  PlusCircle
} from 'lucide-react';
import { getEvents } from '../services/api';
import { useUserLocation } from '../hooks/useUserLocation';
import ExperienceRadarDeck from '../components/ExperienceRadarDeck';
import AlienLogo from '../components/AlienLogo';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const { location, loading: locationLoading, detectLocation, getDistanceToEvent } = useUserLocation();

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await getEvents({ size: 6 });
      const eventsData = res.data?.content || res.data || [];
      setFeaturedEvents(eventsData);
    } catch (err) {
      console.error('Error fetching featured events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Filter nearby events based on detected city
  const nearbyEvents = featuredEvents.filter(ev => {
    if (!location?.city) return false;
    const locLower = location.city.toLowerCase();
    const evCityLower = (ev.city || '').toLowerCase();
    return evCityLower.includes(locLower) || locLower.includes(evCityLower);
  });

  return (
    <div className="w-full bg-[#070709] text-white overflow-hidden">
      
      {/* 1. HERO SECTION (Bright, vibrant concert background, fully visible text, Signature Neon Lime) */}
      <section className="relative min-h-[90vh] flex flex-col justify-between px-4 sm:px-6 lg:px-8 pt-12 pb-12 overflow-hidden">
        
        {/* Background Image with HIGH BRIGHTNESS and vibrant concert stage lights */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-85 scale-100 transition-all duration-700"
          style={{ backgroundImage: `url('/concert-background-dark.png')` }}
        />
        {/* Gradient overlay for text contrast while preserving the bright lights */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#070709] z-0 pointer-events-none" />
        
        {/* Ambient Neon Glows */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#ccff00]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#ff4d00]/15 rounded-full blur-[150px] pointer-events-none" />

        {/* Top Tagline */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ccff00]"></span>
            </span>
            <span className="font-mono text-xs text-[#ccff00] tracking-widest uppercase">
              LIVE EVENT & TICKET PLATFORM // DISCOVER & HOST
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-gray-300">
            <span>INSTANT QR PASSES • ZERO BOT SCALPING</span>
          </div>
        </div>

        {/* Hero Content with High Readability & Clean Scaling */}
        <div className="relative z-10 max-w-7xl mx-auto w-full py-6">
          <div className="space-y-6">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#ccff00]/15 border border-[#ccff00]/60 text-[#ccff00] font-mono text-xs uppercase backdrop-blur-md"
            >
              <AlienLogo className="w-4 h-4" glow={false} />
              <span>THE ALL-IN-ONE EVENT UNIVERSE</span>
            </motion.div>

            {/* Massive punchy headline */}
            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="font-syne font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.92] tracking-tight uppercase text-white max-w-5xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            >
              DISCOVER & HOST <br />
              <span className="text-[#ccff00] drop-shadow-[0_0_35px_rgba(204,255,0,0.45)]">LIVE SHOWS</span>{' '}
              <span className="stroke-text">ANYWHERE.</span>
            </motion.h1>

            {/* Subtitle with high contrast glass backing */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="max-w-2xl"
            >
              <p className="text-gray-100 text-base sm:text-lg leading-relaxed font-light bg-black/65 backdrop-blur-md p-4 border-l-2 border-[#ccff00] shadow-xl">
                From explosive music festivals and live jazz sessions to art exhibitions, tech summits, standup comedy, and private gigs. Book verified digital passes or launch your own show with custom ticket pricing.
              </p>
            </motion.div>

            {/* Action Buttons & Location Grid */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-4"
            >
              <div className="md:col-span-7 flex flex-wrap items-center gap-4">
                <Link to="/events" className="btn-funky-primary text-sm px-7 py-4">
                  <span>EXPLORE ALL EVENTS</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/dashboard/event/new" className="btn-funky-secondary text-sm px-7 py-4">
                  <PlusCircle size={16} className="text-[#ccff00]" />
                  <span>HOST YOUR SHOW</span>
                </Link>
              </div>

              {/* Auto-Detect Location Card */}
              <div className="md:col-span-5">
                <div className="p-4 sm:p-5 bg-[#0e0f17]/95 border border-white/20 backdrop-blur-xl space-y-2.5 shadow-2xl">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">YOUR DETECTED HUB</span>
                    <button
                      onClick={() => detectLocation(true)}
                      className="text-[#ccff00] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation size={12} />
                      <span>{locationLoading ? 'Locating...' : 'Refresh'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#ccff00] text-black">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <div className="font-syne font-black text-xl text-white tracking-tight">
                        {location?.city ? location.city.toUpperCase() : 'DETECTING LOCATION...'}
                      </div>
                      <div className="text-xs font-mono text-gray-400">
                        {location?.country ? `${location.country} • Nearest events active` : 'Click refresh to detect nearby shows'}
                      </div>
                    </div>
                  </div>

                  {nearbyEvents.length > 0 && (
                    <div className="pt-2 border-t border-white/10 text-xs font-mono text-[#ccff00] flex items-center justify-between">
                      <span>⚡ {nearbyEvents.length} SHOWS FOUND IN YOUR CITY</span>
                      <Link to="/events" className="underline font-bold">VIEW NEARBY ↗</Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </section>

      {/* 2. EXPERIENCE RADAR DECK (Interactive Genre Matrix & HUD) */}
      <ExperienceRadarDeck />

      {/* 3. AUTO DETECTED NEARBY EVENTS SECTION */}
      {nearbyEvents.length > 0 && (
        <section className="py-16 bg-[#0c0d14] border-b border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#ccff00] text-black">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-xs font-mono text-[#ccff00] uppercase tracking-widest">LOCAL RADAR</span>
                  <h2 className="font-syne font-black text-2xl sm:text-3xl uppercase">
                    HAPPENING IN {location?.city?.toUpperCase() || 'YOUR AREA'}
                  </h2>
                </div>
              </div>
              <Link to="/events" className="text-xs font-mono text-gray-300 hover:text-[#ccff00] flex items-center gap-1">
                <span>VIEW ALL IN {location?.city?.toUpperCase()}</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyEvents.map((event) => {
                const distance = getDistanceToEvent(event.city);
                return (
                  <Link
                    to={`/events/${event.id}`}
                    key={event.id}
                    className="p-5 bg-[#14151f] border border-[#ccff00]/40 hover:border-[#ccff00] transition-all group flex flex-col justify-between min-h-[220px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge-lime">{event.category || 'LIVE SHOW'}</span>
                        <span className="text-xs font-mono text-[#ccff00]">
                          {distance ? `~${distance} km away` : '📍 In Your City'}
                        </span>
                      </div>
                      <h3 className="font-syne font-extrabold text-xl text-white group-hover:text-[#ccff00] transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mt-2 font-light">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-gray-400">{event.eventDate}</div>
                        <div className="text-gray-300">{event.venue}</div>
                      </div>
                      <div className="font-syne font-black text-lg text-[#ccff00]">
                        ₹{Number(event.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURED SHOWS CALENDAR */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="text-xs font-mono text-[#ccff00] uppercase tracking-widest mb-2">
                01 // CURATED EXPERIENCES
              </div>
              <h2 className="font-syne font-black text-4xl sm:text-6xl uppercase tracking-tight">
                UPCOMING EVENTS & SHOWS
              </h2>
            </div>
            <Link to="/events" className="btn-funky-secondary text-xs">
              <span>VIEW FULL CALENDAR</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="py-20 text-center">
              <div className="funky-spinner mx-auto mb-4" />
              <p className="font-mono text-xs text-gray-400 uppercase">Fetching live experiences...</p>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="p-12 text-center bg-[#101118] border border-white/10 space-y-4">
              <Ticket size={40} className="text-gray-600 mx-auto" />
              <h3 className="font-syne font-bold text-xl text-white">NO SHOWS LISTED YET</h3>
              <p className="text-gray-400 text-xs font-mono">Be the first organizer to post your show.</p>
              <Link to="/dashboard/event/new" className="btn-funky-primary text-xs">
                HOST AN EVENT NOW
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => {
                const distance = getDistanceToEvent(event.city);
                const isSoldOut = event.availableSeats === 0;

                return (
                  <Link
                    to={`/events/${event.id}`}
                    key={event.id}
                    className="group relative flex flex-col bg-[#111219] border border-white/10 hover:border-[#ccff00]/60 transition-all duration-300 overflow-hidden"
                  >
                    {/* Full Length Event Image Banner */}
                    <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-[#141520]">
                      <img
                        src={event.imageUrl || '/concert-background-dark.png'}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = '/concert-background-dark.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111219] via-black/35 to-transparent pointer-events-none" />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="badge-lime">{event.category || 'EVENT'}</span>
                        {distance && (
                          <span className="badge-dark text-[10px]">
                            📍 {distance} km
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
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-syne font-extrabold text-2xl text-white group-hover:text-[#ccff00] transition-colors leading-tight">
                          {event.name}
                        </h3>
                        <p className="text-gray-400 text-xs line-clamp-2 mt-2 font-light leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs font-mono text-gray-300">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#ccff00]" />
                            <span>{event.eventDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <MapPin size={13} />
                            <span>{event.city}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs font-mono text-gray-400">
                            {event.availableSeats > 0 ? (
                              <span className="text-[#ccff00]">{event.availableSeats} passes left</span>
                            ) : (
                              <span className="text-red-400">Sold out</span>
                            )}
                          </div>
                          <div className="font-syne font-black text-xl text-white group-hover:text-[#ccff00] transition-colors">
                            ₹{Number(event.price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 5. PLATFORM PILLARS: FOR ATTENDEES & ORGANIZERS */}
      <section className="py-24 bg-[#0a0b10] border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase">
              FOR EVERYONE
            </span>
            <h2 className="font-syne font-black text-3xl sm:text-5xl uppercase">
              BUILT FOR ATTENDEES & CREATORS
            </h2>
            <p className="text-gray-400 font-mono text-xs">
              Whether you are looking for an unforgettable night or hosting thousands of fans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* For Attendees */}
            <div className="p-8 sm:p-10 bg-[#11121b] border border-white/15 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-[#ccff00] text-black flex items-center justify-center font-syne font-black text-xl">
                  <Ticket size={24} />
                </div>
                <h3 className="font-syne font-black text-2xl sm:text-3xl text-white uppercase">
                  FOR EVENT LOVERS
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed font-light">
                  Find events matching your vibe in any city. Auto-detect your location to see what's happening nearby. Book passes in seconds with instant digital stubs on your phone.
                </p>
                <ul className="space-y-2 font-mono text-xs text-gray-400 pt-2">
                  <li className="flex items-center gap-2">✓ Auto-located nearby recommendations</li>
                  <li className="flex items-center gap-2">✓ Zero scalper bots & fair ticket pricing</li>
                  <li className="flex items-center gap-2">✓ Dynamic cryptographically secure QR passes</li>
                </ul>
              </div>
              <Link to="/events" className="btn-funky-primary text-xs w-full text-center">
                <span>BROWSE SHOWS & TICKETS</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* For Organizers */}
            <div className="p-8 sm:p-10 bg-[#11121b] border border-white/15 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-[#00f0ff] text-black flex items-center justify-center font-syne font-black text-xl">
                  <PlusCircle size={24} />
                </div>
                <h3 className="font-syne font-black text-2xl sm:text-3xl text-white uppercase">
                  FOR ORGANIZERS & HOSTS
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed font-light">
                  Put up your concert, festival, art exhibition, standup show, or private gathering. Set your own ticket tiers, manage quotas in real-time, and get direct settlements.
                </p>
                <ul className="space-y-2 font-mono text-xs text-gray-400 pt-2">
                  <li className="flex items-center gap-2">✓ Launch any event in under 2 minutes</li>
                  <li className="flex items-center gap-2">✓ Real-time guestlist and booking management</li>
                  <li className="flex items-center gap-2">✓ Razorpay integrated payment settlements</li>
                </ul>
              </div>
              <Link to="/dashboard/event/new" className="btn-funky-secondary text-xs w-full text-center border-[#00f0ff]/40 hover:border-[#00f0ff] hover:text-[#00f0ff]">
                <span>HOST AN EVENT NOW</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 6. JAZZ & ACOUSTIC FEATURETTE SECTION (Using jazz-musicians-dark.png) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="px-3 py-1 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase">
              LIVE CULTURE
            </span>
            <h2 className="font-syne font-black text-3xl sm:text-5xl uppercase leading-[0.95]">
              ANY GENRE. <br />
              <span className="text-[#ccff00]">UNLIMITED CREATIVITY.</span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light">
              From soulful jazz quartets and acoustic open mics to underground electronic sound systems and modern contemporary art galleries, Eventified brings people together in spaces that matter.
            </p>

            <div className="pt-2">
              <Link to="/about" className="btn-funky-primary text-xs">
                <span>READ HOW EVENTIFIED WORKS</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Visual with jazz-musicians-dark.png */}
          <div className="lg:col-span-6">
            <div className="relative group p-2 border border-white/20 bg-[#141520]">
              <img
                src="/jazz-musicians-dark.png"
                alt="Live Jazz & Acoustic Performance"
                className="w-full h-auto object-cover grayscale brightness-90 contrast-125 group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 border border-white/20 flex items-center justify-between">
                <div className="font-syne font-bold text-white text-sm">
                  LIVE CONCERTS & JAZZ SESSIONS
                </div>
                <span className="text-[#ccff00] font-mono text-xs">EVENTIFIED PLATFORM</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. CALL TO ACTION BAR */}
      <section className="py-20 bg-[#ccff00] text-black px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <AlienLogo className="w-12 h-12 mx-auto" glow={false} />
          <h2 className="font-syne font-black text-3xl sm:text-6xl uppercase leading-none tracking-tight">
            YOUR TICKET TO UNFORGETTABLE EXPERIENCES.
          </h2>
          <p className="font-sans text-base sm:text-lg font-medium max-w-2xl mx-auto text-black/80">
            Join thousands of attendees exploring live shows or create your own event and start selling passes right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/events" className="px-8 py-4 bg-black text-white font-syne font-black text-xs uppercase hover:bg-white hover:text-black transition-all">
              FIND EVENTS NEAR YOU
            </Link>
            <Link to="/dashboard/event/new" className="px-8 py-4 bg-transparent border-2 border-black text-black font-syne font-black text-xs uppercase hover:bg-black hover:text-white transition-all">
              HOST YOUR SHOW
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
