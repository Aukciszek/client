import { PRIME_NUMBER } from '../app/constants';

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

export function getPower2Factors(n: bigint): [number, bigint] {
  if (n <= 0) {
    return [0, BigInt(0)];
  }

  let r = 0;

  while (n % BigInt(2) === BigInt(0)) {
    n = n / BigInt(2);
    r += 1;
  }

  return [r, n];
}

export function millerRabinPrimeTest(n: bigint, k: number): boolean {
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

// test if const PRIME_NUMBER is prime
// function PRIME_NUMBERPassesMillerRabinPrimeTest()
// {
//   assert(millerRabinPrimeTest(BigInt(PRIME_NUMBER), 2048) == true);
// }