import { toast } from 'react-toastify';
import { k, l, PRIME_NUMBER } from '../../constants';
import { getTokenForServer } from '../../utils/auth';
import type {
  PromiseResultFinalSecrets,
  PromiseResultWithSecrets,
} from './interface';
import type {
  StringNumberPair,
  StringPair,
  PromiseResult,
  NumberPair,
} from '../../interface';

export const sendInitialData = async (servers: string[]): Promise<void> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server, i) =>
      fetch(`${server}/api/initial-values`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        body: JSON.stringify({
          id: i + 1,
          p: PRIME_NUMBER,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  if (errorInfo.length !== 0 && areAllValuesTheSame(errorInfo)) {
    toast.error(<div>Something went wrong while sending initial data</div>);
    return;
  }

  if (messageInfo.length !== 0 && areAllValuesTheSame(messageInfo)) {
    toast.success(<div>Successfully sent initial values to all servers</div>);
    return;
  }

  toast.error(<div>Something went wrong while submitting bid</div>);
};

export const reset = async (
  servers: string[],
  handleClearDataSecondStep: () => void,
): Promise<void> => {
  const messageSuccess: [string, string][] = [];
  const messageError: [string, string][] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            messageError.push([server, data.detail]);
            return;
          }

          messageSuccess.push([server, data.result]);
          handleClearDataSecondStep();
        })
        .catch((err) => {
          messageError.push([server, err.message]);
        }),
    ),
  );

  if (messageError.length !== 0) {
    toast.error(
      <div>
        {messageError.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }

  if (messageSuccess.length !== 0) {
    toast.success(
      <div>
        {messageSuccess.map(([server, result]) => (
          <p key={server}>
            <span className='font-bold'>{server}</span>: {result}
          </p>
        ))}
      </div>,
    );
  }
};

export const hardReset = async (
  servers: string[],
  handleClearData: () => void,
): Promise<void> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/factory-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  if (errorInfo.length !== 0 && areAllValuesTheSame(errorInfo)) {
    toast.error(<div>Something went wrong while reseting servers</div>);
    return;
  }

  if (messageInfo.length !== 0 && areAllValuesTheSame(messageInfo)) {
    // Only call handleClearData once after successful reset of all servers
    handleClearData();
    toast.success(<div>All servers have been successfully reset</div>);
    return;
  }

  toast.error(<div>Something went wrong while reseting servers</div>);
};

export const getRandomString = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const deeplyCheckIDs = (data: NumberPair[]): boolean => {
  if (data.length === 0) {
    return true;
  }

  const firstElement = data[0];

  if (!Array.isArray(firstElement)) {
    return false;
  }

  for (let i = 1; i < data.length; i++) {
    const currentElement = data[i];

    if (!Array.isArray(currentElement)) {
      return false;
    }

    for (let j = 0; j < firstElement.length; j++) {
      if (currentElement[j] !== firstElement[j]) {
        return false;
      }
    }
  }

  return true;
};

export const getBiddersIds = async (
  servers: string[],
): Promise<NumberPair | string> => {
  const messageInfo: NumberPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/get-bidders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push(data.detail);
            return;
          }
          messageInfo.push(data.bidders);
        })
        .catch((err) => {
          errorInfo.push(err.message);
        }),
    ),
  );

  const areTheSame = deeplyCheckIDs(messageInfo);

  if (!areTheSame) return 'IDs are not the same';

  return messageInfo[0];
};

export const resetCalculation = async (
  servers: string[],
): Promise<PromiseResult> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server: string) =>
      fetch(`${server}/api/reset-calculation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  return { messageInfo, errorInfo };
};

export const resetComparison = async (
  servers: string[],
): Promise<PromiseResult> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/reset-comparison`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  return { messageInfo, errorInfo };
};

export const calculateA = async (servers: string[]): Promise<PromiseResult> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-A`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  return { messageInfo, errorInfo };
};

export const calculateShareOfRandomNumber = async (
  servers: string[],
): Promise<PromiseResult> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-share-of-random-number`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  return { messageInfo, errorInfo };
};

