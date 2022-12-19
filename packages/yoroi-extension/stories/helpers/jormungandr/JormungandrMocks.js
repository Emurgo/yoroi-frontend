//fixme: broken flow

import {
  genToAbsoluteSlotNumber,
  genToRelativeSlotNumber,
  genTimeToSlot,
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeSinceGenesis,
  genToRealTime,
} from '../../../app/api/jormungandr/lib/storage/bridge/timeUtils';
import { JormungandrTxSignRequest } from '../../../app/api/jormungandr/lib/transactions/JormungandrTxSignRequest';
import { utxoToTxInput } from '../../../app/api/jormungandr/lib/transactions/inputSelection';
import { PublicDeriver } from '../../../app/api/ada/lib/storage/models/PublicDeriver';
import CachedRequest from '../../../app/stores/lib/LocalizedCachedRequest';
import BigNumber from 'bignumber.js';
import { assuranceModes } from '../../../app/config/transactionAssuranceConfig';
import { networks, getJormungandrBaseConfig, isJormungandr, defaultAssets, } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import { WalletTypeOption } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { Cip1852Wallet } from '../../../app/api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import {
  HasPrivateDeriver,
  HasSign,
  HasLevels,
  GetAllUtxos,
  GetSigningKey,
  GetPublicKey,
  DisplayCutoff,
  Cip1852JormungandrPickReceive,
  GetAllAccounting,
  GetStakingKey,
  HasUtxoChains,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import {
  getNextConceptualWalletCounter,
  getNextPublicDeriverCounter,
} from '../CommonMocks';
import type { ConceptualWalletSettingsCache } from '../../../app/stores/toplevel/WalletSettingsStore';
import WalletSettingsStore from '../../../app/stores/toplevel/WalletSettingsStore';
import TransactionsStore from '../../../app/stores/toplevel/TransactionsStore';
import DelegationStore from '../../../app/stores/toplevel/DelegationStore';
import WalletStore from '../../../app/stores/toplevel/WalletStore';
import JormungandrTimeStore from '../../../app/stores/jormungandr/JormungandrTimeStore';
import type { HwWalletMetaRow, } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import {
  Bip44DerivationLevels,
} from '../../../app/api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type { ISignRequest } from '../../../app/api/common/lib/transactions/ISignRequest';
import {
  getDefaultEntryTokenInfo,
  mockFromDefaults,
} from '../../../app/stores/toplevel/TokenInfoStore';

