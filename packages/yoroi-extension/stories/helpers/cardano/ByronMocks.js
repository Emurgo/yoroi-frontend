//fixme: broken flow

import type { HwWalletMetaRow, } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import {
  getNextConceptualWalletCounter,
  getNextPublicDeriverCounter,
} from '../CommonMocks';
import CachedRequest from '../../../app/stores/lib/LocalizedCachedRequest';
import { PublicDeriver } from '../../../app/api/ada/lib/storage/models/PublicDeriver';
import {
  HasPrivateDeriver,
  HasSign,
  HasLevels,
  GetAllUtxos,
  GetSigningKey,
  GetPublicKey,
  DisplayCutoff,
  CardanoBip44PickReceive,
  HasUtxoChains,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import {
  Bip44DerivationLevels,
} from '../../../app/api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import { Bip44Wallet } from '../../../app/api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { WalletTypeOption } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { networks, getCardanoHaskellBaseConfig, defaultAssets, } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import type { ConceptualWalletSettingsCache } from '../../../app/stores/toplevel/WalletSettingsStore';
import WalletSettingsStore from '../../../app/stores/toplevel/WalletSettingsStore';
import TransactionsStore from '../../../app/stores/toplevel/TransactionsStore';
import WalletStore from '../../../app/stores/toplevel/WalletStore';
import AdaTimeStore from '../../../app/stores/ada/AdaTimeStore';
import {
  genToAbsoluteSlotNumber,
  genToRelativeSlotNumber,
  genTimeToSlot,
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeSinceGenesis,
  genToRealTime,
} from '../../../app/api/ada/lib/storage/bridge/timeUtils';
import BigNumber from 'bignumber.js';
import { assuranceModes } from '../../../app/config/transactionAssuranceConfig';
import { HaskellShelleyTxSignRequest } from '../../../app/api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type { ISignRequest } from '../../../app/api/common/lib/transactions/ISignRequest';
import DelegationStore from '../../../app/stores/toplevel/DelegationStore';
import AdaDelegationStore from '../../../app/stores/ada/AdaDelegationStore';
import {
  getDefaultEntryTokenInfo,
  mockFromDefaults,
} from '../../../app/stores/toplevel/TokenInfoStore';

function genByronSigningWallet(
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
      networkInfo: networks.CardanoMainnet,
      defaultToken: getDefaultEntryTokenInfo(
        networks.CardanoMainnet.NetworkId,
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
    null
  );
  const clazz = HasUtxoChains(CardanoBip44PickReceive(
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

function genMockByronBip44Cache(dummyWallet: PublicDeriver<>) {
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
        ImagePart: '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
        TextPart: 'DNKO-8098',
      },
      publicKey: '79b20a54d343785933f467e5ff212ad9d161be456127842d303434b06ff90cf9022da398bd785addbd78d46b6a085d8c14d1d5f010def1bb97111f5c00597e08',
    }),
    getDelegation: (_wallet) => (undefined),
    getAdaDelegation: (_wallet) => (undefined),
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
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        toRelativeSlotNumber: new CachedRequest(() => {
          return genToRelativeSlotNumber(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        timeToSlot: new CachedRequest(() => {
          return genTimeToSlot(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        currentEpochLength: new CachedRequest(() => {
          return genCurrentEpochLength(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        currentSlotLength: new CachedRequest(() => {
          return genCurrentSlotLength(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        timeSinceGenesis: new CachedRequest(() => {
          return genTimeSinceGenesis(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
          );
        }),
        toRealTime: new CachedRequest(() => {
          return genToRealTime(
            getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
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

export function genByronSigningWalletWithCache(
  genHardwareInfo?: number => HwWalletMetaRow,
): ByronCacheValue {
  const dummyWallet = genByronSigningWallet(genHardwareInfo);
  return {
    publicDeriver: dummyWallet,
    ...genMockByronBip44Cache(dummyWallet),
  };
}

export type ByronCacheValue = {|
  publicDeriver: PublicDeriver<>,
  conceptualWalletCache: ConceptualWalletSettingsCache,
  getPublicKeyCache:
    typeof WalletStore.prototype.getPublicKeyCache,
  getTransactions:
    typeof TransactionsStore.prototype.getTxRequests,
  getDelegation:
    typeof DelegationStore.prototype.getDelegationRequests,
  getAdaDelegation:
    typeof AdaDelegationStore.prototype.getDelegationRequests,
  getSigningKeyCache:
    typeof WalletStore.prototype.getSigningKeyCache,
  getPublicDeriverSettingsCache:
    typeof WalletSettingsStore.prototype.getPublicDeriverSettingsCache,
  getTimeCalcRequests:
    typeof AdaTimeStore.prototype.getTimeCalcRequests,
  getCurrentTimeRequests:
    typeof AdaTimeStore.prototype.getCurrentTimeRequests,
|};

export const genTentativeByronTx = (
  publicDeriver: PublicDeriver<>,
): {|
  tentativeTx: null | ISignRequest<any>,
  inputAmount: string,
  fee: BigNumber,
|} => {
  const inputAmount = '2000001';
  const ouputAmount = '1000000';
  const fee = new BigNumber(inputAmount).minus(new BigNumber(ouputAmount));

  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const config = getCardanoHaskellBaseConfig(networkInfo)
    .reduce((acc, next) => Object.assign(acc, next), {});
  const remoteUnspentUtxo = {
    amount: inputAmount,
    receiver: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
    assets: [],
  };
  const txBuilder = RustModule.WalletV4TxBuilderFromConfig(config);
  txBuilder.add_bootstrap_input(
    RustModule.WalletV4.ByronAddress.from_base58(remoteUnspentUtxo.receiver),
    RustModule.WalletV4.TransactionInput.new(
      RustModule.WalletV4.TransactionHash.from_bytes(
        Buffer.from(remoteUnspentUtxo.tx_hash, 'hex')
      ),
      remoteUnspentUtxo.tx_index
    ),
    RustModule.WalletV4.Value.new(RustModule.WalletV4.BigNum.from_str(remoteUnspentUtxo.amount))
  );
  txBuilder.add_output(RustModule.WalletV4.TransactionOutput.new(
    RustModule.WalletV4.ByronAddress.from_base58('Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN').to_address(),
    RustModule.WalletV4.Value.new(RustModule.WalletV4.BigNum.from_str(ouputAmount))
  ));
  txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str(fee.toString()));
  txBuilder.set_ttl(5);

  const baseConfig = getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
    .reduce((acc, next) => Object.assign(acc, next), {});
  return {
    tentativeTx: new HaskellShelleyTxSignRequest({
      senderUtxos: [{
        ...remoteUnspentUtxo,
        addressing: {
          path: [],
          startLevel: 0,
        },
      }],
      unsignedTx: txBuilder,
      changeAddr: [],
      metadata: undefined,
      networkSettingSnapshot: {
        ChainNetworkId: Number.parseInt(baseConfig.ChainNetworkId, 10),
        PoolDeposit: new BigNumber(baseConfig.PoolDeposit),
        KeyDeposit: new BigNumber(baseConfig.KeyDeposit),
        NetworkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
      },
      neededStakingKeyHashes: {
        neededHashes: new Set(),
        wits: new Set(),
      },
    }),
    inputAmount,
    fee,
  };
};
