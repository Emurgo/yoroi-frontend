// @flow

import type {
  lf$Database,
} from 'lovefield';

import { IDerive } from '../models/functionalities/IDerive';

import { getRowFromKey, getAllSchemaTables, } from '../database/utils';
import {
  PrivateDeriverSchema,
  Bip44DerivationSchema,
  Bip44WrapperSchema,
  PublicDeriverSchema,
  Bip44DerivationMappingSchema
} from '../database/genericBip44/tables';
import type {
  PrivateDeriverRow, Bip44DerivationRow,
  PublicDeriverInsert, PublicDeriverRow,
} from '../database/genericBip44/tables';
import {
  AddPublicDeriver,
} from '../database/genericBip44/api/add';
import {
  GetDerivationsByPath,
} from '../database/genericBip44/api/get';
import {
  TableMap,
} from '../database/genericBip44/api/utils';

import { KeySchema } from '../database/uncategorized/tables';
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
    const Bip44PrivateDeriverTable = db.getSchema().table(PrivateDeriverSchema.name);
    const Bip44DerivationTable = db.getSchema().table(Bip44DerivationSchema.name);
    const PublicDeriverTable = db.getSchema().table(PublicDeriverSchema.name);
    const Bip44DerivationMappingTable = db.getSchema().table(Bip44DerivationMappingSchema.name);
    const KeyTable = db.getSchema().table(KeySchema.name);
    const Bip44WrapperTable = db.getSchema().table(Bip44WrapperSchema.name);

    const getKeyTx = db.createTransaction();
    await getKeyTx
      .begin([
        ...getAllSchemaTables(db, AddPublicDeriver),
        Bip44PrivateDeriverTable, Bip44DerivationTable, KeyTable, Bip44WrapperTable,
        PublicDeriverTable, Bip44DerivationMappingTable,
        // we don't know which level the public deriver will be
        // so we lock the table for every level
        ...Array.from(TableMap, ([_key, value]) => db.getSchema().table(value))
      ]);

    let privateDeriverRow: PrivateDeriverRow;
    {
      // Get Private Deriver
      const result = await getRowFromKey<PrivateDeriverRow>(
        db,
        getKeyTx,
        bip44WrapperId,
        PrivateDeriverSchema.name,
        PrivateDeriverSchema.properties.Bip44WrapperId,
      );
      if (result === undefined) {
        throw new StaleStateError('LovefieldDerive::_derive privateDeriver');
      }
      privateDeriverRow = result;
    }

    let privateKeyId: number;
    {
      // Private Deriver => Bip44Derivation
      const result = await getRowFromKey<Bip44DerivationRow>(
        db,
        getKeyTx,
        privateDeriverRow.Bip44DerivationId,
        Bip44DerivationSchema.name,
        Bip44DerivationSchema.properties.Bip44DerivationId,
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
      const result = await getRowFromKey<KeyRow>(
        db,
        getKeyTx,
        privateKeyId,
        KeySchema.name,
        KeySchema.properties.KeyId,
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
