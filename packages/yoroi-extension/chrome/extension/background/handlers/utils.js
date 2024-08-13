// @flow

import type { PublicDeriver } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import type { WalletState } from '../types';
import {
  asGetAllUtxos,
  asHasLevels,
  asGetPublicKey,
  asGetSigningKey,
  asGetStakingKey,
  asHasUtxoChains,
  asGetBalance,
} from '../../../../app/api/ada/lib/storage/models/PublicDeriver/traits'
import { getWalletChecksum } from '../../../../app/api/export/utils';
import { getReceiveAddress } from '../../../../app/stores/stateless/addressStores';
import { assuranceModes } from '../../../../app/config/transactionAssuranceConfig';
import { getChainAddressesForDisplay, } from '../../../../app/api/ada/lib/storage/models/utils';
import { CoreAddressTypes } from '../../../../app/api/ada/lib/storage/database/primitives/enums';
import { ChainDerivations } from '../../../../app/config/numbersConfig';
import {
  getAllAddressesForWallet,
  getAllAddressesForDisplay,
} from '../../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getForeignAddresses } from '../../../../app/api/ada/lib/storage/bridge/updateTransactions';
import {
  isLedgerNanoWallet,
  isTrezorTWallet
} from '../../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import { Bip44Wallet } from '../../../../app/api/ada/lib/storage/models/Bip44Wallet/wrapper';
import {
  isTestnet,
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
} from '../../../../app/api/ada/lib/storage/database/prepackaged/networks';
import BigNumber from 'bignumber.js';
import {
  asAddressedUtxo,
  cardanoMinAdaRequiredFromRemoteFormat_coinsPerWord,
} from '../../../../app/api/ada/transactions/utils';
import { MultiToken } from '../../../../app/api/common/lib/MultiToken';
import { RustModule } from '../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { loadSubmittedTransactions } from '../../../../app/api/localStorage';
import { getDb } from '../state/databaseManager';
// eslint-disable-next-line import/no-cycle
import { refreshingWalletIdSet } from '../state/refreshScheduler';
import { loadWalletsFromStorage } from '../../../../app/api/ada/lib/storage/models/load';

export async function getWalletsState(publicDeriverId: ?number): Promise<Array<WalletState>> {
  const db = await getDb();
  let publicDerivers = await loadWalletsFromStorage(db);
  if (typeof publicDeriverId === 'number') {
    const publicDeriver = publicDerivers.find(pd =>
      pd.getPublicDeriverId() === publicDeriverId
    );
    if (publicDeriver) {
      publicDerivers = [publicDeriver];
    } else {
      publicDerivers = [];
    }
  }
  const walletStates = await Promise.all(publicDerivers.map(getWalletState));
  await batchLoadSubmittedTransactions(walletStates);
  return walletStates;
}

