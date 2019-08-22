// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import { IDerive } from '../models/functionalities/IDerive';

import { getAllSchemaTables, raii, } from '../database/utils';
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
  ...DerivePublicFromPrivateRequest<{}>,
  decryptPrivateDeriverPassword: ?string,
  publicDeriverPublicKey?: KeyInfo,
  publicDeriverPrivateKey?: KeyInfo,
|};
export async function derivePublicDeriver(
  db: lf$Database,
  tx: lf$Transaction,
  bip44WrapperId: number,
  body: LovefieldDeriveRequest,
): ReturnType<typeof AddPublicDeriver.add> {
  const result = await DerivePublicFromPrivate.add(
    db,
    tx,
    bip44WrapperId,
    {
      publicDeriverInsert: body.publicDeriverInsert,
      pathToPublic: body.pathToPublic,
    },
    (
      privateKeyRow: KeyRow,
    ) => {
      const rootPrivateKey = decryptKey(
        privateKeyRow,
        body.decryptPrivateDeriverPassword,
      );
      const newKey = deriveKey(
        rootPrivateKey,
        body.pathToPublic.map(step => step.index),
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

  return result;
}

function _derive(
  db: lf$Database,
  bip44WrapperId: number,
) {
  return async (
    body: LovefieldDeriveRequest,
  ): ReturnType<typeof derivePublicDeriver> => {
    const result = await raii<PromisslessReturnType<typeof derivePublicDeriver>>(
      db,
      getAllSchemaTables(db, DerivePublicFromPrivate),
      async tx => {
        return await derivePublicDeriver(
          db,
          tx,
          bip44WrapperId,
          body,
        );
      }
    );
    if (result == null) {
      throw new Error('Failed to derive for ' + bip44WrapperId);
    }

    return result;
  };
}

export class LovefieldDerive extends IDerive<
  LovefieldDeriveRequest,
  PromisslessReturnType<typeof AddPublicDeriver.add>
> {

  constructor(
    db: lf$Database,
    bip44WrapperId: number,
  ) {
    super(_derive(db, bip44WrapperId));
  }
}
