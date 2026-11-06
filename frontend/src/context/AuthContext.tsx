import { createContext, useContext } from 'react';
import type { User } from '../api';

type AuthContextValue = {
  user: User | null;
  setUser: (u: User | null) => void;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);
