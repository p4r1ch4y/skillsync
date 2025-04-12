// Client-side authentication helper
(function() {
  // API base URL
  const API_URL = window.location.origin;

  // Token storage key
  const TOKEN_KEY = 'talentsync_auth_token';
  const USER_KEY = 'talentsync_user';

  // Get token from localStorage
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Set token in localStorage
  function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Remove token from localStorage
  function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Get user from localStorage
  function getUser() {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Set user in localStorage
  function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Check if user is authenticated
  function isAuthenticated() {
    return !!getToken();
  }

  // Make authenticated API request
  async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API request failed:', data);
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Login user
  async function login(username, password) {
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register user
  async function register(userData) {
    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  async function logout() {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST'
      });

      removeToken();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token even if API call fails
      removeToken();
      throw error;
    }
  }

  // Get current user
  async function getCurrentUser() {
    try {
      const data = await apiRequest('/api/auth/me');
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      // If unauthorized, clear token and user
      if (error.message === 'Authentication required' || error.message === 'Invalid or expired token') {
        removeToken();
      }
      throw error;
    }
  }

  // Expose public API
  window.TalentSyncAuth = {
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    getUser,
    apiRequest
  };
})();
