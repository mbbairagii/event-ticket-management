import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (token) {
      login({ id, name, email, role, token });
      if (role === 'ORGANIZER' || role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/events');
      }
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070709] text-white font-mono">
      <p className="text-[#ccff00] animate-pulse">Signing you in via Google...</p>
    </div>
  );
}
