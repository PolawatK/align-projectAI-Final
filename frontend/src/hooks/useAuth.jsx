import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStore } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = tokenStore.get();
    if (token) {
      authApi.me()
        .then(setUser)
        .catch(() => tokenStore.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    tokenStore.set(data.access_token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (email, password, display_name) => {
    await authApi.register(email, password, display_name);
    // Auto-login after register
    return login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (_) {}
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
