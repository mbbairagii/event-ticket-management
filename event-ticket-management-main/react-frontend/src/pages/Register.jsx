import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {registerUser} from '../services/api';

function Register() {
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

    const handleChange = (e) => {
        const {name, value} = e.target;

        setFormData((previousData) => ({
            ...previousData,
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

            console.log(requestData);
            await registerUser(requestData);

            setSuccess(
                'Registration successful. You can now log in.'
            );

            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Registration failed'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="card"
            style={{
                maxWidth: '500px',
                margin: '2rem auto'
            }}
        >
            <h2>Create Account</h2>

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

            {success && (
                <div
                    style={{
                        color: '#2ed573',
                        marginBottom: '1rem'
                    }}
                >
                    {success}
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
                <div>
                    <label
                        htmlFor="name"
                        style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="email"
                        style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
                </div>

                <div>
                    <p
                        style={{
                            marginBottom: '0.5rem',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Account Type
                    </p>

                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <input
                            type="radio"
                            name="role"
                            value="USER"
                            checked={
                                formData.role === 'USER'
                            }
                            onChange={handleChange}
                        />

                        Attend events
                    </label>

                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <input
                            type="radio"
                            name="role"
                            value="ORGANIZER"
                            checked={formData.role === 'ORGANIZER'}
                            onChange={(e) =>
                                setFormData((previousData) => ({
                                    ...previousData,
                                    role: e.target.value
                                }))
                            }
                        />

                        Host events
                    </label>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading
                        ? 'Creating account...'
                        : 'Register'}
                </button>
            </form>

            <p style={{marginTop: '1rem'}}>
                Already have an account?{' '}
                <Link to="/login">Log in</Link>
            </p>
        </div>
    );
}

export default Register;