import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aho_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On load, trust whatever token is stored; a real app would also verify
    // it against a /auth/me endpoint. Kept minimal here since that route
    // wasn't part of the spec.
    setLoading(false);
  }, []);

  async function login(credentials) {
    const data = await loginRequest(credentials);
    localStorage.setItem('aho_token', data.token);
    setToken(data.token);
    setUser(data.user ?? null);
    return data;
  }

  async function register(details) {
    const data = await registerRequest(details);
    if (data.token) {
      localStorage.setItem('aho_token', data.token);
      setToken(data.token);
      setUser(data.user ?? null);
    }
    return data;
  }

  function logout() {
    localStorage.removeItem('aho_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
