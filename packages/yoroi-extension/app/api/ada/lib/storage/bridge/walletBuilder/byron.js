// @flow

import { range } from 'lodash';
import {
  lf$Database
} from 'lovefield';
import {
  HARD_DERIVATION_START,
  CoinTypes,
  WalletTypePurpose,
  BIP44_SCAN_SIZE,
  ChainDerivations,
} from '../../../../../../config/numbersConfig';

import type {
  TreeInsert,
} from '../../database/walletTypes/common/utils.types';
import type { Bip44ChainInsert } from '../../database/walletTypes/common/tables';
import type { KeyInsert, NetworkRow } from '../../database/primitives/tables';
import type { HWFeatures, } from '../../database/walletTypes/core/tables';

import { WalletBuilder } from './builder';

import { RustModule } from '../../../cardanoCrypto/rustLoader';
import { encryptWithPassword } from '../../../../../../utils/passwordCipher';

import {
  Bip44DerivationLevels,
  Bip44TableMap,
} from '../../database/walletTypes/bip44/api/utils';

import type {
  HasConceptualWallet,
  HasBip44Wrapper,
  HasPublicDeriver,
  HasRoot,
} from './builder';
import type { AddByHashFunc } from '../../../../../common/lib/storage/bridge/hashMapper';
import { rawGenAddByHash } from '../../../../../common/lib/storage/bridge/hashMapper';
import { addByronAddress } from '../../../../restoration/byron/scan';
import { KeyKind } from '../../../cardanoCrypto/keys/types';
import { hexToBytes } from '../../../../../../coreUtils';

// TODO: maybe move this inside walletBuilder somehow so it's all done in the same transaction
/**
 * We generate addresses here instead of relying on scanning functions
 * This is because scanning depends on having an internet connection
 * But we need to ensure the address maintains the BIP44 gap regardless of internet connection
 */
// <TODO:PENDING_REMOVAL> bip44
export async function getAccountDefaultDerivations(
  settings: RustModule.WalletV2.BlockchainSettings,
  accountPublicKey: RustModule.WalletV2.Bip44AccountPublic,
  addByHash: AddByHashFunc,
): Promise<TreeInsert<Bip44ChainInsert>> {
  const addressesIndex = range(
    0,
    BIP44_SCAN_SIZE
  );

  const externalAddrs = addressesIndex.map(i => (
    accountPublicKey
      .bip44_chain(false)
      .address_key(RustModule.WalletV2.AddressKeyIndex.new(i))
      .bootstrap_era_address(settings).to_base58()
  ));
  const internalAddrs = addressesIndex.map(i => (
    accountPublicKey
      .bip44_chain(true)
      .address_key(RustModule.WalletV2.AddressKeyIndex.new(i))
      .bootstrap_era_address(settings).to_base58()
  ));
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
    insert: async insertRequest => {
      return await addByronAddress(
        addByHash,
        insertRequest,
        externalAddrs[i]
      );
    },
  }));
  const internalAddresses = addressesIndex.map(i => ({
    index: i,
    insert: async insertRequest => {
      return await addByronAddress(
        addByHash,
        insertRequest,
        internalAddrs[i]
      );
    },
  }));

  return [
    {
      index: 0,
      insert: insertRequest => Promise.resolve({
        KeyDerivationId: insertRequest.keyDerivationId,
        DisplayCutoff: 0
      }),
      children: externalAddresses,
    },
    {
      index: 1,
      insert: insertRequest => Promise.resolve({
        KeyDerivationId: insertRequest.keyDerivationId,
        DisplayCutoff: null,
      }),
      children: internalAddresses,
    }
  ];
}

