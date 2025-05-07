// JWT token handling utilities

// Store token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Parse JWT token payload
export const parseToken = (token: string | null): any => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

// Get user info from token
export const getUserFromToken = (): any => {
  const token = getToken();
  if (!token) return null;
  return parseToken(token);
};
