import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest, fetchMe } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aho_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetchMe();
        if (res?.data) {
          setUser(res.data);
        }
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('aho_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  async function login(credentials) {
    const data = await loginRequest(credentials);
    const authData = data?.data;
    if (authData?.access_token) {
      localStorage.setItem('aho_token', authData.access_token);
      setToken(authData.access_token);
      setUser(authData.user ?? null);
    }
    return data;
  }

  async function register(details) {
    const data = await registerRequest(details);
    const authData = data?.data;
    if (authData?.access_token && authData?.user?.status === 'approved') {
      localStorage.setItem('aho_token', authData.access_token);
      setToken(authData.access_token);
      setUser(authData.user ?? null);
    }
    return data;
  }

  function logout() {
    localStorage.removeItem('aho_token');
    setToken(null);
    setUser(null);
  }

  const isAdmin = user?.role === 'admin' && user?.status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
