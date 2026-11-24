import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, setUser } = useAuthStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      logout();
    }
  }, [token, setUser, logout]);

  return { user, token, isAuthenticated, isAdmin, login, logout: handleLogout, fetchMe };
}
