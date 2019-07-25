// @flow

import type {
  lf$Database,
} from 'lovefield';

import { IDerive } from '../models/functionalities/IDerive';

import { getAllSchemaTables, } from '../database/utils';
import {
  AddPublicDeriver,
  DerivePublicFromPrivate,
} from '../database/genericBip44/api/add';
import type {
  DerivePublicFromPrivateRequest
} from '../database/genericBip44/api/add';
import type { KeyRow } from '../database/uncategorized/tables';

import {
  decryptKey,
  deriveKey,
  toKeyInsert
} from './utils';
import type {
  KeyInfo,
} from './utils';

export type LovefieldDeriveRequest = {|
  ...DerivePublicFromPrivateRequest,
  decryptPrivateDeriverPassword: ?string,
  publicDeriverPublicKey?: KeyInfo,
  publicDeriverPrivateKey?: KeyInfo,
|};
async function derivePublicDeriver<Insert>(
  db: lf$Database,
  bip44WrapperId: number,
  body: LovefieldDeriveRequest,
  levelSpecificInsert: Insert,
): ReturnType<typeof AddPublicDeriver.fromParent> {
  const getKeyTx = db.createTransaction();
  await getKeyTx
    .begin(getAllSchemaTables(db, DerivePublicFromPrivate));

  const result = await DerivePublicFromPrivate.add(
    db,
    getKeyTx,
    bip44WrapperId,
    {
      publicDeriverInsert: body.publicDeriverInsert,
      pathToPublic: body.pathToPublic,
    },
    levelSpecificInsert,
    (
      privateKeyRow: KeyRow,
    ) => {
      const rootPrivateKey = decryptKey(
        privateKeyRow,
        body.decryptPrivateDeriverPassword,
      );
      const newKey = deriveKey(
        rootPrivateKey,
        body.pathToPublic,
      );

      const newPrivateKey = body.publicDeriverPrivateKey
        ? toKeyInsert(
          body.publicDeriverPrivateKey,
          newKey.to_hex(),
        )
        : null;
      const newPublicKey = body.publicDeriverPublicKey
        ? toKeyInsert(
          body.publicDeriverPublicKey,
          newKey.public().to_hex(),
        )
        : null;

      return {
        newPrivateKey,
        newPublicKey,
      };
    },
  );

  await getKeyTx.commit();

  return result;
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
