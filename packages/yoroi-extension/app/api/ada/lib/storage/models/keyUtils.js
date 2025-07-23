// @flow

import type { lf$Database, lf$Transaction, } from 'lovefield';

import type { KeyRow, } from '../database/primitives/tables';
import { ModifyKey, } from '../database/primitives/api/write';

import type { IChangePasswordRequest, IChangePasswordResponse, } from './common/interfaces';

import { decryptWithPassword, encryptWithPassword, } from '../../../../../utils/passwordCipher';
import type { IKey, KeySubkindType } from '../../cardanoCrypto/keys/types';
import { KeyKind, KeySubkind, } from '../../cardanoCrypto/keys/types';
import {
  asPrivateKeyInstance,
  BIP32ED25519PrivateKey,
  BIP32ED25519PublicKey,
  BIP32PrivateKey,
  BIP32PublicKey,
  derivePath,
} from '../../cardanoCrypto/keys/keyRepository';

import { WrongPassphraseError } from '../../cardanoCrypto/cryptoErrors';
import { bytesToHex, hexToBytes } from '../../../../../coreUtils';

export function normalizeToPubDeriverLevel(request: {|
  privateKeyRow: $ReadOnly<KeyRow>,
  password: null | string,
  path: Array<number>,
|}): {|
  prvKeyHex: string,
  pubKeyHex: string,
|} {
  const key = keyRowToClass({
    keyRow: request.privateKeyRow,
    subkind: KeySubkind.Private,
    password: request.password,
  });

  const newKey = derivePath(
    key,
    request.path,
  );
  const privateKey = asPrivateKeyInstance(newKey);
  if (privateKey == null) throw new Error(`Should never happen`);
  return {
    prvKeyHex: bytesToHex(privateKey.toBuffer()),
    pubKeyHex: bytesToHex(privateKey.toPublic().toBuffer()),
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
    rawKey = bytesToHex(decryptWithPassword(password, keyRow.Hash));
  } else {
    rawKey = keyRow.Hash;
  }
  return rawKey;
}

export function keyRowToClass(request: {|
  keyRow: $ReadOnly<KeyRow>,
  subkind: KeySubkindType,
  password: null | string,
|}): IKey {
  const key = decryptKey(
    request.keyRow,
    request.password,
  );
  switch (request.keyRow.Type) {
    case KeyKind.BIP32ED25519: {
      if (request.subkind === KeySubkind.Private) {
        return BIP32ED25519PrivateKey.fromBuffer(hexToBytes(key));
      }
      if (request.subkind === KeySubkind.Public) {
        return BIP32ED25519PublicKey.fromBuffer(hexToBytes(key));
      }
      throw new Error(`${nameof(keyRowToClass)} unexpected subtype ${request.keyRow.Type}-${request.subkind}`);
    }
    case KeyKind.BIP32: {
      if (request.subkind === KeySubkind.Private) {
        return BIP32PrivateKey.fromBuffer(hexToBytes(key));
      }
      if (request.subkind === KeySubkind.Public) {
        return BIP32PublicKey.fromBuffer(hexToBytes(key));
      }
      throw new Error(`${nameof(keyRowToClass)} unexpected subtype ${request.keyRow.Type}-${request.subkind}`);
    }
    default:
      throw new Error(`${nameof(keyRowToClass)} unexpected type ${request.keyRow.Type}`);
  }
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
      hexToBytes(decryptedKey),
    );
  }

  const newRow: KeyRow = {
    KeyId: request.oldKeyRow.KeyId,
    Hash: newKey,
    IsEncrypted: request.newPassword !== null,
    PasswordLastUpdate: request.currentTime,
    Type: request.oldKeyRow.Type,
  };

  return await deps.ModifyKey.update(
    db, tx,
    newRow,
  );
}
