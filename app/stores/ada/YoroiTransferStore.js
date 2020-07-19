// @flow
import { observable, action, runInAction } from 'mobx';
import { defineMessages } from 'react-intl';
import { isEqual } from 'lodash';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';
import type {
  TransferStatusT,
  TransferTx,
  TransferSourceType,
  TransferKindType,
} from '../../types/TransferTypes';
import { TransferStatus, TransferSource, TransferKind, } from '../../types/TransferTypes';
import { generateLegacyYoroiTransferTx } from '../../api/ada/transactions/transfer/legacyYoroi';
import { generateCip1852TransferTx } from '../../api/ada/transactions/transfer/cip1852Transfer';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
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
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  unscramblePaperAdaMnemonic,
} from '../../api/ada/lib/cardanoCrypto/paperWallet';
import config from '../../config';

export default class YoroiTransferStore extends Store {

  @observable status: TransferStatusT = TransferStatus.UNINITIALIZED;
  @observable transferFundsRequest: Request<typeof YoroiTransferStore.prototype._checkAndTransfer>
    = new Request<typeof YoroiTransferStore.prototype._checkAndTransfer>(this._checkAndTransfer);
  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.ada.restoreWalletForTransfer);

  setup(): void {
    super.setup();
    const actions = this.actions.ada.yoroiTransfer;
    actions.startTransferFunds.listen(this._startTransferFunds);
    actions.startTransferLegacyHardwareFunds.listen(this._startTransferLegacyHardwareFunds);
    actions.startTransferPaperFunds.listen(this._startTransferPaperFunds);
    actions.startHardwareMnemnoic.listen(this._startHardwareMnemnoic);
    actions.setupTransferFundsWithMnemonic.listen(this.setupTransferFundsWithMnemonic);
    actions.setupTransferFundsWithPaperMnemonic.listen(
      this._errorWrapper(this._setupTransferFundsWithPaperMnemonic)
    );
    actions.checkAddresses.listen(
      this._asyncErrorWrapper(this.checkAddresses)
    );
    actions.backToUninitialized.listen(this._backToUninitialized);
    actions.transferFunds.listen(this._asyncErrorWrapper(this._transferFunds));
    actions.cancelTransferFunds.listen(this.reset);
  }

  _generateTransferTxFromMnemonic: (
    string,
    void => void,
    void => Promise<string>
  ) => Promise<TransferTx> = async (
    recoveryPhrase,
    updateStatusCallback,
    getDestinationAddress,
  ) => {
    // 1) get receive address
    const destinationAddress = await getDestinationAddress();

    // 2) Perform restoration
    const accountIndex = 0 + HARD_DERIVATION_START;
    const { masterKey, addresses } = await this._restoreWalletForTransfer(
      recoveryPhrase,
      accountIndex,
    );

    updateStatusCallback();

    const sourceIsJormungandrWallet = (
      this.transferSource === TransferSource.JORMUNGANDR_UTXO ||
      this.transferSource === TransferSource.JORMUNGANDR_CHIMERIC_ACCOUNT
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
    if (selectedNetwork == null) throw new Error(`${nameof(this._generateTransferTxFromMnemonic)} no network selected`);

    const transferTx = sourceIsJormungandrWallet
      ? await generateCip1852TransferTx(baseRequest)
      : await generateLegacyYoroiTransferTx({
        ...baseRequest,
        legacy: selectedNetwork.NetworkId !== networks.JormungandrMainnet.NetworkId,
      });
    // Possible exception: NotEnoughMoneyToSendError
    return transferTx;
  }
}
