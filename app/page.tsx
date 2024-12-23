'use client';

import { useState } from 'react';

const bigIntMax = (...args: bigint[]): bigint =>
  args.reduce((m, e) => (e > m ? e : m));

function binaryExponentiation(b: bigint, k: bigint, n: bigint): bigint {
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

function getRandomBits(bitLength: number): bigint {
  const byteLength = Math.ceil(bitLength / 8);
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);

  let randomNumber = BigInt(0);
  for (let i = 0; i < byteLength; i++) {
    randomNumber = (randomNumber << BigInt(8)) | BigInt(randomBytes[i]);
  }

  return randomNumber;
}

function getSecureRandomInt(min: bigint, max: bigint): bigint {
  // min is inclusive, max is exclusive
  const range = max - min;
  const bitLength = range.toString(2).length;
  let randomNumber = BigInt(0);

  while (randomNumber < min) {
    randomNumber = getRandomBits(bitLength);
  }

  return (randomNumber % range) + min;
}

function getPower2Factors(n: bigint): [number, bigint] {
  let r = 0;

  while (n > 0 && n % BigInt(2) === BigInt(0)) {
    n = n / BigInt(2);
    r += 1;
  }

  return [r, n];
}

function millerRabinPrimeTest(n: bigint, k: number): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % BigInt(2) === BigInt(0)) return false;

  const [r, d] = getPower2Factors(n - BigInt(1));

  for (let i = 0; i < k; i++) {
    let a = getRandomBits(n.toString(2).length);

    while (a < 2 || a >= n - BigInt(2) + BigInt(1)) {
      a = getRandomBits(n.toString(2).length);
    }

    let x = binaryExponentiation(BigInt(a), BigInt(d), BigInt(n));

    if (x === BigInt(1) || x === n - BigInt(1)) {
      continue;
    }

    let n_1_found = false;

    for (let j = 0; j < r - 1; j++) {
      x = binaryExponentiation(BigInt(x), BigInt(2), BigInt(n));

      if (x === n - BigInt(1)) {
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

function f(x: number, coefficients: bigint[], p: bigint, t: number): bigint {
  let result = BigInt(0);
  for (let i = 0; i < t; i++) {
    result +=
      BigInt(coefficients[i]) * binaryExponentiation(BigInt(x), BigInt(i), p);
  }
  return result % p;
}

function shamir(
  t: number,
  n: number,
  k0: bigint,
): [Array<[number, bigint]>, bigint] {
  const maxVal = bigIntMax(k0, BigInt(n));
  let p = getSecureRandomInt(maxVal + BigInt(1), BigInt(2) * maxVal); // TODO: Need to find greater prime number

  while (!millerRabinPrimeTest(p, 64)) {
    p = getSecureRandomInt(maxVal + BigInt(1), BigInt(2) * maxVal);
  }

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

export default function Home() {
  const [t, setT] = useState<number>(0);
  const [n, setN] = useState<number>(0);
  const [k0, setK0] = useState<bigint>(BigInt(0));
  const [shares, setShares] = useState<Array<[number, bigint]>>([]);
  const [p, setP] = useState<bigint>(BigInt(0));

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
    setK0(BigInt(e.target.value));
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
        <input type='text' value={k0.toString()} onChange={handleK0Change} />
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
