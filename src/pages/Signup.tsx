import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../api/axios';

type FormData = {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'agent' | 'admin';
};

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
     await api.post('/auth/register', formData); 
      alert('Registration successful');
      navigate('/login');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <>
      <Navbar />

      <motion.div
        className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-zinc-900 text-white p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Branding Section */}
        <div className="md:w-1/2 p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Create your HelpDesk account</h1>
          <p className="text-zinc-400 mb-4">
            Track issues, talk to support agents, and resolve queries faster.
          </p>
          <img src="/assets/Security-cuate.svg" alt="Illustration" className="w-64 mx-auto" />
        </div>

        {/* Signup Form */}
        <div className="md:w-1/2 w-full max-w-md bg-zinc-800 p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Sign Up</h2>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-zinc-700 text-white"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-zinc-700 text-white"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-zinc-700 text-white"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-zinc-700 text-white"
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded"
            >
              Signup
            </button>

            <p className="text-sm text-zinc-300 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-400 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </>
  );
}
