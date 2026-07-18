import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  loginAPI,
  registerAPI,
  logoutAPI,
  getProfileAPI,
  updateProfileAPI,
} from '../api/auth';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Clear state on logout or auth failure
  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  // Fetch profile when access token is set or refreshed
  const fetchProfile = useCallback(async () => {
    try {
      const response = await getProfileAPI();
      setUser(response.data.user);
    } catch (error) {
      clearAuth();
    }
  }, [clearAuth]);

  // Initial session check on mount (Stateless token refresh + OAuth handle)
  useEffect(() => {
    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('accessToken', urlToken);
        setAccessToken(urlToken);
        // Clean URL to remove token
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const localToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');

      if (localToken) {
        setAccessToken(localToken);
        try {
          const response = await getProfileAPI();
          setUser(response.data.user);
        } catch (err) {
          // Access token might have expired. Try to refresh if refresh token exists.
          if (!savedRefreshToken) {
            clearAuth();
          } else {
            try {
              const { data } = await api.post('/auth/refresh', { refreshToken: savedRefreshToken });
              localStorage.setItem('accessToken', data.data.accessToken);
              if (data.data.refreshToken) {
                localStorage.setItem('refreshToken', data.data.refreshToken);
              }
              setAccessToken(data.data.accessToken);
              const userResponse = await getProfileAPI();
              setUser(userResponse.data.user);
            } catch (refreshErr) {
              clearAuth();
            }
          }
        }
      } else if (savedRefreshToken) {
        // No access token, but refresh token exists: attempt token refresh
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken: savedRefreshToken });
          localStorage.setItem('accessToken', data.data.accessToken);
          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
          }
          setAccessToken(data.data.accessToken);
          const userResponse = await getProfileAPI();
          setUser(userResponse.data.user);
        } catch (refreshErr) {
          clearAuth();
        }
      } else {
        // Unauthenticated visitor
        clearAuth();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [clearAuth]);

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await loginAPI(email, password);
      const token = response.data.accessToken;
      const refresh = response.data.refreshToken;
      localStorage.setItem('accessToken', token);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      }
      setAccessToken(token);
      setUser(response.data.user);
      toast.success(response.message || 'Logged in successfully!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Login failed. Please check credentials.';
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Registration handler
  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await registerAPI(name, email, password);
      toast.success(response.message || 'Registration successful! Please log in.');
      navigate('/login');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Registration failed.';
      if (error.response?.data?.error?.details) {
        error.response.data.error.details.forEach((detail) => {
          toast.error(detail.message);
        });
      } else {
        toast.error(errorMsg);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    const loadingToast = toast.loading('Logging out...');
    try {
      await logoutAPI();
      clearAuth();
      toast.success('Logged out successfully!', { id: loadingToast });
      navigate('/login');
    } catch (error) {
      clearAuth();
      toast.success('Logged out.', { id: loadingToast });
      navigate('/login');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await updateProfileAPI(profileData);
      // Sync the local user state from the server's returned user object
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(prev => ({ ...prev, ...profileData }));
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    setUser,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
