import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client.js';

export interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'player' | 'admin';
  profile: {
    displayName: string;
    avatarUrl: string;
    level: number;
    xp: number;
    title: string;
    bio: string;
  };
  wallet: {
    goldCoins: number;
    gems: number;
  };
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (token: string, user: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('colheita_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest<UserData>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('colheita_token');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('colheita_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (token: string, _userPayload: any) => {
    localStorage.setItem('colheita_token', token);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('colheita_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
