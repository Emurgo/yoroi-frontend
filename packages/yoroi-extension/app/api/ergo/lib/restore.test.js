// @flow

import '../../ada/lib/test-config';
import type { lf$Database } from 'lovefield';
import { schema } from 'lovefield';
import { RustModule } from '../../ada/lib/cardanoCrypto/rustLoader';
import { CoinTypes, WalletTypePurpose, HARD_DERIVATION_START } from '../../../config/numbersConfig';
import { walletChecksum } from '@emurgo/cip4-js';
import {
  asGetPublicKey
} from '../../ada/lib/storage/models/PublicDeriver/traits';
import ErgoApi from '../index';
import {
  loadLovefieldDB,
} from '../../ada/lib/storage/database/index';
import { generateWalletRootKey } from './crypto/wallet';
import {
  networks,
} from '../../ada/lib/storage/database/prepackaged/networks';
import { derivePath, } from '../../common/lib/crypto/keys/keyRepository';

let db: lf$Database;

const recoveryPhrase = [
  'page',
  'spend',
  'garbage',
  'manual',
  'skirt',
  'toy',
  'whip',
  'hawk',
  'ritual',
  'coil',
  'crime',
  'coil',
].join(' ');

beforeAll(async () => {
  await RustModule.load();
  db = await loadLovefieldDB(schema.DataStoreType.MEMORY);
});

test('Derive Ergo address', async () => {
  const rootKey = generateWalletRootKey(recoveryPhrase);
  const addressKey = derivePath(
    rootKey,
    [
      WalletTypePurpose.BIP44,
      CoinTypes.ERGO,
      HARD_DERIVATION_START + 0,
      0,
      0
    ]
  );
  const ergoAddr = RustModule.SigmaRust.Address.from_public_key(
    addressKey.toPublic().key.publicKey
  );
  expect(
    ergoAddr.to_base58(RustModule.SigmaRust.NetworkPrefix.Mainnet)
  ).toEqual('9hzFPHkkhATNUeaT9pJGVJqkrbUL523HRt6j5R8ok1ck3JduvCY');
});

test('Restore Ergo wallet', async () => {
  const restoreRequest = {
    db,
    recoveryPhrase,
    walletName: 'mywallet',
    walletPassword: '123',
    network: networks.ErgoMainnet,
    accountIndex: HARD_DERIVATION_START + 0,
  };

  const response = await ErgoApi.prototype.restoreWallet(restoreRequest);
  expect(response.publicDerivers.length).toEqual(1);
  const pubDeriver = response.publicDerivers[0];
  const asGetPublicKeyInstance = asGetPublicKey(pubDeriver);
  expect(asGetPublicKeyInstance != null).toEqual(true);
  if (asGetPublicKeyInstance != null) {
    const pubKey = await asGetPublicKeyInstance.getPublicKey();
    const plate = walletChecksum(pubKey.Hash);
    expect(plate.TextPart).toEqual('SZAX-0852');
  }
});
