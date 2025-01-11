import { toast } from 'react-toastify';
import { PRIME_NUMBER } from '../app/constants';

export const sendInitialData = async (
  servers: string[],
  formData: FormData,
): Promise<void> => {
  const t = Number(formData.get('t'));
  const n = Number(formData.get('n'));
  let messageSuccess: string = '';
  let messageError: string = '';

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
            messageError += `${server}: ${data.detail}\n`;
            resolve(data);
            return;
          }
          messageSuccess += `${server}: ${data.result}\n`;
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
