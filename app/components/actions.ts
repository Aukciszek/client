import { PRIME_NUMBER } from '../constants';

export const sendInitialData = async (
  servers: string[],
  setInitialValuesError: React.Dispatch<React.SetStateAction<string>>,
  formData: FormData,
): Promise<void> => {
  const t = Number(formData.get('t'));
  const n = Number(formData.get('n'));

  const promises = servers.map(
    (server, i) =>
      new Promise((resolve) => {
        fetch(`${server}/api/initial-values`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            t,
            n,
            id: i + 1,
            p: PRIME_NUMBER,
            parties: servers,
          }),
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            setInitialValuesError(data.detail);
          }
          resolve(data);
        });
      }),
  );

  await Promise.all(promises);
};
