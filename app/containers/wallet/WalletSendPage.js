// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';

import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';
import { tryAddressToKind } from '../../api/ada/lib/storage/bridge/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';

import {
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../config/numbersConfig';

import WalletSendForm from '../../components/wallet/send/WalletSendForm';
// Web Wallet Confirmation
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import {
  formattedWalletAmount,
} from '../../utils/formatters';
import {
  copySignRequest,
  IGetFee,
  IReceivers,
  ITotalInput,
} from '../../api/ada/transactions/utils';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

// Hardware Wallet Confirmation
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';

const messagesLedger = defineMessages({
  infoLine1: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Ledger device to your computer’s USB port, press the Send using Ledger button.',
  },
  infoLine2: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.2',
    defaultMessage: '!!!Make sure Cardano ADA app must remain open on the Ledger device throughout the process.',
  },
  sendUsingHWButtonLabel: {
    id: 'wallet.send.ledger.confirmationDialog.submit',
    defaultMessage: '!!!Send using Ledger',
  },
});

const messagesTrezor = defineMessages({
  infoLine1: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Trezor device to your computer, press the Send using Trezor button.',
  },
  infoLine2: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.2',
    defaultMessage: '!!!A new tab will appear. Please follow the instructions in the new tab.',
  },
  sendUsingHWButtonLabel: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
  },
});


