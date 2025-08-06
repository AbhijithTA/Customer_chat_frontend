import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../api/axios';

export type UserPayload = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
};


type AuthContextType = {
  user: UserPayload | null;
  loading: boolean;
  refetchUser: () => Promise<UserPayload | null>;
  logout: () => void;
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);


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
    fetchUser(); 
  }, []);

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refetchUser: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
