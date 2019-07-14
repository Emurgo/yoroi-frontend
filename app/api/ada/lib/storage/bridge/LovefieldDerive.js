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
    const pubDeriver = getKeyTx
      .begin([
        Bip44PrivateDeriverTable, Bip44DerivationTable, KeyTable, Bip44WrapperTable,
        PublicDeriverTable,
        // we don't know which level the public deriver will be
        // so we lock the table for every level
        ...Array.from(TableMap, ([key, value]) => db.getSchema().table(value))
      ])
      .then(() => {
        // Get Private Deriver
        const query = db
          .select()
          .from(Bip44PrivateDeriverTable)
          .where(
            Bip44PrivateDeriverTable[PrivateDeriverSchema.properties.Bip44WrapperId]
              .eq(bip44WrapperId)
          );

        return getKeyTx.attach(query);
      })
      .then(result => {
        // Private Deriver => Bip44Derivation
        if (result.length !== 1) {
          throw new StaleStateError('LovefieldDerive::_derive Bip44PrivateDeriverTable');
        }
        const privateDeriverRow: PrivateDeriverRow = result[0];

        const query = db
          .select()
          .from(Bip44DerivationTable)
          .where(
            Bip44DerivationTable[Bip44DerivationSchema.properties.Bip44DerivationId]
              .eq(privateDeriverRow.Bip44DerivationId)
          );

        return getKeyTx.attach(query);
      })
      .then(result => {
        // Bip44Derivation => Private key
        if (result.length !== 1) {
          throw new StaleStateError('LovefieldDerive::_derive Bip44DerivationTable');
        }
        const derivationRow: Bip44DerivationRow = result[0];
        if (derivationRow.PrivateKeyId === null) {
          throw new StaleStateError('LovefieldDerive::_derive PrivateKeyId');
        }
        const keyId = derivationRow.PrivateKeyId;

        const query = db
          .select()
          .from(KeyTable)
          .where(
            KeyTable[KeySchema.properties.KeyId]
              .eq(keyId)
          );

        return getKeyTx.attach(query);
      })
      .then(async result => {
        // Decrypt key and derive new key and save the result
        if (result.length !== 1) {
          throw new StaleStateError('LovefieldDerive::_derive KeyTable');
        }
        const privateKeyRow: KeyRow = result[0];

        const rootPrivateKey = _decryptKey(
          privateKeyRow,
          body.decryptPrivateDeriverPassword,
        );
        const newKey = _deriveKey(
          rootPrivateKey,
          body.pathToPublic,
        );

        // save new key
        const newPrivateKey = body.publicDeriverPrivateKey
          ? await _saveKey(
            db,
            getKeyTx,
            body.publicDeriverPrivateKey,
            newKey.to_hex(),
          )
          : null;
        const newPublicKey = body.publicDeriverPublicKey
          ? await _saveKey(
            db,
            getKeyTx,
            body.publicDeriverPublicKey,
            newKey.public().to_hex(),
          )
          : null;


        return { newPrivateKey, newPublicKey };
      })
      .then(async result => {
        // Fetch public level used for this specified wallet
        const query = db
          .select()
          .from(Bip44WrapperTable)
          .where(
            Bip44WrapperTable[Bip44WrapperSchema.properties.Bip44WrapperId]
              .eq(bip44WrapperId)
          );
        const wrapperResult = await getKeyTx.attach(query);
        if (wrapperResult.length !== 1) {
          throw new StaleStateError('LovefieldDerive::_derive wrapperResult');
        }
        const wrapper: Bip44WrapperRow = wrapperResult[0];

        return {
          ...result,
          level: wrapper.PublicDeriverLevel,
        };
      })
      .then(result => {
        // add derivation information for the level
        // TODO: missing updating on mapping table
        return addByLevel(
          {
            db,
            tx: getKeyTx,
            keyInfo: {
              PublicKeyId: result.newPublicKey ? result.newPublicKey.KeyId : null,
              PrivateKeyId: result.newPublicKey ? result.newPublicKey.KeyId : null,
              Index: body.pathToPublic[body.pathToPublic.length - 1],
            },
            derivationInfo: id => ({
              Bip44DerivationId: id,
              ...body.levelSpecificInsert,
            }),
          },
          result.level
        );

      })
      .then(result => {
        // add the public deriver
        return addPublicDeriver({
          db,
          tx: getKeyTx,
          row: body.publicDeriverInsert(result.derivationTableResult.Bip44DerivationId),
        });
      })
      .then(async result => {
        await getKeyTx.commit();
        return result;
      })
      .catch(e => {
        throw e;
      });

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
