import { toast } from 'react-toastify';
import { PRIME_NUMBER } from '../../constants';
import { areAllValuesTheSame } from '../admin-dashboard/helpers';
import { getTokenForServer, getServersList } from '../../utils/auth';

export const handleShamir = async (
  secret: number,
  id: number,
  t: number,
  n: number,
  servers: string[],
): Promise<void> => {
  const shares = shamir(t, n, BigInt(secret))[0];

  const messageInfo: [string, string][] = [];
  const errorInfo: [string, string][] = [];

  await Promise.all(
    servers.map((server, i) =>
      fetch(`${server}api/set-shares`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        body: JSON.stringify({
          client_id: id,
          share: shares[i][1].toString(16),
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  if (errorInfo.length !== 0 && areAllValuesTheSame(errorInfo)) {
    toast.error(<div>{errorInfo[0][1]}</div>);
    return;
  }

  if (messageInfo.length !== 0 && areAllValuesTheSame(messageInfo)) {
    toast.success(<div>Successfully submitted bid</div>);
    return;
  }

  toast.error(<div>Something went wrong while submitting bid</div>);
};

export function shamir(
  t: number,
  n: number,
  k0: bigint,
): [Array<[number, bigint]>, bigint] {
  const p = BigInt(PRIME_NUMBER);

  const coefficients: bigint[] = Array.from({ length: t }, () =>
    getSecureRandomInt(BigInt(0), p - BigInt(1)),
  );
  coefficients[0] = k0;

  if (coefficients[coefficients.length - 1] === BigInt(0)) {
    const lastIndex = coefficients.length - 1;
    coefficients[lastIndex] = getSecureRandomInt(BigInt(1), p - BigInt(1));
  }

  const shares: Array<[number, bigint]> = [];

  for (let i = 1; i <= n; i++) {
    shares.push([i, f(i, coefficients, p, t)]);
  }

  return [shares, p];
}

export function getSecureRandomInt(min: bigint, max: bigint): bigint {
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
    fetch(`${server}api/redistribute-q`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
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
    fetch(`${server}api/redistribute-r`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
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
    fetch(`${server}api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
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
    fetch(`${server}api/reconstruct-secret`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
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

export const areAllTheSame = (arr: string[]): boolean => {
  if (arr.length === 0) return true;
  const firstValue = arr[0];
  return arr.every((value) => {
    if (value !== firstValue) {
      return false;
    }
    return true;
  });
};
