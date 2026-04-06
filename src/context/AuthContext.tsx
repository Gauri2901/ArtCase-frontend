import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserAccount } from '@/types/user';
import { AuthContext } from './auth-context';

const isSameUser = (current: UserAccount | null, next: UserAccount) => {
  if (!current) {
    return false;
  }

  return (
    current._id === next._id &&
    current.name === next.name &&
    current.email === next.email &&
    current.phone === next.phone &&
    current.isAdmin === next.isAdmin &&
    current.token === next.token
  );
};

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
    setUser((current) => {
      if (isSameUser(current, userData)) {
        return current;
      }

      localStorage.setItem('artcase_user', JSON.stringify(userData));
      return userData;
    });
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
