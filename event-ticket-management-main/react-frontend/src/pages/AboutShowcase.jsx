import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Activity
} from 'lucide-react';
import AlienLogo from '../components/AlienLogo';

export default function AboutShowcase() {
  const stepsForAttendees = [
    {
      num: "01",
      title: "LOCATION AUTO-DETECTION",
      desc: "Our browser-level location engine auto-detects your city and surfaces upcoming shows, secret concerts, art exhibitions, and festivals right near you."
    },
    {
      num: "02",
      title: "INSTANT SECURE CHECKOUT",
      desc: "Zero hidden processing markups. Pick your pass tier and pay securely with Razorpay, UPI, or Cards in less than 30 seconds."
    },
    {
      num: "03",
      title: "CRYPTOGRAPHIC DIGITAL PASS",
      desc: "Receive your encrypted digital pass immediately in your Pass Vault with dynamic QR codes that guarantee seamless, scalp-free door entry."
    }
  ];

  const stepsForOrganizers = [
    {
      num: "01",
      title: "CREATE ANY SHOW IN MINUTES",
      desc: "Whether it's an underground rave, acoustic jazz session, art gallery exhibition, tech summit, or comedy night — set your venue, city, and dates effortlessly."
    },
    {
      num: "02",
      title: "SET YOUR TICKET PRICING & SEATS",
      desc: "You have 100% control over ticket price (₹) and seat availability pools. Update quotas or event details anytime from your dashboard."
    },
    {
      num: "03",
      title: "LIVE SALES & DIRECT PAYOUTS",
      desc: "Track real-time attendee bookings, seat counts, and gross settlement figures with instant payouts through our integrated microservices."
    }
  ];

  const eventCategories = [
    { name: "Live Concerts & Gigs", desc: "Acoustic, rock, indie, hip-hop, and orchestral gatherings.", icon: "🎸" },
    { name: "Underground & Club Shows", desc: "Minimal techno, funky house, and sound system culture.", icon: "🎛️" },
    { name: "Jazz & Soul Sessions", desc: "Improvised live sax, brass horns, and intimate rooms.", icon: "🎷" },
    { name: "Art & Visual Exhibitions", desc: "Contemporary galleries, sensory light sculpture, and projection art.", icon: "🎨" },
    { name: "Comedy & Performance Arts", desc: "Standup comedy, theatrical broadway, and poetry slams.", icon: "🎭" },
    { name: "Food Festivals & Expos", desc: "Culinary pop-ups, wine tastings, and cultural markets.", icon: "🍷" },
    { name: "Tech Summits & Meetups", desc: "Developer conferences, hackathons, and founder keynotes.", icon: "⚡" },
    { name: "Sports & Motorsports", desc: "F1 racing fan zones, cricket screenings, and live tournaments.", icon: "🏎️" }
  ];

  return (
    <div className="w-full bg-[#070709] text-white overflow-hidden">
      
      {/* 1. HERO SHOWCASE WITH BRIGHT CONCERT BACKDROP */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        {/* Background Image with HIGH BRIGHTNESS */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-80 scale-100 transition-all duration-700"
          style={{ backgroundImage: `url('/concert-background-dark.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#070709] z-0 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00]/15 rounded-full blur-[160px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ccff00]/15 border border-[#ccff00]/60 text-[#ccff00] font-mono text-xs uppercase tracking-widest backdrop-blur-md"
          >
            <AlienLogo className="w-4 h-4" glow={false} />
            <span>EVENTIFIED // HOW THE PLATFORM WORKS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-syne font-black text-4xl sm:text-6xl md:text-8xl leading-[0.92] tracking-tight uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
          >
            THE TICKETING <br />
            <span className="text-[#ccff00] drop-shadow-[0_0_30px_rgba(204,255,0,0.45)]">REVOLUTION.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="font-sans text-gray-100 text-lg sm:text-xl font-light max-w-3xl mx-auto leading-relaxed bg-black/65 backdrop-blur-md p-4 border-l-2 border-[#ccff00] shadow-xl"
          >
            Eventified is the next-generation live experience platform. Attendees can seamlessly find and book passes for any show, while organizers and curators can publish events and sell tickets with zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link to="/events" className="btn-funky-primary text-sm px-8 py-4">
              <span>EXPLORE ALL SHOWS</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard/event/new" className="btn-funky-secondary text-sm px-8 py-4">
              <span>HOST YOUR EVENT</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* PLATFORM SPECS HUD BAR */}
      <div className="w-full bg-[#0c0d15] border-y border-white/10 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-center">
          <div className="p-4 bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1">
            <Zap size={18} className="text-[#ccff00]" />
            <span className="text-white font-bold">1-CLICK PASSES</span>
            <span className="text-[10px] text-gray-400">Zero ticket markup</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1">
            <MapPin size={18} className="text-[#00f0ff]" />
            <span className="text-white font-bold">RADAR AUTO-LOCATION</span>
            <span className="text-[10px] text-gray-400">Nearest hub discovery</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1">
            <ShieldCheck size={18} className="text-[#ff4d00]" />
            <span className="text-white font-bold">ANTI-SCALPING VERIFIED</span>
            <span className="text-[10px] text-gray-400">Cryptographic dynamic QR</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1">
            <Activity size={18} className="text-[#ccff00]" />
            <span className="text-white font-bold">DIRECT SETTLEMENTS</span>
            <span className="text-[10px] text-gray-400">Razorpay integrated payouts</span>
          </div>
        </div>
      </div>

      {/* 2. DUAL FLOW: HOW IT WORKS FOR ATTENDEES & ORGANIZERS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
        
        {/* For Attendees Flow */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono text-[#ccff00] uppercase tracking-widest block mb-1">
                STEP-BY-STEP WORKFLOW
              </span>
              <h2 className="font-syne font-black text-3xl sm:text-5xl uppercase">
                1. HOW ATTENDEES BOOK PASSES
              </h2>
            </div>
            <Link to="/events" className="text-xs font-mono text-[#ccff00] hover:underline flex items-center gap-1">
              <span>DISCOVER SHOWS NOW</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stepsForAttendees.map((step) => (
              <div key={step.num} className="p-8 bg-[#0f1017] border border-white/10 space-y-4 relative group hover:border-[#ccff00]/60 transition-colors">
                <div className="font-syne font-black text-5xl text-[#ccff00]">{step.num}</div>
                <h3 className="font-syne font-bold text-xl text-white uppercase">{step.title}</h3>
                <p className="text-gray-400 text-xs font-mono leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Organizers Flow */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest block mb-1">
                CURATOR & HOST WORKFLOW
              </span>
              <h2 className="font-syne font-black text-3xl sm:text-5xl uppercase">
                2. HOW ORGANIZERS PUT UP SHOWS
              </h2>
            </div>
            <Link to="/dashboard/event/new" className="text-xs font-mono text-[#00f0ff] hover:underline flex items-center gap-1">
              <span>CREATE EVENT NOW</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stepsForOrganizers.map((step) => (
              <div key={step.num} className="p-8 bg-[#0f1017] border border-white/10 space-y-4 relative group hover:border-[#00f0ff]/60 transition-colors">
                <div className="font-syne font-black text-5xl text-[#00f0ff]">{step.num}</div>
                <h3 className="font-syne font-bold text-xl text-white uppercase">{step.title}</h3>
                <p className="text-gray-400 text-xs font-mono leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 3. MULTI-GENRE EVENT SHOWCASE GRID */}
      <section className="py-24 bg-[#0a0b10] border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase">
              ANY EVENT GENRE
            </span>
            <h2 className="font-syne font-black text-3xl sm:text-5xl uppercase">
              WHAT CAN BE HOSTED ON EVENTIFIED?
            </h2>
            <p className="text-gray-400 font-mono text-xs">
              Our platform supports any creative, musical, cultural, or community event.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventCategories.map((cat, i) => (
              <div key={i} className="p-6 bg-[#111219] border border-white/10 hover:border-[#ccff00]/50 transition-all space-y-3">
                <div className="text-3xl">{cat.icon}</div>
                <h3 className="font-syne font-bold text-lg text-white uppercase">{cat.name}</h3>
                <p className="text-gray-400 text-xs font-mono leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. JAZZ & ACOUSTIC FEATURE (Featuring jazz-musicians-dark.png) */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Card with jazz-musicians-dark.png */}
          <div className="lg:col-span-7 relative group">
            <div className="relative overflow-hidden border border-white/20 bg-[#12131a] p-2">
              <img
                src="/jazz-musicians-dark.png"
                alt="Live Jazz Performance"
                className="w-full h-auto object-cover grayscale brightness-90 contrast-125 group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlienLogo className="w-8 h-8" glow={true} />
                  <div>
                    <div className="font-syne font-bold text-white text-base">LIVE ACOUSTIC & JAZZ SESSIONS</div>
                    <div className="font-mono text-xs text-[#ccff00]">Saxophone • Brass • Keys • Electronic</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
              COMMUNITY // SOUND
            </div>
            
            <h2 className="font-syne font-black text-3xl sm:text-5xl leading-[0.95] uppercase">
              LIVE CULTURE. <br />
              <span className="text-[#ccff00]">REAL ROOMS.</span>
            </h2>

            <p className="text-gray-300 text-base leading-relaxed font-light">
              We empower artists, venues, and curators to create unforgettable live gatherings. Attendees get guaranteed access to authentic experiences with transparent ticket pricing.
            </p>

            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-white/5 border border-white/10">
                <div className="text-2xl font-bold font-syne text-[#ccff00]">0%</div>
                <div className="text-gray-400 mt-1">SCALPING BOTS</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/10">
                <div className="text-2xl font-bold font-syne text-white">100%</div>
                <div className="text-gray-400 mt-1">DIRECT PASSES</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <section className="py-24 bg-[#ccff00] text-black px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <AlienLogo className="w-14 h-14 mx-auto" glow={false} />
          <h2 className="font-syne font-black text-4xl sm:text-6xl uppercase leading-none tracking-tight">
            BE PART OF THE NEXT LIVE EXPERIENCE.
          </h2>
          <p className="font-sans text-base sm:text-xl font-medium max-w-2xl mx-auto text-black/80">
            Browse upcoming shows in your area or list your event and sell out your seats.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/events" className="px-8 py-4 bg-black text-white font-syne font-black text-sm uppercase hover:bg-white hover:text-black transition-all">
              BROWSE SHOW CALENDAR
            </Link>
            <Link to="/dashboard/event/new" className="px-8 py-4 bg-transparent border-2 border-black text-black font-syne font-black text-sm uppercase hover:bg-black hover:text-white transition-all">
              HOST AN EVENT
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
