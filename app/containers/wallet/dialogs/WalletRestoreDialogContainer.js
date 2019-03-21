// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import validWords from 'bip39/wordlists/english.json';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';
import {
  unscramblePaperAdaMnemonic
} from '../../../api/ada/lib/cardanoCrypto/cryptoWallet';

type Props = InjectedDialogContainerProps & {
  mode: "regular" | "paper"
};

@observer
export default class WalletRestoreDialogContainer extends Component<Props> {

  onSubmit = (values: { recoveryPhrase: string, walletName: string, walletPassword: string }) => {
    if (this.props.mode === "paper") {
      const [newPhrase] = unscramblePaperAdaMnemonic(values.recoveryPhrase, 30);
      values.recoveryPhrase = newPhrase;
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

    const isPaper = this.props.mode === "paper";
    if (!isPaper && this.props.mode !== "regular") {
      throw new Error("Unexpected restore mode: " + this.props.mode);
    }

    return (
      <WalletRestoreDialog
        mnemonicValidator={mnemonic => {
          if (isPaper) {
            return wallets.isValidPaperMnemonic(mnemonic, 30);
          } else {
            return wallets.isValidMnemonic(mnemonic);
          }
        }}
        validWords={validWords}
        numberOfMnemonics={isPaper ? 30 : 15}
        isSubmitting={restoreRequest.isExecuting}
        onSubmit={this.onSubmit}
        onCancel={this.onCancel}
        error={restoreRequest.error}
      />
    );
  }

  _getWalletsStore() {
    return this.props.stores.substores[environment.API].wallets;
  }
}
