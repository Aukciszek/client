'use client';

import { useState } from 'react';

function binaryExponentiation(b: number, k: number, n: number): number {
  let a = 1;
  while (k > 0) {
    if (k & 1) {
      a = (a * b) % n;
    }
    b = (b * b) % n;
    k = k >> 1;
  }
  return a;
}

function getRandomBits(bitLength: number): number {
  const byteLength = Math.ceil(bitLength / 8);
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);

  let randomNumber = 0;
  for (let i = 0; i < byteLength; i++) {
    randomNumber = (randomNumber << 8) | randomBytes[i];
  }

  return randomNumber;
}

function getSecureRandomInt(min: number, max: number): number {
  const range = max - min;
  if (range <= 0) throw new Error('Invalid range for secure random generation');

  const byteArray = new Uint8Array(4);
  let randomInt = 0;

  do {
    crypto.getRandomValues(byteArray);
    randomInt =
      (byteArray[0] << 24) |
      (byteArray[1] << 16) |
      (byteArray[2] << 8) |
      byteArray[3];
    randomInt = Math.abs(randomInt % range);
  } while (randomInt < 0);

  return randomInt + min;
}

function getPower2Factors(n: number): [number, number] {
  let r = 0;
  let d = n;

  while (d > 0 && d % 2 === 0) {
    d = Math.floor(d / 2);
    r += 1;
  }

  return [r, d];
}

function f(x: number, coefficients: number[], p: number, t: number): number {
  let result = 0;
  for (let i = 0; i < t; i++) {
    result += coefficients[i] * binaryExponentiation(x, i, p);
  }
  return result % p;
}

function millerRabinPrimeTest(n: number, k: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0) return false;

  const [r, d] = getPower2Factors(n - 1);

  for (let i = 0; i < k; i++) {
    let a = getRandomBits(n.toString(2).length);

    while (a < 2 || a >= n - 2 + 1) {
      a = getRandomBits(n.toString(2).length);
    }

    let x = binaryExponentiation(a, d, n);

    if (x === 1 || x === n - 1) {
      continue;
    }

    let n_1_found = false;

    for (let j = 0; j < r - 1; j++) {
      x = binaryExponentiation(x, 2, n);

      if (x === n - 1) {
        n_1_found = true;
        break;
      }
    }

    if (!n_1_found) {
      return false;
    }
  }

  return true;
}

function shamir(
  t: number,
  n: number,
  k0: number,
): [Array<[number, number]>, number] {
  const maxVal = Math.max(k0, n);
  let p = getSecureRandomInt(maxVal + 1, 2 * maxVal); // TODO: Need to generate a prime number with more bytes

  while (!millerRabinPrimeTest(p, 100)) {
    p = getSecureRandomInt(maxVal + 1, 2 * maxVal);
  }

  const coefficients: number[] = Array.from({ length: t }, () =>
    getSecureRandomInt(0, p - 1),
  );
  coefficients[0] = k0;

  if (coefficients[coefficients.length - 1] === 0) {
    coefficients[coefficients.length - 1] = getSecureRandomInt(1, p - 1);
  }

  const shares: Array<[number, number]> = [];

  for (let i = 1; i <= n; i++) {
    shares.push([i, f(i, coefficients, p, t)]);
  }

  return [shares, p];
}

export default function Home() {
  const [t, setT] = useState<number>(0);
  const [n, setN] = useState<number>(0);
  const [k0, setK0] = useState<number>(0);
  const [shares, setShares] = useState<Array<[number, number]>>([]);
  const [p, setP] = useState<number>(0);

  const handleSubmit = () => {
    const [shares, p] = shamir(t, n, k0);
    setShares(shares);
    setP(p);
  };

  const handleTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setT(parseInt(e.target.value));
  };

  const handleNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setN(parseInt(e.target.value));
  };

  const handleK0Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setK0(parseInt(e.target.value));
  };

  return (
    <div className='container flex flex-col p-4 gap-4'>
      <div>
        <label htmlFor='t'>t: </label>
        <input type='text' value={t} onChange={handleTChange} />
      </div>
      <div>
        <label htmlFor='n'>n: </label>
        <input type='text' value={n} onChange={handleNChange} />
      </div>
      <div>
        <label htmlFor='k0'>k0: </label>
        <input type='text' value={k0} onChange={handleK0Change} />
      </div>
      <button
        className='w-36 bg-slate-700 text-white p-2 rounded'
        onClick={handleSubmit}
      >
        Submit
      </button>
      <div>
        <h2 className='mt-4'>Prime number (p): {p}</h2>
        <h2 className='mt-4'>Shares:</h2>
        <ul>
          {shares.map(([x, y]) => (
            <li key={x}>
              {x}: {y}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
