import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api';

function Home({ darkMode }) {
    const [featuredEvents, setFeaturedEvents] = useState([]);

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        try {
            const response = await getEvents({ size: 3 });
            setFeaturedEvents(response.data.content || response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="home">
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-image-wrapper">
                        <img
                            src={
                                darkMode
                                    ? '/jazz-musicians-dark.png'
                                    : '/jazz-musicians.png'
                            }
                            alt="Jazz musicians performing"
                            className="hero-image"
                        />
                    </div>

                    <h1 className="hero-title">
                        Explore Events
                    </h1>

                    <p className="hero-subtitle">
                        Discover and book tickets to the most breathtaking events around the world.
                    </p>

                    <Link to="/events" className="btn btn-primary">
                        Explore Events
                    </Link>
                </div>
            </section>

            <section className="featured-section">
                <h2>Featured Events</h2>

                <div className="event-grid">
                    {featuredEvents.map((event) => (
                        <Link
                            to={`/events/${event.id}`}
                            key={event.id}
                            className="event-card-modern"
                        >
                            <div className="event-card-content">
                                <h3>{event.name}</h3>
                                <p>{event.description}</p>
                                <p>{event.eventDate}</p>
                                <p>{event.city}</p>

                                <p className="price-tag">
                                    ₹{Number(event.price || 0).toFixed(2)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;