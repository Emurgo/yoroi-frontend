// @flow
import './lib/test-config';
import { schema } from 'lovefield';
import AdaApi from './index';
import { RustModule } from './lib/cardanoCrypto/rustLoader';
import {
  silenceLogsForTesting,
} from '../../utils/logging';

import type {
  FilterUsedRequest,
  FilterUsedResponse,
} from './lib/state-fetch/types';

import {
  loadLovefieldDB,
} from './lib/storage/lovefieldDatabase';

beforeAll(async () => {
  await RustModule.load();
  await loadLovefieldDB({
    storeType: schema.DataStoreType.MEMORY,
  });
  silenceLogsForTesting();
});

test('Restore wallet', async () => {
  async function checkAddressesInUse(_body: FilterUsedRequest): Promise<FilterUsedResponse> {
    return [];
  }

  const restoreRequest = {
    recoveryPhrase: SEED,
    walletName: 'mywallet',
    walletPassword: '123',
    checkAddressesInUse
  };

  const response : any = await AdaApi.prototype.restoreWallet(restoreRequest);
  expect(response.accounts[0].plate.id).toEqual('DBJL-9530');
});

test('Restore wallet for transfer', async () => {
  // Make sure localStorage is not accessed.
  const localStorage = window.localStorage;
  delete window.localStorage;

  async function checkAddressesInUse(_body: FilterUsedRequest): Promise<FilterUsedResponse> {
    return [];
  }

  const recoveryPhrase = SEED;

  const response  = await AdaApi.prototype.restoreWalletForTransfer({
    recoveryPhrase,
    checkAddressesInUse });

  expect(response.addresses).toEqual(RESTORED_ADDRESSES);

  window.localStorage = localStorage;
});

const SEED = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';

