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
import type { RestoreWalletForTransferResponse, RestoreWalletForTransferFunc } from '../../api/ada/index';
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

export default class AdaYoroiTransferStore extends Store {

  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.ada.restoreWalletForTransfer);

  _restoreWalletForTransfer: (string, number) => Promise<RestoreWalletForTransferResponse> = async (
    recoveryPhrase,
    accountIndex,
  ) => {
    const rootPk = this.stores.yoroiTransfer.mode?.extra === 'ledger'
      ? generateLedgerWalletRootKey(recoveryPhrase)
      : generateWalletRootKey(recoveryPhrase);

    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no network selected`);
    }
    if (!this.stores.yoroiTransfer.mode) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no mode specified`);
    }
    const { mode } = this.stores.yoroiTransfer;

    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    const restoreResult = await this.restoreForTransferRequest.execute({
      rootPk,
      accountIndex,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      transferSource: mode.type,
      network: this.stores.profile.selectedNetwork,
    }).promise;
    if (!restoreResult) throw new Error('Restored wallet was not received correctly');
    return restoreResult;
  };

  generateTransferTxFromMnemonic: {|
    recoveryPhrase: string,
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<string>,
  |} => Promise<TransferTx> = async (request) => {
    if (!this.stores.yoroiTransfer.mode) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTxFromMnemonic)} no mode specified`);
    }
    if (this.stores.yoroiTransfer.mode.type === 'bip44') {
      return this.generateTransferTxForByron(request);
    }
    if (this.stores.yoroiTransfer.mode.type === 'cip1852') {
      return this.generateTransferTxForRewardAccount(request);
    }
    throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this.generateTransferTxFromMnemonic)} unknown restore type ${this.stores.yoroiTransfer.mode?.type || ''}`);
  }

  generateTransferTxForRewardAccount: {|
    recoveryPhrase: string,
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<string>,
  |} => Promise<TransferTx> = async (request) => {
    const { createWithdrawalTx } = this.stores.substores.ada.delegationTransaction;
    createWithdrawalTx.reset();

    // recall: all ITN rewards were on account path 0
    const accountIndex = 0 + HARD_DERIVATION_START;
    // recall: Hardware wallets weren't supported during the ITN
    const stakeKey = generateWalletRootKey(request.recoveryPhrase)
      .derive(WalletTypePurpose.CIP1852)
      .derive(CoinTypes.CARDANO)
      .derive(accountIndex)
      .derive(ChainDerivations.CHIMERIC_ACCOUNT)
      .derive(0);
    const stakeCredential = RustModule.WalletV4.StakeCredential.from_keyhash(
      stakeKey.to_raw_key().to_public().hash()
    );

    const { selected } = this.stores.wallets;
    if (selected == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no wallet selected`);
    }
    const withUtxos = asGetAllUtxos(selected);
    if (withUtxos == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} missing utxo functionality`);
    }
    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} missing chains functionality`);
    }

    const fullConfig = getCardanoHaskellBaseConfig(
      selected.getParent().getNetworkInfo()
    );
    const config = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});
    const timeToSlot = await genTimeToSlot(fullConfig);
    const absSlotNumber = new BigNumber(timeToSlot({ time: new Date() }).slot);

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
          rewardAddress: rewardHex,
          shouldDeregister: true,
        }],
      });
    }).promise;
    if (unsignedTx == null) throw new Error(`Should never happen`);

    const withdrawalSum = unsignedTx.withdrawalSum(true);

    // TODO: support multiple change addresses
    if (unsignedTx.signRequest.changeAddr.length > 1) {
      throw new Error(`${nameof(this.generateTransferTxForRewardAccount)} multiple change addresses`);
    }
    if (unsignedTx.signRequest.changeAddr.length === 0) {
      throw new Error(`${nameof(this.generateTransferTxForRewardAccount)} no change`);
    }
    const changeAddr = unsignedTx.signRequest.changeAddr[0];
    return {
      encodedTx: Uint8Array.from([]),
      fee: unsignedTx.fee(true),
      id: unsignedTx.txId(),
      receiver: changeAddr.address,
      recoveredBalance: withdrawalSum,
      senders: unsignedTx
        .uniqueSenderAddresses(),
    };
  }

  generateTransferTxForByron: {|
    recoveryPhrase: string,
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<string>,
  |} => Promise<TransferTx> = async (request) => {
    // 1) get receive address
    const destinationAddress = await request.getDestinationAddress();

    // 2) Perform restoration
    const accountIndex = 0 + HARD_DERIVATION_START; // TODO: don't hardcode index
    const { masterKey, addresses } = await this._restoreWalletForTransfer(
      request.recoveryPhrase,
      accountIndex,
    );

    request.updateStatusCallback();

    // 3) Calculate private keys for restored wallet utxo
    const accountKey = RustModule.WalletV4.Bip32PrivateKey
      .from_bytes(Buffer.from(masterKey, 'hex'))
      .derive(WalletTypePurpose.BIP44)
      .derive(CoinTypes.CARDANO)
      .derive(accountIndex);

    // 4) generate transaction

    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(AdaYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no network selected`);
    }
    const fullConfig = getCardanoHaskellBaseConfig(
      this.stores.profile.selectedNetwork
    );
    const config = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});

    // note: no wallet selected so we call this directly
    const timeToSlot = await genTimeToSlot(fullConfig);

    const transferTx = await yoroiTransferTxFromAddresses({
      addresses,
      outputAddr: destinationAddress,
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountKey,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
      protocolParams: {
        keyDeposit: RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
        ),
        minimumUtxoVal: RustModule.WalletV4.BigNum.from_str(config.MinimumUtxoVal),
        poolDeposit: RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
      },
      absSlotNumber: new BigNumber(timeToSlot({ time: new Date() }).slot),
    });
    // Possible exception: NotEnoughMoneyToSendError
    return transferTx;
  }
}
