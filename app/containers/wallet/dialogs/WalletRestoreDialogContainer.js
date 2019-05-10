// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import validWords from 'bip39/src/wordlists/english.json';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import WalletRestoreVerifyDialog from '../../../components/wallet/WalletRestoreVerifyDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';
import {
  unscramblePaperAdaMnemonic,
  mnemonicsToAddresses,
} from '../../../api/ada/lib/cardanoCrypto/cryptoWallet';

type Props = InjectedDialogContainerProps & {
  mode: "regular" | "paper"
};

const NUMBER_OF_VERIFIED_ADDRESSES = 1;
const NUMBER_OF_VERIFIED_ADDRESSES_PAPER = 5;

@observer
export default class WalletRestoreDialogContainer extends Component<Props> {

  state = {
    verifyRestore: undefined,
    submitValues: undefined,
  };

  onVerifiedSubmit = () => {
    const { submitValues } = this.state;
    if (!submitValues) {
      throw new Error("Cannot submit wallet restoration! No values are available in context!");
    }
    this.props.actions[environment.API].wallets.restoreWallet.trigger(submitValues);
  };

  onSubmit = (values: {
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string,
    paperPassword: string
  }) => {
    let isPaper = isPaperMode(this.props.mode);
    if (isPaper) {
      const [newPhrase] = unscramblePaperAdaMnemonic(
        values.recoveryPhrase,
        getWordsCount(this.props.mode),
        values.paperPassword
      );
      if (newPhrase) {
        values.recoveryPhrase = newPhrase;
      }
    }
    const { addresses, accountPlate } =  mnemonicsToAddresses(values.recoveryPhrase,
      isPaper ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER : NUMBER_OF_VERIFIED_ADDRESSES);
    this.setState(s => ({...s,
      verifyRestore: { addresses, accountPlate },
      submitValues: values,
    }));
  };

  cancelVerification = () => {
    this.setState(s => ({...s,
      verifyRestore: undefined,
      submitValues: undefined,
    }));
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

    const { verifyRestore } = this.state;
    if (verifyRestore) {
      const { addresses, accountPlate } = verifyRestore;
      return (
        <WalletRestoreVerifyDialog
          addresses={addresses}
          accountPlate={accountPlate}
          onCopyAddress={() => {}}
          onNext={this.onVerifiedSubmit}
          onCancel={this.cancelVerification}
          classicTheme={this.props.classicTheme}
        />
      )
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
        showPaperPassword={isPaper}
        classicTheme={this.props.classicTheme}
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
