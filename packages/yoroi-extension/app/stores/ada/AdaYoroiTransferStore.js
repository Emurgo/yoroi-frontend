// @flow
import { observable, } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type { TransferTx, } from '../../types/TransferTypes';
import { yoroiTransferTxFromAddresses } from '../../api/ada/transactions/transfer/legacyYoroi';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { generateWalletRootKey, } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { CoinTypes, HARD_DERIVATION_START, WalletTypePurpose, } from '../../config/numbersConfig';
import type {
  RestoreWalletForTransferFunc,
  RestoreWalletForTransferResponse,
  TransferToCip1852Func,
} from '../../api/ada/index';
import { Bip44DerivationLevels, } from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import TimeUtils from '../../api/ada/lib/storage/bridge/timeUtils';
import type { Address, Addressing } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { StoresMap } from '../index';

export default class AdaYoroiTransferStore extends Store<StoresMap> {

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
    const accountPubKey = request.rootPk
      .derive(WalletTypePurpose.BIP44)
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
      network: this.stores.profile.selectedNetwork,
    }).promise;
    if (!restoreResult) throw new Error('Restored wallet was not received correctly');
    return restoreResult;
  };

  // <TODO:PENDING_REMOVAL> paper
  generateTransferTxForByron: {|
    recoveryPhrase: string,
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
  |} => Promise<TransferTx> = async (request) => {
    const rootPk = generateWalletRootKey(request.recoveryPhrase);

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
    const currentTime = this.stores.serverConnectionStore.serverTime ?? new Date();
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
        coinsPerUtxoByte: RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoByte),
        poolDeposit: RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
        networkId: selectedNetwork.NetworkId,
      },
      // use server time for TTL if connected to server
      absSlotNumber: new BigNumber(TimeUtils.timeToAbsoluteSlot(fullConfig, currentTime)),
    });
    // Possible exception: NotEnoughMoneyToSendError
    return transferTx;
  }

  reset(): void {
    this.restoreForTransferRequest.reset();
    this.transferRequest.reset();
  }
}
