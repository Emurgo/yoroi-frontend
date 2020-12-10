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
} from '../../../../config/numbersConfig';

import { encryptWithPassword } from '../../../../utils/passwordCipher';

import type {
  TreeInsert,
} from '../../../ada/lib/storage/database/walletTypes/common/utils';
import { WalletBuilder } from '../../../ada/lib/storage/bridge/walletBuilder/builder';
import type { CanonicalAddressInsert, NetworkRow } from '../../../ada/lib/storage/database/primitives/tables';
import {
  Bip44DerivationLevels,
  Bip44TableMap,
} from '../../../ada/lib/storage/database/walletTypes/bip44/api/utils';
import type {
  HasConceptualWallet,
  HasBip44Wrapper,
  HasPublicDeriver,
  HasRoot,
} from '../../../ada/lib/storage/bridge/walletBuilder/builder';
import type { AddByHashFunc } from '../../../common/lib/storage/bridge/hashMapper';
import { rawGenAddByHash } from '../../../common/lib/storage/bridge/hashMapper';
import { addErgoP2PK } from '../restoration/scan';
import { KeyKind } from '../../../common/lib/crypto/keys/types';
import { derivePath, deriveKey, BIP32PublicKey, BIP32PrivateKey } from '../../../common/lib/crypto/keys/keyRepository';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

// TODO: maybe move this inside walletBuilder somehow so it's all done in the same transaction
/**
 * We generate addresses here instead of relying on scanning functions
 * This is because scanning depends on having an internet connection
 * But we need to ensure the address maintains the BIP44 gap regardless of internet connection
 */
export async function getChainDefaultDerivations(
  bip32Account: BIP32PublicKey,
  network: $Values<typeof RustModule.SigmaRust.NetworkPrefix>,
  addByHash: AddByHashFunc,
): Promise<TreeInsert<CanonicalAddressInsert>> {
  const addressesIndex = range(
    0,
    BIP44_SCAN_SIZE
  );

  const externalAddrs = addressesIndex.map(i => (
    Buffer.from(
      RustModule.SigmaRust.Address.from_public_key(
        deriveKey(bip32Account, i)
          .key
          .publicKey
      ).to_bytes(network)
    ).toString('hex')
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
      return await addErgoP2PK(
        addByHash,
        insertRequest,
        externalAddrs[i]
      );
    },
  }));

  return externalAddresses;
}

export async function createStandardBip44Wallet(request: {|
  db: lf$Database,
  rootPk: BIP32PrivateKey,
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
    request.rootPk.toBuffer(),
  );

  const chainKey = derivePath(
    request.rootPk,
    [
      WalletTypePurpose.BIP44,
      CoinTypes.ERGO,
      request.accountIndex,
      ChainDerivations.EXTERNAL,
    ]
  ).toPublic();

  const chainNetworkId = ((
    Number.parseInt(request.network.BaseConfig[0].ChainNetworkId, 10): any
  ): $Values<typeof RustModule.SigmaRust.NetworkPrefix>);

  const initialDerivations = await getChainDefaultDerivations(
    chainKey,
    chainNetworkId,
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
              Type: KeyKind.BIP32,
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
          PublicDeriverLevel: Bip44DerivationLevels.CHAIN.level,
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
                  index: CoinTypes.ERGO,
                  insert: {},
                },
                {
                  index: request.accountIndex,
                  insert: {},
                },
                {
                  index: ChainDerivations.EXTERNAL,
                  insert: {
                    DisplayCutoff: 0,
                  },
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
