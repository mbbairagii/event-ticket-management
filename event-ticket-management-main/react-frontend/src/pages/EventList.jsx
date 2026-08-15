import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api';

function EventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        city: '',
        category: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);

        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '')
            );

            const response = await getEvents(params);
            setEvents(response.data.content || response.data || []);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents();
    };

    return (
        <div className="events-page">
            <div className="events-content">
                <h2>Discover Events</h2>

                <div className="card events-filter-card">
                    <form
                        onSubmit={handleSearch}
                        className="events-filter-form"
                    >
                        <div>
                            <label htmlFor="event-name">
                                Event Name
                            </label>

                            <input
                                id="event-name"
                                type="text"
                                name="name"
                                placeholder="Search by name..."
                                value={filters.name}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="event-city">
                                City
                            </label>

                            <input
                                id="event-city"
                                type="text"
                                name="city"
                                placeholder="E.g. New York"
                                value={filters.city}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="event-category">
                                Category
                            </label>

                            <input
                                id="event-category"
                                type="text"
                                name="category"
                                placeholder="E.g. Music, Tech"
                                value={filters.category}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="events-loading">
                        Loading events...
                    </div>
                ) : (
                    <div className="events-grid">
                        {events.length === 0 ? (
                            <p className="events-empty">
                                No events found matching your criteria.
                            </p>
                        ) : (
                            events.map((event) => (
                                <Link
                                    to={`/events/${event.id}`}
                                    key={event.id}
                                    className="event-card-modern"
                                >
                                    <div
                                        className="event-card-image"
                                        style={{
                                            backgroundImage: `url(${event.imageUrl || '/images/event_music_festival.jpg'})`
                                        }}
                                    >
                                        <div className="event-card-category">
                                            {event.category}
                                        </div>
                                    </div>

                                    <div className="event-card-content">
                                        <h3>{event.name}</h3>

                                        <p className="event-description">
                                            {event.description}
                                        </p>

                                        <div className="event-card-details">
                                            <div>
                                                📅 {event.eventDate}
                                                <br />
                                                📍 {event.city}
                                            </div>

                                            <div className="event-price">
                                                ₹{Number(event.price || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventList;