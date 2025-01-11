import { toast } from 'react-toastify';

export const reset = async (servers: string[]): Promise<void> => {
  let messageSuccess: string = '';
  let messageError: string = '';
  const promises = servers.map(
    (server) =>
      new Promise((resolve) => {
        fetch(`${server}/api/reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageError += `${server}: ${data.detail}`;
            resolve(data);
            return;
          }
          messageSuccess += `${server}: ${data.result}`;
          resolve(data);
        });
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

export const hardReset = async (servers: string[]): Promise<void> => {
  let messageSuccess: string = '';
  let messageError: string = '';
  const promises = servers.map(
    (server) =>
      new Promise((resolve) => {
        fetch(`${server}/api/factory-reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageError += `${server}: ${data.detail}`;
            resolve(data);
            return;
          }
          messageSuccess += `${server}: ${data.result}`;
          resolve(data);
        });
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