function genMockJormungandrCache(dummyWallet: PublicDeriver<>) {
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
      plate: {
        ImagePart: '1dda96f3e8a39341da9549bef4be416c173eeb940f092cfc98d5c63a06c6007d326c77a599b1fd36ddf57507b8ea52537f129dac7bceb18c674bc3baab90411f',
        TextPart: 'ATPE-6458',
      },
      publicKey: '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
    }),
    getDelegation: (_wallet) => (undefined),
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
    getTimeCalcRequests: (publicDeriver) => ({
      publicDeriver,
      requests: {
        toAbsoluteSlot: new CachedRequest(() => {
          return genToAbsoluteSlotNumber(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        toRelativeSlotNumber: new CachedRequest(() => {
          return genToRelativeSlotNumber(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        timeToSlot: new CachedRequest(() => {
          return genTimeToSlot(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        currentEpochLength: new CachedRequest(() => {
          return genCurrentEpochLength(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        currentSlotLength: new CachedRequest(() => {
          return genCurrentSlotLength(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        timeSinceGenesis: new CachedRequest(() => {
          return genTimeSinceGenesis(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        toRealTime: new CachedRequest(() => {
          return genToRealTime(
            getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
      },
    }),
    getCurrentTimeRequests: (publicDeriver) => ({
      publicDeriver,
      currentEpoch: 100,
      currentSlot: 5000,
      msIntoSlot: 10,
    }),
  };
}

function genJormungandrDummyWallet(): PublicDeriver<> {
  const conceptualWalletId = getNextConceptualWalletCounter();
  const parent = new Cip1852Wallet(
    (null: any),
    {
      db: (null: any),
      conceptualWalletId,
      walletType: WalletTypeOption.WEB_WALLET,
      hardwareInfo: null,
      networkInfo: networks.JormungandrMainnet,
      defaultToken: getDefaultEntryTokenInfo(
        networks.JormungandrMainnet.NetworkId,
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

export function genJormungandrDummyWithCache(): JormungandrCacheValue {
  const dummyWallet = genJormungandrDummyWallet();
  return {
    publicDeriver: dummyWallet,
    ...genMockJormungandrCache(dummyWallet),
  };
}

function genSigningWallet(
  genHardwareInfo?: number => HwWalletMetaRow,
): PublicDeriver<> {
  const conceptualWalletId = getNextConceptualWalletCounter();
  const hardwareInfo = genHardwareInfo == null
    ? null
    : genHardwareInfo(conceptualWalletId);
  const parent = new Cip1852Wallet(
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
      networkInfo: networks.JormungandrMainnet,
      defaultToken: getDefaultEntryTokenInfo(
        networks.JormungandrMainnet.NetworkId,
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
  const clazz = HasUtxoChains(Cip1852JormungandrPickReceive(GetStakingKey(GetAllAccounting(
    DisplayCutoff(GetSigningKey(GetPublicKey(
      GetAllUtxos(HasLevels(HasSign(HasPrivateDeriver((PublicDeriver: any)))))
    )))
  ))));
  const self = new clazz({
    publicDeriverId: getNextPublicDeriverCounter(),
    parent,
    pathToPublic: [],
    derivationId: 0,
  });
  return self;
}

export function genJormungandrSigningWalletWithCache(
  genHardwareInfo?: number => HwWalletMetaRow,
): JormungandrCacheValue {
  const dummyWallet = genSigningWallet(genHardwareInfo);
  return {
    publicDeriver: dummyWallet,
    ...genMockJormungandrCache(dummyWallet),
  };
}

export type JormungandrCacheValue = {|
  publicDeriver: PublicDeriver<>,
  conceptualWalletCache: ConceptualWalletSettingsCache,
  getPublicKeyCache:
    typeof WalletStore.prototype.getPublicKeyCache,
  getTransactions:
    typeof TransactionsStore.prototype.getTxRequests,
  getDelegation:
    typeof DelegationStore.prototype.getDelegationRequests,
  getSigningKeyCache:
    typeof WalletStore.prototype.getSigningKeyCache,
  getPublicDeriverSettingsCache:
    typeof WalletSettingsStore.prototype.getPublicDeriverSettingsCache,
  getTimeCalcRequests:
    typeof JormungandrTimeStore.prototype.getTimeCalcRequests,
  getCurrentTimeRequests:
    typeof JormungandrTimeStore.prototype.getCurrentTimeRequests,
|};


export const genJormungandrUndelegateTx = (
  publicDeriver: PublicDeriver<>,
): JormungandrTxSignRequest => {
  const inputAmount = '1000001';

  if (!isJormungandr(publicDeriver.getParent().getNetworkInfo())) {
    throw new Error('Delegation only supported for Jormungandr');
  }
  const remoteUnspentUtxo = {
    amount: inputAmount,
    receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  };
  const input = utxoToTxInput(remoteUnspentUtxo);
  const builder = RustModule.WalletV3.InputOutputBuilder.empty();
  builder.add_input(input);
  const IOs = builder.build();

  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const config = getJormungandrBaseConfig(networkInfo)
    .reduce((acc, next) => Object.assign(acc, next), {});

  return new JormungandrTxSignRequest({
    senderUtxos: [{
      ...remoteUnspentUtxo,
      addressing: {
        path: [],
        startLevel: 0,
      },
    }],
    unsignedTx: IOs,
    changeAddr: [],
    certificate: undefined, // TODO
    networkSettingSnapshot: {
      NetworkId: networkInfo.NetworkId,
      ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
    },
  });
};

export const genTentativeJormungandrTx = (
  publicDeriver: PublicDeriver<>,
): {|
  tentativeTx: null | ISignRequest<any>,
  inputAmount: string,
  fee: BigNumber,
|} => {
  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const config = getJormungandrBaseConfig(networkInfo)
    .reduce((acc, next) => Object.assign(acc, next), {});

  const inputAmount = '1000001';
  const outputAmount = '400';
  const fee = new BigNumber(inputAmount).minus(new BigNumber(outputAmount));

  const remoteUnspentUtxo = {
    amount: inputAmount,
    receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  };
  const input = utxoToTxInput(remoteUnspentUtxo);
  const builder = RustModule.WalletV3.InputOutputBuilder.empty();
  builder.add_input(input);
  builder.add_output(
    RustModule.WalletV3.Address.from_string('addr1s33chdhaexquujgnwm458swlt4tl2t5qyyk7d04gtdy5utp4y6c9sf4nrtlu7glkdwww3leg94jr6rkt9prwfgfp7symp5nj08zuln4lmxjv7k'),
    RustModule.WalletV3.Value.from_str(outputAmount)
  );
  const unsignedTx = builder.build();
  return {
    tentativeTx: new JormungandrTxSignRequest({
      senderUtxos: [{
        ...remoteUnspentUtxo,
        addressing: {
          path: [],
          startLevel: 0,
        },
      }],
      unsignedTx,
      changeAddr: [],
      certificate: undefined,
      networkSettingSnapshot: {
        NetworkId: networkInfo.NetworkId,
        ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
      },
    }),
    inputAmount,
    fee,
  };
};
