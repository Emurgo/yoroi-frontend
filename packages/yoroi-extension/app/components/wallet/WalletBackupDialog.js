// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import WalletBackupPrivacyWarningDialog from './backup-recovery/WalletBackupPrivacyWarningDialog';
import WalletRecoveryPhraseDisplayDialog from './backup-recovery/WalletRecoveryPhraseDisplayDialog';
import WalletRecoveryPhraseEntryDialog from './backup-recovery/WalletRecoveryPhraseEntryDialog';

type Props = {|
  +currentStep: ?string,
  +canPhraseBeShown: boolean,
  +isPrivacyNoticeAccepted: boolean,
  +countdownRemaining: number,
  +isTermDeviceAccepted: boolean,
  +isTermRecoveryAccepted: boolean,
  +isValid: boolean,
  +isSubmitting: boolean,
  +recoveryPhrase: string,
  +recoveryPhraseSorted: Array<{|
    word: string,
    isActive: boolean,
  |}>,
  +enteredPhrase: Array<{|
    word: string,
    index: number,
  |}>,
  +onCancelBackup: void => void,
  +togglePrivacyNotice: void => void,
  +onContinue: void => void,
  +onBack: void => void,
  +onStartWalletBackup: void => void,
  +onAcceptTermDevice: void => void,
  +onAcceptTermRecovery: void => void,
  +onAddWord: {| index: number, word: string |} => void,
  +onClear: void => void,
  +onFinishBackup: void => PossiblyAsync<void>,
  +onRestartBackup: void => void,
  +removeWord: void => void,
  +hasWord: boolean,
|};

@observer
export default class WalletBackupDialog extends Component<Props> {

  render(): Node {
    const {
      currentStep, onCancelBackup,
      canPhraseBeShown, isPrivacyNoticeAccepted,
      countdownRemaining, togglePrivacyNotice,
      onContinue, onBack, recoveryPhrase,
      onStartWalletBackup, isTermDeviceAccepted,
      enteredPhrase, removeWord, hasWord,
      isTermRecoveryAccepted, isValid, isSubmitting,
      onAcceptTermDevice, onAcceptTermRecovery,
      onAddWord, onClear, onFinishBackup,
      onRestartBackup, recoveryPhraseSorted
    } = this.props;

    if (currentStep === 'privacyWarning') {
      return (
        <WalletBackupPrivacyWarningDialog
          canPhraseBeShown={canPhraseBeShown}
          isPrivacyNoticeAccepted={isPrivacyNoticeAccepted}
          countdownRemaining={countdownRemaining}
          togglePrivacyNotice={togglePrivacyNotice}
          onCancelBackup={onCancelBackup}
          onContinue={onContinue}
        />
      );
    }

    if (currentStep === 'recoveryPhraseDisplay') {
      return (
        <WalletRecoveryPhraseDisplayDialog
          recoveryPhrase={recoveryPhrase}
          onStartWalletBackup={onStartWalletBackup}
          onCancelBackup={onCancelBackup}
          onBack={onBack}
        />
      );
    }

    if (currentStep === 'recoveryPhraseEntry') {
      return (
        <WalletRecoveryPhraseEntryDialog
          isTermDeviceAccepted={isTermDeviceAccepted}
          enteredPhrase={enteredPhrase}
          isTermRecoveryAccepted={isTermRecoveryAccepted}
          isValid={isValid}
          isSubmitting={isSubmitting}
          onAcceptTermDevice={onAcceptTermDevice}
          onAcceptTermRecovery={onAcceptTermRecovery}
          onAddWord={onAddWord}
          onCancelBackup={onCancelBackup}
          onClear={onClear}
          onRestartBackup={onRestartBackup}
          recoveryPhraseSorted={recoveryPhraseSorted}
          onFinishBackup={onFinishBackup}
          removeWord={removeWord}
          hasWord={hasWord}
        />
      );
    }

    // We should never get to this point
    // TODO: use proper types to make sure this is not possible
    return <br />;
  }
}
