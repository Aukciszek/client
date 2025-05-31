import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';

// Define interfaces for token structure
interface TokenInfo {
  access_token: string;
  server: string;
}

interface DecodedToken {
  uid: number;
  isAdmin: boolean;
  exp: number;
}

// Store servers information
let serversList: string[] = [];

// Set cookie with token
export const setToken = (token: string): void => {
  const cookies = new Cookies();
  cookies.set('access_token', token, { path: '/', maxAge: 2592000 }); // 30 days
};

// Set cookie with token list
export const setTokens = (tokens: TokenInfo[]): void => {
  const cookies = new Cookies();
  cookies.set('access_tokens', tokens, { path: '/', maxAge: 2592000 }); // 30 days
};

// Get token from cookies
export const getToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = new Cookies();
  const access_token = cookies.get('access_token');
  if (access_token) {
    return access_token;
  }
  return null;
};

export const getTokensList = (): string | null => {
  const cookies = new Cookies();
  const access_tokens = cookies.get('access_tokens');
  return access_tokens;
};

// Remove token cookie
export const removeCookie = (cookieName: string): void => {
  const cookies = new Cookies();
  cookies.remove(cookieName, { path: '/' });
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Enhance token parsing with better error handling
export const parseToken = (token: string | null): DecodedToken | null => {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = window.atob(base64);
    const payload = JSON.parse(jsonPayload);

    return payload;
  } catch {
    return null;
  }
};

export const parseTokensList = (token: string | null): DecodedToken | null => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
};

export const parseServersList = (
  serversFromToken: string | null,
): string[] | null => {
  if (!serversFromToken) return [];
  try {
    const decoded = decodeURIComponent(serversFromToken);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const verifyAuthTokens = (
  access_tokens: string | null,
): DecodedToken | null => {
  if (!access_tokens) return null;
  try {
    const base64Url = access_tokens.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
};

// Get user info from token
export const getUserFromToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;
  return parseToken(token);
};

export const getUserFromTokens = (): DecodedToken | null => {
  const token = getTokensList();
  if (!token) return null;
  return parseTokensList(token);
};

// Read and parse JWT token
export const readToken = (token: string | null): DecodedToken | null => {
  try {
    if (!token) return null;

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
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Parse tokens list and extract servers
export const parseTokensListAndServers = (
  tokens: TokenInfo[],
): { decodedFirstToken: DecodedToken | null; servers: string[] } => {
  try {
    if (!Array.isArray(tokens)) {
      throw new Error('Invalid tokens format: expected an array');
    }

    if (tokens.length === 0) {
      throw new Error('No tokens provided');
    }

    // Parse first token
    const firstTokenObj = tokens[0];

    if (typeof firstTokenObj !== 'object') {
      throw new Error('Invalid first token format');
    }

    const firstToken = firstTokenObj.access_token.toString();
    if (!firstToken) {
      throw new Error('Missing access token');
    }

    // Get servers list from tokens
    const servers = tokens.map((token: TokenInfo) => {
      if (!token.server) {
        throw new Error('Missing server URL in token');
      }
      return token.server;
    });

    const decodedFirstToken = parseToken(firstToken);
    if (!decodedFirstToken) {
      throw new Error('Failed to decode first token');
    }

    // Store servers list for future use
    serversList = servers;
    setServersListCookie(servers);

    return { decodedFirstToken, servers };
  } catch (error) {
    toast.error(`Error parsing tokens list: ${error}`);
    throw new Error('Failed to parse tokens list and extract servers');
  }
};

export const setServersListCookie = (servers: string[]): void => {
  const cookies = new Cookies();
  try {
    const encodedServers = JSON.stringify(servers);
    cookies.set('servers_list', encodedServers, {
      path: '/',
      maxAge: 2592000, // 30 days
    });
    serversList = servers;
  } catch (error) {
    toast.error(`Error setting servers list cookie: ${error}`);
  }
};

// Get stored servers list
export const getServersList = (): string[] => {
  // From JWT
  let servers = serversList;

  // From cookie
  if (servers.length === 0) {
    servers = getServersListFromCookie();
    serversList = servers;
  }

  return servers;
};

// Get stored servers list
export const getServersListFromCookie = (): string[] => {
  const cookies = new Cookies();
  try {
    const storedServers = cookies.get('servers_list');

    // If no cookie exists, return empty array
    if (!storedServers) {
      return [];
    }

    // If the stored value is already an array, return it
    if (Array.isArray(storedServers)) {
      return storedServers;
    }

    // If it's a string, try to decode and parse it
    if (typeof storedServers === 'string') {
      const decodedValue = decodeURIComponent(storedServers);
      const parsedServers = JSON.parse(decodedValue);
      return Array.isArray(parsedServers) ? parsedServers : [];
    }

    return [];
  } catch (error) {
    toast.error(`Error parsing stored servers list: ${error}`);
    return [];
  }
};

// Get token for specific server
export const getTokenForServer = (server: string): string | null => {
  try {
    const cookies = new Cookies();
    const tokens = cookies.get('access_tokens');

    if (!tokens || !Array.isArray(tokens)) return null;

    // Normalize URLs by removing trailing slashes and converting to lowercase
    const normalizeUrl = (url: string) => {
      try {
        // Parse URL to handle different formats consistently
        const parsed = new URL(url);
        // Return consistent format: protocol://hostname:port
        return `${parsed.protocol}//${parsed.host}`.toLowerCase();
      } catch {
        // If URL parsing fails, fall back to basic normalization
        return url.toLowerCase().trim().replace(/\/+$/, '');
      }
    };

    const normalizedServer = normalizeUrl(server);

    const tokenInfo = tokens.find((token: TokenInfo) => {
      if (typeof token !== 'object' || !token.server) return false;
      const normalizedTokenServer = normalizeUrl(token.server);
      return normalizedTokenServer === normalizedServer;
    });

    return tokenInfo?.access_token ?? null;
  } catch {
    return null;
  }
};
