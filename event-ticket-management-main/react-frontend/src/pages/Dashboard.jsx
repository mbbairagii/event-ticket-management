import {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
    getEvents,
    deleteEvent,
    getAllBookings,
    getOrganizerBookings
} from '../services/api';
import {useAuth} from '../context/AuthContext';

function Dashboard() {
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('events');

    const {user} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (
            !user ||
            (user.role !== 'ADMIN' &&
                user.role !== 'ORGANIZER')
        ) {
            navigate('/');
            return;
        }

        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        const eventsCall =
            user.role === 'ADMIN'
                ? getEvents({size: 100})
                : getEvents({
                    organizerId: user.id,
                    size: 100
                });

        const bookingsCall =
            user.role === 'ADMIN'
                ? getAllBookings()
                : getOrganizerBookings(user.id);

        // Use allSettled instead of all: a failure fetching bookings
        // should not prevent events (or vice versa) from being shown.
        const [eventsResult, bookingsResult] =
            await Promise.allSettled([
                eventsCall,
                bookingsCall
            ]);

        if (eventsResult.status === 'fulfilled') {
            const eventsResponse = eventsResult.value;
            setEvents(
                eventsResponse.data.content ||
                eventsResponse.data ||
                []
            );
        } else {
            console.error(
                'Error fetching events',
                eventsResult.reason
            );
        }

        if (bookingsResult.status === 'fulfilled') {
            const bookingsResponse = bookingsResult.value;
            setBookings(bookingsResponse.data || []);
        } else {
            console.error(
                'Error fetching bookings',
                bookingsResult.reason
            );
        }
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                'Are you sure you want to delete this event?'
            )
        ) {
            return;
        }

        try {
            await deleteEvent(id);
            await fetchData();
        } catch (error) {
            alert('Failed to delete event');
        }
    };

    if (
        !user ||
        (user.role !== 'ADMIN' &&
            user.role !== 'ORGANIZER')
    ) {
        return null;
    }

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}
            >
                <h2>
                    {user.role === 'ADMIN'
                        ? 'Admin Dashboard'
                        : 'My Hosted Events'}
                </h2>

                <Link
                    to="/dashboard/event/new"
                    className="btn btn-primary"
                >
                    Create New Event
                </Link>
            </div>

            <div
                style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1rem'
                }}
            >
                <button
                    className={`btn ${
                        activeTab === 'events'
                            ? 'btn-primary'
                            : 'btn-secondary'
                    }`}
                    onClick={() =>
                        setActiveTab('events')
                    }
                >
                    Manage Events
                </button>

                <button
                    className={`btn ${
                        activeTab === 'bookings'
                            ? 'btn-primary'
                            : 'btn-secondary'
                    }`}
                    onClick={() =>
                        setActiveTab('bookings')
                    }
                >
                    {user.role === 'ADMIN'
                        ? 'All Bookings'
                        : 'My Event Bookings'}
                </button>
            </div>

            {activeTab === 'events' && (
                <div
                    className="card"
                    style={{
                        padding: '0',
                        overflowX: 'auto'
                    }}
                >
                    <table
                        style={{
                            width: '100%',
                            borderCollapse:
                                'collapse',
                            textAlign: 'left'
                        }}
                    >
                        <thead>
                        <tr
                            style={{
                                borderBottom:
                                    '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                Event Name
                            </th>

                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                Date
                            </th>

                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                Available / Total
                            </th>

                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                Actions
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {events.map((event) => (
                            <tr
                                key={event.id}
                                style={{
                                    borderBottom:
                                        '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <td
                                    style={{
                                        padding: '1rem'
                                    }}
                                >
                                    {event.name}
                                </td>

                                <td
                                    style={{
                                        padding: '1rem'
                                    }}
                                >
                                    {event.eventDate}
                                </td>

                                <td
                                    style={{
                                        padding: '1rem'
                                    }}
                                >
                                    {event.availableSeats}{' '}
                                    / {event.totalSeats}
                                </td>

                                <td
                                    style={{
                                        padding: '1rem',
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Link
                                        to={`/dashboard/event/edit/${event.id}`}
                                        className="btn btn-secondary"
                                        style={{
                                            padding:
                                                '0.3rem 0.6rem',
                                            fontSize:
                                                '0.9rem'
                                        }}
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                event.id
                                            )
                                        }
                                        className="btn"
                                        style={{
                                            background:
                                                '#ff6b6b',
                                            color: 'white',
                                            padding:
                                                '0.3rem 0.6rem',
                                            fontSize:
                                                '0.9rem'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {events.length === 0 && (
                            <tr>
                                <td
                                    colSpan="4"
                                    style={{
                                        padding:
                                            '2rem',
                                        textAlign:
                                            'center',
                                        color:
                                            'var(--text-secondary)'
                                    }}
                                >
                                    No events found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div
                    className="card"
                    style={{
                        padding: '0',
                        overflowX: 'auto'
                    }}
                >
                    <table
                        style={{
                            width: '100%',
                            borderCollapse:
                                'collapse',
                            textAlign: 'left'
                        }}
                    >
                        <thead>
                        <tr
                            style={{
                                borderBottom:
                                    '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                ID
                            </th>

                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                User
                            </th>

                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                Event
                            </th>

                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                Quantity
                            </th>

                            <th
                                style={{
                                    padding: '1rem'
                                }}
                            >
                                Status
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {bookings.map((booking) => (
                            <tr
                                key={booking.id}
                                style={{
                                    borderBottom:
                                        '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                <td
                                    style={{
                                        padding: '1rem'
                                    }}
                                >
                                    #{booking.id}
                                </td>

                                <td
                                    style={{
                                        padding: '1rem'
                                    }}
                                >
                                    {booking.user?.name}{' '}
                                    ({booking.user?.email})
                                </td>

                                <td
                                    style={{
                                        padding: '1rem'
                                    }}
                                >
                                    {booking.event?.name}
                                </td>

                                <td
                                    style={{
                                        padding: '1rem'
                                    }}
                                >
                                    {booking.quantity}
                                </td>

                                <td
                                    style={{
                                        padding: '1rem'
                                    }}
                                >
                                        <span
                                            style={{
                                                padding:
                                                    '0.3rem 0.6rem',
                                                borderRadius:
                                                    '1rem',
                                                fontSize:
                                                    '0.8rem',
                                                background:
                                                    booking.status ===
                                                    'CONFIRMED'
                                                        ? 'rgba(46, 213, 115, 0.2)'
                                                        : 'rgba(255, 71, 87, 0.2)',
                                                color:
                                                    booking.status ===
                                                    'CONFIRMED'
                                                        ? '#2ed573'
                                                        : '#ff4757'
                                            }}
                                        >
                                            {booking.status}
                                        </span>
                                </td>
                            </tr>
                        ))}

                        {bookings.length === 0 && (
                            <tr>
                                <td
                                    colSpan="5"
                                    style={{
                                        padding:
                                            '2rem',
                                        textAlign:
                                            'center',
                                        color:
                                            'var(--text-secondary)'
                                    }}
                                >
                                    No bookings found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Dashboard;