// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import type {
  KeyRow,
} from '../database/primitives/tables';
import {
  ModifyKey,
} from '../database/primitives/api/write';

import type {
  IChangePasswordRequest, IChangePasswordResponse,
} from './common/interfaces';

import {
  encryptWithPassword,
  decryptWithPassword,
} from '../../../../../utils/passwordCipher';

import { RustModule } from '../../cardanoCrypto/rustLoader';

import { WrongPassphraseError } from '../../cardanoCrypto/cryptoErrors';

export function normalizeBip32Ed25519ToPubDeriverLevel(request: {|
  privateKeyRow: $ReadOnly<KeyRow>,
  password: null | string,
  path: Array<number>,
|}): {|
  prvKeyHex: string,
  pubKeyHex: string,
|} {
  const prvKey = decryptKey(
    request.privateKeyRow,
    request.password,
  );
  const wasmKey = RustModule.WalletV3.Bip32PrivateKey.from_bytes(Buffer.from(prvKey, 'hex'));
  const newKey = deriveKey(
    wasmKey,
    request.path,
  );
  return {
    prvKeyHex: Buffer.from(newKey.as_bytes()).toString('hex'),
    pubKeyHex: Buffer.from(newKey.to_public().as_bytes()).toString('hex'),
  };
}

export function decryptKey(
  keyRow: $ReadOnly<KeyRow>,
  password: null | string,
): string {
  let rawKey;
  if (keyRow.IsEncrypted) {
    if (password === null) {
      throw new WrongPassphraseError();
    }
    const keyBytes = decryptWithPassword(password, keyRow.Hash);
    rawKey = Buffer.from(keyBytes).toString('hex');

  } else {
    rawKey = keyRow.Hash;
  }
  return rawKey;
}


export function deriveKey(
  startingKey: RustModule.WalletV3.Bip32PrivateKey,
  pathToPublic: Array<number>,
): RustModule.WalletV3.Bip32PrivateKey {
  let currKey = startingKey;
  for (let i = 0; i < pathToPublic.length; i++) {
    currKey = currKey.derive(
      pathToPublic[i],
    );
  }

  return currKey;
}

export async function rawChangePassword(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {| ModifyKey: Class<ModifyKey>, |},
  request: {| ...IChangePasswordRequest, oldKeyRow: $ReadOnly<KeyRow>, |},
): Promise<IChangePasswordResponse> {
  const decryptedKey = decryptKey(
    request.oldKeyRow,
    request.oldPassword,
  );

  let newKey = decryptedKey;
  if (request.newPassword !== null) {
    newKey = encryptWithPassword(
      request.newPassword,
      Buffer.from(decryptedKey, 'hex'),
    );
  }

  const newRow: KeyRow = {
    KeyId: request.oldKeyRow.KeyId,
    Hash: newKey,
    IsEncrypted: request.newPassword !== null,
    PasswordLastUpdate: request.currentTime,
  };

  return await deps.ModifyKey.update(
    db, tx,
    newRow,
  );
}
