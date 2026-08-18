import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Disc, 
  Activity, 
  ShieldCheck, 
  Flame, 
  Music, 
  Zap, 
  Radio, 
  ArrowUpRight 
} from 'lucide-react';
import AlienLogo from './AlienLogo';

const CATEGORY_CAPSULES = [
  { id: 'Music', name: 'Live Concerts', icon: Music, count: '14 Shows', color: '#ccff00', desc: 'Indie, Acoustic, Rock & Bands' },
  { id: 'Electronic', name: 'Underground Club', icon: Disc, count: '28 Shows', color: '#00f0ff', desc: 'Techno, House & Warehouse Raves' },
  { id: 'Jazz', name: 'Jazz & Brass', icon: Radio, count: '8 Shows', color: '#ffaa00', desc: 'Improv Sax, Keys & Soul Sessions' },
  { id: 'Art', name: 'Art Exhibitions', icon: Sparkles, count: '12 Expos', color: '#ff007f', desc: 'Galleries, Light Sculpture & Popups' },
  { id: 'Comedy', name: 'Standup Comedy', icon: Flame, count: '9 Nights', color: '#ff4d00', desc: 'Open Mics & Special Headliners' },
  { id: 'Tech', name: 'Tech & Hackathons', icon: Zap, count: '6 Summits', color: '#7000ff', desc: 'Developer Meetups & Keynotes' }
];

export default function ExperienceRadarDeck() {
  const navigate = useNavigate();

  const handleSelectCategory = (catId) => {
    navigate(`/events?category=${catId}`);
  };

  return (
    <div className="w-full bg-[#090a10] border-y border-white/10 relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Background ambient HUD scanline & glows */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#ccff00]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#00f0ff]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top HUD Telemetry Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 text-xs font-mono">
          
          <div className="flex items-center gap-3">
            <AlienLogo className="w-6 h-6 shrink-0" glow={true} />
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider">
                LIVE EXPERIENCE RADAR
              </span>
              <span className="px-2 py-0.5 bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/40 text-[10px]">
                ACTIVE FEED
              </span>
            </div>
          </div>

          {/* Telemetry live badges */}
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse"></span>
              <span>100% DIRECT SETTLEMENT</span>
            </div>
            <span className="hidden sm:inline text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#00f0ff]" />
              <span>ANTI-SCALPING VERIFIED</span>
            </div>
            <span className="hidden sm:inline text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <Activity size={13} className="text-[#ff4d00]" />
              <span>REAL-TIME SEAT QUOTA</span>
            </div>
          </div>

        </div>

        {/* Interactive Genre & Event Type Capsules Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">
              TAP A FREQUENCY TO EXPLORE SHOWS
            </span>
            <Link to="/events" className="text-xs font-mono text-[#ccff00] hover:underline flex items-center gap-1">
              <span>ALL CATEGORIES</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORY_CAPSULES.map((cat) => {
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="group relative p-4 bg-[#11121c] hover:bg-[#161824] border border-white/10 hover:border-[#ccff00] transition-all duration-300 text-left flex flex-col justify-between h-36 cursor-pointer overflow-hidden"
                >
                  {/* Subtle top indicator line on hover */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: cat.color }}
                  />

                  <div className="flex items-center justify-between">
                    <div 
                      className="w-8 h-8 rounded-none flex items-center justify-center bg-black/50 border border-white/15 group-hover:scale-110 transition-transform"
                      style={{ color: cat.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 group-hover:text-[#ccff00] transition-colors">
                      {cat.count}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-syne font-bold text-sm text-white group-hover:text-[#ccff00] transition-colors leading-tight">
                      {cat.name}
                    </h4>
                    <p className="text-[10px] font-mono text-gray-400 line-clamp-1">
                      {cat.desc}
                    </p>
                  </div>

                  {/* Frequency equalizer bar animation on hover */}
                  <div className="flex items-end gap-1 h-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <span className="w-1 bg-[#ccff00] h-1 group-hover:animate-pulse"></span>
                    <span className="w-1 bg-[#ccff00] h-2"></span>
                    <span className="w-1 bg-[#ccff00] h-1.5"></span>
                    <span className="w-1 bg-[#ccff00] h-2"></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
