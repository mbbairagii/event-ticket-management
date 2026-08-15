import {Link, NavLink, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

function Navbar({darkMode, setDarkMode}) {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const isOrganizer =
        user?.role === 'ORGANIZER' ||
        user?.role === 'organizer';

    const isAdmin =
        user?.role === 'ADMIN' ||
        user?.role === 'admin';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                Eventified
            </Link>

            <div className="nav-links">
                <NavLink to="/events" className="nav-link">
                    Browse Events
                </NavLink>

                {user ? (
                    <>
                        {(isAdmin || isOrganizer) && (
                            <NavLink
                                to="/dashboard"
                                className="nav-link"
                            >
                                {isAdmin
                                    ? 'Admin Dashboard'
                                    : 'My Hosted Events'}
                            </NavLink>
                        )}

                        {isOrganizer && (
                            <NavLink
                                to="/dashboard/event/new"
                                className="nav-link"
                            >
                                Host an Event
                            </NavLink>
                        )}

                        <NavLink
                            to="/bookings"
                            className="nav-link"
                        >
                            My Bookings
                        </NavLink>

                        <span className="nav-user">
                            Hello, {user.name}
                        </span>

                        <button
                            type="button"
                            className="nav-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink
                            to="/login"
                            className="nav-link"
                        >
                            Login
                        </NavLink>

                        <NavLink
                            to="/register"
                            className="nav-button"
                        >
                            Register
                        </NavLink>
                    </>
                )}

                <button
                    type="button"
                    className="theme-button"
                    onClick={() => setDarkMode((value) => !value)}
                >
                    {darkMode ? 'White mode' : 'Black mode'}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;