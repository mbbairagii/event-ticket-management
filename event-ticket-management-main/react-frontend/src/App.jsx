import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import AboutShowcase from './pages/AboutShowcase';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import EventForm from './pages/EventForm';
import BookingList from './pages/BookingList';
import Login from './pages/Login';
import Register from './pages/Register';

// Helper component to reset scroll position on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="app-container bg-[#070709] text-white min-h-screen flex flex-col justify-between selection:bg-[#ccff00] selection:text-black">
          
          {/* Subtle noise grain texture overlay */}
          <div className="grain-overlay pointer-events-none" />

          {/* Sticky Dark Funky Navbar */}
          <Navbar 
            isAudioPlaying={isAudioPlaying} 
            setIsAudioPlaying={setIsAudioPlaying} 
          />

          {/* Main Routing View */}
          <main className="flex-1 w-full">
            <Routes>
              {/* Home Experience */}
              <Route path="/" element={<Home />} />
              
              {/* Deep Scrollable Showcase Manifesto Page */}
              <Route path="/about" element={<AboutShowcase />} />
              <Route path="/manifesto" element={<AboutShowcase />} />
              
              {/* Shows & Ticketing */}
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              
              {/* My Passes */}
              <Route path="/bookings" element={<BookingList />} />
              
              {/* Host / Admin Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/event/new" element={<EventForm />} />
              <Route path="/dashboard/event/edit/:id" element={<EventForm />} />
              
              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Fallback Catch-all */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {/* Brutalist Footer */}
          <Footer />

        </div>
      </Router>
    </AuthProvider>
  );
}