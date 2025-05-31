import { getServersList, getTokenForServer } from './utils/auth';
import { toast } from 'react-toastify';
import type { Server, SetNumber } from './globalInterface';
import type { Dispatch, SetStateAction } from 'react';
import { PRIME_NUMBER, REFRESH_INTERVAL } from './constants';

// Track the current interval ID and pending checks
let isChecking = false;

export const resetServerStatusInterval = (
  servers: Server[],
  setServers: Dispatch<SetStateAction<Server[]>>,
): void => {
  if (isChecking) return; // Skip if already checking
  // Check status without resetting interval
  servers.forEach((server) => {
    handleCheckStatus(server.id, servers, setServers);
  });
};

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

export const checkServerStatus = async (
  server: string,
  isLoading: boolean,
): Promise<boolean> => {
  if (!isLoading) {
    try {
      const serverUrl = server.endsWith('/') ? server : `${server}/`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REFRESH_INTERVAL); // 10 second timeout

      try {
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
  }
  return true;
};

export const handleCheckStatus = async (
  id: string,
  servers: Server[],
  setServers: Dispatch<SetStateAction<Server[]>>,
  isLoading: boolean = false,
): Promise<void> => {
  const server = servers.find((s) => s.id === id);
  if (!server) return;

  // Show loading state for this specific server
  setServers((prev) =>
    prev.map((s) => (s.id === id ? { ...s, status: 'checking' } : s)),
  );

  const isOnline = await checkServerStatus(server.address, isLoading);

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
  isLoading: boolean = false,
): void => {
  // Function to check all servers
  const checkAllServers = async () => {
    if (isChecking) return; // Skip if already checking
    isChecking = true;

    await Promise.all(
      servers.map((server) =>
        handleCheckStatus(server.id, servers, setServers, isLoading),
      ),
    );

    isChecking = false;
  };

  // Check status immediately
  checkAllServers();
};

export const dataValidation = {
  getMaxA: (l: number, k: number): number => {
    /*     """
      Wyznaczenie najwiekszej mozliwej wartosci a (liczba pierwsza musi byc wieksza od a).
      Zalozenie 1: a = 2^(l+k+1) - r + 2^l + d - s
      Zalozenie 2: liczba_bitow_random_number = l + k + 1
      Zalozenie 3: r >= 0
      Args:
          l: liczba bitów porównywanych liczb <= l
          k: parametr dodatkowy, liczba bitów losowego r = l + k + 1
      """ */
    const powHi = 2 ** (l + k + 1);
    const randomNumberBits = l + k + 1;
    const randomNumberBitsRange = [0, 2 ** randomNumberBits - 1];
    const powLow = 2 ** l;
    const comparisonRange = [0, powLow - 1];
    // a has to be lower than p
    const plainARange = [
      powHi + powLow + comparisonRange[0] - comparisonRange[1],
      powHi + powLow + comparisonRange[1] - comparisonRange[0],
    ];
    const maxA = [
      plainARange[0] - randomNumberBitsRange[1],
      plainARange[1] - randomNumberBitsRange[0],
    ];

    return maxA[1];
  },
  getMaxP: (l: number, k: number): number => {
    /* """
        - Zalozenie 1: a = 2^(l+k+1) - r + 2^l + d - s
        - Zalozenie 2: liczba bitow losowego r = l + k + 1
        - Zalozenie 3: r >= 0
        Wtedy liczba pierwsza p >= 2^(l+k+1) + 2^(l+1)
        Args:
            l: liczba bitów porównywanych liczb <= l
            k: parametr dodatkowy
        """ */
    return 2 ** (l + k + 1) + 2 ** (l + 1);
  },
  getMaxBid: (l: number): number => {
    /* """
    Wyznaczenie maksymalnej wartości licytacji.
    Założenie 1: a = 2^(l+k+1) - r + 2^l + d - s
    Założenie 2: liczba_bitow_random_number = l + k + 1
    Założenie 3: r >= 0
    Args:
        l: liczba bitów porównywanych liczb <= l
        k: parametr dodatkowy, liczba bitów losowego r = l + k + 1
    """ */
    return Math.pow(Number(2), l) - 1;
  },
  validateP: (l: number, k: number): boolean => {
    /* """
    Sprawdzenie, czy p jest większa niż największe możliwe a.
    Założenie 1: a = 2^(l+k+1) - r + 2^l + d - s
    Założenie 2: liczba_bitow_random_number = l + k + 1
    Założenie 3: r >= 0
    Args:
        l: liczba bitów porównywanych liczb <= l
        k: parametr dodatkowy, liczba bitów losowego r = l + k + 1
        p: liczba pierwsza
    """ */
    const p = Number(PRIME_NUMBER);
    const powHi = 2 ** (l + k + 1);
    const randomNumberBits = l + k + 1;
    const randomNumberRange = [0, 2 ** randomNumberBits - 1];
    const powLow = 2 ** l;
    const comparisonRange = [0, powLow - 1];
    // a has to be lower than p
    // plain a doesn't have to be lower than p when modulus reduction is performed after inclusion of random r
    const plainARange = [
      powHi + powLow + comparisonRange[0] - comparisonRange[1],
      powHi + powLow + comparisonRange[1] - comparisonRange[0],
    ];
    const rangeOfA = [
      plainARange[0] - randomNumberRange[1],
      plainARange[1] - randomNumberRange[0],
    ];

    if (p <= rangeOfA[1]) {
      return false;
    } else {
      return true;
    }
  },
};