export const calculateAComparison = async (
  servers: string[],
  biddersIds: NumberPair,
): Promise<PromiseResult> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-a-comparison`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        body: JSON.stringify({
          first_client_id: biddersIds[0],
          second_client_id: biddersIds[1],
          l: l,
          k: k,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  return { messageInfo, errorInfo };
};

export const promisesReconstruct = async (
  servers: string[],
): Promise<PromiseResultWithSecrets> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];
  const secrets: StringNumberPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/reconstruct-secret/comparison_a`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          secrets.push([server, data.secret as number]);
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  return { messageInfo, errorInfo, secrets };
};

export const calculateZ = async (
  servers: string[],
  openedA: number,
): Promise<PromiseResult> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-z-comparison`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        body: JSON.stringify({
          opened_a: openedA,
          l: l,
          k: k,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  return { messageInfo, errorInfo };
};

export const popZ = async (servers: string[]): Promise<PromiseResult> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  for (let i = 0; i < l; i++) {
    await romb(servers);

    await Promise.all(
      servers.map((server) =>
        fetch(`${server}/api/pop-zZ`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(server)}`,
          },
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
              errorInfo.push([server, data.detail]);
              return;
            }
            messageInfo.push([server, data.result]);
          })
          .catch((err) => {
            errorInfo.push([server, err.message]);
          }),
      ),
    );
  }

  return { messageInfo, errorInfo };
};

export const recalculateFinalSecrets = async (
  servers: string[],
): Promise<PromiseResultFinalSecrets> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];
  const finalSecrets: StringPair[] = [];

  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/reconstruct-secret/res`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
          finalSecrets.push([server, data.secret]);
        })
        .catch((err) => {
          errorInfo.push([server, err.message]);
        }),
    ),
  );

  return { messageInfo, errorInfo, finalSecrets };
};

export const xor = async (
  parties: string[],
  take_value_from_temporary_zZ: boolean,
  zZ_first_multiplication_factor: number[],
  zZ_second_multiplication_factor: number[],
) => {
  const tasks = [];

  for (const party of parties) {
    tasks.push(
      fetch(`${party}/api/redistribute-q`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
      }),
    );
  }
  await Promise.all(tasks);

  const tasks2 = [];
  for (const party of parties) {
    tasks2.push(
      fetch(`${party}/api/redistribute-r`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
        body: JSON.stringify({
          take_value_from_temporary_zZ: take_value_from_temporary_zZ,
          zZ_first_multiplication_factor: zZ_first_multiplication_factor,
          zZ_second_multiplication_factor: zZ_second_multiplication_factor,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          toast.error(`Error resetting ${party}: ${data.detail}`);
        }
      }),
    );
  }
  await Promise.all(tasks2);

  const tasks3 = [];
  for (const party of parties) {
    tasks3.push(
      fetch(`${party}/api/calculate-multiplicative-share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
        body: JSON.stringify({
          calculate_for_xor: true,
        }),
      })
    );
  }
  await Promise.all(tasks3);

  const tasks4 = [];
  for (const party of parties) {
    tasks4.push(
      fetch(`${party}/api/xor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
        body: JSON.stringify({
          take_value_from_temporary_zZ: take_value_from_temporary_zZ,
          zZ_first_multiplication_factor: zZ_first_multiplication_factor,
          zZ_second_multiplication_factor: zZ_second_multiplication_factor,
        }),
      }),
    );
  }
  await Promise.all(tasks4);

  const tasks5 = [];
  for (const party of parties) {
    tasks5.push(
      fetch(`${party}/api/reset-calculation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
      }),
    );
  }
  await Promise.all(tasks5);
};

export async function calculateFinalComparisonResult(
  parties: string[],
  openedA: number,
) {
  const resetTasks = parties.map((party) =>
    fetch(`${party}/api/reset-calculation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(party)}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          toast.error(`Error resetting ${party}: ${data.detail}`);
        }
      })
      .catch((err) => {
        toast.error(`Error resetting ${party}: ${err.message}`);
      }),
  );
  await Promise.all(resetTasks);

  const qTasks = parties.map((party) =>
    fetch(`${party}/api/redistribute-q`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(party)}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          toast.error(`Error redistributing q for ${party}: ${data.detail}`);
        }
      })
      .catch((err) => {
        toast.error(`Error redistributing q for ${party}: ${err.message}`);
      }),
  );
  await Promise.all(qTasks);

  const rTasks = parties.map((party) =>
    fetch(`${party}/api/redistribute-r`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(party)}`,
      },
      body: JSON.stringify({
        calculate_final_comparison_result: true,
        opened_a: openedA,
        l: l,
        k: k,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          toast.error(`Error redistributing r for ${party}: ${data.detail}`);
        }
      })
      .catch((err) => {
        toast.error(`Error redistributing r for ${party}: ${err.message}`);
      }),
  );
  await Promise.all(rTasks);

  const multiplicativeShareTasks = parties.map((party) =>
    fetch(`${party}/api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(party)}`,
      },
      body: JSON.stringify({
        calculate_for_xor: true,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          toast.error(
            `Error calculating multiplicative share for ${party}: ${data.detail}`,
          );
        }
      })
      .catch((err) => {
        toast.error(
          `Error calculating multiplicative share for ${party}: ${err.message}`,
        );
      }),
  );
  await Promise.all(multiplicativeShareTasks);

  const comparisonResultTasks = parties.map((party) =>
    fetch(`${party}/api/calculate-comparison-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(party)}`,
      },
      body: JSON.stringify({
        opened_a: openedA,
        l: l,
        k: k,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          toast.error(
            `Error calculating comparison result for ${party}: ${data.detail}`,
          );
        }
      })
      .catch((err) => {
        toast.error(
          `Error calculating comparison result for ${party}: ${err.message}`,
        );
      }),
  );
  await Promise.all(comparisonResultTasks);
}