async function getWalletState(publicDeriver: PublicDeriver<>): Promise<WalletState> {
  await RustModule.load();

  const publicDeriverId = publicDeriver.getPublicDeriverId();

  const conceptualWalletInfo = await publicDeriver.getParent().getFullConceptualWalletInfo();
  const network = publicDeriver.getParent().getNetworkInfo();

  const type = (() => {
    if (isLedgerNanoWallet(publicDeriver.getParent())) {
      return 'ledger';
    }
    if (isTrezorTWallet(publicDeriver.getParent())) {
      return 'trezor';
    }
    return 'mnemonic';
  })();

  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    throw new Error('unexpected missing asGetAllUtxos result');
  }
  const utxos = await withUtxos.getAllUtxos();
  const addressedUtxos = asAddressedUtxo(utxos).filter(u => u.assets.length > 0);
  const config = getCardanoHaskellBaseConfig(network).reduce(
    (acc, next) => Object.assign(acc, next),
    {}
  );
  const deposits: Array<BigNumber> = addressedUtxos.map(u => {
    try {
      return cardanoMinAdaRequiredFromRemoteFormat_coinsPerWord(
        // $FlowIgnore[prop-missing] property `addressing` is missing in  `RemoteUnspentOutput` [1] but exists in  `CardanoAddressedUtxo` [2]
        u,
        new BigNumber(config.CoinsPerUtxoWord),
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(
        `Failed to calculate min-required ADA for utxo: ${JSON.stringify(u)}`,
        e
      );
      return new BigNumber('0');
    }
  });
  const sumDeposit = deposits.reduce((a, b) => a.plus(b), new BigNumber('0'));
  const defaultTokenId = publicDeriver.getParent().getDefaultMultiToken().defaults.defaultIdentifier;
  const assetDeposits =  new MultiToken(
    [
      {
        identifier: defaultTokenId,
        amount: sumDeposit,
        networkId: network.NetworkId,
      },
    ],
    {
      defaultNetworkId: network.NetworkId,
      defaultIdentifier: defaultTokenId,
    }
  );

  const withPubKey = asGetPublicKey(publicDeriver);
  if (withPubKey == null) {
    throw new Error('unexpected missing asGetPublicKey result');
  }
  const publicKey = await withPubKey.getPublicKey();
  const plate = await getWalletChecksum(withPubKey);

  const receiveAddress = await getReceiveAddress(publicDeriver);
  if (receiveAddress == null) {
    throw new Error('unexpected missing receive address');
  }

  const signingKeyUpdateDate =
      (await asGetSigningKey(publicDeriver)?.getSigningKey())?.row.PasswordLastUpdate?.toISOString()
      || null;

  const withStakingKey = asGetStakingKey(publicDeriver);
  if (withStakingKey == null) {
    throw new Error('unexpected missing asGetAllAccounting result');
  }
  const stakingKeyDbRow = await withStakingKey.getStakingKey();

  const withUtxoChains = asHasUtxoChains(publicDeriver);
  if (withUtxoChains == null) {
    throw new Error('unexpected missing asHasUtxoChains result');
  }
  const allAddressesByType = [];
  const externalAddressesByType = [];
  const internalAddressesByType = [];

  for (const typeName of Object.keys(CoreAddressTypes)) {
    const addrType = CoreAddressTypes[typeName];

    allAddressesByType[addrType] = await getAllAddressesForDisplay({
      publicDeriver,
      type: addrType
    });
    externalAddressesByType[addrType] = await getChainAddressesForDisplay({
      publicDeriver: withUtxoChains,
      chainsRequest: { chainId: ChainDerivations.EXTERNAL },
      type: addrType
    });
    internalAddressesByType[addrType] = await getChainAddressesForDisplay({
      publicDeriver: withUtxoChains,
      chainsRequest: { chainId: ChainDerivations.INTERNAL },
      type: addrType
    });
  }
  const allAddresses = await getAllAddressesForWallet(publicDeriver);

  const withLevels = asHasLevels(publicDeriver);
  if (withLevels == null) {
    throw new Error('unexpected missing asHasLevels result');
  }
  const foreignAddresses = await getForeignAddresses({ publicDeriver: withLevels });

  const allUtxoAddresses = await withUtxos.getAllUtxoAddresses();

  const canGetBalance = asGetBalance(publicDeriver);
  if (canGetBalance == null) {
    throw new Error('unexpected missing asGetBalance result');
  }
  const balance = await canGetBalance.getBalance();

  return {
    publicDeriverId,
    conceptualWalletId: publicDeriver.getParent().getConceptualWalletId(),
    utxos,
    transactions: [], // fixme
    networkId: network.NetworkId,
    name: conceptualWalletInfo.Name,
    type,
    hardwareWalletDeviceId: publicDeriver.getParent().hardwareInfo?.DeviceId,
    plate,
    publicKey: publicKey.Hash,
    receiveAddress,
    pathToPublic: withPubKey.pathToPublic,
    signingKeyUpdateDate,
    stakingAddressing: { addressing: stakingKeyDbRow.addressing },
    stakingAddress: stakingKeyDbRow.addr.Hash,
    publicDeriverLevel: withLevels.getParent().getPublicDeriverLevel(),
    lastSyncInfo: await publicDeriver.getLastSyncInfo(),
    balance,
    assetDeposits,
    defaultTokenId,
    assuranceMode: assuranceModes.NORMAL,
    allAddressesByType,
    foreignAddresses,
    externalAddressesByType,
    internalAddressesByType,
    allAddresses,
    allUtxoAddresses,
    isBip44Wallet: publicDeriver.getParent() instanceof Bip44Wallet,
    isTestnet: isTestnet(network),
    isCardanoHaskell: isCardanoHaskell(network),
    isRefreshing: refreshingWalletIdSet.has(publicDeriverId),
    submittedTransactions: [],
  };
}

