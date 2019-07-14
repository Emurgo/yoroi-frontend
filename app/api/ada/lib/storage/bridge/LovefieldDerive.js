// @flow

import type {
  lf$Database,
  lf$Transaction,
  lf$Row,
} from 'lovefield';

import { IDerive } from '../models/functionalities/IDerive';

import { getRowFromKey } from '../database/utils';
import {
  PrivateDeriverSchema,
  Bip44DerivationSchema,
  Bip44WrapperSchema,
  PublicDeriverSchema
} from '../database/genericBip44/tables';
import type {
  PrivateDeriverRow, Bip44DerivationRow,
  PublicDeriverInsert, PublicDeriverRow,
  Bip44WrapperRow,
} from '../database/genericBip44/tables';
import { addPublicDeriver, addByLevel, TableMap, } from '../database/genericBip44/api';

import { KeySchema } from '../database/uncategorized/tables';
import type { KeyRow } from '../database/uncategorized/tables';
import { addKey, } from '../database/uncategorized/api';

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

async function _saveKey(
  db: lf$Database,
  tx: lf$Transaction,
  keyInfo: KeyInfo,
  keyHex: string,
): Promise<KeyRow> {
  const hash = keyInfo.password
    ? encryptWithPassword(
      keyInfo.password,
      Buffer.from(keyHex, 'hex')
    )
    : keyHex;

  return await addKey({
    db,
    tx,
    row: {
      Hash: hash,
      IsEncrypted: keyInfo.password != null,
      PasswordLastUpdate: keyInfo.lastUpdate,
    }
  });
}

function _derive(
  db: lf$Database,
  bip44WrapperId: number,
) {
  return async function (body: LovefieldDeriveRequest): Promise<PublicDeriverRow> {
    const Bip44PrivateDeriverTable = db.getSchema().table(PrivateDeriverSchema.name);
    const Bip44DerivationTable = db.getSchema().table(Bip44DerivationSchema.name);
    const PublicDeriverTable = db.getSchema().table(PublicDeriverSchema.name);
    const KeyTable = db.getSchema().table(KeySchema.name);
    const Bip44WrapperTable = db.getSchema().table(Bip44WrapperSchema.name);

    const getKeyTx = db.createTransaction();
    await getKeyTx
      .begin([
        Bip44PrivateDeriverTable, Bip44DerivationTable, KeyTable, Bip44WrapperTable,
        PublicDeriverTable,
        // we don't know which level the public deriver will be
        // so we lock the table for every level
        ...Array.from(TableMap, ([key, value]) => db.getSchema().table(value))
      ]);

    let privateDeriverRow: PrivateDeriverRow;
    {
      // Get Private Deriver
      const query = db
        .select()
        .from(Bip44PrivateDeriverTable)
        .where(
          Bip44PrivateDeriverTable[PrivateDeriverSchema.properties.Bip44WrapperId]
            .eq(bip44WrapperId)
        );

      const result = await getKeyTx.attach(query);
      if (result.length !== 1) {
        throw new StaleStateError('LovefieldDerive::_derive Bip44PrivateDeriverTable');
      }
      privateDeriverRow = result[0];
    }

    let keyId: number;
    {
      // Private Deriver => Bip44Derivation
      const query = db
        .select()
        .from(Bip44DerivationTable)
        .where(
          Bip44DerivationTable[Bip44DerivationSchema.properties.Bip44DerivationId]
            .eq(privateDeriverRow.Bip44DerivationId)
        );

      const result = await getKeyTx.attach(query);
      if (result.length !== 1) {
        throw new StaleStateError('LovefieldDerive::_derive Bip44DerivationTable');
      }
      const derivationRow: Bip44DerivationRow = result[0];
      if (derivationRow.PrivateKeyId === null) {
        throw new StaleStateError('LovefieldDerive::_derive PrivateKeyId');
      }
      keyId = derivationRow.PrivateKeyId;
    }

    let privateKeyRow: KeyRow;
    {
      // Bip44Derivation => Private key

      const query = db
        .select()
        .from(KeyTable)
        .where(
          KeyTable[KeySchema.properties.KeyId]
            .eq(keyId)
        );

      const result = await getKeyTx.attach(query);
      if (result.length !== 1) {
        throw new StaleStateError('LovefieldDerive::_derive KeyTable');
      }
      privateKeyRow = result[0];
    }

    let newPrivateKey: KeyRow | null;
    let newPublicKey: KeyRow | null;
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
        ? await _saveKey(
          db,
          getKeyTx,
          body.publicDeriverPrivateKey,
          newKey.to_hex(),
        )
        : null;
      newPublicKey = body.publicDeriverPublicKey
        ? await _saveKey(
          db,
          getKeyTx,
          body.publicDeriverPublicKey,
          newKey.public().to_hex(),
        )
        : null;
    }

    let insertResult;
    {
      // add derivation information for the level
      // TODO: missing updating on mapping table
      insertResult = await addByLevel(
        {
          db,
          tx: getKeyTx,
          keyInfo: {
            PublicKeyId: newPublicKey ? newPublicKey.KeyId : null,
            PrivateKeyId: newPrivateKey ? newPrivateKey.KeyId : null,
            Index: body.pathToPublic[body.pathToPublic.length - 1],
          },
          derivationInfo: id => ({
            Bip44DerivationId: id,
            ...body.levelSpecificInsert,
          }),
        },
        privateDeriverRow.Level + body.pathToPublic.length
      );
    }

    let pubDeriver: PublicDeriverRow;
    {
      // add the public deriver
      pubDeriver = await addPublicDeriver({
        db,
        tx: getKeyTx,
        row: body.publicDeriverInsert(insertResult.derivationTableResult.Bip44DerivationId),
      });
    }
    
    await getKeyTx.commit();

    return pubDeriver;
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
