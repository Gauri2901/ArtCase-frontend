import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserAccount } from '@/types/user';

interface AuthContextType {
  user: UserAccount | null;
  loading: boolean; // Add loading state
  login: (userData: UserAccount) => void;
  updateUser: (userData: UserAccount) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true); // Start as loading

  useEffect(() => {
    // Check localStorage on load
    const storedUser = localStorage.getItem('artcase_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // Finished checking
  }, []);

  const login = (userData: UserAccount) => {
    setUser(userData);
    localStorage.setItem('artcase_user', JSON.stringify(userData));
  };

  const updateUser = (userData: UserAccount) => {
    setUser(userData);
    localStorage.setItem('artcase_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('artcase_user');
    window.location.href = '/login'; // Hard redirect to ensure clean state
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};  