import { toast } from 'react-toastify';
import { k, l, PRIME_NUMBER } from '../constants';
import type {
  PromiseResultFinalSecrets,
  PromiseResultWithSecrets,
} from './interface';
import type {
  StringNumberPair,
  StringPair,
  PromiseResult,
  NumberPair,
} from '../interface';

export const sendInitialData = async (
  servers: string[],
  formData: FormData,
): Promise<void> => {
  const t = Number(formData.get('t'));
  const n = Number(formData.get('n'));
  const messageInfo: StringPair[] = [];
  const errorInfo: StringPair[] = [];

  await Promise.all(
    servers.map((server, i) =>
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
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            errorInfo.push([server, data.detail]);
            return;
          }
          messageInfo.push([server, data.result]);
          handleClearData();
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          first_client_id: biddersIds[0],
          second_client_id: biddersIds[1],
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
      fetch(`${server}/api/reconstruct-secret`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
      fetch(`${server}/api/reconstruct-secret`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
        },
        body: JSON.stringify({
          take_value_from_temporary_zZ: take_value_from_temporary_zZ,
          zZ_first_multiplication_factor: zZ_first_multiplication_factor,
          zZ_second_multiplication_factor: zZ_second_multiplication_factor,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          console.error(`Error resetting ${party}: ${data.detail}`);
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
        },
        body: JSON.stringify({
          calculate_for_xor: true,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
        }
      }),
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
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          console.error(`Error resetting ${party}: ${data.detail}`);
        }
      })
      .catch((err) => {
        console.error(`Error resetting ${party}: ${err.message}`);
      }),
  );
  await Promise.all(resetTasks);

  const qTasks = parties.map((party) =>
    fetch(`${party}/api/redistribute-q`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          console.error(`Error redistributing q for ${party}: ${data.detail}`);
        }
      })
      .catch((err) => {
        console.error(`Error redistributing q for ${party}: ${err.message}`);
      }),
  );
  await Promise.all(qTasks);

  const rTasks = parties.map((party) =>
    fetch(`${party}/api/redistribute-r`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
          console.error(`Error redistributing r for ${party}: ${data.detail}`);
        }
      })
      .catch((err) => {
        console.error(`Error redistributing r for ${party}: ${err.message}`);
      }),
  );
  await Promise.all(rTasks);

  const multiplicativeShareTasks = parties.map((party) =>
    fetch(`${party}/api/calculate-multiplicative-share`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        calculate_for_xor: true,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          console.error(
            `Error calculating multiplicative share for ${party}: ${data.detail}`,
          );
        }
      })
      .catch((err) => {
        console.error(
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
          console.error(
            `Error calculating comparison result for ${party}: ${data.detail}`,
          );
        }
      })
      .catch((err) => {
        console.error(
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
): void => {
  const allResultsMatch = areAllValuesTheSame(
    recalculateFinalSecretsInfo.finalSecrets,
  );

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

export const performComparison = async (
  serverAddresses: string[],
  biddersIdsInfo: NumberPair,
): Promise<void> => {
  let currentWinner = biddersIdsInfo.pop();
  if (!currentWinner) return;

  let currentContender;
  let recalculateFinalSecretsInfo;

  while (biddersIdsInfo.length > 0) {
    currentContender = biddersIdsInfo.pop();
    if (currentContender === undefined) return;

    const resetComparisonInfo = await resetComparison(serverAddresses);

    handleToast(
      resetComparisonInfo,
      'Reset comparison success!',
      'Reset comparison failed!',
    );

    const calculateAComparisonInfo = await calculateAComparison(
      serverAddresses,
      [currentWinner, currentContender],
    );

    handleToast(
      calculateAComparisonInfo,
      'Calculate A comparison success!',
      'Calculate A comparison failed!',
    );

    const promisesReconstructInfo =
      await promisesReconstruct(serverAddresses);

    handleToast(
      promisesReconstructInfo,
      'Reconstruct secrets success!',
      'Reconstruct secrets failed!',
    );

    const calculateZInfo = await calculateZ(
      serverAddresses,
      promisesReconstructInfo.secrets[0][1],
    );

    handleToast(
      calculateZInfo,
      'Calculate Z success!',
      'Calculate Z failed!',
    );

    const popZInfo = await popZ(serverAddresses);

    handleToast(popZInfo, 'Pop Z success!', 'Pop Z failed!');
    
    await calculateFinalComparisonResult(
      serverAddresses,
      promisesReconstructInfo.secrets[0][1],
    );

    recalculateFinalSecretsInfo =
      await recalculateFinalSecrets(serverAddresses);

    handleToast(
      recalculateFinalSecretsInfo,
      'Recalculate final secrets success!',
      'Recalculate final secrets failed!',
    );
    
    const firstResult = recalculateFinalSecretsInfo.finalSecrets[0][1];
    
    if (parseInt(firstResult, 16) === 0) currentWinner = currentContender;
  }
  
  if (recalculateFinalSecretsInfo === undefined) return;
  handleWinnerToast(recalculateFinalSecretsInfo, currentWinner);
}