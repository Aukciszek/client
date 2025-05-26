import { getServersList, getTokenForServer } from './utils/auth';
import { toast } from 'react-toastify';
import type { Server, SetNumber } from './globalInterface';
import type { Dispatch, SetStateAction } from 'react';
import { REFRESH_INTERVAL } from './constants';

export const getServerAddresses = (servers: Server[]): string[] =>
  servers.map((server) => server.address);

export const getInitialValues = async (
  setT: SetNumber,
  setN: SetNumber,
  setServers: Dispatch<SetStateAction<Server[]>>,
  initialValuesServer: string,
): Promise<void> => {
  const messageInfo: string[] = [];

  // Log the server we're trying to get a token for
  const token = getTokenForServer(initialValuesServer);

  if (!token) {
    toast.error('Authentication token not found. Please try logging in again.');
    return;
  }

  // Ensure URL is properly formatted with trailing slash
  const serverUrl = initialValuesServer.endsWith('/')
    ? initialValuesServer
    : `${initialValuesServer}/`;

  await fetch(`${serverUrl}api/initial-values`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail);
        setT(0);
        setN(0);
        setServers([]);
        throw new Error(data.detail);
      }

      setT(data.t);
      setN(data.n);
      // Get the current auth servers list to properly map server addresses
      const authServers = getServersList();
      const availableServers = data.parties.map((party: string) => {
        // Try to find matching server from auth context to get the proper name
        const matchingAuthServer = authServers.find(
          (server) => server === party,
        );
        return {
          id: party,
          name: matchingAuthServer || party,
          address: party,
          status: 'online',
        };
      });
      setServers(availableServers);
      messageInfo.push(data.result);
      toast.success('Successfully retrieved server addresses');
    })
    .catch((err) => {
      const error = err.message;
      toast.error(error);
      setT(0);
      setN(0);
      setServers([]);
      throw err;
    });
};

export const checkServerStatus = async (server: string): Promise<boolean> => {
  try {
    const serverUrl = server.endsWith('/') ? server : `${server}/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REFRESH_INTERVAL); // 10 second timeout

    try {
      console.log(`Checking status for server: ${serverUrl}`);
      await fetch(`${serverUrl}api/status`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted due to timeout
      }
      return false;
    }
  } catch {
    return false;
  }
};

export const handleCheckStatus = async (
  id: string,
  servers: Server[],
  setServers: Dispatch<SetStateAction<Server[]>>,
): Promise<void> => {
  const server = servers.find((s) => s.id === id);
  if (!server) return;

  // Show loading state for this specific server
  setServers((prev) =>
    prev.map((s) => (s.id === id ? { ...s, status: 'checking' } : s)),
  );

  const isOnline = await checkServerStatus(server.address);

  // Update status for just this server
  setServers((prev) =>
    prev.map((s) =>
      s.id === id ? { ...s, status: isOnline ? 'online' : 'offline' } : s,
    ),
  );
};

export const handleAllServersStatus = (
  servers: Server[],
  setServers: Dispatch<SetStateAction<Server[]>>,
): (() => void) => {
  // Check status immediately
  servers.forEach((server) => {
    handleCheckStatus(server.id, servers, setServers);
  });

  // Set up automatic refresh every 10 seconds
  const intervalId = setInterval(() => {
    servers.forEach((server) => {
      handleCheckStatus(server.id, servers, setServers);
    });
  }, REFRESH_INTERVAL);

  // Return cleanup function to clear the interval
  return () => clearInterval(intervalId);
};
