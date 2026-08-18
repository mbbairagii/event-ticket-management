import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import AlienLogo from './AlienLogo';

export default function Footer() {
  const [worldTimes, setWorldTimes] = useState({
    ams: '',
    ldn: '',
    ber: '',
    del: '',
    nyc: '',
    ibz: ''
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const formatTime = (timeZone) =>
        new Intl.DateTimeFormat('en-GB', {
          timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now);

      setWorldTimes({
        ams: formatTime('Europe/Amsterdam'),
        ldn: formatTime('Europe/London'),
        ber: formatTime('Europe/Berlin'),
        del: formatTime('Asia/Kolkata'),
        nyc: formatTime('America/New_York'),
        ibz: formatTime('Europe/Madrid')
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#040406] text-white border-t border-white/10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#ff4d00]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* World Time Hubs Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pb-12 border-b border-white/10 text-xs font-mono">
          <div className="p-3 bg-white/5 border border-white/10 flex flex-col">
            <span className="text-gray-400">AMSTERDAM</span>
            <span className="text-[#ccff00] font-bold text-sm mt-1">{worldTimes.ams || '00:00:00'}</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 flex flex-col">
            <span className="text-gray-400">LONDON</span>
            <span className="text-[#ccff00] font-bold text-sm mt-1">{worldTimes.ldn || '00:00:00'}</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 flex flex-col">
            <span className="text-gray-400">BERLIN</span>
            <span className="text-[#ccff00] font-bold text-sm mt-1">{worldTimes.ber || '00:00:00'}</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 flex flex-col">
            <span className="text-gray-400">NEW DELHI</span>
            <span className="text-[#ccff00] font-bold text-sm mt-1">{worldTimes.del || '00:00:00'}</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 flex flex-col">
            <span className="text-gray-400">NEW YORK</span>
            <span className="text-[#ccff00] font-bold text-sm mt-1">{worldTimes.nyc || '00:00:00'}</span>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 flex flex-col">
            <span className="text-gray-400">IBIZA</span>
            <span className="text-[#ccff00] font-bold text-sm mt-1">{worldTimes.ibz || '00:00:00'}</span>
          </div>
        </div>

        {/* Middle Section: Logo + Links + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-14">
          
          {/* Brand statement */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <AlienLogo className="w-8 h-8" glow={true} />
              <span className="font-syne font-black text-2xl text-white tracking-tight">
                EVENTIFIED
              </span>
            </div>
            <h3 className="font-syne font-bold text-xl uppercase leading-tight text-gray-200">
              THE LIVE EXPERIENCES & <br />
              <span className="text-[#ccff00]">TICKETING ENGINE.</span>
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-light max-w-md">
              Connecting attendees to verified live concerts, art exhibitions, club nights, tech summits, and festivals with instant cryptographic passes.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 space-y-3 font-mono text-xs">
            <div className="text-[#ccff00] font-bold uppercase tracking-widest mb-3">NAVIGATION</div>
            <ul className="space-y-2.5 text-gray-300">
              <li>
                <Link to="/" className="hover:text-[#ccff00] flex items-center gap-2">
                  <ArrowUpRight size={14} /> HOME FEED
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#ccff00] flex items-center gap-2">
                  <ArrowUpRight size={14} /> HOW IT WORKS (SHOWCASE)
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#ccff00] flex items-center gap-2">
                  <ArrowUpRight size={14} /> EXPLORE ALL SHOWS
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-[#ccff00] flex items-center gap-2">
                  <ArrowUpRight size={14} /> MY DIGITAL PASSES
                </Link>
              </li>
              <li>
                <Link to="/dashboard/event/new" className="hover:text-[#ccff00] flex items-center gap-2 text-[#ccff00]">
                  <ArrowUpRight size={14} /> HOST AN EVENT (ORGANIZER)
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Drop alerts */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-[#ccff00] font-mono text-xs font-bold uppercase tracking-widest">
              DROP ALERTS & SHOW NOTIFICATIONS
            </div>
            <p className="text-gray-400 text-xs font-mono">
              Get notified of newly added shows, early bird tickets, and secret lineups.
            </p>
            {subscribed ? (
              <div className="p-3 bg-[#ccff00]/15 border border-[#ccff00] text-[#ccff00] text-xs font-mono">
                ✓ SUBSCRIBED TO EVENTIFIED DROPS.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    required
                    className="w-full bg-white/5 border border-white/20 text-white px-4 py-3 text-xs font-mono focus:outline-none focus:border-[#ccff00]"
                  />
                  <button
                    type="submit"
                    className="bg-[#ccff00] text-black px-5 py-3 font-mono font-bold text-xs uppercase hover:bg-white transition-colors shrink-0 cursor-pointer"
                  >
                    JOIN
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Giant Typography */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-syne font-black text-3xl sm:text-5xl tracking-tighter text-white/20 select-none">
            EVENTIFIED // 2026
          </div>
          <div className="text-right text-xs font-mono text-gray-500">
            <div>ALL SHOWS & TICKETS • ZERO BOT SCALPING</div>
            <div>RAZORPAY SECURE SETTLEMENT ENGINE</div>
          </div>
        </div>

      </div>
    </footer>
  );
}
