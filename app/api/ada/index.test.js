// @flow
import './lib/test-config';
import { schema } from 'lovefield';
import type { lf$Database } from 'lovefield';
import AdaApi from './index';
import { RustModule } from './lib/cardanoCrypto/rustLoader';
import { generateWalletRootKey } from './lib/cardanoCrypto/cryptoWallet';
import { HARD_DERIVATION_START, } from '../../config/numbersConfig';
import { TransferSource } from '../../types/TransferTypes';
import {
  silenceLogsForTesting,
} from '../../utils/logging';

import type {
  FilterUsedRequest,
  FilterUsedResponse,
} from '../common/lib/state-fetch/currencySpecificTypes';

import {
  loadLovefieldDB,
} from './lib/storage/database/index';
import { legacyWalletChecksum } from '@emurgo/cip4-js';
import { asGetPublicKey } from './lib/storage/models/PublicDeriver/traits';
import {
  networks,
} from './lib/storage/database/prepackaged/networks';

let db: lf$Database;

beforeAll(async () => {
  await RustModule.load();
  db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
  silenceLogsForTesting();
});

test('Restore wallet', async () => {
  const restoreRequest = {
    db,
    recoveryPhrase: TX_TEST_MNEMONIC_1,
    walletName: 'mywallet',
    walletPassword: '123',
    network: networks.ByronMainnet,
  };

  const response = await AdaApi.prototype.restoreWallet(restoreRequest);
  expect(response.publicDerivers.length).toEqual(1);
  const pubDeriver = response.publicDerivers[0];
  const asGetPublicKeyInstance = asGetPublicKey(pubDeriver);
  expect(asGetPublicKeyInstance != null).toEqual(true);
  if (asGetPublicKeyInstance != null) {
    const pubKey = await asGetPublicKeyInstance.getPublicKey();
    const plate = legacyWalletChecksum(pubKey.Hash);
    expect(plate.TextPart).toEqual('DBJL-9530');
  }
});

test('Restore wallet for transfer', async () => {
  async function checkAddressesInUse(_body: FilterUsedRequest): Promise<FilterUsedResponse> {
    return [];
  }

  const recoveryPhrase = TX_TEST_MNEMONIC_1;

  const response  = await AdaApi.prototype.restoreWalletForTransfer({
    rootPk: generateWalletRootKey(recoveryPhrase),
    checkAddressesInUse,
    accountIndex: HARD_DERIVATION_START + 0,
    transferSource: TransferSource.BYRON,
  });

  expect(response).toEqual(RESTORED_ADDRESSES);
});

const TX_TEST_MNEMONIC_1 = 'prevent company field green slot measure chief hero apple task eagle sunset endorse dress seed';

