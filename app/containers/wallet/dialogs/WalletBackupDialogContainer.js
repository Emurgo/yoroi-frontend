// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WalletBackupDialog from '../../../components/wallet/WalletBackupDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';

type Props = InjectedDialogContainerProps;

@observer
export default class WalletBackupDialogContainer extends Component<Props> {

  onCancelBackup = () => {
    this.props.onClose();
    this.props.actions.walletBackup.cancelWalletBackup.trigger();
  }

  render() {
    const { actions, stores } = this.props;
    const {
      recoveryPhraseWords,
      enteredPhrase,
      isRecoveryPhraseValid,
      countdownRemaining,
      recoveryPhraseSorted,
      isTermDeviceAccepted,
      isTermRecoveryAccepted,
      isPrivacyNoticeAccepted,
      currentStep
    } = stores.walletBackup;
    const {
      startWalletBackup,
      addWordToWalletBackupVerification,
      clearEnteredRecoveryPhrase,
      acceptWalletBackupTermDevice,
      acceptWalletBackupTermRecovery,
      restartWalletBackup,
      finishWalletBackup,
      removeOneMnemonicWord,
      continueToPrivacyWarning,
      acceptPrivacyNoticeForWalletBackup,
      continueToRecoveryPhraseForWalletBackup
    } = actions.walletBackup;
    const { createWalletRequest } = stores.substores[environment.API].wallets;
    const { classicTheme } = this.props;
    const hasWord = (enteredPhrase.length > 0);
    return (
      <WalletBackupDialog
        // Global props for all dialogs
        currentStep={currentStep}
        onCancelBackup={this.onCancelBackup}
        // Props for WalletBackupPrivacyWarningDialog
        canPhraseBeShown={isPrivacyNoticeAccepted && countdownRemaining === 0}
        isPrivacyNoticeAccepted={isPrivacyNoticeAccepted}
        countdownRemaining={countdownRemaining}
        onAcceptPrivacyNotice={acceptPrivacyNoticeForWalletBackup.trigger}
        onBack={continueToPrivacyWarning.trigger}
        onContinue={continueToRecoveryPhraseForWalletBackup.trigger}
        // Props for WalletRecoveryPhraseDisplayDialog
        recoveryPhrase={recoveryPhraseWords.reduce((phrase, { word }) => `${phrase} ${word}`, '')}
        onStartWalletBackup={startWalletBackup.trigger}
        // Props for WalletRecoveryPhraseEntryDialog
        isTermDeviceAccepted={isTermDeviceAccepted}
        enteredPhrase={enteredPhrase}
        hasWord={hasWord}
        isTermRecoveryAccepted={isTermRecoveryAccepted}
        isValid={isRecoveryPhraseValid}
        isSubmitting={createWalletRequest.isExecuting}
        onAcceptTermDevice={acceptWalletBackupTermDevice.trigger}
        onAcceptTermRecovery={acceptWalletBackupTermRecovery.trigger}
        onAddWord={addWordToWalletBackupVerification.trigger}
        onClear={clearEnteredRecoveryPhrase.trigger}
        onFinishBackup={() => {
          finishWalletBackup.trigger();
        }}
        removeWord={() => {
          removeOneMnemonicWord.trigger();
        }}
        onRestartBackup={restartWalletBackup.trigger}
        recoveryPhraseSorted={recoveryPhraseSorted}
        classicTheme={classicTheme}
      />
    );
  }
}
