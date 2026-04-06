import { createContext } from 'react';
import type { UserAccount } from '@/types/user';

export interface AuthContextType {
  user: UserAccount | null;
  loading: boolean;
  login: (userData: UserAccount) => void;
  updateUser: (userData: UserAccount) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
