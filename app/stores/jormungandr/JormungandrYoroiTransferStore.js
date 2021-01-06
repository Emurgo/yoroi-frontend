// @flow
import { observable, } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type {
  TransferTx,
} from '../../types/TransferTypes';
import { v4Bip32PrivateToV3 } from '../../api/jormungandr/lib/crypto/utils';
import { yoroiTransferTxFromAddresses } from '../../api/jormungandr/lib/transactions/transfer/yoroiTransfer';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { generateWalletRootKey, generateLedgerWalletRootKey, } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
} from '../../config/numbersConfig';
import type { RestoreWalletForTransferResponse, RestoreWalletForTransferFunc } from '../../api/jormungandr/index';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import {
  getJormungandrBaseConfig,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import type {
  Address, Addressing
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

export default class JormungandrYoroiTransferStore extends Store {

  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.jormungandr.restoreWalletForTransfer);

  _restoreWalletForTransfer: {|
    rootPk: RustModule.WalletV4.Bip32PrivateKey,
    accountIndex: number,
  |} => Promise<RestoreWalletForTransferResponse> = async (
    request
  ) => {
    const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;

    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(JormungandrYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no network selected`);
    }
    if (!this.stores.yoroiTransfer.mode) {
      throw new Error(`${nameof(JormungandrYoroiTransferStore)}::${nameof(this._restoreWalletForTransfer)} no mode specified`);
    }
    const { mode } = this.stores.yoroiTransfer;
    const restoreResult = await this.restoreForTransferRequest.execute({
      network: this.stores.profile.selectedNetwork,
      rootPk: v4Bip32PrivateToV3(request.rootPk),
      accountIndex: request.accountIndex,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      transferSource: mode.type,
    }).promise;
    if (!restoreResult) throw new Error('Restored wallet was not received correctly');
    return restoreResult;
  };

  generateTransferTx: {|
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
      throw new Error(`${nameof(JormungandrYoroiTransferStore)}::${nameof(this.generateTransferTx)} no key specified`);
    })();

    // 1) get receive address
    const destinationAddress = await request.getDestinationAddress();

    // 2) Perform restoration
    const accountIndex = 0 + HARD_DERIVATION_START;
    const { masterKey, addresses } = await this._restoreWalletForTransfer({
      rootPk,
      accountIndex,
    });

    request.updateStatusCallback();

    if (!this.stores.yoroiTransfer.mode) {
      throw new Error(`${nameof(JormungandrYoroiTransferStore)}::${nameof(this.generateTransferTx)} no mode specified`);
    }
    const { mode } = this.stores.yoroiTransfer;

    // 3) Calculate private keys for restored wallet utxo
    const accountKey = RustModule.WalletV3.Bip32PrivateKey
      .from_bytes(Buffer.from(masterKey, 'hex'))
      .derive(mode.type === 'cip1852'
        ? WalletTypePurpose.CIP1852
        : WalletTypePurpose.BIP44)
      .derive(CoinTypes.CARDANO)
      .derive(accountIndex);

    // 4) generate transaction

    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(JormungandrYoroiTransferStore)}::${nameof(this.generateTransferTx)} no network selected`);
    }
    const { selectedNetwork } = this.stores.profile;
    const config = getJormungandrBaseConfig(
      selectedNetwork
    ).reduce((acc, next) => Object.assign(acc, next), {});

    const transferTx = await yoroiTransferTxFromAddresses({
      addresses,
      outputAddr: destinationAddress.address,
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountKey,
      network: selectedNetwork,
      getUTXOsForAddresses:
        this.stores.substores.jormungandr.stateFetchStore.fetcher.getUTXOsForAddresses,
      useLegacyWitness: mode.type === 'bip44',
      protocolParams: {
        genesisHash: config.ChainNetworkId,
        feeConfig: config.LinearFee,
        networkId: selectedNetwork.NetworkId,
      },
    });
    // Possible exception: NotEnoughMoneyToSendError
    return transferTx;
  }

  reset(): void {
    this.restoreForTransferRequest.reset();
  }
}
