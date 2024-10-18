// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletBackupDialog from '../../../components/wallet/WalletBackupDialog';
import type { StoresProps } from '../../../stores';

type Props = {|
  +onClose: void => void,
|};

@observer
export default class WalletBackupDialogContainer extends Component<{| ...Props, ...StoresProps |}> {

  onCancelBackup: (() => void) = () => {
    this.props.onClose();
    this.props.stores.walletBackup.cancelWalletBackup();
  }

  render(): Node {
    const { stores } = this.props;
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
    const { createWalletRequest } = stores.wallets;
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
        togglePrivacyNotice={stores.walletBackup.togglePrivacyNoticeForWalletBackup}
        onBack={stores.walletBackup.continueToPrivacyWarning}
        onContinue={stores.walletBackup.continueToRecoveryPhraseForWalletBackup}
        // Props for WalletRecoveryPhraseDisplayDialog
        recoveryPhrase={recoveryPhraseWords.reduce((phrase, { word }) => `${phrase} ${word}`, '')}
        onStartWalletBackup={stores.walletBackup.startWalletBackup}
        // Props for WalletRecoveryPhraseEntryDialog
        isTermDeviceAccepted={isTermDeviceAccepted}
        enteredPhrase={enteredPhrase}
        hasWord={hasWord}
        isTermRecoveryAccepted={isTermRecoveryAccepted}
        isValid={isRecoveryPhraseValid}
        isSubmitting={createWalletRequest.isExecuting}
        onAcceptTermDevice={stores.walletBackup.acceptWalletBackupTermDevice}
        onAcceptTermRecovery={stores.walletBackup.acceptWalletBackupTermRecovery}
        onAddWord={stores.walletBackup.addWordToWalletBackupVerification}
        onClear={stores.walletBackup.clearEnteredRecoveryPhrase}
        onFinishBackup={stores.substores.ada.wallets.finishWalletBackup}
        removeWord={() => {
          stores.walletBackup.removeOneMnemonicWord();
        }}
        onRestartBackup={stores.walletBackup.restartWalletBackup}
        recoveryPhraseSorted={recoveryPhraseSorted}
      />
    );
  }
}