const RESTORED_ADDRESSES = {
  masterKey: 'c8bf95a562d0f668340b0dc383860596225422eaf69c592c66b70c19b5e59744d8eed3ad296a0e3335d9dbe7d2200d525653d2c3ff4be10d4a96e14eb1a503d66238b3b8cf2ab4e2df16f6e49a0f86dff6c9ed409e91492071624781bcaa12d5',
  addresses: [{
    address: 'Ae2tdPwUPEZCfyggUgSxD1E5UCx5f5hrXCdvQjJszxE7epyZ4ox9vRNUbHf',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 0]
    }
  }, {
    address: 'Ae2tdPwUPEZFXnw5T5aXoaP28yw4mRLeYomaG9mPGCFbPUtw368ZWYKp1zM',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 1]
    }
  }, {
    address: 'Ae2tdPwUPEZ8gpDazyi8VtcGMnMrkpKxts6ppCT45mdT6WMZEwHXs7pP8Tg',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 2]
    }
  }, {
    address: 'Ae2tdPwUPEZBFhEBZgvm3fQeuW2zBPochfQehFtXn6tCRQy7zsQ9Px88jsH',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 3]
    }
  }, {
    address: 'Ae2tdPwUPEZ6tzHKyuMLL6bh1au5DETgb53PTmJAN9aaCLtaUTWHvrS2mxo',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 4]
    }
  }, {
    address: 'Ae2tdPwUPEYxzZH7sSyyXK6DDmjCxRajXUXFqbEjtxfPN7HZzQfXr4hxKwT',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 5]
    }
  }, {
    address: 'Ae2tdPwUPEZMUQdcxu6AEoq9wzL8mtSCKhWUNhYjXqq1aenwimnLaCit1FY',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 6]
    }
  }, {
    address: 'Ae2tdPwUPEYw9VvB1BQqgGd8XzNfgz4mv9gBjB9P8EtvPQfz4D8Gt4xnQog',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 7]
    }
  }, {
    address: 'Ae2tdPwUPEYxYn4T89ffVqpDwqwsMDAZTcfnWBqAkjoem5sgaVKGU3FUB2E',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 8]
    }
  }, {
    address: 'Ae2tdPwUPEZBZ9aYboQuf5PFcjuZRCosBhLkUCxSQw1vqk3iyK5qGo5CJWe',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 9]
    }
  }, {
    address: 'Ae2tdPwUPEZ4yCaYs3j7pPPaM9iA3KLruJkKjmUBBLKYzpJUHutWdS6EkKa',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 10]
    }
  }, {
    address: 'Ae2tdPwUPEZ5zV8wqC9gPvkDtr2MS3Ys2vQbyPdM4wsdnzevbqnaJFg62hk',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 11]
    }
  }, {
    address: 'Ae2tdPwUPEZAD1KmgTQ4zS6Q5s4VXWDXqB3ZmM1abQGoyrGN8qCsZyXc3vf',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 12]
    }
  }, {
    address: 'Ae2tdPwUPEZ1SFwQMGroCTabfCPJ1RiK8D2F11C1vTMi14tX1XK2uogRWqM',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 13]
    }
  }, {
    address: 'Ae2tdPwUPEZJ8CiSFVipoupUVBGRAVbmbpmKPCXsExcwzZd6FcNpAcExY1r',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 14]
    }
  }, {
    address: 'Ae2tdPwUPEZCeLRPNcreMQAAfJFs9ZzBeFK9pUXhMnL3ooQP9TajasVsYKK',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 15]
    }
  }, {
    address: 'Ae2tdPwUPEZGvzYwTSUZhTxDviZSKqLZDYVkcT4rLqckFXvdTMv21CinTCd',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 16]
    }
  }, {
    address: 'Ae2tdPwUPEZKEsQJxXQvRJHLCWRGFQNWFgHhroEw9GGXV25wRBH8TAmwCRi',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 17]
    }
  }, {
    address: 'Ae2tdPwUPEZ6u2i2u4iLhd9Rq4rUBsVaMpqQWuTCXMitMmugcsr9iANjNEE',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 18]
    }
  }, {
    address: 'Ae2tdPwUPEYxsngJhnW49jrmGuaCvQK34Hqrnx5w5SWxgfjDkSDcnrRdT5G',
    addressing: {
      startLevel: 3,
      path: [2147483648, 0, 19]
    }
  }, {
    address: 'Ae2tdPwUPEZ3Kt2BJnDMQggxEA4c9MTagByH41rJkv2k82dBch2nqMAdyHJ',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 0]
    }
  }, {
    address: 'Ae2tdPwUPEYzRJEAdyX24mYTmKx8dMHYQgxkBcgnsdFHPPvmySMS9cspZmj',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 1]
    }
  }, {
    address: 'Ae2tdPwUPEZ5yxTy5wcVmUXP5xkkDSXfrgqWp8Px6knmUiFjJEytBGXfWoS',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 2]
    }
  }, {
    address: 'Ae2tdPwUPEZ3pKEVL1tMmz8EzaE9Hyn2cVJKf3TFVCjw7xeLFBdJngUXPXG',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 3]
    }
  }, {
    address: 'Ae2tdPwUPEZLhFMGWjMpCWwsUiN58DkKmtg6r7dFJfXhmUyzNGPb2Crg141',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 4]
    }
  }, {
    address: 'Ae2tdPwUPEZBTYWkpudmAYdyQM9CHcV9orEVnVSan6EP2xNApB5bLE1XsKF',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 5]
    }
  }, {
    address: 'Ae2tdPwUPEYzdEoDVNdvLz6kFgVsjEyUJ1z3mHzAT1HotQk31tRvGNM4tge',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 6]
    }
  }, {
    address: 'Ae2tdPwUPEZ2NvzdECB18z3SBTc8SVvx1PJuxPKsnncygEZeeKNaAeBeLDg',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 7]
    }
  }, {
    address: 'Ae2tdPwUPEZ3iMfnFWSM3zeqpNwAdT62jNgiA27x1ZEacpfVbViYWb7gyNP',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 8]
    }
  }, {
    address: 'Ae2tdPwUPEYykz6FbkuRf9ScRwZc8F1xobMPyzECjsdMyqobn2tVpL6pdDW',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 9]
    }
  }, {
    address: 'Ae2tdPwUPEZ8SUET76NhRhJ6TNLW48csZ4e87hu6JYobQvVTKSYDMPBU5Xa',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 10]
    }
  }, {
    address: 'Ae2tdPwUPEZBryPRKuib729PQNSBxzgXsTVwmg3CWQjZaAS7pj4WZNa3VR6',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 11]
    }
  }, {
    address: 'Ae2tdPwUPEZ6yyMqXFEYmLvqXqktpU8LR6oW8qVbaap7R2YJGc9xDbs2Eb6',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 12]
    }
  }, {
    address: 'Ae2tdPwUPEZ4gRK6Qhj3Mo4tSU4LkRiqVgsQm6rg8YBGC6fqVLNqA9REr7c',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 13]
    }
  }, {
    address: 'Ae2tdPwUPEZ3xWm3GHFVNtVWcnyTGpSF6AjyhZJY3DuSGvf3WvwLzkBisFw',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 14]
    }
  }, {
    address: 'Ae2tdPwUPEZL9BqYXyY6zQQoatsWbkcN6g46NfvCfaE8mQppcVgentdAXeo',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 15]
    }
  }, {
    address: 'Ae2tdPwUPEYzxRSsoqFY2Ym7zQfSdosY1bdK8KZTEjPjcobHd3GbZ3qZpvB',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 16]
    }
  }, {
    address: 'Ae2tdPwUPEZEdntBfWRH5ucNrQd7RwPjZ2QZEkxJbsJDBrCGnTtjqfb8Aph',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 17]
    }
  }, {
    address: 'Ae2tdPwUPEZKDMDuUZBUSokAzeJwNpqHorYEPuycXBMMFameoVFkxwpLheC',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 18]
    }
  }, {
    address: 'Ae2tdPwUPEZ2E4XNPVarvndsmkC8n2vS9rXJfCxny9oVacViLRDpeKioaAc',
    addressing: {
      startLevel: 3,
      path: [2147483648, 1, 19]
    }
  }]
};
