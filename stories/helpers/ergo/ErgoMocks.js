// @flow

import { ErgoTxSignRequest } from '../../../app/api/ergo/lib/transactions/ErgoTxSignRequest';
import { PublicDeriver } from '../../../app/api/ada/lib/storage/models/PublicDeriver';
import CachedRequest from '../../../app/stores/lib/LocalizedCachedRequest';
import BigNumber from 'bignumber.js';
import { assuranceModes } from '../../../app/config/transactionAssuranceConfig';
import { networks, getErgoBaseConfig, defaultAssets, } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import { WalletTypeOption } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { Bip44Wallet } from '../../../app/api/ada/lib/storage/models/Bip44Wallet/wrapper';
import {
  HasPrivateDeriver,
  HasSign,
  HasLevels,
  GetAllUtxos,
  GetSigningKey,
  GetPublicKey,
  DisplayCutoff,
  HasUtxoChains,
  Bip44PickInternal,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import {
  getNextConceptualWalletCounter,
  getNextPublicDeriverCounter,
} from '../CommonMocks';
import type { ConceptualWalletSettingsCache } from '../../../app/stores/toplevel/WalletSettingsStore';
import WalletSettingsStore from '../../../app/stores/toplevel/WalletSettingsStore';
import TransactionsStore from '../../../app/stores/toplevel/TransactionsStore';
import WalletStore from '../../../app/stores/toplevel/WalletStore';
import type { HwWalletMetaRow, } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import {
  Bip44DerivationLevels,
} from '../../../app/api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type { ISignRequest } from '../../../app/api/common/lib/transactions/ISignRequest';
import {
  MultiToken,
} from '../../../app/api/common/lib/MultiToken';
import {
  getDefaultEntryTokenInfo,
  mockFromDefaults,
} from '../../../app/stores/toplevel/TokenInfoStore';
import { sendAllUnsignedTxFromUtxo } from '../../../app/api/ergo/lib/transactions/utxoTransaction';
import type { NetworkRow } from '../../../app/api/ada/lib/storage/database/primitives/tables';

function genMockErgoCache(dummyWallet: PublicDeriver<>) {
  const defaultToken = dummyWallet.getParent().getDefaultToken();

  const pendingRequest = new CachedRequest(_publicDeriver => Promise.resolve([]));
  const recentRequest = new CachedRequest(_request => Promise.resolve({
    transactions: [],
    total: 0,
  }));
  const allRequest = new CachedRequest(_request => Promise.resolve({
    transactions: [],
    total: 0,
  }));
  const getBalanceRequest = new CachedRequest(_request => Promise.resolve(
    new MultiToken([], defaultToken),
  ));
  return {
    conceptualWalletCache: {
      conceptualWallet: dummyWallet.getParent(),
      conceptualWalletName: 'Test wallet',
    },
    getPublicKeyCache: (wallet) => ({
      publicDeriver: wallet,
      plate: {
        ImagePart: '2dda96f3e8a39341da9549bef4be416c173eeb940f092cfc98d5c63a06c6007d326c77a599b1fd36ddf57507b8ea52537f129dac7bceb18c674bc3baab90411f',
        TextPart: 'CTPE-6458',
      },
      publicKey: '9e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
    }),
    getTransactions: (wallet) => ({
      publicDeriver: wallet,
      lastSyncInfo: {
        BlockHash: null,
        LastSyncInfoId: 1,
        SlotNum: null,
        Height: 0,
        Time: null,
      },
      requests: {
        pendingRequest,
        recentRequest,
        allRequest,
        getBalanceRequest,
      },
    }),
    getPublicDeriverSettingsCache: (publicDeriver) => ({
      publicDeriver,
      assuranceMode: assuranceModes.NORMAL,
      publicDeriverName: '',
    }),
    getSigningKeyCache: (publicDeriver) => ({
      publicDeriver,
      signingKeyUpdateDate: null,
    }),
  };
}

function genErgoDummyWallet(): PublicDeriver<> {
  const conceptualWalletId = getNextConceptualWalletCounter();
  const parent = new Bip44Wallet(
    (null: any),
    {
      db: (null: any),
      conceptualWalletId,
      walletType: WalletTypeOption.WEB_WALLET,
      hardwareInfo: null,
      networkInfo: networks.ErgoMainnet,
      defaultToken: getDefaultEntryTokenInfo(
        networks.ErgoMainnet.NetworkId,
        mockFromDefaults(defaultAssets)
      ),
    },
    {
      ConceptualWalletId: conceptualWalletId,
      SignerLevel: null,
      PublicDeriverLevel: 0,
      PrivateDeriverLevel: null,
      PrivateDeriverKeyDerivationId: null,
      RootKeyDerivationId: 0,
    },
    null,
    null,
  );
  const clazz = GetPublicKey(HasLevels(HasSign(PublicDeriver)));
  const self = new clazz({
    publicDeriverId: getNextPublicDeriverCounter(),
    parent,
    pathToPublic: [],
    derivationId: 0,
  });
  return self;
}

export function genErgoDummyWithCache(): ErgoCacheValue {
  const dummyWallet = genErgoDummyWallet();
  return {
    publicDeriver: dummyWallet,
    ...genMockErgoCache(dummyWallet),
  };
}

function genSigningWallet(
  genHardwareInfo?: number => HwWalletMetaRow,
): PublicDeriver<> {
  const conceptualWalletId = getNextConceptualWalletCounter();
  const hardwareInfo = genHardwareInfo == null
    ? null
    : genHardwareInfo(conceptualWalletId);
  const parent = new Bip44Wallet(
    (null: any),
    {
      db: (null: any),
      conceptualWalletId,
      walletType: (() => {
        if (hardwareInfo != null) {
          return WalletTypeOption.HARDWARE_WALLET;
        }
        return WalletTypeOption.WEB_WALLET;
      })(),
      hardwareInfo,
      networkInfo: networks.ErgoMainnet,
      defaultToken: getDefaultEntryTokenInfo(
        networks.ErgoMainnet.NetworkId,
        mockFromDefaults(defaultAssets)
      ),
    },
    {
      ConceptualWalletId: conceptualWalletId,
      SignerLevel: null,
      PublicDeriverLevel: Bip44DerivationLevels.ACCOUNT.level,
      PrivateDeriverLevel: null,
      PrivateDeriverKeyDerivationId: null,
      RootKeyDerivationId: 0,
    },
    null,
    null,
  );
  const clazz = HasUtxoChains(Bip44PickInternal(
    DisplayCutoff(GetSigningKey(GetPublicKey(
      GetAllUtxos(HasLevels(HasSign(HasPrivateDeriver((PublicDeriver: any)))))
    )))
  ));
  const self = new clazz({
    publicDeriverId: getNextPublicDeriverCounter(),
    parent,
    pathToPublic: [],
    derivationId: 0,
  });
  return self;
}

export function genErgoSigningWalletWithCache(
  genHardwareInfo?: number => HwWalletMetaRow,
): ErgoCacheValue {
  const dummyWallet = genSigningWallet(genHardwareInfo);
  return {
    publicDeriver: dummyWallet,
    ...genMockErgoCache(dummyWallet),
  };
}

export type ErgoCacheValue = {|
  publicDeriver: PublicDeriver<>,
  conceptualWalletCache: ConceptualWalletSettingsCache,
  getPublicKeyCache:
    typeof WalletStore.prototype.getPublicKeyCache,
  getTransactions:
    typeof TransactionsStore.prototype.getTxRequests,
  getSigningKeyCache:
    typeof WalletStore.prototype.getSigningKeyCache,
  getPublicDeriverSettingsCache:
    typeof WalletSettingsStore.prototype.getPublicDeriverSettingsCache,
|};

export const genTentativeErgoTx = (
  network: $ReadOnly<NetworkRow>,
): {|
  tentativeTx: null | ISignRequest<any>,
  inputAmount: string,
  fee: BigNumber,
|} => {
  const config = getErgoBaseConfig(
    network
  ).reduce((acc, next) => Object.assign(acc, next), {});

  const remoteUnspentUtxos = [{
    entry: {
      receiver: Buffer.from(RustModule.SigmaRust.NetworkAddress.from_base58(
        '9hD2Cw6yQL6zzrw3TFgKdwFkBdDdU3ro1xRFmjouDw4NYS2S5RD'
      ).to_bytes()).toString('hex'),
      amount: '1100000',
      additionalRegisters: Object.freeze({
        R4: '0e0474657374',
        R5: '0e0120',
        R6: '0e0131',
      }),
      assets: [{
        tokenId: 'c804ec8f26627b004b11cf7387b6823893737ce682ebd70a7da902e95f49a4ae',
        amount: 12340
      }],
      creationHeight: 327878,
      ergoTree: '0008cd03622070184643e8089c6ff367dc648eacc6bcf9ee34c07fafa7e61075df25b58b',
      boxId: 'dc18a160f90e139f4813759d86db87b7f80db228de8f6b8c493da954042881ef',
      tx_hash: '953ea849258ea1cb1d5ad79876f4f6294f091c034c2069d7f351b90fb7e1ccf1',
      tx_index: 0,
    },
    addressing: {
      path: [],
      startLevel: 0,
    },
  }];

  const fee = new BigNumber(
    RustModule.SigmaRust.BoxValue.SAFE_USER_MIN().as_i64().to_str()
  );
  const sendAll = sendAllUnsignedTxFromUtxo({
    receiver: {
      address: Buffer.from(RustModule.SigmaRust.NetworkAddress.from_base58(
        '9hD2Cw6yQL6zzrw3TFgKdwFkBdDdU3ro1xRFmjouDw4NYS2S5RD'
      ).to_bytes()).toString('hex'),
    },
    currentHeight: 999999,
    utxos: remoteUnspentUtxos.map(utxo => utxo.entry),
    txFee: fee,
    protocolParams: {
      FeeAddress: config.FeeAddress,
      MinimumBoxValue: config.MinimumBoxValue,
      NetworkId: network.NetworkId,
    },
  });

  const signRequest = new ErgoTxSignRequest({
    senderUtxos: remoteUnspentUtxos.map(utxo => ({ ...utxo.entry, addressing: utxo.addressing })),
    unsignedTx: sendAll.unsignedTx,
    changeAddr: sendAll.changeAddr,
    networkSettingSnapshot: {
      NetworkId: network.NetworkId,
      ChainNetworkId: (Number.parseInt(config.ChainNetworkId, 10): any),
      FeeAddress: config.FeeAddress,
    },
  });
  return {
    tentativeTx: signRequest,
    inputAmount: remoteUnspentUtxos.reduce(
      (sum, next) => sum.plus(next.entry.amount),
      new BigNumber(0)
    ).toString(),
    fee,
  };
};
