import { shamir } from '../helpers';

export const handleShamir = async (
  secret: number,
  id: number,
  t: number,
  n: number,
  servers: string[],
): Promise<void> => {
  const shares = shamir(t, n, BigInt(secret))[0];

  const promises = servers.map((server, i) =>
    fetch(`${server}/api/set-shares`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: id,
        share: Number(shares[i][1]),
      }),
    }).then((res) => res.json()),
  );

  await Promise.all(promises);
};

export const handleCalculateR = async (
  firstClientId: number,
  secondClientId: number,
  servers: string[],
): Promise<void> => {
  const promises = servers.map((server) =>
    fetch(`${server}/api/calculate-r`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        first_client_id: firstClientId,
        second_client_id: secondClientId,
      }),
    }).then((res) => res.json()),
  );

  await Promise.all(promises);
};

export const handleSendRToOtherParties = async (
  servers: string[],
): Promise<void> => {
  const promises = servers.map((server) =>
    fetch(`${server}/api/send-r-to-parties`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    }).then((res) => res.json()),
  );

  await Promise.all(promises);
};

export const handleCalculateMultiplicativeShare = async (
  servers: string[],
): Promise<void> => {
  const promises = servers.map((server) =>
    fetch(`${server}/api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    }).then((res) => res.json()),
  );

  await Promise.all(promises);
};

export const handleReconstructSecret = async (
  servers: string[],
): Promise<[string, number][]> => {
  const secrets: [string, number][] = [];

  const promises = servers.map((server) =>
    fetch(`${server}/api/reconstruct-secret`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        secrets.push([server, data.secret]);
        return data;
      }),
  );

  await Promise.all(promises);
  return secrets;
};
