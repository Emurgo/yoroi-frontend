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
} from '../database/walletTypes/common/utils';
import {
  GetOrAddAddress,
} from '../database/primitives/api/write';
import type { KeyInsert } from '../database/primitives/tables';
import type { HWFeatures, } from '../database/walletTypes/core/tables';

import { WalletBuilder } from './walletBuilder';

import { RustModule } from '../../cardanoCrypto/rustLoader';
import { encryptWithPassword } from '../../../../../utils/passwordCipher';

import {
  Bip44DerivationLevels,
} from '../database/walletTypes/bip44/api/utils';
import {
  getAllSchemaTables,
  raii,
} from '../database/utils';

import type {
  HasConceptualWallet,
  HasBip44Wrapper,
  HasPublicDeriver,
  HasRoot,
} from './walletBuilder';


// TODO: maybe move this inside walletBuilder somehow so it's all done in the same transaction
export async function getAccountDefaultDerivations(
  settings: RustModule.WalletV2.BlockchainSettings,
  accountPublicKey: RustModule.WalletV2.Bip44AccountPublic,
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
        .address_key(RustModule.WalletV2.AddressKeyIndex.new(i))
        .bootstrap_era_address(settings).to_base58()
    ))
  );
  const internalIds = await hashToIds(
    addressesIndex.map(i => (
      accountPublicKey
        .bip44_chain(true)
        .address_key(RustModule.WalletV2.AddressKeyIndex.new(i))
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
  settings: RustModule.WalletV2.BlockchainSettings,
  rootPk: RustModule.WalletV2.Bip44RootPrivateKey,
  password: string,
  accountIndex: number,
  walletName: string,
  accountName: string,
}): Promise<HasConceptualWallet & HasBip44Wrapper & HasRoot & HasPublicDeriver<mixed>> {
  if (request.accountIndex < HARD_DERIVATION_START) {
    throw new Error('createStandardBip44Wallet needs hardened index');
  }

  const encryptedRoot = encryptWithPassword(
    request.password,
    Buffer.from(request.rootPk.key().to_hex(), 'hex'),
  );

  const accountPublicKey = request.rootPk.bip44_account(
    RustModule.WalletV2.AccountIndex.new(request.accountIndex)
  ).public();

  const deps = Object.freeze({
    GetOrAddAddress,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));

  // Note: we generate initial addresses in a separate database query
  // from creation of the actual wallet
  const initialDerivations = await raii(
    request.db,
    depTables,
    async tx => {
      const hashToIdFunc = async (
        addressHash: Array<string>
      ): Promise<Array<number>> => {
        const rows = await deps.GetOrAddAddress.addByHash(
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

  const pathToPrivate = []; // private deriver level === root level
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
      .addFromRoot(
        _finalState => ({
          rootInsert: {
            privateKeyInfo: {
              Hash: encryptedRoot,
              IsEncrypted: true,
              PasswordLastUpdate: null,
            },
            publicKeyInfo: null,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: null,
              Index: null,
            }),
            levelInfo: id => ({
              KeyDerivationId: id,
            }),
          },
          tree: rootDerivation => ({
            derivationId: rootDerivation,
            children: [],
          }),
        })
      )
      .addBip44Wrapper(
        finalState => ({
          ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
          SignerLevel: Bip44DerivationLevels.ROOT.level,
          PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
          PrivateDeriverKeyDerivationId: finalState.root.root.KeyDerivation.KeyDerivationId,
          PrivateDeriverLevel: pathToPrivate.length,
        })
      )
      .derivePublicDeriver(
        _finalState => ({
          decryptPrivateDeriverPassword: request.password,
          publicDeriverMeta: {
            name: request.accountName,
          },
          path: [BIP44_PURPOSE, CARDANO_COINTYPE, request.accountIndex],
          initialDerivations
        })
      )
      .commit();
  }

  return state;
}

export async function createHardwareWallet(request: {
  db: lf$Database,
  settings: RustModule.WalletV2.BlockchainSettings,
  accountPublicKey: RustModule.WalletV2.Bip44AccountPublic,
  accountIndex: number,
  walletName: string,
  accountName: string,
  hwWalletMetaInsert: HWFeatures,
}): Promise<HasConceptualWallet & HasBip44Wrapper & HasPublicDeriver<mixed>> {
  if (request.accountIndex < HARD_DERIVATION_START) {
    throw new Error('createHardwareWallet needs hardened index');
  }
  const deps = Object.freeze({
    GetOrAddAddress,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  // Note: we generate initial addresses in a separate database query
  // from creation of the actual wallet
  const initialDerivations = await raii(
    request.db,
    depTables,
    async tx => {
      const hashToIdFunc = async (
        addressHash: Array<string>
      ): Promise<Array<number>> => {
        const rows = await deps.GetOrAddAddress.addByHash(
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
      .addFromRoot(
        _finalState => ({
          rootInsert: {
            privateKeyInfo: null,
            publicKeyInfo: null,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: null,
              Index: null,
            }),
            levelInfo: id => ({
              KeyDerivationId: id,
            }),
          },
          tree: rootDerivation => ({
            derivationId: rootDerivation,
            children: [],
          }),
        })
      )
      .addBip44Wrapper(
        finalState => ({
          ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
          SignerLevel: null,
          PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
          PrivateDeriverKeyDerivationId: null,
          PrivateDeriverLevel: null,
        })
      )
      .addAdhocPublicDeriver(
        finalState => ({
          parentDerivationId: finalState.root.root.KeyDerivation.KeyDerivationId,
          pathStartLevel: 1,
          publicDeriverMeta: {
            name: request.accountName,
          },
          pathToPublic: [
            {
              index: BIP44_PURPOSE,
              insert: {},
              publicKey: null,
              privateKey: null,
            },
            {
              index: CARDANO_COINTYPE,
              insert: {},
              publicKey: null,
              privateKey: null,
            },
            {
              index: request.accountIndex,
              insert: {},
              publicKey: {
                Hash: request.accountPublicKey.key().to_hex(),
                IsEncrypted: false,
                PasswordLastUpdate: null,
              },
              privateKey: null,
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
  settings: RustModule.WalletV2.BlockchainSettings,
  encryptedPk: void | KeyInsert,
  accountPubKey: string,
  displayCutoff: number,
  walletName: string,
  hwWalletMetaInsert: void | HWFeatures,
}): Promise<void> {
  // hardware wallet
  if (request.encryptedPk == null) {
    let builder = WalletBuilder
      .start(request.db)
      .addConceptualWallet(
        _finalState => ({
          CoinType: CARDANO_COINTYPE,
          Name: request.walletName,
        })
      )
      .addFromRoot(
        _finalState => ({
          rootInsert: {
            privateKeyInfo: null,
            publicKeyInfo: null,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: null,
              Index: null,
            }),
            levelInfo: id => ({
              KeyDerivationId: id,
            }),
          },
          tree: rootDerivation => ({
            derivationId: rootDerivation,
            children: [],
          }),
        })
      )
      .addBip44Wrapper(
        finalState => ({
          ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
          SignerLevel: null,
          PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
          PrivateDeriverKeyDerivationId: null,
          PrivateDeriverLevel: null,
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
    await builder.commit();
  } else {
    const pathToPrivate = []; // private deriver level === root level
    const encryptedPk = request.encryptedPk;
    let builder = WalletBuilder
      .start(request.db)
      .addConceptualWallet(
        _finalState => ({
          CoinType: CARDANO_COINTYPE,
          Name: request.walletName,
        })
      )
      .addFromRoot(
        _finalState => ({
          rootInsert: {
            privateKeyInfo: encryptedPk,
            publicKeyInfo: null,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: null,
              Index: null,
            }),
            levelInfo: id => ({
              KeyDerivationId: id,
            }),
          },
          tree: rootDerivation => ({
            derivationId: rootDerivation,
            children: [],
          }),
        })
      )
      .addBip44Wrapper(
        finalState => ({
          ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
          SignerLevel: Bip44DerivationLevels.ROOT.level,
          PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
          PrivateDeriverKeyDerivationId: finalState.root.root.KeyDerivation.KeyDerivationId,
          PrivateDeriverLevel: pathToPrivate.length
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
}

async function addPublicDeriverToMigratedWallet<
  T: $Shape<{||}> & HasConceptualWallet & HasRoot & HasBip44Wrapper
>(request: {
  builder: WalletBuilder<T>,
  db: lf$Database,
  accountPubKey: string,
  settings: RustModule.WalletV2.BlockchainSettings,
  displayCutoff: number,
  hwWalletMetaInsert: void | HWFeatures,
}): Promise<WalletBuilder<T & HasPublicDeriver<mixed>>> {
  const accountIndex = HARD_DERIVATION_START + 0;
  const accountName = '';

  const accountPublicKey = RustModule.WalletV2.Bip44AccountPublic.new(
    RustModule.WalletV2.PublicKey.from_hex(request.accountPubKey),
    RustModule.WalletV2.DerivationScheme.v2()
  );
  const deps = Object.freeze({
    GetOrAddAddress,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));

  // Note: we generate initial addresses in a separate database query
  // from creation of the actual wallet
  const initialDerivations = await raii(
    request.db,
    depTables,
    async tx => {
      const hashToIdFunc = async (
        addressHash: Array<string>
      ): Promise<Array<number>> => {
        const rows = await deps.GetOrAddAddress.addByHash(
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
    publicKey: null,
    privateKey: null,
  },
  {
    index: CARDANO_COINTYPE,
    insert: {},
    publicKey: null,
    privateKey: null,
  },
  {
    index: accountIndex,
    insert: {},
    publicKey: {
      Hash: accountPublicKey.key().to_hex(),
      IsEncrypted: false,
      PasswordLastUpdate: null,
    },
    privateKey: null,
  }];

  // We need to add ad-hoc even in the derived case
  // because during migration, the private key is encrypted (can't derive with it)
  return request.builder
    .addAdhocPublicDeriver(
      finalState => ({
        parentDerivationId: finalState.root.root.KeyDerivation.KeyDerivationId,
        pathStartLevel: 1,
        publicDeriverMeta: {
          name: accountName,
        },
        pathToPublic,
        initialDerivations,
        hwWalletMetaInsert: request.hwWalletMetaInsert == null
          ? undefined
          : {
            ConceptualWalletId: finalState.conceptualWalletRow.ConceptualWalletId,
            ...request.hwWalletMetaInsert
          },
      })
    );
}
