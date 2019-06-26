// @flow

import type {
  lf$Database,
} from 'lovefield';

import { IDerive } from '../models/functionalities/IDerive';

import { getRowFromKey } from '../database/utils';
import {
  PrivateDeriverSchema,
  Bip44DerivationSchema,
  Bip44WrapperSchema
} from '../database/genericBip44/tables';
import type {
  PrivateDeriverRow, Bip44DerivationRow,
  PublicDeriverInsert, PublicDeriverRow,
  Bip44WrapperRow,
} from '../database/genericBip44/tables';
import { addPublicDeriver, addByLevel, } from '../database/genericBip44/api';

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
  publicDeriverInsert: PublicDeriverInsert,
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

async function _saveKey(
  db: lf$Database,
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
    /*
     * Get private key
    */
    const privateDeriver = await getRowFromKey<PrivateDeriverRow>(
      db,
      bip44WrapperId,
      PrivateDeriverSchema.name,
      PrivateDeriverSchema.properties.Bip44WrapperId,
    );
    if (privateDeriver === undefined) {
      throw new StaleStateError('LovelaceDerive::_derive privateDeriver');
    }
    const bip44Derivation = await getRowFromKey<Bip44DerivationRow>(
      db,
      privateDeriver.Bip44DerivationId,
      Bip44DerivationSchema.name,
      Bip44DerivationSchema.properties.Bip44DerivationId,
    );
    if (bip44Derivation === undefined || bip44Derivation.PrivateKeyId === null) {
      throw new StaleStateError('LovelaceDerive::_derive bip44Derivation');
    }
    const privateKeyRow = await getRowFromKey<KeyRow>(
      db,
      bip44Derivation.PrivateKeyId,
      KeySchema.name,
      KeySchema.properties.KeyId,
    );
    if (privateKeyRow === undefined) {
      throw new StaleStateError('LovelaceDerive::_derive privateKeyRow');
    }
    let rootPk;
    if (privateKeyRow.IsEncrypted) {
      if (body.decryptPrivateDeriverPassword == null) {
        throw new WrongPassphraseError();
      }
      rootPk = getCryptoWalletFromEncryptedMasterKey(
        privateKeyRow.Hash,
        body.decryptPrivateDeriverPassword
      );
    } else {
      rootPk = getCryptoWalletFromMasterKey(privateKeyRow.Hash);
    }
    const rawKey = rootPk.key();

    /*
     * Perform derivation
    */
    let currKey = rawKey;
    for (let i = 0; i < body.pathToPublic.length; i++) {
      currKey = currKey.derive(
        RustModule.Wallet.DerivationScheme.v2(),
        body.pathToPublic[i],
      );
    }

    /*
     * Update tables
    */
    const newPrivateKey = body.publicDeriverPrivateKey
      ? await _saveKey(
        db,
        body.publicDeriverPrivateKey,
        currKey.to_hex(),
      )
      : null;
    const newPublicKey = body.publicDeriverPublicKey
      ? await _saveKey(
        db,
        body.publicDeriverPublicKey,
        currKey.public().to_hex(),
      )
      : null;

    const wrapper = await getRowFromKey<Bip44WrapperRow>(
      db,
      bip44WrapperId,
      Bip44WrapperSchema.name,
      Bip44WrapperSchema.properties.Bip44WrapperId,
    );
    if (wrapper === undefined) {
      throw new StaleStateError('LovelaceDerive::_derive wrapper');
    }
    const pubDeriver = await addPublicDeriver({
      db,
      row: body.publicDeriverInsert,
    });
    await addByLevel(
      {
        db,
        keyInfo: {
          PublicKeyId: newPublicKey ? newPublicKey.KeyId : null,
          PrivateKeyId: newPublicKey ? newPublicKey.KeyId : null,
          Index: body.pathToPublic[body.pathToPublic.length - 1],
        },
        derivationInfo: id => ({
          Bip44DerivationId: id,
          ...body.levelSpecificInsert,
        }),
      },
      wrapper.PublicDeriverLevel
    );

    return pubDeriver;
  };
}

export class LovelaceDerive
  extends IDerive<LovefieldDeriveRequest, PublicDeriverRow> {

  constructor(
    db: lf$Database,
    bip44WrapperId: number,
  ) {
    super(_derive(db, bip44WrapperId));
  }
}
