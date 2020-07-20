// @flow
import { observable, } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type {
  TransferTx,
} from '../../types/TransferTypes';
import { TransferSource, TransferKind, } from '../../types/TransferTypes';
import { generateLegacyYoroiTransferTx } from '../../api/ada/transactions/transfer/legacyYoroi';
import { generateCip1852TransferTx } from '../../api/ada/transactions/transfer/cip1852Transfer';
import { isJormungandr } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { generateWalletRootKey, generateLedgerWalletRootKey, } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
} from '../../config/numbersConfig';
import type { RestoreWalletForTransferResponse, RestoreWalletForTransferFunc } from '../../api/ada/index';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';

export default class AdaYoroiTransferStore extends Store {

  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.ada.restoreWalletForTransfer);

  _restoreWalletForTransfer: (string, number) => Promise<RestoreWalletForTransferResponse> = async (
    recoveryPhrase,
    accountIndex,
  ) => {
    const rootPk = this.stores.yoroiTransfer.transferKind === TransferKind.LEDGER
      ? generateLedgerWalletRootKey(recoveryPhrase)
      : generateWalletRootKey(recoveryPhrase);
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    const restoreResult = await this.restoreForTransferRequest.execute({
      rootPk,
      accountIndex,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      transferSource: this.stores.yoroiTransfer.transferSource,
    }).promise;
    if (!restoreResult) throw new Error('Restored wallet was not received correctly');
    return restoreResult;
  };

  generateTransferTxFromMnemonic: {|
    recoveryPhrase: string,
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<string>,
  |} => Promise<TransferTx> = async (request) => {
    // 1) get receive address
    const destinationAddress = await request.getDestinationAddress();

    // 2) Perform restoration
    const accountIndex = 0 + HARD_DERIVATION_START;
    const { masterKey, addresses } = await this._restoreWalletForTransfer(
      request.recoveryPhrase,
      accountIndex,
    );

    request.updateStatusCallback();

    const sourceIsJormungandrWallet = (
      this.stores.yoroiTransfer.transferSource === TransferSource.JORMUNGANDR_UTXO ||
      this.stores.yoroiTransfer.transferSource === TransferSource.JORMUNGANDR_CHIMERIC_ACCOUNT
    );

    // 3) Calculate private keys for restored wallet utxo
    const accountKey = RustModule.WalletV3.Bip32PrivateKey
      .from_bytes(Buffer.from(masterKey, 'hex'))
      .derive(sourceIsJormungandrWallet
        ? WalletTypePurpose.CIP1852
        : WalletTypePurpose.BIP44)
      .derive(CoinTypes.CARDANO)
      .derive(accountIndex);

    // 4) generate transaction
    const baseRequest = {
      addresses,
      outputAddr: destinationAddress,
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountKey,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
    };

    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this.generateTransferTxFromMnemonic)} no network selected`);

    const transferTx = sourceIsJormungandrWallet
      ? await generateCip1852TransferTx(baseRequest)
      : await generateLegacyYoroiTransferTx({
        ...baseRequest,
        legacy: !isJormungandr(selectedNetwork),
      });
    // Possible exception: NotEnoughMoneyToSendError
    return transferTx;
  }
}
