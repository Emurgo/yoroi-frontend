// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, FormattedHTMLMessage } from 'react-intl';
import { ellipsis } from '../../../utils/strings';
import config from '../../../config';
import validWords from 'bip39/src/wordlists/english.json';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import WalletRestoreVerifyDialog from '../../../components/wallet/WalletRestoreVerifyDialog';
import type { WalletRestoreDialogValues } from '../../../components/wallet/WalletRestoreDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';
import {
  unscramblePaperAdaMnemonic,
  mnemonicsToAddresses,
} from '../../../api/ada/lib/cardanoCrypto/cryptoWallet';
import type { WalletAccountNumberPlate } from '../../../domain/Wallet';

const messages = defineMessages({
  copyTooltipMessage: {
    id: 'wallet.receive.page.addressCopyTooltipNotificationMessage',
    defaultMessage: '!!!Coppied'
  },
});

type Props = InjectedDialogContainerProps & {
  mode: "regular" | "paper",
  introMessage?: string,
  onBack: void => void,
};

const NUMBER_OF_VERIFIED_ADDRESSES = 1;
const NUMBER_OF_VERIFIED_ADDRESSES_PAPER = 5;

type WalletRestoreDialogContainerState = {
  verifyRestore?: {
    addresses: Array<string>,
    accountPlate: WalletAccountNumberPlate,
  },
  submitValues?: WalletRestoreDialogValues,
  resolvedRecoveryPhrase?: string,
}

@observer
export default class WalletRestoreDialogContainer
  extends Component<Props, WalletRestoreDialogContainerState> {

  state = {
    verifyRestore: undefined,
    submitValues: undefined,
    resolvedRecoveryPhrase: undefined,
  };

  onVerifiedSubmit = () => {
    const { submitValues, resolvedRecoveryPhrase } = this.state;
    if (!submitValues) {
      throw new Error('Cannot submit wallet restoration! No values are available in context!');
    }
    if (resolvedRecoveryPhrase) {
      submitValues.recoveryPhrase = resolvedRecoveryPhrase;
    }
    this.props.actions[environment.API].wallets.restoreWallet.trigger(submitValues);
  };

  onSubmit = (values: WalletRestoreDialogValues) => {
    const isPaper = isPaperMode(this.props.mode);
    let resolvedRecoveryPhrase = values.recoveryPhrase;
    if (isPaper) {
      const [newPhrase] = unscramblePaperAdaMnemonic(
        values.recoveryPhrase,
        getWordsCount(this.props.mode),
        values.paperPassword
      );
      if (!newPhrase) {
        throw new Error('Failed to restore a paper wallet! Invalid recovery phrase!');
      }
      resolvedRecoveryPhrase = newPhrase;
    }
    const { addresses, accountPlate } =  mnemonicsToAddresses(
      resolvedRecoveryPhrase,
      0, // show addresses for account #0
      isPaper ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER : NUMBER_OF_VERIFIED_ADDRESSES,
      'External',
    );
    this.setState({
      verifyRestore: { addresses, accountPlate },
      submitValues: values,
      resolvedRecoveryPhrase,
    });
  };

  cancelVerification = () => {
    this.setState({
      verifyRestore: undefined,
      resolvedRecoveryPhrase: undefined,
    });
  };

  onCancel = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this._getWalletsStore();
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  render() {
    const actions = this.props.actions;
    const { uiNotifications, profile } = this.props.stores;
    const wallets = this._getWalletsStore();
    const { restoreRequest } = wallets;

    const isPaper = isPaperMode(this.props.mode);
    const wordsCount = getWordsCount(this.props.mode);
    if (!isPaper && this.props.mode !== 'regular') {
      throw new Error('Unexpected restore mode: ' + this.props.mode);
    }

    const tooltipNotification = {
      id: `copyTooltipNotification`,
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: messages.copyTooltipMessage,
    };

    const { verifyRestore, submitValues } = this.state;
    if (verifyRestore) {
      const { addresses, accountPlate } = verifyRestore;
      return (
        <WalletRestoreVerifyDialog
          addresses={addresses}
          accountPlate={accountPlate}
          selectedExplorer={profile.selectedExplorer}
          onNext={this.onVerifiedSubmit}
          onCancel={this.cancelVerification}
          onCopyAddressTooltip={(address) => {
            actions.notifications.open.trigger({
              id: tooltipNotification.id,
              duration: tooltipNotification.duration,
              message: messages.copyTooltipMessage
            });
          }}
          showNotification={uiNotifications.getTooltipActiveNotification(tooltipNotification.id)}
          isSubmitting={restoreRequest.isExecuting}
          classicTheme={this.props.classicTheme}
          error={restoreRequest.error}
        />
      );
    }

    return (
      <WalletRestoreDialog
        mnemonicValidator={mnemonic => {
          if (isPaper) {
            return wallets.isValidPaperMnemonic(mnemonic, wordsCount);
          }
          return wallets.isValidMnemonic(mnemonic);
        }}
        validWords={validWords}
        numberOfMnemonics={wordsCount}
        isSubmitting={restoreRequest.isExecuting}
        onSubmit={this.onSubmit}
        onCancel={this.onCancel}
        onBack={this.props.onBack}
        error={restoreRequest.error}
        isPaper={isPaper}
        showPaperPassword={isPaper}
        classicTheme={this.props.classicTheme}
        initValues={submitValues || undefined}
        introMessage={this.props.introMessage || ''}
      />
    );
  }

  _getWalletsStore() {
    return this.props.stores.substores[environment.API].wallets;
  }
}

function isPaperMode(mode: string): boolean {
  return mode === 'paper';
}

function getWordsCount(mode: string): number {
  return mode === 'paper' ? 21 : 15;
}
