import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {loginUser} from '../services/api';
import {useAuth} from '../context/AuthContext';

function Login({darkMode}) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();
    const {login} = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await loginUser(formData);
            login(response.data);

            if (response.data.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-page login-page">
            <img
                src={darkMode ? '/film.png' : '/film-white.png'}
                alt=""
                className="auth-film"
            />

            <div className="card auth-card">
                <h2>Login</h2>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        className="colorful-input"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="colorful-input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="btn btn-primary">
                        Login
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;