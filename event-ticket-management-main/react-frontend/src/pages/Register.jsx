import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, Ticket, Sparkles } from 'lucide-react';
import AlienLogo from '../components/AlienLogo';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase()
      };

      const res = await registerUser(requestData);

      // Auto login if user object returned
      if (res.data && (res.data.id || res.data.email)) {
        login(res.data);
        setSuccess('Account created! Entering Eventified...');
        setTimeout(() => {
          if (res.data.role === 'ORGANIZER' || res.data.role === 'ADMIN') {
            navigate('/dashboard');
          } else {
            navigate('/events');
          }
        }, 1000);
      } else {
        setSuccess('Account registered successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden bg-[#070709]">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url('/concert-background-dark.png')` }}
      />

      <div className="relative z-10 w-full max-w-lg bg-[#0e0f16] border border-white/15 p-8 sm:p-10 shadow-2xl space-y-8">
        
        {/* Header with Alien Logo */}
        <div className="space-y-2 text-center">
          <AlienLogo className="w-12 h-12 mx-auto mb-3" glow={true} />
          <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest block">
            BECOME A MEMBER
          </span>
          <h1 className="font-syne font-black text-3xl text-white uppercase tracking-tight">
            JOIN EVENTIFIED
          </h1>
          <p className="text-xs font-mono text-gray-400">
            Select your account type to book tickets or host your own shows.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-[#ccff00]/10 border border-[#ccff00]/40 text-[#ccff00] font-mono text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-gray-400">
              FULL NAME
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={16} />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Alex Mercer"
                value={formData.name}
                onChange={handleChange}
                required
                className="funky-input input-with-icon text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-gray-400">
              EMAIL ADDRESS
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="funky-input input-with-icon text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-gray-400">
              PASSWORD (MIN 6 CHARACTERS)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="funky-input input-with-icon text-xs font-mono"
              />
            </div>
          </div>

          {/* Account Type Selector Cards */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-mono uppercase text-gray-400 block">
              SELECT ACCOUNT ROLE
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, role: 'USER' }))}
                className={`p-4 border text-left transition-all cursor-pointer space-y-1.5 ${
                  formData.role === 'USER'
                    ? 'border-[#ccff00] bg-[#ccff00]/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Ticket size={16} className={formData.role === 'USER' ? 'text-[#ccff00]' : 'text-gray-500'} />
                  {formData.role === 'USER' && <span className="text-[10px] font-mono text-[#ccff00]">SELECTED</span>}
                </div>
                <div className="font-syne font-bold text-sm text-white">ATTENDEE / FAN</div>
                <div className="text-[10px] font-mono text-gray-400">Book & hold passes</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, role: 'ORGANIZER' }))}
                className={`p-4 border text-left transition-all cursor-pointer space-y-1.5 ${
                  formData.role === 'ORGANIZER'
                    ? 'border-[#ccff00] bg-[#ccff00]/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sparkles size={16} className={formData.role === 'ORGANIZER' ? 'text-[#ccff00]' : 'text-gray-500'} />
                  {formData.role === 'ORGANIZER' && <span className="text-[10px] font-mono text-[#ccff00]">SELECTED</span>}
                </div>
                <div className="font-syne font-bold text-sm text-white">EVENT ORGANIZER</div>
                <div className="text-[10px] font-mono text-gray-400">Host shows & sell tickets</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#ccff00] hover:bg-white text-black font-syne font-black text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'CREATING ACCOUNT...' : 'CONFIRM REGISTRATION'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/10 text-center font-mono text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-[#ccff00] hover:underline font-bold">
            Sign In Here ↗
          </Link>
        </div>

      </div>
    </div>
  );
}