export const romb = async (serverAdresses: string[]) => {
  const messageCalculateRomb: [string, string][] = [];
  const errorCalculateRomb: [string, string][] = [];
  let Qs = [];
  let Rs = [];
  let Multishares = [];

  const taskRomb1 = serverAdresses.map((server) =>
    fetch(`${server}/api/reset-calculation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageCalculateRomb.push([server, data.detail]);
          return;
        }
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb1);

  const taskRomb2 = serverAdresses.map((server) =>
    fetch(`${server}/api/redistribute-q`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageCalculateRomb.push([server, data.detail]);
          return;
        }
        Qs.push([server, data.secret]);
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb2);

  const taskRomb3 = serverAdresses.map((server) =>
    fetch(`${server}/api/redistribute-r`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
      body: JSON.stringify({
        take_value_from_temporary_zZ: false,
        zZ_first_multiplication_factor: [0, 0],
        zZ_second_multiplication_factor: [1, 0],
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          errorCalculateRomb.push([server, data.detail]);

          return;
        }
        messageCalculateRomb.push([server, data.detail]);
        Rs.push([server, data.secret]);
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb3);

  const taskRomb4 = serverAdresses.map((server) =>
    fetch(`${server}/api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
      body: JSON.stringify({
        set_in_temporary_zZ_index: 0,
        calculate_for_xor: false,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          errorCalculateRomb.push([server, data.detail]);

          return;
        }

        messageCalculateRomb.push([server, data.detail]);
        Multishares.push([server, data.secret]);
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb4);

  const taskRomb5 = serverAdresses.map((server) =>
    fetch(`${server}/api/reset-calculation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageCalculateRomb.push([server, data.detail]);
          return;
        }
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb5);

  await xor(serverAdresses, false, [0, 1], [1, 1]);

  Qs = [];
  Rs = [];

  const taskRomb6 = serverAdresses.map((server) =>
    fetch(`${server}/api/redistribute-q`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageCalculateRomb.push([server, data.detail]);
          return;
        }
        Qs.push([server, data.secret]);
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb6);

  const taskRomb7 = serverAdresses.map((server) =>
    fetch(`${server}/api/redistribute-r`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
      body: JSON.stringify({
        take_value_from_temporary_zZ: true,
        zZ_first_multiplication_factor: [0, 0],
        zZ_second_multiplication_factor: [1],
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          errorCalculateRomb.push([server, data.detail]);

          return;
        }
        Rs.push([server, data.secret]);
        messageCalculateRomb.push([server, data.detail]);
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb7);

  Multishares = [];

  const taskRomb8 = serverAdresses.map((server) =>
    fetch(`${server}/api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
      body: JSON.stringify({
        set_in_temporary_zZ_index: 1,
        calculate_for_xor: false,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          errorCalculateRomb.push([server, data.detail]);

          return;
        }

        Multishares.push([server, data.secret]);
        messageCalculateRomb.push([server, data.detail]);
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb8);

  const taskRomb9 = serverAdresses.map((server) =>
    fetch(`${server}/api/reset-calculation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          messageCalculateRomb.push([server, data.detail]);
          return;
        }
      })
      .catch((err) => {
        errorCalculateRomb.push([server, err.message]);
      }),
  );
  await Promise.all(taskRomb9);

  await xor(serverAdresses, true, [0, 1], [1]);
};

export const areAllValuesTheSame = <T extends string | number>(
  array: [string, T][],
): boolean => {
  if (array.length <= 1) return true;
  const firstValue = array[0][1];
  return array.every((item) => item[1] === firstValue);
};

export const handleToast = (
  promiseResult: PromiseResult,
  successMessage: string,
  errorMessage: string,
): void => {
  const isMatch = areAllValuesTheSame(promiseResult.messageInfo);

  if (isMatch && promiseResult.messageInfo.length !== 0) {
    toast.success(successMessage, {
      autoClose: 5000,
      closeOnClick: true,
      draggable: true,
    });
    return;
  } else {
    toast.error(errorMessage, {
      autoClose: 5000,
      closeOnClick: true,
      draggable: true,
    });
  }
};

export const handleBiddersIdsToast = (
  biddersIdsInfo: NumberPair | string,
  successMessage: string,
  errorMessage: string,
): void => {
  if (Array.isArray(biddersIdsInfo)) {
    toast.success(successMessage, {
      autoClose: 5000,
      closeOnClick: true,
      draggable: true,
    });
    return;
  } else {
    toast.error(errorMessage, {
      autoClose: 5000,
      closeOnClick: true,
      draggable: true,
    });
  }
};

export const handleWinnerToast = (
  recalculateFinalSecretsInfo: PromiseResultFinalSecrets,
  currentWinner: number,
  loadingToastId?: string,
): void => {
  const allResultsMatch = areAllValuesTheSame(
    recalculateFinalSecretsInfo.finalSecrets,
  );

  if (loadingToastId) {
    toast.dismiss(loadingToastId);
  }

  if (allResultsMatch) {
    toast.success(
      `Auction completed successfully! Client with ID: ${currentWinner}, is the winner!`,
      {
        autoClose: false,
        closeOnClick: true,
        draggable: true,
      },
    );
  } else {
    toast.error('Auction failed. Results do not match!', {
      autoClose: false,
      closeOnClick: true,
      draggable: true,
    });
  }
};

export const comparison = async (
  servers: string[],
  openedA: number,
  l: number,
  k: number,
): Promise<void> => {
  // Prepare z tables for all servers
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/prepare-z-tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        body: JSON.stringify({
          opened_a: openedA.toString(16),
          l: l,
          k: k,
        }),
      }),
    ),
  );

  for (let i = 0; i < l; i++) {
    await calculateZTables(servers, l);
  }

  // Initialize z and Z for all servers
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/initialize-z-and-Z`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        body: JSON.stringify({
          l: l,
        }),
      }),
    ),
  );

  for (let i = l - 1; i >= 0; i--) {
    // Prepare for next round of comparison
    await Promise.all(
      servers.map((server) =>
        fetch(`${server}/api/prepare-for-next-romb/${i}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(server)}`,
          },
        }),
      ),
    );

    // x AND y
    await multiplyShares(servers, 'x', 'y', 'z');

    // Reset calculation for all servers
    await Promise.all(
      servers.map((server) =>
        fetch(`${server}/api/reset-calculation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(server)}`,
          },
        }),
      ),
    );

    // X XOR Y
    await xorShares(servers, 'X', 'Y', 'Z');

    // Reset calculation for all servers
    await Promise.all(
      servers.map((server) =>
        fetch(`${server}/api/reset-calculation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(server)}`,
          },
        }),
      ),
    );

    // Calculate x AND (X XOR Y)
    await multiplyShares(servers, 'x', 'Z', 'Z');

    // Reset calculation for all servers
    await Promise.all(
      servers.map((server) =>
        fetch(`${server}/api/reset-calculation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(server)}`,
          },
        }),
      ),
    );

    // x AND (X XOR Y) XOR X
    await xorShares(servers, 'Z', 'X', 'Z');

    // Reset calculation for all servers
    await Promise.all(
      servers.map((server) =>
        fetch(`${server}/api/reset-calculation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(server)}`,
          },
        }),
      ),
    );
  }

  // [res] = a_l XOR [r_l] XOR [Z]
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/prepare-shares-for-res-xors/${l}/${l}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // a_l XOR [r_l] -> assign to [res]
  await xorShares(servers, 'a_l', 'r_l', 'res');

  // Reset calculation for all servers
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/reset-calculation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // [res] XOR [Z] -> assign to [res]
  await xorShares(servers, 'res', 'Z', 'res');

  // Reset calculation for all servers
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/reset-calculation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );
};

