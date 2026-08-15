import { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import BookingList from './pages/BookingList';
import Dashboard from './pages/Dashboard';
import EventForm from './pages/EventForm';
import { AuthProvider } from './context/AuthContext';

import './index.css';
import './App.css';

function App() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        document.body.className = darkMode ? 'dark-mode' : '';
    }, [darkMode]);

    return (
        <AuthProvider>
            <Router>
                <Navbar
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />

                <main className="container animate-fade-in">
                    <Routes>
                        <Route
                            path="/"
                            element={<Home darkMode={darkMode} />}
                        />

                        <Route path="/login" element={<Login darkMode={darkMode}/>} />
                        <Route path="/register" element={<Register darkMode={darkMode} />} />
                        <Route path="/events" element={<EventList />} />
                        <Route path="/events/:id" element={<EventDetails />} />
                        <Route path="/bookings" element={<BookingList />} />
                        <Route path="/dashboard" element={<Dashboard />} />

                        <Route
                            path="/dashboard/event/new"
                            element={<EventForm />}
                        />

                        <Route
                            path="/dashboard/event/edit/:id"
                            element={<EventForm />}
                        />
                    </Routes>
                </main>
            </Router>
        </AuthProvider>
    );
}

export default App;