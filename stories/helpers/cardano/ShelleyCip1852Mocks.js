// @flow

import { WalletTypeOption } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { Cip1852Wallet } from '../../../app/api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import { PublicDeriver } from '../../../app/api/ada/lib/storage/models/PublicDeriver';
import CachedRequest from '../../../app/stores/lib/LocalizedCachedRequest';
import BigNumber from 'bignumber.js';
import { assuranceModes } from '../../../app/config/transactionAssuranceConfig';
import { networks, getCardanoHaskellBaseConfig, defaultAssets } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
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
import type { ISignRequest } from '../../../app/api/common/lib/transactions/ISignRequest';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { HaskellShelleyTxSignRequest } from '../../../app/api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import AdaDelegationStore from '../../../app/stores/ada/AdaDelegationStore';
import {
  MultiToken,
} from '../../../app/api/common/lib/MultiToken';
import {
  getDefaultEntryTokenInfo,
  mockFromDefaults,
} from '../../../app/stores/toplevel/TokenInfoStore';

function genMockShelleyCip1852Cache(dummyWallet: PublicDeriver<>) {
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
        ImagePart: 'b04dc22991594170974bbbb5908cc50b48f236d680a9ebfe6c1d00f52f8f4813341943eb66dec48cfe7f3be5beec705b91300a07641e668ff19dfa2fbeccbfba',
        TextPart: 'JHKT-8080',
      },
      publicKey: '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
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
      networkInfo: networks.CardanoMainnet,
      defaultToken: getDefaultEntryTokenInfo(
        networks.CardanoMainnet.NetworkId,
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

export function genShelleyCIP1852SigningWalletWithCache(
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

export const genTentativeShelleyTx = (
  publicDeriver: PublicDeriver<>,
): {|
  tentativeTx: ISignRequest<any>,
  inputAmount: MultiToken,
  fee: MultiToken,
|} => {
  const defaultToken = publicDeriver.getParent().getDefaultToken();

  const inputAmount = new MultiToken(
    [{
      identifier: defaultToken.defaultIdentifier,
      amount: new BigNumber('2000001'),
      networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    }],
    defaultToken
  );
  const outputAmount = new MultiToken(
    [{
      identifier: defaultToken.defaultIdentifier,
      amount: new BigNumber('1000000'),
      networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    }],
    defaultToken
  );
  const fee = inputAmount.joinSubtractCopy(outputAmount);

  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const config = getCardanoHaskellBaseConfig(networkInfo)
    .reduce((acc, next) => Object.assign(acc, next), {});
  const remoteUnspentUtxo = {
    amount: inputAmount.getDefault().toString(),
    receiver: '01d2d1d233e88e9c8428b68ada19acbdc9ced7e3b4ab6ca5d470376ea4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  };
  const txBuilder = RustModule.WalletV4.TransactionBuilder.new(
    RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
      RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
    ),
    RustModule.WalletV4.BigNum.from_str(config.MinimumUtxoVal),
    RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
    RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
  );
  txBuilder.add_key_input(
    RustModule.WalletV4.Ed25519KeyHash.from_bytes(
      Buffer.from('00000000000000000000000000000000000000000000000000000000', 'hex')
    ),
    RustModule.WalletV4.TransactionInput.new(
      RustModule.WalletV4.TransactionHash.from_bytes(
        Buffer.from(remoteUnspentUtxo.tx_hash, 'hex')
      ),
      remoteUnspentUtxo.tx_index
    ),
    RustModule.WalletV4.BigNum.from_str(remoteUnspentUtxo.amount.toString())
  );
  txBuilder.add_output(RustModule.WalletV4.TransactionOutput.new(
    RustModule.WalletV4.Address.from_bytes(
      Buffer.from('01d2d1d233e88e9c8428b68ada19acbdc9ced7e3b4ab6ca5d470376ea4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e', 'hex')
    ),
    RustModule.WalletV4.BigNum.from_str(
      outputAmount.getDefault().toString()
    )
  ));

  txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str(fee.getDefault().toString()));
  txBuilder.set_ttl(5);

  return {
    tentativeTx: new HaskellShelleyTxSignRequest(
      {
        senderUtxos: [{
          ...remoteUnspentUtxo,
          addressing: {
            path: [],
            startLevel: 0,
          },
        }],
        unsignedTx: txBuilder,
        changeAddr: [],
        certificate: undefined,
      },
      undefined,
      {
        ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
        KeyDeposit: new BigNumber(config.KeyDeposit),
        PoolDeposit: new BigNumber(config.PoolDeposit),
        NetworkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
      },
      {
        neededHashes: new Set(),
        wits: new Set(),
      },
    ),
    inputAmount,
    fee,
  };
};

export const genWithdrawalTx = (
  publicDeriver: PublicDeriver<>,
  unregister: boolean,
): HaskellShelleyTxSignRequest => {
  const inputAmount = '2000000';
  const outputAmount = '1500000';
  const fee = new BigNumber(inputAmount).minus(new BigNumber(outputAmount));

  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const config = getCardanoHaskellBaseConfig(networkInfo)
    .reduce((acc, next) => Object.assign(acc, next), {});
  const remoteUnspentUtxo = {
    amount: inputAmount,
    receiver: '01d2d1d233e88e9c8428b68ada19acbdc9ced7e3b4ab6ca5d470376ea4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  };
  const txBuilder = RustModule.WalletV4.TransactionBuilder.new(
    RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
      RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
    ),
    RustModule.WalletV4.BigNum.from_str(config.MinimumUtxoVal),
    RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
    RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
  );
  txBuilder.add_key_input(
    RustModule.WalletV4.Ed25519KeyHash.from_bytes(
      Buffer.from('00000000000000000000000000000000000000000000000000000000', 'hex')
    ),
    RustModule.WalletV4.TransactionInput.new(
      RustModule.WalletV4.TransactionHash.from_bytes(
        Buffer.from(remoteUnspentUtxo.tx_hash, 'hex')
      ),
      remoteUnspentUtxo.tx_index
    ),
    RustModule.WalletV4.BigNum.from_str(remoteUnspentUtxo.amount)
  );
  txBuilder.add_output(RustModule.WalletV4.TransactionOutput.new(
    RustModule.WalletV4.Address.from_bytes(
      Buffer.from('01d2d1d233e88e9c8428b68ada19acbdc9ced7e3b4ab6ca5d470376ea4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e', 'hex')
    ),
    RustModule.WalletV4.BigNum.from_str(outputAmount)
  ));

  const rewardAddr = RustModule.WalletV4.RewardAddress.from_address(
    RustModule.WalletV4.Address.from_bytes(
      Buffer.from(
        'e14d65e74d68e2439b7bbf6181ccddd3926d53487beae273b9fb1ed414',
        'hex'
      ),
    )
  );
  if (rewardAddr == null) throw new Error(`Invalid reward address`);
  const withdrawals = RustModule.WalletV4.Withdrawals.new();
  withdrawals.insert(
    rewardAddr,
    RustModule.WalletV4.BigNum.from_str('1000000'),
  );
  txBuilder.set_withdrawals(withdrawals);

  if (unregister) {
    const certs = RustModule.WalletV4.Certificates.new();
    certs.add(RustModule.WalletV4.Certificate.new_stake_deregistration(
      RustModule.WalletV4.StakeDeregistration.new(
        rewardAddr.payment_cred()
      )
    ));
    txBuilder.set_certs(certs);
  }

  txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str(fee.toString()));
  txBuilder.set_ttl(5);

  const baseConfig = getCardanoHaskellBaseConfig(publicDeriver.getParent().getNetworkInfo())
    .reduce((acc, next) => Object.assign(acc, next), {});
  return new HaskellShelleyTxSignRequest(
    {
      senderUtxos: [{
        ...remoteUnspentUtxo,
        addressing: {
          path: [],
          startLevel: 0,
        },
      }],
      unsignedTx: txBuilder,
      changeAddr: [],
      certificate: undefined,
    },
    undefined,
    {
      ChainNetworkId: Number.parseInt(baseConfig.ChainNetworkId, 10),
      PoolDeposit: new BigNumber(baseConfig.PoolDeposit),
      KeyDeposit: new BigNumber(baseConfig.KeyDeposit),
      NetworkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    },
    {
      neededHashes: new Set([Buffer.from(rewardAddr.payment_cred().to_bytes()).toString('hex')]),
      wits: new Set(), // TODO: should be present, but probably doesn't matter for UI tests
    },
  );
};

