

// Set cookie with token
export const setToken = (token: string): void => {
  document.cookie = `auth_token=${token}; path=/; max-age=2592000`; // 30 days
};

// Set cookie with token
export const setTokens = (token: string, auth_tokens: string): void => {
  let karol = "siema";
  let karol2 = "zw ide do toalety";
  document.cookie = `auth_token=${token}; auth_tokens=${auth_tokens}; path=/; max-age=2592000`; // 30 days
};

// Get token from cookies
export const getToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
  return match ? match[2] : null;
};

export const getTokensList = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^|;)\s*auth_tokens\s*=\s*([^;]+)/);
  return match ? match[2] : null;
};

// Remove token cookie
export const removeToken = (): void => {
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
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

export const parseTokensList = (token: string | null): any => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

export const verifyAuthTokens = (auth_tokens: string | null): any => {
  if (!auth_tokens) return null;
  try {
    const base64Url = auth_tokens.split('.')[1];
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

export const getUserFromTokens = (): any => {
  const token = getTokensList();
  if (!token) return null;
  return parseTokensList(token);
};

// Read and parse JWT token
export const readToken = (token: string | null): any => {
  try {
    if (!token) return JSON.parse('{}');

    // Split the token into parts
    const base64Url = token.split('.');
    if (base64Url.length !== 3) {
      throw new Error('Invalid JWT format: Token must have three parts.');
    }
    const base64Payload = base64Url[1];

    // Prepare for decoding
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64
    const decodedPayload = atob(base64);

    // Handle UTF-8 encoding
    const jsonPayload = decodeURIComponent(
      decodedPayload
        .split('')
        .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};