import type { SetNumber } from '@/app/interface';
import { toast } from 'react-toastify';
import type { Dispatch, SetStateAction } from 'react';
import { PRIME_NUMBER } from '../constants';
import type { Server } from '../globalInterface';

export const getInitialValues = async (
  setT: SetNumber,
  setN: SetNumber,
  setServers: Dispatch<SetStateAction<Server[]>>,
  initialValuesServer: string,
): Promise<void> => {
  await fetch(`${initialValuesServer}/api/initial-values`)
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail);
      } else {
        setT(data.t);
        setN(data.n);
        const servers = data.parties.map((party: string) => {
          return {
            // Change id, name, address
            id: party,
            name: party,
            address: party,
            status: 'online',
          };
        });
        setServers(servers);
        toast.success(data.result);
      }
    })
    .catch((err) => {
      toast.error(err.message);
    });
};

export const handleShamir = async (
  secret: number,
  id: number,
  t: number,
  n: number,
  servers: string[],
): Promise<void> => {
  const shares = shamir(t, n, BigInt(secret))[0];

  console.log('shares', shares);

  const messageSuccess: [string, string][] = [];
  const messageError: [string, string][] = [];

  const promises = servers.map((server, i) =>
    fetch(`${server}/api/set-shares`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: id,
        share: shares[i][1].toString(),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageError.push([server, data.detail]);
          return;
        }
        messageSuccess.push([server, data.result]);
      })
      .catch((err) => {
        messageError.push([server, err.message]);
      }),
  );

  await Promise.all(promises);

  if (messageError.length !== 0)
    toast.error(
      <div>
        {messageError.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );

  if (messageSuccess.length !== 0)
    toast.success(
      <div>
        {messageSuccess.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
};

export function shamir(
  t: number,
  n: number,
  k0: bigint,
): [Array<[number, bigint]>, bigint] {
  const p = BigInt(PRIME_NUMBER);

  const coefficients: bigint[] = Array.from({ length: t }, () =>
    getSecureRandomInt(BigInt(0), p),
  );
  coefficients[0] = k0;

  if (coefficients[coefficients.length - 1] === BigInt(0)) {
    coefficients[coefficients.length - 1] = getSecureRandomInt(BigInt(1), p);
  }

  const shares: Array<[number, bigint]> = [];

  for (let i = 1; i <= n; i++) {
    shares.push([i, f(i, coefficients, p, t)]);
  }

  return [shares, p];
}

export function getSecureRandomInt(min: bigint, max: bigint): bigint {
  // min is inclusive, max is exclusive
  const range = max - min;
  const bitLength = range.toString(2).length;
  let randomNumber = BigInt(0);

  while (randomNumber < min) {
    randomNumber = getRandomBits(bitLength);
  }

  return (randomNumber % range) + min;
}

export function getRandomBits(bitLength: number): bigint {
  const byteLength = Math.ceil(bitLength / 8);
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);

  let randomNumber = BigInt(0);
  for (let i = 0; i < byteLength; i++) {
    randomNumber = (randomNumber << BigInt(8)) | BigInt(randomBytes[i]);
  }

  return randomNumber;
}

export function f(
  x: number,
  coefficients: bigint[],
  p: bigint,
  t: number,
): bigint {
  let result = BigInt(0);
  for (let i = 0; i < t; i++) {
    result +=
      BigInt(coefficients[i]) * binaryExponentiation(BigInt(x), BigInt(i), p);
  }
  return result % p;
}

export function binaryExponentiation(b: bigint, k: bigint, n: bigint): bigint {
  let a = BigInt(1);
  while (k > 0) {
    if (k & BigInt(1)) {
      a = (a * b) % n;
    }
    b = (b * b) % n;
    k = BigInt(k) >> BigInt(1);
  }
  return a;
}

export const handleMultiplication = async (
  firstClientId: number,
  secondClientId: number,
  servers: string[],
): Promise<[string, number][]> => {
  const messageQSuccess: [string, string][] = [];
  const messageQError: [string, string][] = [];

  const promises_q = servers.map((server) =>
    fetch(`${server}/api/redistribute-q`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageQError.push([server, data.detail]);
          return;
        }
        messageQSuccess.push([server, data.result]);
      })
      .catch((err) => {
        messageQError.push([server, err.message]);
      }),
  );

  await Promise.all(promises_q);

  if (messageQError.length !== 0) {
    toast.error(
      <div>
        {messageQError.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  if (messageQSuccess.length !== 0) {
    toast.success(
      <div>
        {messageQSuccess.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  const messageRSuccess: [string, string][] = [];
  const messageRError: [string, string][] = [];

  const promises_r = servers.map((server) =>
    fetch(`${server}/api/redistribute-r`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        first_client_id: firstClientId,
        second_client_id: secondClientId,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageRError.push([server, data.detail]);
          return;
        }
        messageRSuccess.push([server, data.result]);
      })
      .catch((err) => {
        messageQError.push([server, err.message]);
      }),
  );

  await Promise.all(promises_r);

  if (messageRError.length !== 0) {
    toast.error(
      <div>
        {messageRError.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  if (messageRSuccess.length !== 0) {
    toast.success(
      <div>
        {messageRSuccess.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  const messageSuccessCalculateShare: [string, string][] = [];
  const messageErrorCalculateShare: [string, string][] = [];

  const promises = servers.map((server) =>
    fetch(`${server}/api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageErrorCalculateShare.push([server, data.detail]);
          return;
        }
        messageSuccessCalculateShare.push([server, data.result]);
      })
      .catch((err) => {
        messageErrorCalculateShare.push([server, err.message]);
      }),
  );

  await Promise.all(promises);

  if (messageErrorCalculateShare.length !== 0) {
    toast.error(
      <div>
        {messageErrorCalculateShare.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  if (messageSuccessCalculateShare.length !== 0) {
    toast.success(
      <div>
        {messageSuccessCalculateShare.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }
  const secrets: [string, number][] = [];
  const messageErrorReconstruct: [string, number][] = [];

  const promisesReconstruct = servers.map((server) =>
    fetch(`${server}/api/reconstruct-secret`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageErrorReconstruct.push([server, data.detail]);
          return;
        }
        secrets.push([server, data.secret]);
      })
      .catch((err) => {
        messageErrorReconstruct.push([server, err.message]);
      }),
  );

  await Promise.all(promisesReconstruct);

  if (messageErrorReconstruct.length !== 0) {
    toast.error(
      <div>
        {messageErrorReconstruct.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  return secrets;
};
