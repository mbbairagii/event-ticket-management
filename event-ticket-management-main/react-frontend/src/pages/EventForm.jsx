import {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    getEventById,
    createEvent,
    updateEvent
} from '../services/api';
import {useAuth} from '../context/AuthContext';

function EventForm() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();

    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        venue: '',
        city: '',
        eventDate: '',
        totalSeats: '',
        availableSeats: '',
        price: '',
        category: ''
    });

    useEffect(() => {
        if (
            !user ||
            (user.role !== 'ADMIN' &&
                user.role !== 'ORGANIZER')
        ) {
            navigate('/');
            return;
        }

        if (id) {
            fetchEventData();
        }
    }, [id, user, navigate]);

    const fetchEventData = async () => {
        try {
            const response = await getEventById(id);

            const event = response.data;

            setFormData({
                name: event.name || '',
                description: event.description || '',
                venue: event.venue || '',
                city: event.city || '',
                eventDate: event.eventDate
                    ? event.eventDate.substring(0, 16)
                    : '',
                totalSeats: event.totalSeats ?? '',
                availableSeats: event.availableSeats ?? '',
                price: event.price ?? '',
                category: event.category || ''
            });
        } catch (err) {
            setError('Failed to fetch event data');
        }
    };

    const handleChange = (e) => {
        const {name, value, type} = e.target;

        const finalValue =
            type === 'number' && value !== ''
                ? Number(value)
                : value;

        setFormData((previousData) => {
            const updatedData = {
                ...previousData,
                [name]: finalValue
            };

            if (name === 'totalSeats' && !id) {
                updatedData.availableSeats = finalValue;
            }

            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const submissionData = {
                ...formData,
                organizerId: user.id
            };

            if (!id) {
                submissionData.availableSeats =
                    submissionData.totalSeats;
            }

            if (id) {
                await updateEvent(id, submissionData);
            } else {
                await createEvent(submissionData);
            }

            navigate('/dashboard');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to save event'
            );
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
        <div
            className="card"
            style={{
                maxWidth: '600px',
                margin: '0 auto'
            }}
        >
            <h2>{id ? 'Edit Event' : 'Create New Event'}</h2>

            {error && (
                <div
                    style={{
                        color: '#ff6b6b',
                        marginBottom: '1rem'
                    }}
                >
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            '1fr 1fr',
                        gap: '1rem'
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            Event Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            Category
                        </label>

                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        required
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border:
                                '1px solid var(--surface-light)',
                            background:
                                'var(--surface-color)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            '1fr 1fr',
                        gap: '1rem'
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            Venue
                        </label>

                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            City
                        </label>

                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            '1fr 1fr',
                        gap: '1rem'
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            Event Date and Time
                        </label>

                        <input
                            type="datetime-local"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            Price (₹)
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            '1fr 1fr',
                        gap: '1rem'
                    }}
                >
                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            Total Seats
                        </label>

                        <input
                            type="number"
                            min="1"
                            name="totalSeats"
                            value={formData.totalSeats}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color:
                                    'var(--text-secondary)'
                            }}
                        >
                            Available Seats
                        </label>

                        <input
                            type="number"
                            min="0"
                            name="availableSeats"
                            value={formData.availableSeats}
                            onChange={handleChange}
                            required
                            disabled={!id}
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '1rem'
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate('/dashboard')
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{flex: 1}}
                    >
                        {id
                            ? 'Update Event'
                            : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EventForm;