const RESTORED_ADDRESSES = [
  { address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf',
    accountIndex: 0,
    addressType: 'External',
    index: 0 },
  { address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM',
    accountIndex: 0,
    addressType: 'External',
    index: 1 },
  { address: 'Ae2tdPwUPEZ8gpDazyi8VtcGMnMrkpKxts6ppCT45mdT6WMZEwHXs7pP8Tg',
    accountIndex: 0,
    addressType: 'External',
    index: 2 },
  { address: 'Ae2tdPwUPEZBFhEBZgvm3fQeuW2zBPochfQehFtXn6tCRQy7zsQ9Px88jsH',
    accountIndex: 0,
    addressType: 'External',
    index: 3 },
  { address: 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo',
    accountIndex: 0,
    addressType: 'External',
    index: 4 },
  { address: 'Ae2tdPwUPEYxzZH7sSyyXK6DDmjCxRajXUXFqbEjtxfPN7HZzQfXr4hxKwT',
    accountIndex: 0,
    addressType: 'External',
    index: 5 },
  { address: 'Ae2tdPwUPEZMUQdcxu6AEoq9wzL8mtSCKhWUNhYjXqq1aenwimnLaCit1FY',
    accountIndex: 0,
    addressType: 'External',
    index: 6 },
  { address: 'Ae2tdPwUPEYw9VvB1BQqgGd8XzNfgz4mv9gBjB9P8EtvPQfz4D8Gt4xnQog',
    accountIndex: 0,
    addressType: 'External',
    index: 7 },
  { address: 'Ae2tdPwUPEYxYn4T89ffVqpDwqwsMDAZTcfnWBqAkjoem5sgaVKGU3FUB2E',
    accountIndex: 0,
    addressType: 'External',
    index: 8 },
  { address: 'Ae2tdPwUPEZBZ9aYboQuf5PFcjuZRCosBhLkUCxSQw1vqk3iyK5qGo5CJWe',
    accountIndex: 0,
    addressType: 'External',
    index: 9 },
  { address: 'Ae2tdPwUPEZ4yCaYs3j7pPPaM9iA3KLruJkKjmUBBLKYzpJUHutWdS6EkKa',
    accountIndex: 0,
    addressType: 'External',
    index: 10 },
  { address: 'Ae2tdPwUPEZ5zV8wqC9gPvkDtr2MS3Ys2vQbyPdM4wsdnzevbqnaJFg62hk',
    accountIndex: 0,
    addressType: 'External',
    index: 11 },
  { address: 'Ae2tdPwUPEZAD1KmgTQ4zS6Q5s4VXWDXqB3ZmM1abQGoyrGN8qCsZyXc3vf',
    accountIndex: 0,
    addressType: 'External',
    index: 12 },
  { address: 'Ae2tdPwUPEZ1SFwQMGroCTabfCPJ1RiK8D2F11C1vTMi14tX1XK2uogRWqM',
    accountIndex: 0,
    addressType: 'External',
    index: 13 },
  { address: 'Ae2tdPwUPEZJ8CiSFVipoupUVBGRAVbmbpmKPCXsExcwzZd6FcNpAcExY1r',
    accountIndex: 0,
    addressType: 'External',
    index: 14 },
  { address: 'Ae2tdPwUPEZCeLRPNcreMQAAfJFs9ZzBeFK9pUXhMnL3ooQP9TajasVsYKK',
    accountIndex: 0,
    addressType: 'External',
    index: 15 },
  { address: 'Ae2tdPwUPEZGvzYwTSUZhTxDviZSKqLZDYVkcT4rLqckFXvdTMv21CinTCd',
    accountIndex: 0,
    addressType: 'External',
    index: 16 },
  { address: 'Ae2tdPwUPEZKEsQJxXQvRJHLCWRGFQNWFgHhroEw9GGXV25wRBH8TAmwCRi',
    accountIndex: 0,
    addressType: 'External',
    index: 17 },
  { address: 'Ae2tdPwUPEZ6u2i2u4iLhd9Rq4rUBsVaMpqQWuTCXMitMmugcsr9iANjNEE',
    accountIndex: 0,
    addressType: 'External',
    index: 18 },
  { address: 'Ae2tdPwUPEYxsngJhnW49jrmGuaCvQK34Hqrnx5w5SWxgfjDkSDcnrRdT5G',
    accountIndex: 0,
    addressType: 'External',
    index: 19 },
  { address: 'Ae2tdPwUPEZ3Kt2BJnDMQggxEA4c9MTagByH41rJkv2k82dBch2nqMAdyHJ',
    accountIndex: 0,
    addressType: 'Internal',
    index: 0 },
  { address: 'Ae2tdPwUPEYzRJEAdyX24mYTmKx8dMHYQgxkBcgnsdFHPPvmySMS9cspZmj',
    accountIndex: 0,
    addressType: 'Internal',
    index: 1 },
  { address: 'Ae2tdPwUPEZ5yxTy5wcVmUXP5xkkDSXfrgqWp8Px6knmUiFjJEytBGXfWoS',
    accountIndex: 0,
    addressType: 'Internal',
    index: 2 },
  { address: 'Ae2tdPwUPEZ3pKEVL1tMmz8EzaE9Hyn2cVJKf3TFVCjw7xeLFBdJngUXPXG',
    accountIndex: 0,
    addressType: 'Internal',
    index: 3 },
  { address: 'Ae2tdPwUPEZLhFMGWjMpCWwsUiN58DkKmtg6r7dFJfXhmUyzNGPb2Crg141',
    accountIndex: 0,
    addressType: 'Internal',
    index: 4 },
  { address: 'Ae2tdPwUPEZBTYWkpudmAYdyQM9CHcV9orEVnVSan6EP2xNApB5bLE1XsKF',
    accountIndex: 0,
    addressType: 'Internal',
    index: 5 },
  { address: 'Ae2tdPwUPEYzdEoDVNdvLz6kFgVsjEyUJ1z3mHzAT1HotQk31tRvGNM4tge',
    accountIndex: 0,
    addressType: 'Internal',
    index: 6 },
  { address: 'Ae2tdPwUPEZ2NvzdECB18z3SBTc8SVvx1PJuxPKsnncygEZeeKNaAeBeLDg',
    accountIndex: 0,
    addressType: 'Internal',
    index: 7 },
  { address: 'Ae2tdPwUPEZ3iMfnFWSM3zeqpNwAdT62jNgiA27x1ZEacpfVbViYWb7gyNP',
    accountIndex: 0,
    addressType: 'Internal',
    index: 8 },
  { address: 'Ae2tdPwUPEYykz6FbkuRf9ScRwZc8F1xobMPyzECjsdMyqobn2tVpL6pdDW',
    accountIndex: 0,
    addressType: 'Internal',
    index: 9 },
  { address: 'Ae2tdPwUPEZ8SUET76NhRhJ6TNLW48csZ4e87hu6JYobQvVTKSYDMPBU5Xa',
    accountIndex: 0,
    addressType: 'Internal',
    index: 10 },
  { address: 'Ae2tdPwUPEZBryPRKuib729PQNSBxzgXsTVwmg3CWQjZaAS7pj4WZNa3VR6',
    accountIndex: 0,
    addressType: 'Internal',
    index: 11 },
  { address: 'Ae2tdPwUPEZ6yyMqXFEYmLvqXqktpU8LR6oW8qVbaap7R2YJGc9xDbs2Eb6',
    accountIndex: 0,
    addressType: 'Internal',
    index: 12 },
  { address: 'Ae2tdPwUPEZ4gRK6Qhj3Mo4tSU4LkRiqVgsQm6rg8YBGC6fqVLNqA9REr7c',
    accountIndex: 0,
    addressType: 'Internal',
    index: 13 },
  { address: 'Ae2tdPwUPEZ3xWm3GHFVNtVWcnyTGpSF6AjyhZJY3DuSGvf3WvwLzkBisFw',
    accountIndex: 0,
    addressType: 'Internal',
    index: 14 },
  { address: 'Ae2tdPwUPEZL9BqYXyY6zQQoatsWbkcN6g46NfvCfaE8mQppcVgentdAXeo',
    accountIndex: 0,
    addressType: 'Internal',
    index: 15 },
  { address: 'Ae2tdPwUPEYzxRSsoqFY2Ym7zQfSdosY1bdK8KZTEjPjcobHd3GbZ3qZpvB',
    accountIndex: 0,
    addressType: 'Internal',
    index: 16 },
  { address: 'Ae2tdPwUPEZEdntBfWRH5ucNrQd7RwPjZ2QZEkxJbsJDBrCGnTtjqfb8Aph',
    accountIndex: 0,
    addressType: 'Internal',
    index: 17 },
  { address: 'Ae2tdPwUPEZKDMDuUZBUSokAzeJwNpqHorYEPuycXBMMFameoVFkxwpLheC',
    accountIndex: 0,
    addressType: 'Internal',
    index: 18 },
  { address: 'Ae2tdPwUPEZ2E4XNPVarvndsmkC8n2vS9rXJfCxny9oVacViLRDpeKioaAc',
    accountIndex: 0,
    addressType: 'Internal',
    index: 19 }
];
