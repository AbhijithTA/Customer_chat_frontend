import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../api/axios';

// Define the shape of your user object
export type UserPayload = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
};

// Define the context type
type AuthContextType = {
  user: UserPayload | null;
  loading: boolean;
  refetchUser: () => Promise<UserPayload | null>;
  logout: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user from backend
  const fetchUser = async (): Promise<UserPayload | null> => {
    try {
      const res = await api.get('/auth/me'); 
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(); // On initial load
  }, []);

  const logout = () => {
    setUser(null);
    // You can optionally call a /logout API route here to clear cookies server-side
  };

  return (
    <AuthContext.Provider value={{ user, loading, refetchUser: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
