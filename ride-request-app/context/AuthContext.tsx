// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// ---- Types ----
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  userToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// ---- Create context ----
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- Provider ----
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://192.168.0.104:5001/api';

  useEffect(() => {
    const load = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userData = await SecureStore.getItemAsync('userData');
        if (token) setUserToken(token);
        if (userData) setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ---- Login ----
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, { email, password });
      const { token, user: userData } = res.data;

      if (!token || !userData) return false;

      setUserToken(token);
      setUser(userData);

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));

      return true;
    } catch (err) {
      console.error('Login error', err);
      return false;
    }
  };

  // ---- Register ----
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post<RegisterResponse>(`${API_BASE}/auth/register`, { name, email, password });
      const { token, user: userData } = res.data;

      if (!token || !userData) return false;

      setUserToken(token);
      setUser(userData);

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));

      return true;
    } catch (err) {
      console.error('Register error', err);
      return false;
    }
  };

  // ---- Logout ----
  const logout = async (): Promise<void> => {
    try {
      setUserToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ---- Hook ----
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
