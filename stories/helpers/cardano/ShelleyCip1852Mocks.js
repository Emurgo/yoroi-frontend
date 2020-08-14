// @flow

import { WalletTypeOption } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { Cip1852Wallet } from '../../../app/api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import { PublicDeriver } from '../../../app/api/ada/lib/storage/models/PublicDeriver';
import CachedRequest from '../../../app/stores/lib/LocalizedCachedRequest';
import BigNumber from 'bignumber.js';
import { assuranceModes } from '../../../app/config/transactionAssuranceConfig';
import { networks, getCardanoHaskellBaseConfig } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import {
  HasPrivateDeriver,
  HasSign,
  HasLevels,
  GetAllUtxos,
  GetSigningKey,
  GetPublicKey,
  DisplayCutoff,
  Cip1852PickInternal,
  GetAllAccounting,
  GetStakingKey,
  HasUtxoChains,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import {
  genToAbsoluteSlotNumber,
  genToRelativeSlotNumber,
  genTimeToSlot,
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeSinceGenesis,
  genToRealTime,
} from '../../../app/api/ada/lib/storage/bridge/timeUtils';
import {
  getNextConceptualWalletCounter,
  getNextPublicDeriverCounter,
} from '../CommonMocks';
import type { ConceptualWalletSettingsCache } from '../../../app/stores/toplevel/WalletSettingsStore';
import WalletSettingsStore from '../../../app/stores/toplevel/WalletSettingsStore';
import TransactionsStore from '../../../app/stores/toplevel/TransactionsStore';
import DelegationStore from '../../../app/stores/toplevel/DelegationStore';
import WalletStore from '../../../app/stores/toplevel/WalletStore';
import AdaTimeStore from '../../../app/stores/ada/AdaTimeStore';
import {
  Bip44DerivationLevels,
} from '../../../app/api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import type { HwWalletMetaRow, } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';

function genMockShelleyCip1852Cache(dummyWallet: PublicDeriver<>) {
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
    new BigNumber(0),
  ));
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

function genShelleyCip1852DummyWallet(): PublicDeriver<> {
  const conceptualWalletId = getNextConceptualWalletCounter();
  const parent = new Cip1852Wallet(
    (null: any),
    {
      db: (null: any),
      conceptualWalletId,
      walletType: WalletTypeOption.WEB_WALLET,
      hardwareInfo: null,
      networkInfo: networks.ByronMainnet,
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

export function genShelleyCip1852DummyWithCache(): ShelleyCip1852CacheValue {
  const dummyWallet = genShelleyCip1852DummyWallet();
  return {
    publicDeriver: dummyWallet,
    ...genMockShelleyCip1852Cache(dummyWallet),
  };
}

export function genShelleyCip1852SigningWallet(
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
      networkInfo: networks.ByronMainnet,
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
  const clazz = HasUtxoChains(Cip1852PickInternal(GetStakingKey(GetAllAccounting(
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

export function genSigningWalletWithCache(
  genHardwareInfo?: number => HwWalletMetaRow,
): ShelleyCip1852CacheValue {
  const dummyWallet = genShelleyCip1852SigningWallet(genHardwareInfo);
  return {
    publicDeriver: dummyWallet,
    ...genMockShelleyCip1852Cache(dummyWallet),
  };
}

export type ShelleyCip1852CacheValue = {|
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
    typeof AdaTimeStore.prototype.getTimeCalcRequests,
  getCurrentTimeRequests:
    typeof AdaTimeStore.prototype.getCurrentTimeRequests,
|};
