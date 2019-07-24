// @flow

import type {
  lf$Database,
} from 'lovefield';

import { IDerive } from '../models/functionalities/IDerive';

import { getAllSchemaTables, StaleStateError, } from '../database/utils';
import type {
  PrivateDeriverRow,
  PublicDeriverInsert,
} from '../database/genericBip44/tables';
import {
  AddPublicDeriver,
} from '../database/genericBip44/api/add';
import {
  GetDerivationsByPath,
  GetPrivateDeriver,
  GetBip44Derivation,
} from '../database/genericBip44/api/get';
import {
  GetKey,
} from '../database/uncategorized/api/get';
import type { KeyInsert, KeyRow } from '../database/uncategorized/tables';

import {
  decryptKey,
  deriveKey,
  toKeyInsert
} from './utils';
import type {
  KeyInfo,
} from './utils';

export type LovefieldDeriveRequest = {
  publicDeriverInsert: number => PublicDeriverInsert,
  /**
   * Path is relative to private deriver
   * Last index should be the index you want for the public deriver
   */
  pathToPublic: Array<number>,
  decryptPrivateDeriverPassword: ?string,
  publicDeriverPublicKey?: KeyInfo,
  publicDeriverPrivateKey?: KeyInfo,
};
async function derivePublicDeriver<Insert>(
  db: lf$Database,
  bip44WrapperId: number,
  body: LovefieldDeriveRequest,
  levelSpecificInsert: Insert,
): ReturnType<typeof AddPublicDeriver.fromParent> {
  const getKeyTx = db.createTransaction();
  await getKeyTx
    .begin([
      ...getAllSchemaTables(db, AddPublicDeriver),
      ...getAllSchemaTables(db, GetPrivateDeriver),
      ...getAllSchemaTables(db, GetBip44Derivation),
      ...getAllSchemaTables(db, GetKey),
    ]);

  let privateDeriverRow: PrivateDeriverRow;
  {
    // Get Private Deriver
    const result = await GetPrivateDeriver.fromBip44Wrapper(
      db,
      getKeyTx,
      bip44WrapperId,
    );
    if (result === undefined) {
      throw new StaleStateError('LovefieldDerive::_derive privateDeriver');
    }
    privateDeriverRow = result;
  }

  let privateKeyId: number;
  {
    // Private Deriver => Bip44Derivation
    const result = await GetBip44Derivation.get(
      db,
      getKeyTx,
      privateDeriverRow.Bip44DerivationId,
    );
    if (result === undefined) {
      throw new StaleStateError('LovefieldDerive::_derive Bip44DerivationTable');
    }
    if (result.PrivateKeyId === null) {
      throw new StaleStateError('LovefieldDerive::_derive PrivateKeyId');
    }
    privateKeyId = result.PrivateKeyId;
  }

  let privateKeyRow: KeyRow;
  {
    // Bip44Derivation => Private key
    const result = await GetKey.get(
      db,
      getKeyTx,
      privateKeyId,
    );
    if (result === undefined) {
      throw new StaleStateError('LovefieldDerive::_derive KeyTable');
    }
    privateKeyRow = result;
  }

  let newPrivateKey: KeyInsert | null;
  let newPublicKey: KeyInsert | null;
  {
    // Decrypt key and derive new key and save the result

    const rootPrivateKey = decryptKey(
      privateKeyRow,
      body.decryptPrivateDeriverPassword,
    );
    const newKey = deriveKey(
      rootPrivateKey,
      body.pathToPublic,
    );

    // save new key
    newPrivateKey = body.publicDeriverPrivateKey
      ? toKeyInsert(
        body.publicDeriverPrivateKey,
        newKey.to_hex(),
      )
      : null;
    newPublicKey = body.publicDeriverPublicKey
      ? toKeyInsert(
        body.publicDeriverPublicKey,
        newKey.public().to_hex(),
      )
      : null;
  }

  let pubDeriver;
  {
    // get parent of the new derivation
    const newLevelParent = await GetDerivationsByPath.get(
      db,
      getKeyTx,
      privateDeriverRow.Bip44DerivationId,
      [],
      Array.from(body.pathToPublic.slice(0, body.pathToPublic.length - 1)),
    );
    const parentDerivationId = newLevelParent.keys().next().value;
    if (parentDerivationId === undefined) {
      throw new StaleStateError('LovefieldDerive::_derive newLevelParent');
    }

    pubDeriver = await AddPublicDeriver.fromParent(
      db,
      getKeyTx,
      {
        addLevelRequest: {
          privateKeyInfo: newPrivateKey,
          publicKeyInfo: newPublicKey,
          derivationInfo: keys => ({
            PublicKeyId: keys.public,
            PrivateKeyId: keys.private,
            Index: body.pathToPublic[body.pathToPublic.length - 1],
          }),
          parentDerivationId,
          levelInfo: id => ({
            Bip44DerivationId: id,
            ...levelSpecificInsert,
          }),
        },
        level: privateDeriverRow.Level + body.pathToPublic.length,
        addPublicDeriverRequest: body.publicDeriverInsert
      }
    );
  }

  await getKeyTx.commit();

  return pubDeriver;
}

function _derive(
  db: lf$Database,
  bip44WrapperId: number,
) {
  return (
    body: LovefieldDeriveRequest,
    levelSpecificInsert: {},
  ) => derivePublicDeriver(
    db,
    bip44WrapperId,
    body,
    levelSpecificInsert,
  );
}

export class LovefieldDerive
  extends IDerive<LovefieldDeriveRequest, PromisslessReturnType<typeof AddPublicDeriver.fromParent>> {

  constructor(
    db: lf$Database,
    bip44WrapperId: number,
  ) {
    super(_derive(db, bip44WrapperId));
  }
}