// <TODO:PENDING_REMOVAL> bip44 (used only in tests)
export async function createStandardBip44Wallet(request: {|
  db: lf$Database,
  rootPk: RustModule.WalletV2.Bip44RootPrivateKey,
  password: string,
  accountIndex: number,
  walletName: string,
  accountName: string,
  network: $ReadOnly<NetworkRow>,
|}): Promise<HasConceptualWallet & HasBip44Wrapper & HasRoot & HasPublicDeriver<mixed>> {
  if (request.accountIndex < HARD_DERIVATION_START) {
    throw new Error(`${nameof(createStandardBip44Wallet)} needs hardened index`);
  }

  const encryptedRoot = encryptWithPassword(
    request.password,
    hexToBytes(request.rootPk.key().to_hex()),
  );

  const accountPublicKey = request.rootPk.bip44_account(
    RustModule.WalletV2.AccountIndex.new(request.accountIndex)
  ).public();

  if (request.network.BaseConfig[0].ByronNetworkId == null) {
    throw new Error(`${nameof(createStandardBip44Wallet)} missing Byron network id`);
  }
  const settings = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: request.network.BaseConfig[0].ByronNetworkId,
  });

  const initialDerivations = await getAccountDefaultDerivations(
    settings,
    accountPublicKey,
    rawGenAddByHash(new Set()),
  );

  const pathToPrivate = []; // private deriver level === root level
  let state;
  {
    state = await WalletBuilder
      .start(
        request.db,
        Bip44TableMap,
      )
      .addConceptualWallet(
        _finalState => ({
          NetworkId: request.network.NetworkId,
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
              Type: KeyKind.BIP32ED25519,
            },
            publicKeyInfo: null,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: null,
              Index: null,
            }),
            levelInfo: insertRequest => Promise.resolve({
              KeyDerivationId: insertRequest.keyDerivationId,
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
          RootKeyDerivationId: finalState.root.root.KeyDerivation.KeyDerivationId,
        })
      )
      .derivePublicDeriver(
        finalState => {
          const id = finalState.bip44WrapperRow.PrivateDeriverKeyDerivationId;
          const level = finalState.bip44WrapperRow.PrivateDeriverLevel;
          if (id == null || level == null) {
            throw new Error(`${nameof(createStandardBip44Wallet)} missing private deriver`);
          }
          return {
            deriverRequest: {
              decryptPrivateDeriverPassword: request.password,
              publicDeriverMeta: {
                name: request.accountName,
              },
              path: [
                {
                  index: WalletTypePurpose.BIP44,
                  insert: {},
                },
                {
                  index: CoinTypes.CARDANO,
                  insert: {},
                },
                {
                  index: request.accountIndex,
                  insert: {},
                },
              ],
              initialDerivations,
            },
            privateDeriverKeyDerivationId: id,
            privateDeriverLevel: level,
          };
        }
      )
      .commit();
  }

  return state;
}

// <TODO:PENDING_REMOVAL> legacy migration
export async function migrateFromStorageV1(request: {
  db: lf$Database,
  settings: RustModule.WalletV2.BlockchainSettings,
  encryptedPk: void | KeyInsert,
  accountPubKey: string,
  displayCutoff: number,
  walletName: string,
  hwWalletMetaInsert: void | HWFeatures,
  network: $ReadOnly<NetworkRow>,
  ...
}): Promise<void> {
  // hardware wallet
  if (request.encryptedPk == null) {
    let builder = WalletBuilder
      .start(
        request.db,
        Bip44TableMap,
      )
      .addConceptualWallet(
        _finalState => ({
          NetworkId: request.network.NetworkId,
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
            levelInfo: insertRequest => Promise.resolve({
              KeyDerivationId: insertRequest.keyDerivationId,
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
          RootKeyDerivationId: finalState.root.root.KeyDerivation.KeyDerivationId,
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
      .start(
        request.db,
        Bip44TableMap,
      )
      .addConceptualWallet(
        _finalState => ({
          NetworkId: request.network.NetworkId,
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
            levelInfo: insertRequest => Promise.resolve({
              KeyDerivationId: insertRequest.keyDerivationId,
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
          RootKeyDerivationId: finalState.root.root.KeyDerivation.KeyDerivationId,
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
  ...
}): Promise<WalletBuilder<T & HasPublicDeriver<mixed>>> {
  const accountIndex = HARD_DERIVATION_START + 0;
  const accountName = '';

  const accountPublicKey = RustModule.WalletV2.Bip44AccountPublic.new(
    RustModule.WalletV2.PublicKey.from_hex(request.accountPubKey),
    RustModule.WalletV2.DerivationScheme.v2()
  );
  let initialDerivations;
  {
    const insert = await getAccountDefaultDerivations(
      request.settings,
      accountPublicKey,
      rawGenAddByHash(new Set()),
    );
    // replace default display cutoff
    const external = insert.find(chain => chain.index === ChainDerivations.EXTERNAL);
    if (external == null) {
      throw new Error(`${nameof(addPublicDeriverToMigratedWallet)} cannot find external chain. Should never happen`);
    }
    external.insert = insertRequest => Promise.resolve({
      KeyDerivationId: insertRequest.keyDerivationId,
      DisplayCutoff: request.displayCutoff,
    });

    initialDerivations = insert;
  }

  const pathToPublic = [{
    index: WalletTypePurpose.BIP44,
    insert: insertRequest => Promise.resolve({
      KeyDerivationId: insertRequest.keyDerivationId,
    }),
    publicKey: null,
    privateKey: null,
  },
  {
    index: CoinTypes.CARDANO,
    insert: insertRequest => Promise.resolve({
      KeyDerivationId: insertRequest.keyDerivationId,
    }),
    publicKey: null,
    privateKey: null,
  },
  {
    index: accountIndex,
    insert: insertRequest => Promise.resolve({
      KeyDerivationId: insertRequest.keyDerivationId,
    }),
    publicKey: {
      Hash: accountPublicKey.key().to_hex(),
      IsEncrypted: false,
      PasswordLastUpdate: null,
      Type: KeyKind.BIP32ED25519,
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
