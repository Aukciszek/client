'use server';

export const reset = async (servers: string[]): Promise<void> => {
  const promises = servers.map(
    (server) =>
      new Promise((resolve) => {
        fetch(`${server}/api/reset'`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }).then(async (res) => {
          const data = await res.json();
          resolve(data);
        });
      }),
  );

  await Promise.all(promises);
};

export const hardReset = async (servers: string[]): Promise<void> => {
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
          resolve(data);
        });
      }),
  );

  await Promise.all(promises);
};
