// @flow

import { range } from 'lodash';
import {
  lf$Database
} from 'lovefield';
import {
  HARD_DERIVATION_START,
  CARDANO_COINTYPE,
  BIP44_PURPOSE,
  BIP44_SCAN_SIZE,
  EXTERNAL,
} from '../../../../../config/numbersConfig';

import type {
  TreeInsert,
} from '../database/bip44/api/write';
import {
  GetOrAddAddress,
} from '../database/primitives/api/write';
import type { KeyInsert } from '../database/primitives/tables';
import type { HWFeatures, } from '../database/wallet/tables';

import { WalletBuilder } from './walletBuilder';

import { RustModule } from '../../cardanoCrypto/rustLoader';
import { encryptWithPassword } from '../../../../../utils/passwordCipher';

import {
  Bip44DerivationLevels,
} from '../database/bip44/api/utils';
import {
  getAllSchemaTables,
  raii,
} from '../database/utils';

import type {
  HasConceptualWallet,
  HasBip44Wrapper,
  HasPrivateDeriver,
  HasPublicDeriver,
} from './walletBuilder';

export async function getAccountDefaultDerivations(
  settings: RustModule.Wallet.BlockchainSettings,
  accountPublicKey: RustModule.Wallet.Bip44AccountPublic,
  hashToIds: (addressHash: Array<string>) => Promise<Array<number>>,
): Promise<TreeInsert< { DisplayCutoff: null | number }>> {
  const addressesIndex = range(
    0,
    BIP44_SCAN_SIZE
  );

  const externalIds = await hashToIds(
    addressesIndex.map(i => (
      accountPublicKey
        .bip44_chain(false)
        .address_key(RustModule.Wallet.AddressKeyIndex.new(i))
        .bootstrap_era_address(settings).to_base58()
    ))
  );
  const internalIds = await hashToIds(
    addressesIndex.map(i => (
      accountPublicKey
        .bip44_chain(true)
        .address_key(RustModule.Wallet.AddressKeyIndex.new(i))
        .bootstrap_era_address(settings).to_base58()
    ))
  );
  /**
   * Even if the user has no internet connection and scanning fails,
   * we need to initialize our wallets with the bip44 gap size directly
   *
   * Otherwise the generated addresses won't be added to the wallet at all.
   * This would violate our bip44 obligation to maintain a unused address gap
   *
   * Example:
   * If we throw, no new addresses will be added
   * so the user's balance would be stuck at 0 until they reinstall Yoroi.
   */
  const externalAddresses = addressesIndex.map(i => ({
    index: i,
    insert: {
      AddressId: externalIds[i],
    }
  }));
  const internalAddresses = addressesIndex.map(i => ({
    index: i,
    insert: {
      AddressId: internalIds[i],
    }
  }));

  return [
    {
      index: 0,
      insert: { DisplayCutoff: 0 },
      children: externalAddresses,
    },
    {
      index: 1,
      insert: { DisplayCutoff: null },
      children: internalAddresses,
    }
  ];
}

export async function createStandardBip44Wallet(request: {
  db: lf$Database,
  settings: RustModule.Wallet.BlockchainSettings,
  rootPk: RustModule.Wallet.Bip44RootPrivateKey,
  password: string,
  accountIndex: number,
  walletName: string,
  accountName: string,
}): Promise<HasConceptualWallet & HasBip44Wrapper & HasPrivateDeriver & HasPublicDeriver<mixed>> {
  if (request.accountIndex < HARD_DERIVATION_START) {
    throw new Error('createStandardBip44Wallet needs hardened index');
  }

  const encryptedRoot = encryptWithPassword(
    request.password,
    Buffer.from(request.rootPk.key().to_hex(), 'hex'),
  );

  const accountPublicKey = request.rootPk.bip44_account(
    RustModule.Wallet.AccountIndex.new(request.accountIndex)
  ).public();

  // Note: we generate initial addresses in a separate database query
  // from creation of the actual wallet
  const initialDerivations = await raii(
    request.db,
    getAllSchemaTables(request.db, GetOrAddAddress),
    async tx => {
      const hashToIdFunc = async (
        addressHash: Array<string>
      ): Promise<Array<number>> => {
        const rows = await GetOrAddAddress.addByHash(
          request.db, tx,
          addressHash
        );
        return rows.map(row => row.AddressId);
      };

      return await getAccountDefaultDerivations(
        request.settings,
        accountPublicKey,
        hashToIdFunc,
      );
    }
  );

  let state;
  {
    state = await WalletBuilder
      .start(request.db)
      .addConceptualWallet(
        _finalState => ({
          CoinType: CARDANO_COINTYPE,
          Name: request.walletName,
        })
      )
      .addBip44Wrapper(
        finalState => ({
          ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
          IsBundled: false,
          SignerLevel: Bip44DerivationLevels.ROOT.level,
          PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
          Version: 2,
        })
      )
      .addPrivateDeriver(
        finalState => ({
          // private deriver level === root level
          pathToPrivate: [],
          addLevelRequest: parent => ({
            privateKeyInfo: {
              Hash: encryptedRoot,
              IsEncrypted: true,
              PasswordLastUpdate: null,
            },
            publicKeyInfo: null,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: parent,
              Index: null,
            }),
            levelInfo: id => ({
              KeyDerivationId: id,
            })
          }),
          addPrivateDeriverRequest: derivationId => ({
            Bip44WrapperId: finalState.bip44WrapperRow.Bip44WrapperId,
            KeyDerivationId: derivationId,
            Level: Bip44DerivationLevels.ROOT.level,
          }),
        })
      )
      .derivePublicDeriver(
        _finalState => ({
          decryptPrivateDeriverPassword: request.password,
          publicDeriverPublicKey: {
            password: null,
            lastUpdate: null,
          },
          publicDeriverInsert: ids => ({
            Bip44WrapperId: ids.wrapperId,
            KeyDerivationId: ids.derivationId,
            Name: request.accountName,
            LastSyncInfoId: ids.lastSyncInfoId,
          }),
          pathToPublic: [
            {
              index: BIP44_PURPOSE,
              insert: {},
            },
            {
              index: CARDANO_COINTYPE,
              insert: {},
            },
            {
              index: request.accountIndex,
              insert: {},
            },
          ],
          initialDerivations
        })
      )
      .commit();
  }

  return state;
}

