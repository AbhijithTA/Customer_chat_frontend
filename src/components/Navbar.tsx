import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-zinc-800 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <Link to="/" className="text-yellow-400 font-bold text-xl">
        HelpDesk
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Role-based dashboard link */}
            {user.role === 'customer' && (
              <Link to="/customer" className="hover:text-yellow-400 text-sm">
                My Tickets
              </Link>
            )}
            {user.role === 'agent' && (
              <Link to="/agent" className="hover:text-yellow-400 text-sm">
                Agent Panel
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:text-yellow-400 text-sm">
                Admin Panel
              </Link>
            )}

            {/* User info */}
            <span className="text-sm text-zinc-300">Hi, {user.name}</span>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-yellow-400 text-sm">
              Login
            </Link>
            <Link to="/signup" className="hover:text-yellow-400 text-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>  
    </nav>
  );
}