// not an exact voting transaction but enough for storybook UI
// this separate transaction is used to get trx type HaskellShelleyTxSignRequest
export const genVotingShelleyTx = (
  publicDeriver: PublicDeriver<>,
): HaskellShelleyTxSignRequest => {
  const defaultToken = publicDeriver.getParent().getDefaultToken();

  const inputAmount = new MultiToken(
    [{
      identifier: defaultToken.defaultIdentifier,
      amount: new BigNumber('1174000'),
      networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    }],
    defaultToken
  );
  const outputAmount = new MultiToken(
    [{
      identifier: defaultToken.defaultIdentifier,
      amount: new BigNumber('1000000'),
      networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    }],
    defaultToken
  );
  const fee = inputAmount.joinSubtractCopy(outputAmount);

  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const config = getCardanoHaskellBaseConfig(networkInfo)
    .reduce((acc, next) => Object.assign(acc, next), {});
  const remoteUnspentUtxo = {
    amount: inputAmount.getDefault().toString(),
    receiver: '01d2d1d233e88e9c8428b68ada19acbdc9ced7e3b4ab6ca5d470376ea4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
    tx_hash: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe',
    tx_index: 0,
    utxo_id: '6930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe0',
  };
  const txBuilder = RustModule.WalletV4.TransactionBuilder.new(
    RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
      RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
    ),
    RustModule.WalletV4.BigNum.from_str(config.MinimumUtxoVal),
    RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
    RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
  );
  txBuilder.add_key_input(
    RustModule.WalletV4.Ed25519KeyHash.from_bytes(
      Buffer.from('00000000000000000000000000000000000000000000000000000000', 'hex')
    ),
    RustModule.WalletV4.TransactionInput.new(
      RustModule.WalletV4.TransactionHash.from_bytes(
        Buffer.from(remoteUnspentUtxo.tx_hash, 'hex')
      ),
      remoteUnspentUtxo.tx_index
    ),
    RustModule.WalletV4.BigNum.from_str(remoteUnspentUtxo.amount.toString())
  );
  txBuilder.add_output(RustModule.WalletV4.TransactionOutput.new(
    RustModule.WalletV4.Address.from_bytes(
      Buffer.from('01d2d1d233e88e9c8428b68ada19acbdc9ced7e3b4ab6ca5d470376ea4c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e', 'hex')
    ),
    RustModule.WalletV4.BigNum.from_str(
      outputAmount.getDefault().toString()
    )
  ));

  txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str(fee.getDefault().toString()));
  txBuilder.set_ttl(5);

  return new HaskellShelleyTxSignRequest(
      {
        senderUtxos: [{
          ...remoteUnspentUtxo,
          addressing: {
            path: [],
            startLevel: 0,
          },
        }],
        unsignedTx: txBuilder,
        changeAddr: [],
        certificate: undefined,
      },
      undefined,
      {
        ChainNetworkId: Number.parseInt(config.ChainNetworkId, 10),
        KeyDeposit: new BigNumber(config.KeyDeposit),
        PoolDeposit: new BigNumber(config.PoolDeposit),
        NetworkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
      },
      {
        neededHashes: new Set(),
        wits: new Set(),
      },
    );
};