export async function createHardwareWallet(request: {
  db: lf$Database,
  settings: RustModule.Wallet.BlockchainSettings,
  accountPublicKey: RustModule.Wallet.Bip44AccountPublic,
  accountIndex: number,
  walletName: string,
  accountName: string,
  hwWalletMetaInsert?: HWFeatures,
}): Promise<HasConceptualWallet & HasBip44Wrapper & HasPublicDeriver<mixed>> {
  if (request.accountIndex < HARD_DERIVATION_START) {
    throw new Error('createHardwareWallet needs hardened index');
  }
  // Note: we generate initial addresses in a separate database query
  // from creation of the actual wallet
  const initialDerivations = await raii(
    request.db,
    getAllSchemaTables(request.db, GetOrAddAddress),
    async tx => {
      const hashToIdFunc = async (
        addressHash: Array<string>
      ): Promise<Array<number>> => {
        const rows = await GetOrAddAddress.addByHash(
          request.db, tx,
          addressHash
        );
        return rows.map(row => row.AddressId);
      };

      return await getAccountDefaultDerivations(
        request.settings,
        request.accountPublicKey,
        hashToIdFunc,
      );
    }
  );

  let state;
  {
    state = await WalletBuilder
      .start(request.db)
      .addConceptualWallet(
        _finalState => ({
          CoinType: CARDANO_COINTYPE,
          Name: request.walletName,
        })
      )
      .addBip44Wrapper(
        finalState => ({
          ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
          IsBundled: false,
          SignerLevel: Bip44DerivationLevels.ROOT.level,
          PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
          Version: 2,
        })
      )
      .addAdhocPublicDeriver(
        finalState => ({
          bip44WrapperId: finalState.bip44WrapperRow.Bip44WrapperId,
          publicKey: {
            Hash: request.accountPublicKey.key().to_hex(),
            IsEncrypted: false,
            PasswordLastUpdate: null,
          },
          publicDeriverInsert: ids => ({
            Bip44WrapperId: ids.wrapperId,
            KeyDerivationId: ids.derivationId,
            Name: request.accountName,
            LastSyncInfoId: ids.lastSyncInfoId,
          }),
          parentDerivationId: null,
          pathStartLevel: 0,
          pathToPublic: [
            {
              index: 0,
              insert: {},
            },
            {
              index: BIP44_PURPOSE,
              insert: {},
            },
            {
              index: CARDANO_COINTYPE,
              insert: {},
            },
            {
              index: request.accountIndex,
              insert: {},
            },
          ],
          initialDerivations,
          hwWalletMetaInsert: {
            ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
            ...request.hwWalletMetaInsert
          },
        })
      )
      .commit();
  }

  return state;
}

