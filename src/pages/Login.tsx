import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refetchUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/login', { email, password });

      const user = await refetchUser(); 

      const role = user?.role;
      if (role === 'customer') navigate('/customer');
      else if (role === 'agent') navigate('/agent');
      else if (role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">🎧</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              HelpDesk
            </h1>
          </div>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">⚠️</span>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
          <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>👤 Customer: customer@123.com / customer123</div>
            <div>🛠️ Agent: agent@123.com / agent123</div>
            <div>👑 Admin: admin@123.com / admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
}