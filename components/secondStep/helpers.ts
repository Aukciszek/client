import { toast } from 'react-toastify';
import { shamir } from '../helpers';

export const handleShamir = async (
  secret: number,
  id: number,
  t: number,
  n: number,
  servers: string[],
): Promise<void> => {
  const shares = shamir(t, n, BigInt(secret))[0];

  let messageSuccess: string = '';
  let messageError: string = '';

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
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        messageError += `${server}: ${data.detail}`;
        return;
      }
      messageSuccess += `${server}: ${data.result}`;
    }),
  );

  await Promise.all(promises);

  if (messageError !== '') {
    toast.error(messageError);
  }

  if (messageSuccess !== '') {
    toast.success(messageSuccess);
  }
};

export const handleCalculateQAndRAndRedistribute = async (
  firstClientId: number,
  secondClientId: number,
  servers: string[],
): Promise<void> => {
  let messageQSuccess: string = '';
  let messageQError: string = '';
  const promises_q = servers.map((server) =>
    fetch(`${server}/api/redistribute-q`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        messageQError += `${server}: ${data.detail}`;
        return;
      }
      messageQSuccess += `${server}: ${data.result}`;
    }),
  );

  await Promise.all(promises_q);

  if (messageQError !== '') {
    toast.error(messageQError);
  }

  if (messageQSuccess !== '') {
    toast.success(messageQSuccess);
  }

  let messageRSuccess: string = '';
  let messageRError: string = '';
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
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        messageRError += `${server}: ${data.detail}`;
        return;
      }
      messageRSuccess += `${server}: ${data.result}`;
    }),
  );

  await Promise.all(promises_r);

  if (messageRError !== '') {
    toast.error(messageRError);
  }

  if (messageRSuccess !== '') {
    toast.success(messageRSuccess);
  }
};

export const handleCalculateMultiplicativeShare = async (
  servers: string[],
): Promise<void> => {
  let messageSuccess: string = '';
  let messageError: string = '';
  const promises = servers.map((server) =>
    fetch(`${server}/api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        messageError += `${server}: ${data.detail}`;
        return;
      }
      messageSuccess += `${server}: ${data.result}`;
    }),
  );

  await Promise.all(promises);

  if (messageError !== '') {
    toast.error(messageError);
  }

  if (messageSuccess !== '') {
    toast.success(messageSuccess);
  }
};

export const handleReconstructSecret = async (
  servers: string[],
): Promise<[string, number][]> => {
  const secrets: [string, number][] = [];
  let messageError: string = '';

  const promises = servers.map((server) =>
    fetch(`${server}/api/reconstruct-secret`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        messageError += `${server}: ${data.detail}`;
        return;
      }
      secrets.push([server, data.secret]);
    }),
  );

  await Promise.all(promises);
  if (messageError !== '') {
    toast.error(messageError);
  }

  return secrets;
};