async function batchLoadSubmittedTransactions(walletStates: Array<WalletState>) {
  const walletStateByIdMap = new Map();
  for (const walletState of walletStates) {
    walletStateByIdMap.set(walletState.publicDeriverId, walletState);
  }

  const allSubmittedTxs = await loadSubmittedTransactions();
  for (const submittedTx of allSubmittedTxs) {
    const walletState = walletStateByIdMap.get(submittedTx.publicDeriverId);
    if (walletState) {
      walletState.submittedTransactions.push(submittedTx);
    }
  }
}


export async function getPlaceHolderWalletState(publicDeriver: PublicDeriver<>): Promise<WalletState> {
  const publicDeriverId = publicDeriver.getPublicDeriverId();

  const conceptualWalletInfo = await publicDeriver.getParent().getFullConceptualWalletInfo();
  const network = publicDeriver.getParent().getNetworkInfo();

  const type = (() => {
    if (isLedgerNanoWallet(publicDeriver.getParent())) {
      return 'ledger';
    }
    if (isTrezorTWallet(publicDeriver.getParent())) {
      return 'trezor';
    }
    return 'mnemonic';
  })();

  const zero = new MultiToken([], { defaultNetworkId: network.NetworkId, defaultIdentifier: '' });

  return {
    publicDeriverId,
    conceptualWalletId: publicDeriver.getParent().getConceptualWalletId(),
    utxos: [],
    transactions: [], // fixme
    networkId: network.NetworkId,
    name: conceptualWalletInfo.Name,
    type,
    hardwareWalletDeviceId: publicDeriver.getParent().hardwareInfo?.DeviceId,
    plate: { ImagePart: '', TextPart: '' },
    publicKey: '',
    receiveAddress: {
      addr: { AddressId: 0, Digest: 0, Type: 0, Hash: '', IsUsed: false },
      row: { CanonicalAddressId: 0, KeyDerivationId: 0 },
      addressing: {
        path: [],
        startLevel: 0,
      },
    },
    pathToPublic: [],
    signingKeyUpdateDate: null,
    stakingAddressing: { addressing: { path: [], startLevel: 0 } },
    stakingAddress: '',
    publicDeriverLevel: 0,
    lastSyncInfo: {
      LastSyncInfoId: 0,
      Time: null,
      SlotNum: null,
      BlockHash: null,
      Height: 0,
    },
    balance: zero,
    assetDeposits: zero,
    defaultTokenId: '',
    assuranceMode: assuranceModes.NORMAL,
    allAddressesByType: [],
    foreignAddresses: [],
    externalAddressesByType: [],
    internalAddressesByType: [],
    allAddresses: { utxoAddresses: [], accountingAddresses: [] },
    allUtxoAddresses: [],
    isBip44Wallet: publicDeriver.getParent() instanceof Bip44Wallet,
    isTestnet: isTestnet(network),
    isCardanoHaskell: isCardanoHaskell(network),
    isRefreshing: true,
    submittedTransactions: [],
  };
}