type Props = InjectedProps;
@observer
export default class WalletSendPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { transactions, transactionBuilderStore } = this.props.stores.substores.ada;
    const publicDeriver = this.props.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error('Active wallet required for WalletSendPage.');

    const { intl } = this.context;
    const { uiDialogs, profile } = this.props.stores;
    const { actions } = this.props;
    const { validateAmount, hasAnyPending } = transactions;
    const { txBuilderActions } = this.props.actions.ada;

    // disallow sending when pending tx exists
    if (uiDialogs.isOpen && hasAnyPending) {
      actions.dialogs.closeActiveDialog.trigger();
    }

    const walletType = publicDeriver.self.getParent().getWalletType();
    const targetDialog = walletType === WalletTypeOption.HARDWARE_WALLET ?
      HWSendConfirmationDialog :
      WalletSendConfirmationDialog;

    const onSubmit = () => {
      actions.dialogs.open.trigger({
        dialog: targetDialog
      });
      txBuilderActions.updateTentativeTx.trigger();
    };

    return (
      <div>
        <WalletSendForm
          currencyUnit={intl.formatMessage(globalMessages.unitAda)}
          currencyMaxIntegerDigits={MAX_INTEGER_PLACES_IN_ADA}
          currencyMaxFractionalDigits={DECIMAL_PLACES_IN_ADA}
          validateAmount={validateAmount}
          onSubmit={onSubmit}
          isValidShelleyAddress={address => {
            const kind = tryAddressToKind(address, 'bech32');
            if (kind == null) return false;
            if (kind === CoreAddressTypes.CARDANO_LEGACY) return false;
            return true;
          }}
          isValidLegacyAddress={address => {
            const kind = tryAddressToKind(address, 'bech32');
            if (kind == null) return false;
            if (kind === CoreAddressTypes.CARDANO_LEGACY) return true;
            return false;
          }}
          totalInput={transactionBuilderStore.totalInput}
          hasAnyPending={hasAnyPending}
          classicTheme={profile.isClassicTheme}
          updateReceiver={(addr: void | string) => txBuilderActions.updateReceiver.trigger(addr)}
          updateAmount={(value: void | number) => txBuilderActions.updateAmount.trigger(value)}
          shouldSendAll={transactionBuilderStore.shouldSendAll}
          toggleSendAll={() => txBuilderActions.toggleSendAll.trigger()}
          fee={transactionBuilderStore.fee}
          isCalculatingFee={transactionBuilderStore.createUnsignedTx.isExecuting}
          reset={() => txBuilderActions.reset.trigger()}
          error={transactionBuilderStore.createUnsignedTx.error}
          uriParams={this.props.stores.loading.uriParams}
          resetUriParams={this.props.stores.loading.resetUriParams}
        />
        {this.renderDialog()}
      </div>
    );
  }

  renderDialog = (): Node => {
    const { uiDialogs } = this.props.stores;

    if (uiDialogs.isOpen(WalletSendConfirmationDialog)) {
      return this.webWalletDoConfirmation();
    }
    if (uiDialogs.isOpen(HWSendConfirmationDialog)) {
      return this.hardwareWalletDoConfirmation();
    }
    return '';
  }

  /** Web Wallet Send Confirmation dialog
    * Callback that creates a container to avoid the component knowing about actions/stores */
  webWalletDoConfirmation = (): Node => {
    const { intl } = this.context;
    const { actions, stores } = this.props;

    const { transactionBuilderStore } = this.props.stores.substores.ada;
    if (!transactionBuilderStore.tentativeTx) {
      throw new Error('webWalletDoConfirmation::should never happen');
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    return (<WalletSendConfirmationDialogContainer
      actions={actions}
      stores={stores}
      signRequest={signRequest}
      staleTx={transactionBuilderStore.txMismatch}
      currencyUnit={intl.formatMessage(globalMessages.unitAda)}
    />);
  };

  /** Hardware Wallet (Trezor or Ledger) Confirmation dialog
    * Callback that creates a component to avoid the component knowing about actions/stores
    * separate container is not needed, this container acts as container for Confirmation dialog */
  hardwareWalletDoConfirmation = (): Node => {
    const { intl } = this.context;
    const publicDeriver = this.props.stores.wallets.selected;
    const { transactionBuilderStore } = this.props.stores.substores.ada;
    // Guard against potential null values
    if (!publicDeriver) throw new Error('Active wallet required for hardwareWalletDoConfirmation.');

    if (!transactionBuilderStore.tentativeTx) {
      throw new Error('hardwareWalletDoConfirmation::should never happen');
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    const totalInput = ITotalInput(signRequest, true);
    const fee = IGetFee(signRequest, true);
    const receivers = IReceivers(signRequest, false);

    const conceptualWallet = publicDeriver.self.getParent();
    let hwSendConfirmationDialog: Node = null;

    const unsignedTx = signRequest.unsignedTx;
    if (!(unsignedTx instanceof RustModule.WalletV2.Transaction)) {
      throw new Error('hardwareWalletDoConfirmation hw wallets unsupported for Shelley');
    }
    const v2Request = {
      ...signRequest,
      unsignedTx,
    };
    if (isLedgerNanoWallet(conceptualWallet)) {
      const ledgerSendAction = this.props.actions[environment.API].ledgerSend;
      ledgerSendAction.init.trigger();
      const ledgerSendStore = this.props.stores.substores[environment.API].ledgerSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          staleTx={transactionBuilderStore.txMismatch}
          selectedExplorer={this.props.stores.profile.selectedExplorer}
          amount={formattedWalletAmount(totalInput.minus(fee))}
          receivers={receivers}
          totalAmount={formattedWalletAmount(totalInput)}
          transactionFee={formattedWalletAmount(fee)}
          currencyUnit={intl.formatMessage(globalMessages.unitAda)}
          messages={messagesLedger}
          isSubmitting={ledgerSendStore.isActionProcessing}
          error={ledgerSendStore.error}
          onSubmit={
            () => ledgerSendAction.sendUsingLedger.trigger({
              params: { signRequest: copySignRequest(v2Request) },
              publicDeriver,
            })
          }
          onCancel={ledgerSendAction.cancel.trigger}
          classicTheme={this.props.stores.profile.isClassicTheme}
        />);
    } else if (isTrezorTWallet(conceptualWallet)) {
      const trezorSendAction = this.props.actions[environment.API].trezorSend;
      const trezorSendStore = this.props.stores.substores[environment.API].trezorSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          staleTx={transactionBuilderStore.txMismatch}
          selectedExplorer={this.props.stores.profile.selectedExplorer}
          amount={formattedWalletAmount(totalInput.minus(fee))}
          receivers={receivers}
          totalAmount={formattedWalletAmount(totalInput)}
          transactionFee={formattedWalletAmount(fee)}
          currencyUnit={intl.formatMessage(globalMessages.unitAda)}
          messages={messagesTrezor}
          isSubmitting={trezorSendStore.isActionProcessing}
          error={trezorSendStore.error}
          onSubmit={
            () => trezorSendAction.sendUsingTrezor.trigger({
              params: { signRequest: copySignRequest(v2Request) },
              publicDeriver,
            })
          }
          onCancel={trezorSendAction.cancel.trigger}
          classicTheme={this.props.stores.profile.isClassicTheme}
        />);
    } else {
      throw new Error('Unsupported hardware wallet found at hardwareWalletDoConfirmation.');
    }

    return hwSendConfirmationDialog;
  };
}