export const performComparison = async (
  serverAddresses: string[],
  biddersIdsInfo: number[],
  loadingToastId: string,
): Promise<void> => {
  let currentWinner = biddersIdsInfo.pop();
  if (!currentWinner) {
    toast.dismiss(loadingToastId);
    toast.error('No bidders found to perform comparison', {
      autoClose: false,
      closeOnClick: true,
      draggable: true
    });
    return;
  }

  let currentContender;
  let recalculateFinalSecretsInfo;

  await calculateA(serverAddresses);

  while (biddersIdsInfo.length > 0) {
    currentContender = biddersIdsInfo.pop();
    if (currentContender === undefined) {
      toast.dismiss(loadingToastId);
      return;
    }

    await resetComparison(serverAddresses);

    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < l + k + 1; i++) {
        await shareRandomBit(serverAddresses, PRIME_NUMBER, i);
      }
    }

    await calculateShareOfRandomNumber(serverAddresses);

    await calculateAComparison(serverAddresses, [
      currentWinner,
      currentContender,
    ]);

    const promisesReconstructInfo = await promisesReconstruct(serverAddresses);

    await comparison(
      serverAddresses,
      promisesReconstructInfo.secrets[0][1],
      l,
      k,
    );

    recalculateFinalSecretsInfo =
      await recalculateFinalSecrets(serverAddresses);

    const firstResult = recalculateFinalSecretsInfo.finalSecrets[0][1];

    // reverse auction - find the smallest bid
    // if the result of comparison is 1 (currentWinner >= currentContender)
    // than change currentWinner = currentContender
    if (parseInt(firstResult, 16) === 1) {
      currentWinner = currentContender;
    }
  }

  if (recalculateFinalSecretsInfo === undefined) {
    toast.dismiss(loadingToastId);
    toast.error('Error determining auction winner', {
      autoClose: false,
      closeOnClick: true,
      draggable: true,
    });
    return;
  }

  // Handle final winner announcement
  handleWinnerToast(recalculateFinalSecretsInfo, currentWinner, loadingToastId);
};

