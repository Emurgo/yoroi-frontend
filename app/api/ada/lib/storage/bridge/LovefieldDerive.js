// @flow

import type {
  lf$Database,
} from 'lovefield';

import { IDerive } from '../models/functionalities/IDerive';

import { getAllSchemaTables, } from '../database/utils';
import type {
  PrivateDeriverRow,
  PublicDeriverInsert, PublicDeriverRow,
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

import { StaleStateError, WrongPassphraseError } from '../../cardanoCrypto/cryptoErrors';

import {
  getCryptoWalletFromEncryptedMasterKey,
  getCryptoWalletFromMasterKey,
} from '../../cardanoCrypto/cryptoWallet';
import { RustModule } from '../../cardanoCrypto/rustLoader';

import { encryptWithPassword } from '../../../../../utils/passwordCipher';

type KeyInfo = {
  password: string | null,
  lastUpdate: Date | null
};
export type LovefieldDeriveRequest = {
  publicDeriverInsert: number => PublicDeriverInsert,
  levelSpecificInsert: Object,
  /**
   * Path is relative to private deriver
   * Last index should be the index you want for the public deriver
   */
  pathToPublic: Array<number>,
  decryptPrivateDeriverPassword: ?string,
  publicDeriverPublicKey?: KeyInfo,
  publicDeriverPrivateKey?: KeyInfo,
};

function _decryptKey(
  privateKeyRow: KeyRow,
  decryptPrivateDeriverPassword: ?string,
): RustModule.Wallet.PrivateKey {
  let rootPk;
  if (privateKeyRow.IsEncrypted) {
    if (decryptPrivateDeriverPassword == null) {
      throw new WrongPassphraseError();
    }
    rootPk = getCryptoWalletFromEncryptedMasterKey(
      privateKeyRow.Hash,
      decryptPrivateDeriverPassword
    );
  } else {
    rootPk = getCryptoWalletFromMasterKey(privateKeyRow.Hash);
  }
  return rootPk.key();
}

function _deriveKey(
  startingKey: RustModule.Wallet.PrivateKey,
  pathToPublic: Array<number>,
): RustModule.Wallet.PrivateKey {
  let currKey = startingKey;
  for (let i = 0; i < pathToPublic.length; i++) {
    currKey = currKey.derive(
      RustModule.Wallet.DerivationScheme.v2(),
      pathToPublic[i],
    );
  }

  return currKey;
}

async function _toKeyInsert(
  keyInfo: KeyInfo,
  keyHex: string,
): Promise<KeyInsert> {
  const hash = keyInfo.password
    ? encryptWithPassword(
      keyInfo.password,
      Buffer.from(keyHex, 'hex')
    )
    : keyHex;

  return {
    Hash: hash,
    IsEncrypted: keyInfo.password != null,
    PasswordLastUpdate: keyInfo.lastUpdate,
  };
}

function _derive(
  db: lf$Database,
  bip44WrapperId: number,
) {
  return async function (body: LovefieldDeriveRequest): Promise<PublicDeriverRow> {
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
      const result = await GetBip44Derivation.func(
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
      const result = await GetKey.func(
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

      const rootPrivateKey = _decryptKey(
        privateKeyRow,
        body.decryptPrivateDeriverPassword,
      );
      const newKey = _deriveKey(
        rootPrivateKey,
        body.pathToPublic,
      );

      // save new key
      newPrivateKey = body.publicDeriverPrivateKey
        ? await _toKeyInsert(
          body.publicDeriverPrivateKey,
          newKey.to_hex(),
        )
        : null;
      newPublicKey = body.publicDeriverPublicKey
        ? await _toKeyInsert(
          body.publicDeriverPublicKey,
          newKey.public().to_hex(),
        )
        : null;
    }

    let pubDeriver;
    {
      // get parent of the new derivation
      const newLevelParent = await GetDerivationsByPath.func(
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
              ...body.levelSpecificInsert,
            }),
          },
          level: privateDeriverRow.Level + body.pathToPublic.length,
          addPublicDeriverRequest: body.publicDeriverInsert
        }
      );
    }

    await getKeyTx.commit();

    return pubDeriver.publcDeriverResult;
  };
}

export class LovefieldDerive
  extends IDerive<LovefieldDeriveRequest, PublicDeriverRow> {

  constructor(
    db: lf$Database,
    bip44WrapperId: number,
  ) {
    super(_derive(db, bip44WrapperId));
  }
}
