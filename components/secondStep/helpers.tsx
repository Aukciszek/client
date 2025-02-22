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

  return secrets
};