export const addShares = async (
  servers: string[],
  firstShareName: string,
  secondShareName: string,
  resultShareName: string,
): Promise<PromiseResult> => {
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  // Step 1: Calculate additive share for all servers
  const calculateTasks = servers.map((server) =>
    fetch(`${server}/api/calculate-additive-share`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
      body: JSON.stringify({
        first_share_name: firstShareName,
        second_share_name: secondShareName,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          errorInfo.push([server, data.detail]);
          return;
        }
        messageInfo.push([server, 'Additive shares calculated']);
      })
      .catch((err) => {
        errorInfo.push([server, err.message]);
      }),
  );
  await Promise.all(calculateTasks);

  // Step 2: Set the result share to the additive share
  const setResultTasks = servers.map((server) =>
    fetch(`${server}/api/set-additive-share/${resultShareName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          errorInfo.push([server, data.detail]);
          return;
        }
        messageInfo.push([
          server,
          `Result share ${resultShareName} set to additive share`,
        ]);
      })
      .catch((err) => {
        errorInfo.push([server, err.message]);
      }),
  );
  await Promise.all(setResultTasks);

  return { messageInfo, errorInfo };
};

export async function multiplyShares(
  servers: string[],
  firstShareName: string,
  secondShareName: string,
  resultShareName: string,
) {
  // Step 1: Redistribute q values
  const qTasks = servers.map((server) =>
    fetch(`${server}/api/redistribute-q`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    }).catch((err) =>
      toast.error(`Error redistributing q for ${server}: ${err.message}`),
    ),
  );
  await Promise.all(qTasks);

  // Step 2: Redistribute r values
  const rTasks = servers.map((server) =>
    fetch(`${server}/api/redistribute-r`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
      body: JSON.stringify({
        first_share_name: firstShareName,
        second_share_name: secondShareName,
      }),
    }).catch((err) =>
      toast.error(`Error redistributing r for ${server}: ${err.message}`),
    ),
  );
  await Promise.all(rTasks);

  // Step 3: Calculate multiplicative shares
  const multiplicativeShareTasks = servers.map((server) =>
    fetch(`${server}/api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    }).catch((err) =>
      toast.error(
        `Error calculating multiplicative share for ${server}: ${err.message}`,
      ),
    ),
  );
  await Promise.all(multiplicativeShareTasks);

  // Step 4: Set the result share
  const setResultShareTasks = servers.map((server) =>
    fetch(`${server}/api/set-multiplicative-share/${resultShareName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${getTokenForServer(server)}`,
      },
    }).catch((err) =>
      toast.error(
        `Error setting result share ${resultShareName} for ${server}: ${err.message}`,
      ),
    ),
  );
  await Promise.all(setResultShareTasks);
}

export const xorShares = async (
  servers: string[],
  firstShareName: string,
  secondShareName: string,
  resultShareName: string,
): Promise<void> => {
  // Step 1: Calculate additive shares
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-additive-share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        body: JSON.stringify({
          first_share_name: firstShareName,
          second_share_name: secondShareName,
        }),
      }),
    ),
  );

  // Step 2: Redistribute q values
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/redistribute-q`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Step 3: Redistribute r values
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/redistribute-r`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
        body: JSON.stringify({
          first_share_name: firstShareName,
          second_share_name: secondShareName,
        }),
      }),
    ),
  );

  // Step 4: Calculate multiplicative share
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-multiplicative-share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Step 5: Calculate XOR share
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-xor-share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Step 6: Set result share to XOR share
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/set-xor-share/${resultShareName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );
};

export const shareRandomU = async (servers: string[]): Promise<void> => {
  // Step 1: Redistribute u values
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/redistribute-u`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Step 2: Calculate shared u values
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-shared-u`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );
};

export function smallestSquareRootModulo(
  number: number,
  modulus: number,
): number {
  let result = 0;
  for (let i = 0; i < modulus; i++) {
    if ((i * i) % modulus === number) {
      result = i;
      break;
    }
  }
  return result;
}

export function modularMultiplicativeInverse(b: number, n: number): number {
  let A = n;
  let B = b;
  let U = 0;
  let V = 1;

  while (B !== 0) {
    const q = Math.floor(A / B);
    [A, B] = [B, A - q * B];
    [U, V] = [V, U - q * V];
  }

  if (U < 0) {
    return U + n;
  }
  return U;
}

