//fixme: broken flow

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
  ErgoBip44PickReceive,
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
import { replaceMockBoxId } from '../../../app/api/ergo/lib/transactions/utils';

function genMockErgoCache(dummyWallet: PublicDeriver<>) {
  const pendingRequest = new CachedRequest(_publicDeriver => Promise.resolve([]));
  const recentRequest = new CachedRequest(_request => Promise.resolve({
    transactions: [],
    total: 0,
  }));
  const allRequest = new CachedRequest(_request => Promise.resolve({
    hash: 0,
    totalAvailable: 0,
    unconfirmedAmount: null,
    remoteTransactionIds: new Set(),
    timestamps: [],
    assetIds: [],
  }));
  const getBalanceRequest = new CachedRequest(request => request.getBalance());
  const getAssetDepositRequest = new CachedRequest(request => request.getBalance());
  return {
    conceptualWalletCache: {
      conceptualWallet: dummyWallet.getParent(),
      conceptualWalletName: 'Test wallet',
    },
    getPublicKeyCache: (wallet) => ({
      publicDeriver: wallet,
      // eslint-disable-next-line max-len
      // rent sword help dynamic enhance collect biology drama agent raven grape bike march length leisure
      plate: {
        ImagePart: '4047a1fc82e156f08252b2ba9ad9663d5d98570ba9fdeaa98a40acde82f5c7083bfd30b9e9bb82023d706b596058d59661275ae09100ebfafd5668501c055e19',
        TextPart: 'AZTH-1588',
      },
      publicKey: '0488b21e000000000000000000b9433af1acee90cab083bca7d59bc6fa65dbbfbbe0406cee9d11f48cced4fae903595503bb7c9b8d897078384ba49a0700e110440d844aea7610ca6e4e5526248d',
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
        getAssetDepositRequest,
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
  const clazz = HasUtxoChains(ErgoBip44PickReceive(
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
  publicDeriver: PublicDeriver<>,
): {|
  tentativeTx: null | ISignRequest<any>,
  inputAmount: MultiToken,
  fee: MultiToken,
|} => {
  const config = getErgoBaseConfig(
    publicDeriver.getParent().getNetworkInfo()
  ).reduce((acc, next) => Object.assign(acc, next), {});

  const remoteUnspentUtxos = [{
    entry: replaceMockBoxId({
      receiver: Buffer.from(RustModule.SigmaRust.NetworkAddress.from_base58(
        '9ew5xgVKW8u6f1qV6AbpVn1DrPT1zfNraGy6H9aTYTmXspBhxRs'
      ).to_bytes()).toString('hex'),
      amount: '10000000000',
      // additionalRegisters: Object.freeze({
      //   R4: '0e0474657374',
      //   R5: '0e0120',
      //   R6: '0e0131',
      // }),
      assets: [{
        tokenId: 'f2b5c4e4883555b882e3a5919967883aade9e0494290f29e0e3069f5ce9eabe4',
        amount: '12340'
      }],
      creationHeight: 327878,
      ergoTree: Buffer.from(RustModule.SigmaRust.Address.from_base58(
        '9ew5xgVKW8u6f1qV6AbpVn1DrPT1zfNraGy6H9aTYTmXspBhxRs'
      ).to_ergo_tree().sigma_serialize_bytes()).toString('hex'),
      boxId: 'dc18a160f90e139f4813759d86db87b7f80db228de8f6b8c493da954042881ef',
      tx_hash: '953ea849258ea1cb1d5ad79876f4f6294f091c034c2069d7f351b90fb7e1ccf1',
      tx_index: 0,
    }),
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
        '9iFo22w5LoHJcvKn6oK9Br7dw3bUqeXkRddeiKAEEFUr95zv1bY'
      ).to_bytes()).toString('hex'),
    },
    currentHeight: 999999,
    utxos: remoteUnspentUtxos.map(utxo => utxo.entry),
    txFee: fee,
    protocolParams: {
      FeeAddress: config.FeeAddress,
      MinimumBoxValue: config.MinimumBoxValue,
      NetworkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    },
  });

  const signRequest = new ErgoTxSignRequest({
    senderUtxos: remoteUnspentUtxos.map(utxo => ({ ...utxo.entry, addressing: utxo.addressing })),
    unsignedTx: sendAll.unsignedTx,
    changeAddr: sendAll.changeAddr,
    networkSettingSnapshot: {
      NetworkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
      ChainNetworkId: (Number.parseInt(config.ChainNetworkId, 10): any),
      FeeAddress: config.FeeAddress,
    },
  });

  const defaultToken = publicDeriver.getParent().getDefaultToken();
  return {
    tentativeTx: signRequest,
    inputAmount: remoteUnspentUtxos.reduce(
      (sum, next) => sum.joinAddMutable(new MultiToken(
        [
          {
            amount: new BigNumber(next.entry.amount),
            identifier: defaultToken.defaultIdentifier,
            networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
          },
          ...(next.entry.assets?.map(asset => ({
            amount: new BigNumber(asset.amount),
            identifier: asset.tokenId,
            networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
          })) ?? []),
        ],
        defaultToken
      )),
      new MultiToken([], defaultToken)
    ),
    fee: new MultiToken(
      [{
        identifier: defaultToken.defaultIdentifier,
        amount: new BigNumber('2000001'),
        networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
      }],
      defaultToken
    ),
  };
};
