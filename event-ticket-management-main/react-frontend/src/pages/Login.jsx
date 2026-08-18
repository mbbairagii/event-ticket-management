import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import AlienLogo from '../components/AlienLogo';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(formData);
      login(response.data);

      if (response.data.role === 'ADMIN' || response.data.role === 'ORGANIZER') {
        navigate('/dashboard');
      } else {
        navigate('/events');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden bg-[#070709]">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-[140px] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url('/concert-background-dark.png')` }}
      />

      <div className="relative z-10 w-full max-w-md bg-[#0e0f16] border border-white/15 p-8 sm:p-10 shadow-2xl space-y-8">
        
        {/* Header with Alien Logo */}
        <div className="space-y-2 text-center">
          <AlienLogo className="w-12 h-12 mx-auto mb-3" glow={true} />
          <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest block">
            MEMBER PORTAL
          </span>
          <h1 className="font-syne font-black text-3xl text-white uppercase tracking-tight">
            SIGN IN TO EVENTIFIED
          </h1>
          <p className="text-xs font-mono text-gray-400">
            Access your passes or manage your hosted shows.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="funky-input input-with-icon text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-gray-400">
              PASSWORD
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
                className="funky-input input-with-icon text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#ccff00] hover:bg-white text-black font-syne font-black text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN NOW'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/10 text-center font-mono text-xs text-gray-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#ccff00] hover:underline font-bold">
            Create Account ↗
          </Link>
        </div>

      </div>
    </div>
  );
}