export async function shareRandomBit(
  parties: string[],
  p: string,
  bitIndex: number,
) {
  let openedV = 0;

  while (openedV <= 0) {
    await shareRandomU(parties);

    await multiplyShares(parties, 'u', 'u', 'v');

    // Reset calculation
    await Promise.all(
      parties.map((party) =>
        fetch(`${party}/api/reset-calculation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(party)}`,
          },
        }),
      ),
    );

    // Reconstruct secret
    const results = await Promise.all(
      parties.map((party) =>
        fetch(`${party}/api/reconstruct-secret/v`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(party)}`,
          },
        }).then((res) => res.json()),
      ),
    );

    for (let i = 0; i < results.length; i++) {
      openedV = parseInt(results[i]?.secret, 16);
    }
  }

  const w = smallestSquareRootModulo(openedV, parseInt(p, 16));
  const inverseW = modularMultiplicativeInverse(w, parseInt(p, 16));

  // Set shares of inverse_w
  await Promise.all(
    parties.map((party) =>
      fetch(`${party}/api/set-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
        body: JSON.stringify({
          share_name: 'dummy_sharing_of_inverse_w_',
          share_value: inverseW.toString(16),
        }),
      }),
    ),
  );

  await multiplyShares(
    parties,
    'dummy_sharing_of_inverse_w_',
    'u',
    'inverse_w_times_u',
  );

  // Reset calculation
  await Promise.all(
    parties.map((party) =>
      fetch(`${party}/api/reset-calculation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
      }),
    ),
  );

  // Dummy sharing of 1
  await Promise.all(
    parties.map((party) =>
      fetch(`${party}/api/set-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
        body: JSON.stringify({
          share_name: 'dummy_sharing_of_one',
          share_value: '0x1',
        }),
      }),
    ),
  );

  await addShares(
    parties,
    'inverse_w_times_u',
    'dummy_sharing_of_one',
    'inverse_w_times_u_plus_one',
  );

  const inverseTwo = modularMultiplicativeInverse(2, parseInt(p, 16));

  // Dummy sharing of 1/2
  await Promise.all(
    parties.map((party) =>
      fetch(`${party}/api/set-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
        body: JSON.stringify({
          share_name: 'dummy_sharing_of_inverse_two',
          share_value: inverseTwo.toString(16),
        }),
      }),
    ),
  );

  await multiplyShares(
    parties,
    'inverse_w_times_u_plus_one',
    'dummy_sharing_of_inverse_two',
    'temporary_random_bit',
  );

  // Final reset
  await Promise.all(
    parties.map((party) =>
      fetch(`${party}/api/reset-calculation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
      }),
    ),
  );

  // Set random bit share for all
  await Promise.all(
    parties.map((party) =>
      fetch(`${party}/api/set-temporary-random-bit-share/${bitIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(party)}`,
        },
      }),
    ),
  );
}

export const calculateZTableXOR = async (
  servers: string[],
  index: number,
): Promise<void> => {
  // Calculate additive shares of z table for all servers
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-additive-share-of-z-table/${index}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Calculate and redistribute q value
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/redistribute-q`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Calculate and redistribute r values
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-r-of-z-table/${index}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Calculate the multiplicative share
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-multiplicative-share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Calculate the XOR share
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/calculate-xor-share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );

  // Set the z table to XOR share
  await Promise.all(
    servers.map((server) =>
      fetch(`${server}/api/set-z-table-to-xor-share/${index}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getTokenForServer(server)}`,
        },
      }),
    ),
  );
};

export const calculateZTables = async (
  servers: string[],
  l: number,
): Promise<void> => {
  for (let i = l - 1; i >= 0; i--) {
    await calculateZTableXOR(servers, i);

    // Reset calculation for all servers
    await Promise.all(
      servers.map((server) =>
        fetch(`${server}/api/reset-calculation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getTokenForServer(server)}`,
          },
        }),
      ),
    );
  }
};
