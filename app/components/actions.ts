import { PRIME_NUMBER } from '../constants';
import { shamir } from './helpers';

export const sendInitialData = async (
  servers: string[],
  formData: FormData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const t = Number(formData.get('t')?.toString());
  const n = Number(formData.get('n')?.toString());

  const promises = servers.entries().map(
    ([i, server]) =>
      new Promise((resolve) => {
        fetch(`${server}/api/initial-values`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            t: t,
            n: n,
            id: i + 1,
            p: PRIME_NUMBER,
            parties: servers,
          }),
        }).then((res) => {
          resolve(res.body);
        });
      }),
  );
  await Promise.all(promises);
};
