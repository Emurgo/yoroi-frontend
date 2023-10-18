// @flow
import { observable, } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type {
  TransferTx,
} from '../../types/TransferTypes';
import { yoroiTransferTxFromAddresses } from '../../api/ada/transactions/transfer/legacyYoroi';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { generateWalletRootKey, generateLedgerWalletRootKey, } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  ChainDerivations,
  CoinTypes,
} from '../../config/numbersConfig';
import type {
  RestoreWalletForTransferResponse,
  RestoreWalletForTransferFunc,
  TransferToCip1852Func,
} from '../../api/ada/index';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  genTimeToSlot,
} from '../../api/ada/lib/storage/bridge/timeUtils';
import {
  asGetAllUtxos, asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  Address, Addressing
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class AdaYoroiTransferStore extends Store<StoresMap, ActionsMap> {

  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.ada.restoreWalletForTransfer);
  @observable transferRequest: Request<TransferToCip1852Func>
    = new Request<TransferToCip1852Func>(
      this.api.ada.transferToCip1852.bind(this.api.ada)
    );

  _restoreWalletForTransfer: {|
    rootPk: RustModule.WalletV4.Bip32PrivateKey,
    accountIndex: number,
  |} => Promise<RestoreWalletForTransferResponse> = async (
    request
  ) => {
    if (!this.stores.yoroiTransfer.mode) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no mode specified`);
    }
    const { mode } = this.stores.yoroiTransfer;

    const accountPubKey = request.rootPk
      .derive(mode.type === 'cip1852'
        ? WalletTypePurpose.CIP1852
        : WalletTypePurpose.BIP44)
      .derive(CoinTypes.CARDANO)
      .derive(request.accountIndex)
      .to_public();

    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no network selected`);
    }

    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    const restoreResult = await this.restoreForTransferRequest.execute({
      accountPubKey,
      accountIndex: request.accountIndex,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      transferSource: mode.type,
      network: this.stores.profile.selectedNetwork,
    }).promise;
    if (!restoreResult) throw new Error('Restored wallet was not received correctly');
    return restoreResult;
  };

  generateTransferTx: {|
    ...({| recoveryPhrase: string, |} | {| privateKey: string |}),
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
  |} => Promise<TransferTx> = async (request) => {
    if (!this.stores.yoroiTransfer.mode) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTx)} no mode specified`);
    }
    if (this.stores.yoroiTransfer.mode.type === 'bip44') {
      return this.generateTransferTxForByron(request);
    }
    if (this.stores.yoroiTransfer.mode.type === 'cip1852') {
      return this.generateTransferTxForRewardAccount(request);
    }
    throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTx)} unknown restore type ${this.stores.yoroiTransfer.mode?.type || ''}`);
  }

  generateTransferTxForRewardAccount: {|
    ...({| recoveryPhrase: string, |} | {| privateKey: string |}),
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
  |} => Promise<TransferTx> = async (request) => {
    const { createWithdrawalTx } = this.stores.substores.ada.delegationTransaction;
    createWithdrawalTx.reset();

    // recall: all ITN rewards were on account path 0
    // TODO: don't hardcode this
    const accountIndex = 0 + HARD_DERIVATION_START;

    const stakingKey = (() => {
      if (request.privateKey != null) {
        return RustModule.WalletV4.PrivateKey.from_extended_bytes(
          Buffer.from(request.privateKey, 'hex')
        );
      }
      if (request.recoveryPhrase != null) {
        const rootKey = this.stores.yoroiTransfer.mode?.extra === 'ledger'
          ? generateLedgerWalletRootKey(request.recoveryPhrase)
          : generateWalletRootKey(request.recoveryPhrase);

        return rootKey
          .derive(WalletTypePurpose.CIP1852)
          .derive(CoinTypes.CARDANO)
          .derive(accountIndex)
          .derive(ChainDerivations.CHIMERIC_ACCOUNT)
          .derive(0)
          .to_raw_key();
      }
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTxForRewardAccount)} no key specified`);
    })();

    const stakeCredential = RustModule.WalletV4.Credential.from_keyhash(
      stakingKey.to_public().hash()
    );

    const { selected } = this.stores.wallets;
    if (selected == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTxForRewardAccount)} no wallet selected`);
    }
    const withUtxos = asGetAllUtxos(selected);
    if (withUtxos == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTxForRewardAccount)} missing utxo functionality`);
    }
    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTxForRewardAccount)} missing chains functionality`);
    }

    const fullConfig = getCardanoHaskellBaseConfig(
      selected.getParent().getNetworkInfo()
    );
    const config = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});
    const timeToSlot = await genTimeToSlot(fullConfig);
    const absSlotNumber = new BigNumber(timeToSlot({
      // use server time for TTL if connected to server
      time: this.stores.serverConnectionStore.serverTime ?? new Date(),
    }).slot);

    const rewardHex = Buffer.from(RustModule.WalletV4.RewardAddress.new(
      Number.parseInt(config.ChainNetworkId, 10),
      stakeCredential
    ).to_address().to_bytes()).toString('hex');
    const unsignedTx = await createWithdrawalTx.execute(async () => {
      return await this.api.ada.createWithdrawalTx({
        publicDeriver: withHasUtxoChains,
        getAccountState: this.stores.substores.ada.stateFetchStore.fetcher.getAccountState,
        absSlotNumber,
        withdrawals: [{
          privateKey: stakingKey,
          rewardAddress: rewardHex,
          shouldDeregister: this.stores.substores.ada.delegationTransaction.shouldDeregister,
        }],
      });
    }).promise;
    if (unsignedTx == null) throw new Error(`Should never happen`);

    // TODO: this isn't actually used anywhere. Should probably remove it
    const defaultToken = selected.getParent().getDefaultToken();
    return {
      encodedTx: Uint8Array.from([]),
      fee: unsignedTx.fee(),
      id: unsignedTx.txId(),
      receivers: unsignedTx.receivers(true),
      recoveredBalance: new MultiToken([], defaultToken),
      senders: unsignedTx
        .uniqueSenderAddresses(),
    };
  }

  generateTransferTxForByron: {|
    ...({| recoveryPhrase: string, |} | {| privateKey: string |}),
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
  |} => Promise<TransferTx> = async (request) => {
    const rootPk = (() => {
      if (request.privateKey != null) {
        return RustModule.WalletV4.Bip32PrivateKey.from_bytes(
          Buffer.from(request.privateKey, 'hex')
        );
      }
      if (request.recoveryPhrase != null) {
        return this.stores.yoroiTransfer.mode?.extra === 'ledger'
          ? generateLedgerWalletRootKey(request.recoveryPhrase)
          : generateWalletRootKey(request.recoveryPhrase);
      }
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTx)} no key specified`);
    })();

    // 1) get receive address
    const destinationAddress = await request.getDestinationAddress();

    // 2) Perform restoration
    const accountIndex = 0 + HARD_DERIVATION_START; // TODO: don't hardcode index
    const { addresses } = await this._restoreWalletForTransfer({
      rootPk,
      accountIndex,
    });

    request.updateStatusCallback();

    // 3) Calculate private keys for restored wallet utxo

    const accountKey = rootPk
      .derive(WalletTypePurpose.BIP44)
      .derive(CoinTypes.CARDANO)
      .derive(accountIndex);

    // 4) generate transaction

    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no network selected`);
    }
    const { selectedNetwork } = this.stores.profile;
    const fullConfig = getCardanoHaskellBaseConfig(selectedNetwork);
    const config = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});

    // note: no wallet selected so we call this directly
    const timeToSlot = await genTimeToSlot(fullConfig);

    const transferTx = await yoroiTransferTxFromAddresses({
      addresses,
      outputAddr: destinationAddress,
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountKey,
      network: selectedNetwork,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
      protocolParams: {
        keyDeposit: RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
        ),
        coinsPerUtxoWord: RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoWord),
        poolDeposit: RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
        networkId: selectedNetwork.NetworkId,
      },
      absSlotNumber: new BigNumber(timeToSlot({
        // use server time for TTL if connected to server
        time: this.stores.serverConnectionStore.serverTime ?? new Date(),
      }).slot),
    });
    // Possible exception: NotEnoughMoneyToSendError
    return transferTx;
  }

  reset(): void {
    this.restoreForTransferRequest.reset();
    this.transferRequest.reset();
  }
}
