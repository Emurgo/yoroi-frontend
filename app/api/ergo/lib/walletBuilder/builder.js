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
import { Address } from '@coinbarn/ergo-ts';

import { encryptWithPassword } from '../../../../utils/passwordCipher';

import type {
  TreeInsert,
} from '../../../ada/lib/storage/database/walletTypes/common/utils';
import type { Bip44ChainInsert } from '../../../ada/lib/storage/database/walletTypes/common/tables';
import { WalletBuilder } from '../../../ada/lib/storage/bridge/walletBuilder/builder';
import type { NetworkRow } from '../../../ada/lib/storage/database/primitives/tables';
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
import { derivePath, BIP32PublicKey, BIP32PrivateKey } from '../../../common/lib/crypto/keys/keyRepository';

// TODO: maybe move this inside walletBuilder somehow so it's all done in the same transaction
/**
 * We generate addresses here instead of relying on scanning functions
 * This is because scanning depends on having an internet connection
 * But we need to ensure the address maintains the BIP44 gap regardless of internet connection
 */
export async function getAccountDefaultDerivations(
  bip32Account: BIP32PublicKey,
  addByHash: AddByHashFunc,
): Promise<TreeInsert<Bip44ChainInsert>> {
  const addressesIndex = range(
    0,
    BIP44_SCAN_SIZE
  );

  const externalAddrs = addressesIndex.map(i => (
    Address.fromPk(
      derivePath(
        bip32Account,
        [
          ChainDerivations.EXTERNAL,
          i,
        ]
      )
        .key
        .publicKey
        .toString('hex')
    ).addrBytes.toString('hex')
  ));
  const internalAddrs = addressesIndex.map(i => (
    Address.fromPk(
      derivePath(
        bip32Account,
        [
          ChainDerivations.INTERNAL,
          i,
        ]
      )
        .key
        .publicKey
        .toString('hex')
    ).addrBytes.toString('hex')
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
  const internalAddresses = addressesIndex.map(i => ({
    index: i,
    insert: async insertRequest => {
      return await addErgoP2PK(
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

  const accountKey = derivePath(
    request.rootPk,
    [
      WalletTypePurpose.BIP44,
      CoinTypes.ERGO,
      request.accountIndex,
    ]
  ).toPublic();

  const initialDerivations = await getAccountDefaultDerivations(
    accountKey,
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
              path: [WalletTypePurpose.BIP44, CoinTypes.ERGO, request.accountIndex],
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
