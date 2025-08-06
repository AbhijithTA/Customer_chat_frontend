import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'agent': return '🛠️';
      case 'customer': return '👤';
      default: return '💼';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'agent': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'customer': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'customer': return '/customer';
      case 'agent': return '/agent';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50 text-white px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-3 group transition-all duration-200"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
            <span className="text-white font-bold text-xl">🎧</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            HelpDesk
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>

              <Link
                to={getDashboardPath()}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(getDashboardPath())
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                {user.role === 'customer' && (
                  <>
                    <span>🎫</span>
                    My Tickets
                  </>
                )}
                {user.role === 'agent' && (
                  <>
                    <span>🛠️</span>
                    Agent Panel
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <span>👑</span>
                    Admin Panel
                  </>
                )}
              </Link>


              <div className="flex items-center gap-4">

                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getRoleColor(user.role)}`}>
                  <span>{getRoleIcon(user.role)}</span>
                  <span className="text-sm font-medium">Hi, {user.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)} capitalize`}>
                    {user.role}
                  </span>
                </div>


                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/login')
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 ${isActive('/signup') ? 'ring-2 ring-blue-500/50' : ''
                  }`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>


        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200"
        >
          <div className="flex flex-col gap-1">
            <div className={`w-5 h-0.5 bg-current transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-current transition-all duration-200 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-current transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
        </button>
      </div>


      <div className={`md:hidden transition-all duration-200 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="pt-4 pb-2 border-t border-slate-800/50 mt-4">
          {user ? (
            <div className="space-y-3">

              <div className={`flex items-center gap-3 p-3 rounded-lg border ${getRoleColor(user.role)}`}>
                <span className="text-2xl">{getRoleIcon(user.role)}</span>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs opacity-75 capitalize">{user.role}</p>
                </div>
              </div>

              <Link
                to={getDashboardPath()}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(getDashboardPath())
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                {user.role === 'customer' && (
                  <>
                    <span>🎫</span>
                    My Tickets
                  </>
                )}
                {user.role === 'agent' && (
                  <>
                    <span>🛠️</span>
                    Agent Panel
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <span>👑</span>
                    Admin Panel
                  </>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                <span>🚪</span>
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={`block p-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/login')
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMenuOpen(false)}
                className={`block p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium text-center transition-all duration-200 ${isActive('/signup') ? 'ring-2 ring-blue-500/50' : ''
                  }`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}