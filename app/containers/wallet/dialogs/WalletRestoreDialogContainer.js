// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import validWords from 'bip39/src/wordlists/english.json';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';
import { unscramblePaperAdaMnemonic } from '../../../api/ada/lib/cardanoCrypto/cryptoWallet';

type Props = InjectedDialogContainerProps & {
  mode: "regular" | "paper"
};

@observer
export default class WalletRestoreDialogContainer extends Component<Props> {

  onSubmit = (values: {
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string,
    paperPassword: string
  }) => {
    if (isPaperMode(this.props.mode)) {
      const [newPhrase] = unscramblePaperAdaMnemonic(
        values.recoveryPhrase,
        getWordsCount(this.props.mode),
        values.paperPassword
      );
      if (newPhrase) {
        values.recoveryPhrase = newPhrase;
      }
    }
    this.props.actions[environment.API].wallets.restoreWallet.trigger(values);
  };

  onCancel = () => {
    this.props.onClose();
    // Restore request should be reset only in case restore is finished/errored
    const { restoreRequest } = this._getWalletsStore();
    if (!restoreRequest.isExecuting) restoreRequest.reset();
  };

  render() {

    const wallets = this._getWalletsStore();
    const { restoreRequest } = wallets;

    const isPaper = isPaperMode(this.props.mode);
    const wordsCount = getWordsCount(this.props.mode);
    if (!isPaper && this.props.mode !== 'regular') {
      throw new Error('Unexpected restore mode: ' + this.props.mode);
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
        error={restoreRequest.error}
        isPaper={isPaper}
        showPaperPassword
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
