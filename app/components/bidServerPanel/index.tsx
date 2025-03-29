'use client';

import { IoMdAddCircleOutline, IoMdSend } from 'react-icons/io';
import { MdOutlineInfo } from 'react-icons/md';
import FormField from '../ui/formField';
import Button from '../ui/button';
import type { BidServerPanelProps } from './interface';

export default function BidServerPanel({
  headline,
  description,
  connectedToMaster,
  isDisabled,
  onSubmit,
  isAdmin,
  firstValue,
  secondValue,
  setFirstValue,
  setSecondValue,
  initialValues,
}: BidServerPanelProps) {
  return (
    <div className='w-full bg-secondary border border-primary-border p-6 rounded-xl shadow-sm lg:basis-1/2 lg:w-auto'>
      <h2 className='text-xl font-bold tracking-wide font-headline lg:text-2xl'>
        {headline}
      </h2>
      <p className='text-sm md:text-base'>{description}</p>
      <form className='flex flex-col gap-4 pt-6' onSubmit={onSubmit}>
        {isAdmin ? (
          initialValues ? (
            <>
              <FormField
                id='t'
                text='T'
                value={firstValue}
                setValue={setFirstValue}
                placeholder='e.g. 1'
                type='number'
              />
              <FormField
                id='n'
                text='Number of servers'
                value={secondValue}
                setValue={setSecondValue}
                placeholder='e.g. 2'
                type='number'
              />
            </>
          ) : (
            <>
              <FormField
                id='serverName'
                text='Server Name'
                value={firstValue}
                setValue={setFirstValue}
                placeholder='e.g. Auction Server 1'
                type='text'
              />
              <FormField
                id='serverAddress'
                text='Server Address'
                value={secondValue}
                setValue={setSecondValue}
                placeholder='https://server-address.example.com'
                type='text'
              />
            </>
          )
        ) : (
          <>
            <FormField
              id='id'
              text='ID'
              value={firstValue}
              setValue={setFirstValue}
              placeholder='Enter your ID'
              type='text'
            />
            <FormField
              id='bidAmount'
              text='Bid Amount'
              value={firstValue}
              setValue={setFirstValue}
              placeholder='Enter your bid amount'
              type='number'
            />
          </>
        )}
        <Button
          variant='default'
          disabled={isDisabled}
          style='flex justify-center items-center gap-2'
        >
          {isAdmin ? (
            initialValues ? (
              <>Set intial values</>
            ) : (
              <>
                Add Server <IoMdAddCircleOutline className='h-4 w-4' />
              </>
            )
          ) : (
            <>
              Submit Bid <IoMdSend className='h-4 w-4' />
            </>
          )}
        </Button>
      </form>
      {!connectedToMaster && (
        <div className='flex items-center gap-2 mt-4 px-4 py-2 text-xs rounded-xl bg-teal-100 lg:text-sm'>
          <MdOutlineInfo className='h-4 w-4' />
          You must connect to a server before submitting a bid
        </div>
      )}
    </div>
  );
}
