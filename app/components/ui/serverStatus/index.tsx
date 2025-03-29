'use client';

import type { ServerStatusProps } from './interface';

export default function ServerStatus({ status }: ServerStatusProps) {
  return (
    <div
      className={`w-min mx-auto rounded-full px-2 py-1 text-xs lg:text-sm lg:px-3 lg:py-1.5 ${
        status === 'online'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {status}
    </div>
  );
}
