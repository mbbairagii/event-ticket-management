import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  getEventById, 
  createEvent, 
  updateEvent,
  uploadPosterImage
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Sparkles, 
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Eye,
  Loader2
} from 'lucide-react';
import AlienLogo from '../components/AlienLogo';

const COMMON_CITIES = ['Delhi', 'Mumbai', 'Goa', 'Bengaluru', 'Amsterdam', 'London', 'Berlin', 'Ibiza', 'New York'];
const COMMON_CATEGORIES = ['Music & Concerts', 'Electronic & Club', 'Jazz & Soul', 'Festival', 'Art Exhibition', 'Standup Comedy', 'Tech Summit', 'Food & Drink', 'Theatre & Film'];

const PRESET_POSTERS = [
  { label: 'Live Concert Stage', url: '/concert-background-dark.png' },
  { label: 'Jazz & Brass Session', url: '/jazz-musicians-dark.png' },
  { label: 'Electronic & Club Rave', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Contemporary Art Gallery', url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Standup Comedy Night', url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Tech & Hackathon Summit', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80' }
];

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    city: '',
    eventDate: '',
    totalSeats: '',
    availableSeats: '',
    price: '',
    category: 'Music & Concerts',
    imageUrl: '/concert-background-dark.png'
  });

  const isAuthorized = user && (user.role === 'ADMIN' || user.role === 'ORGANIZER' || user.role === 'admin' || user.role === 'organizer');

  const fetchEventData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getEventById(id);
      const ev = response.data;

      setFormData({
        name: ev.name || '',
        description: ev.description || '',
        venue: ev.venue || '',
        city: ev.city || '',
        eventDate: ev.eventDate ? ev.eventDate.substring(0, 16) : '',
        totalSeats: ev.totalSeats ?? '',
        availableSeats: ev.availableSeats ?? '',
        price: ev.price ?? '',
        category: ev.category || 'Music & Concerts',
        imageUrl: ev.imageUrl || '/concert-background-dark.png'
      });
    } catch (err) {
      console.error('Fetch event data error', err);
      setError('Failed to fetch event data for editing.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isAuthorized) {
      navigate('/');
      return;
    }
    if (id) {
      fetchEventData();
    }
  }, [id, user, navigate, isAuthorized, fetchEventData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' && value !== '' ? Number(value) : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: finalValue };
      if (name === 'totalSeats' && !id) {
        updated.availableSeats = finalValue;
      }
      return updated;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadingImage(true);

    // 1. First attempt direct multipart server upload
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await uploadPosterImage(uploadData);
      if (res.data?.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
        setUploadingImage(false);
        return;
      }
    } catch (serverUploadErr) {
      console.warn('Server direct upload attempt bypassed, using local canvas compression', serverUploadErr);
    }

    // 2. Client-side canvas compression fallback
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setFormData(prev => ({ ...prev, imageUrl: optimizedDataUrl }));
        setUploadingImage(false);
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submissionData = {
        ...formData,
        organizerId: user.id
      };

      if (!id) {
        submissionData.availableSeats = submissionData.totalSeats;
      }

      if (id) {
        await updateEvent(id, submissionData);
      } else {
        await createEvent(submissionData);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="w-full bg-[#070709] text-white min-h-screen pb-24">
      
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-gradient-to-b from-[#10111a] to-[#070709]">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-[#ccff00] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>BACK TO DASHBOARD</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <AlienLogo className="w-5 h-5" glow={false} />
            <span className="px-3 py-1 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase">
              {id ? 'EDIT EVENT' : 'CREATE EVENT'}
            </span>
            <span className="text-xs font-mono text-gray-400">ORGANIZER CONTROL TOWER</span>
          </div>

          <h1 className="font-syne font-black text-3xl sm:text-5xl uppercase tracking-tight">
            {id ? 'MODIFY SHOW DETAILS' : 'PUBLISH A NEW EXPERIENCE'}
          </h1>
          <p className="text-gray-400 font-mono text-xs max-w-xl">
            Set your venue, ticket tiers, available capacity, and upload custom poster visuals.
          </p>
        </div>
      </section>

      {/* Main Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#0e0f16] border border-white/15 p-6 sm:p-10 shadow-2xl">
          
          {/* Row 1: Event Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-300">
                EVENT TITLE / SHOW NAME *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Neon Horizon Tour 2026"
                required
                className="funky-input text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-300">
                GENRE / CATEGORY *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="funky-input text-sm"
              >
                {COMMON_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-[#111218] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-gray-300">
              EVENT DESCRIPTION & LINEUP
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the experience, headliners, set times, and entry requirements..."
              className="funky-input text-sm resize-none"
            />
          </div>

          {/* Row 3: Venue & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-300">
                VENUE NAME *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. The Warehouse Arena"
                required
                className="funky-input text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-300">
                CITY / HUB *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Goa, Delhi, Amsterdam"
                required
                className="funky-input text-sm"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_CITIES.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setFormData(p => ({ ...p, city: c }))}
                    className="text-[10px] font-mono px-2 py-0.5 bg-white/5 hover:bg-[#ccff00] hover:text-black border border-white/10 text-gray-400 transition-colors cursor-pointer"
                  >
                    +{c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Event Date & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-300">
                DATE & TIME (LOCAL) *
              </label>
              <input
                type="datetime-local"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
                className="funky-input text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-300">
                TICKET PRICE (₹ INR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 1200.00"
                required
                className="funky-input text-sm"
              />
            </div>
          </div>

          {/* Row 5: Seats Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-300">
                TOTAL SEAT CAPACITY *
              </label>
              <input
                type="number"
                min="1"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                placeholder="e.g. 500"
                required
                className="funky-input text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-300">
                AVAILABLE TICKETS {id ? '(CURRENT QUOTA)' : '(DEFAULTS TO TOTAL)'}
              </label>
              <input
                type="number"
                min="0"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                disabled={!id}
                required
                className="funky-input text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Row 6: Visual Poster Image & Live Preview */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-[#ccff00] flex items-center gap-1.5 font-bold">
                <ImageIcon size={14} />
                <span>POSTER IMAGE & VISUAL ARTWORK</span>
              </label>
              <span className="text-[10px] font-mono text-gray-400">ORGANIZER CUSTOM ARTWORK</span>
            </div>

            {/* Poster URL Input & File Upload Option */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-1.5">
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="Paste direct image URL (https://...) or choose a preset below"
                  className="funky-input text-xs font-mono"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className={`w-full h-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-dashed border-white/30 hover:border-[#ccff00] text-xs font-mono text-gray-300 flex items-center justify-center gap-2 cursor-pointer transition-colors ${uploadingImage ? 'opacity-60 pointer-events-none' : ''}`}>
                  {uploadingImage ? (
                    <Loader2 size={14} className="text-[#ccff00] animate-spin" />
                  ) : (
                    <Upload size={14} className="text-[#ccff00]" />
                  )}
                  <span>{uploadingImage ? 'PROCESSING IMAGE...' : uploadedFileName ? 'CHANGE POSTER' : 'UPLOAD FILE (.JPG / .PNG)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                {uploadedFileName && !uploadingImage && (
                  <p className="text-[10px] font-mono text-[#ccff00] truncate">
                    ✓ {uploadedFileName} (Ready to publish)
                  </p>
                )}
              </div>
            </div>

            {/* One-Click Aesthetic Preset Posters */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-gray-400 uppercase">
                OR CHOOSE A CURATED POSTER PRESET:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_POSTERS.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => setFormData(p => ({ ...p, imageUrl: preset.url }))}
                    className={`p-2.5 text-left border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                      formData.imageUrl === preset.url
                        ? 'border-[#ccff00] bg-[#ccff00]/10 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span className="truncate">{preset.label}</span>
                    {formData.imageUrl === preset.url && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Visual Poster Preview Card */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-2">
                <Eye size={13} className="text-[#ccff00]" />
                <span>LIVE POSTER PREVIEW</span>
              </div>

              <div className="relative h-48 sm:h-56 w-full border border-white/20 overflow-hidden bg-[#141520]">
                <img
                  src={formData.imageUrl || '/concert-background-dark.png'}
                  alt="Poster Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/concert-background-dark.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="badge-lime">{formData.category || 'EVENT'}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h4 className="font-syne font-black text-xl text-white uppercase truncate max-w-sm">
                      {formData.name || 'Your Event Name'}
                    </h4>
                    <p className="text-xs font-mono text-gray-300">
                      {formData.venue || 'Venue'}, {formData.city || 'City'}
                    </p>
                  </div>
                  <div className="font-syne font-black text-xl text-[#ccff00]">
                    ₹{Number(formData.price || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-funky-secondary text-xs"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-funky-primary text-xs"
            >
              <Sparkles size={16} />
              <span>{loading ? 'PROCESSING...' : id ? 'UPDATE EVENT' : 'PUBLISH EVENT TO CALENDAR'}</span>
            </button>
          </div>

        </form>

      </section>

    </div>
  );
}