import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../hooks/useUserLocation';
import AlienLogo from './AlienLogo';
import { 
  MapPin, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Volume2,
  VolumeX,
  Ticket,
  Sparkles
} from 'lucide-react';

export default function Navbar({ isAudioPlaying, setIsAudioPlaying }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { location, loading: locationLoading, detectLocation } = useUserLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'organizer';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#070709]/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. LEFT BRAND & LOCATION SECTION */}
          <div className="flex items-center gap-4 xl:gap-6 shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-3 text-white group focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
            >
              <AlienLogo className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" glow={true} />
              <div className="flex flex-col">
                <span className="font-syne font-black text-xl tracking-tight text-white flex items-center gap-1.5 leading-tight">
                  EVENTIFIED <span className="text-[#ccff00] text-[10px] font-mono px-1.5 py-0.5 bg-white/5 border border-[#ccff00]/30">LIVE</span>
                </span>
                <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase hidden sm:block">
                  Concerts • Art • Shows • Festivals
                </span>
              </div>
            </Link>

            {/* Auto-Detected Location Pill */}
            <button
              onClick={() => detectLocation(true)}
              title="Click to refresh your detected location"
              className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ccff00]/50 transition-all text-xs font-mono text-gray-300 cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]"></span>
              </span>
              <MapPin size={12} className="text-[#ccff00]" />
              <span>
                {locationLoading ? 'LOCATING...' : location?.city ? `${location.city.toUpperCase()}` : 'DETECT LOCATION'}
              </span>
            </button>
          </div>

          {/* 2. CENTER NAVIGATION COLUMNS / TABS */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-150 ${
                  isActive 
                    ? 'text-[#ccff00] font-bold border-b-2 border-[#ccff00] bg-white/[0.04]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.03]'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-150 ${
                  isActive 
                    ? 'text-[#ccff00] font-bold border-b-2 border-[#ccff00] bg-white/[0.04]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.03]'
                }`
              }
            >
              How It Works
            </NavLink>

            <NavLink
              to="/events"
              className={({ isActive }) =>
                `px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-[#ccff00] font-bold border-b-2 border-[#ccff00] bg-white/[0.04]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.03]'
                }`
              }
            >
              <Ticket size={13} />
              <span>All Shows & Tickets</span>
            </NavLink>

            {user && (
              <NavLink
                to="/bookings"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-mono uppercase tracking-wider transition-all duration-150 ${
                    isActive 
                      ? 'text-[#ccff00] font-bold border-b-2 border-[#ccff00] bg-white/[0.04]' 
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.03]'
                  }`
                }
              >
                My Passes
              </NavLink>
            )}

            {(isAdmin || isOrganizer) && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all duration-150 ${
                    isActive 
                      ? 'text-[#ccff00] font-bold border-b-2 border-[#ccff00] bg-white/[0.04]' 
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.03]'
                  }`
                }
              >
                <LayoutDashboard size={13} className="text-[#ccff00]" />
                <span>{isAdmin ? 'Admin Portal' : 'Organizer Dashboard'}</span>
              </NavLink>
            )}
          </div>

          {/* 3. RIGHT ACTIONS & USER PROFILE / LOGOUT */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            
            {/* Audio Vibe Equalizer Toggle */}
            {setIsAudioPlaying && (
              <button
                onClick={() => setIsAudioPlaying(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:border-[#ccff00]/40 text-xs font-mono text-gray-300 transition-all cursor-pointer"
                title={isAudioPlaying ? "Mute Ambience" : "Play Sound Ambience"}
              >
                {isAudioPlaying ? (
                  <>
                    <Volume2 size={13} className="text-[#ccff00]" />
                    <div className="flex items-end gap-[2px] h-3">
                      <span className="w-[2px] bg-[#ccff00] sound-bar-1"></span>
                      <span className="w-[2px] bg-[#ccff00] sound-bar-2"></span>
                      <span className="w-[2px] bg-[#ccff00] sound-bar-3"></span>
                      <span className="w-[2px] bg-[#ccff00] sound-bar-4"></span>
                    </div>
                  </>
                ) : (
                  <>
                    <VolumeX size={13} className="text-gray-500" />
                    <span className="text-[10px] text-gray-400">SOUND OFF</span>
                  </>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                {/* User Identity Card */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 border border-white/15">
                  <div className="w-8 h-8 rounded-none bg-[#ccff00]/20 border border-[#ccff00] flex items-center justify-center text-[#ccff00] font-mono text-xs font-bold shrink-0">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-mono font-bold text-white leading-tight truncate max-w-[120px]">
                      {user.name || user.email}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-[#ccff00] flex items-center gap-1">
                      <Sparkles size={10} />
                      <span>{user.role || 'USER'}</span>
                    </span>
                  </div>
                </div>

                {/* Explicit, Highly Visible Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/40 hover:border-red-500 transition-all font-mono text-xs uppercase font-bold cursor-pointer"
                  title="Sign Out of Eventified"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-mono uppercase text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#ccff00] text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-1.5"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white bg-white/5 border border-white/10 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0b10] border-b border-white/15 px-4 pt-4 pb-6 space-y-3">
          {/* Location status on mobile */}
          <button
            onClick={() => {
              detectLocation(true);
            }}
            className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 text-xs font-mono text-gray-200"
          >
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-[#ccff00]" />
              <span>Location:</span>
            </span>
            <span className="text-[#ccff00] font-bold">
              {locationLoading ? 'Detecting...' : location?.city ? location.city : 'Auto-Detect'}
            </span>
          </button>

          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-mono uppercase tracking-wider text-gray-300 hover:text-[#ccff00]"
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-mono uppercase tracking-wider text-gray-300 hover:text-[#ccff00]"
          >
            How It Works (Showcase)
          </NavLink>

          <NavLink
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-mono uppercase tracking-wider text-gray-300 hover:text-[#ccff00]"
          >
            All Shows & Tickets
          </NavLink>

          {user && (
            <NavLink
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-mono uppercase tracking-wider text-gray-300 hover:text-[#ccff00]"
            >
              My Passes
            </NavLink>
          )}

          {(isAdmin || isOrganizer) && (
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-mono uppercase tracking-wider text-[#ccff00]"
            >
              {isAdmin ? 'Admin Portal' : 'Organizer Dashboard'}
            </NavLink>
          )}

          <div className="pt-4 border-t border-white/10">
            {user ? (
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">Signed in as:</span>
                  <span className="text-white font-bold">{user.name || user.email} ({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/40 text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut size={16} />
                  <span>LOGOUT (SIGN OUT)</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center bg-white/10 text-white text-xs font-mono uppercase tracking-wider"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center bg-[#ccff00] text-black font-bold text-xs font-mono uppercase tracking-wider"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}