export async function migrateFromStorageV1(request: {
  db: lf$Database,
  settings: RustModule.Wallet.BlockchainSettings,
  encryptedPk: void | KeyInsert,
  accountPubKey: string,
  displayCutoff: number,
  walletName: string,
  hwWalletMetaInsert: void | HWFeatures,
}): Promise<void> {
  {
    let builder = WalletBuilder
      .start(request.db)
      .addConceptualWallet(
        _finalState => ({
          CoinType: CARDANO_COINTYPE,
          Name: request.walletName,
        })
      )
      .addBip44Wrapper(
        finalState => ({
          ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
          IsBundled: false,
          SignerLevel: Bip44DerivationLevels.ROOT.level,
          PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
          Version: 2,
        })
      );
    if (request.encryptedPk != null) {
      const encryptedPk = request.encryptedPk;
      builder = builder.addPrivateDeriver(
        finalState => ({
          // private deriver level === root level
          pathToPrivate: [],
          addLevelRequest: parent => ({
            privateKeyInfo: encryptedPk,
            publicKeyInfo: null,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: parent,
              Index: null,
            }),
            levelInfo: id => ({
              KeyDerivationId: id,
            })
          }),
          addPrivateDeriverRequest: derivationId => ({
            Bip44WrapperId: finalState.bip44WrapperRow.Bip44WrapperId,
            KeyDerivationId: derivationId,
            Level: Bip44DerivationLevels.ROOT.level,
          }),
        })
      );
      builder = await addPublicDeriverToMigratedWallet({
        builder,
        db: request.db,
        accountPubKey: request.accountPubKey,
        settings: request.settings,
        displayCutoff: request.displayCutoff,
        hwWalletMetaInsert: request.hwWalletMetaInsert,
      });
      return await builder.commit();
    }
    builder = await addPublicDeriverToMigratedWallet({
      builder,
      db: request.db,
      accountPubKey: request.accountPubKey,
      settings: request.settings,
      displayCutoff: request.displayCutoff,
      hwWalletMetaInsert: request.hwWalletMetaInsert,
    });
    await builder.commit();
  }
}
async function addPublicDeriverToMigratedWallet<
  T: $Shape<{||}> & HasConceptualWallet & HasBip44Wrapper
>(request: {
  builder: WalletBuilder<T>,
  db: lf$Database,
  accountPubKey: string,
  settings: RustModule.Wallet.BlockchainSettings,
  displayCutoff: number,
  hwWalletMetaInsert: void | HWFeatures,
}): Promise<WalletBuilder<T & HasPublicDeriver<mixed>>> {
  const accountIndex = HARD_DERIVATION_START + 0;
  const accountName = '';

  const accountPublicKey = RustModule.Wallet.Bip44AccountPublic.new(
    RustModule.Wallet.PublicKey.from_hex(request.accountPubKey),
    RustModule.Wallet.DerivationScheme.v2()
  );

  // Note: we generate initial addresses in a separate database query
  // from creation of the actual wallet
  const initialDerivations = await raii(
    request.db,
    getAllSchemaTables(request.db, GetOrAddAddress),
    async tx => {
      const hashToIdFunc = async (
        addressHash: Array<string>
      ): Promise<Array<number>> => {
        const rows = await GetOrAddAddress.addByHash(
          request.db, tx,
          addressHash
        );
        return rows.map(row => row.AddressId);
      };

      const insert = await getAccountDefaultDerivations(
        request.settings,
        accountPublicKey,
        hashToIdFunc,
      );
      // replace default display cutoff
      const external = insert.find(chain => chain.index === EXTERNAL);
      if (external == null) {
        throw new Error('migrateFromStorageV1 cannot find external chain. Should never happen');
      }
      external.insert.DisplayCutoff = request.displayCutoff;

      return insert;
    }
  );

  const pathToPublic = [{
    index: BIP44_PURPOSE,
    insert: {},
  },
  {
    index: CARDANO_COINTYPE,
    insert: {},
  },
  {
    index: accountIndex,
    insert: {},
  }];

  return request.builder
    .addAdhocPublicDeriver(
      finalState => {
        // kind of hacky way to extract the ID without angering Flow
        const maybePrivateDeriver = ((finalState: any): WithNullableFields<HasPrivateDeriver>);
        const privateDeriverKeyDerivationId = maybePrivateDeriver.privateDeriver == null
          ? null
          : maybePrivateDeriver.privateDeriver.privateDeriverResult.KeyDerivationId;
        return {
          bip44WrapperId: finalState.bip44WrapperRow.Bip44WrapperId,
          publicKey: {
            Hash: accountPublicKey.key().to_hex(),
            IsEncrypted: false,
            PasswordLastUpdate: null,
          },
          publicDeriverInsert: ids => ({
            Bip44WrapperId: ids.wrapperId,
            KeyDerivationId: ids.derivationId,
            Name: accountName,
            LastSyncInfoId: ids.lastSyncInfoId,
          }),
          parentDerivationId: privateDeriverKeyDerivationId,
          pathStartLevel: privateDeriverKeyDerivationId == null ? 0 : 1,
          pathToPublic: privateDeriverKeyDerivationId != null
            ? pathToPublic
            : [{
              index: 0,
              insert: {},
            }, ...pathToPublic],
          initialDerivations,
          hwWalletMetaInsert: request.hwWalletMetaInsert == null
            ? undefined
            : {
              ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
              ...request.hwWalletMetaInsert
            },
        };
      }
    );
}
