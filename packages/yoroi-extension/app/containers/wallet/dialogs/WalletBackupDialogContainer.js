// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import WalletBackupDialog from '../../../components/wallet/WalletBackupDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type {
  RecoveryPhraseSortedArray,
  RecoveryPhraseWordArray,
  WalletBackupSteps,
} from '../../../stores/toplevel/WalletBackupStore';

export type GeneratedData = typeof WalletBackupDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

@observer
export default class WalletBackupDialogContainer extends Component<Props> {

  onCancelBackup: (() => void) = () => {
    this.props.onClose();
    this.generated.actions.walletBackup.cancelWalletBackup.trigger();
  }

  render(): Node {
    const { actions, stores } = this.generated;
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
        onFinishBackup={finishWalletBackup.trigger}
        removeWord={() => {
          removeOneMnemonicWord.trigger();
        }}
        onRestartBackup={restartWalletBackup.trigger}
        recoveryPhraseSorted={recoveryPhraseSorted}
        classicTheme={stores.profile.isClassicTheme}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      walletBackup: {|
        acceptPrivacyNoticeForWalletBackup: {|
          trigger: (params: void) => void
        |},
        acceptWalletBackupTermDevice: {|
          trigger: (params: void) => void
        |},
        acceptWalletBackupTermRecovery: {|
          trigger: (params: void) => void
        |},
        addWordToWalletBackupVerification: {|
          trigger: (params: {|
            index: number,
            word: string
          |}) => void
        |},
        cancelWalletBackup: {|
          trigger: (params: void) => void
        |},
        clearEnteredRecoveryPhrase: {|
          trigger: (params: void) => void
        |},
        continueToPrivacyWarning: {|
          trigger: (params: void) => void
        |},
        continueToRecoveryPhraseForWalletBackup: {|
          trigger: (params: void) => void
        |},
        finishWalletBackup: {|
          trigger: (params: void) => Promise<void>
        |},
        removeOneMnemonicWord: {|
          trigger: (params: void) => void
        |},
        restartWalletBackup: {|
          trigger: (params: void) => void
        |},
        startWalletBackup: {|
          trigger: (params: void) => void
        |}
      |}
    |},
    stores: {|
      profile: {| isClassicTheme: boolean |},
      walletBackup: {|
        countdownRemaining: number,
        currentStep: WalletBackupSteps,
        enteredPhrase: Array<{|
          index: number,
          word: string
        |}>,
        isPrivacyNoticeAccepted: boolean,
        isRecoveryPhraseValid: boolean,
        isTermDeviceAccepted: boolean,
        isTermRecoveryAccepted: boolean,
        recoveryPhraseSorted: RecoveryPhraseSortedArray,
        recoveryPhraseWords: RecoveryPhraseWordArray
      |},
      wallets: {|
        createWalletRequest: {| isExecuting: boolean |}
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletBackupDialogContainer)} no way to generated props`);
    }
    const { stores, actions, } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        walletBackup: {
          recoveryPhraseWords: stores.walletBackup.recoveryPhraseWords,
          enteredPhrase: stores.walletBackup.enteredPhrase,
          isRecoveryPhraseValid: stores.walletBackup.isRecoveryPhraseValid,
          countdownRemaining: stores.walletBackup.countdownRemaining,
          recoveryPhraseSorted: stores.walletBackup.recoveryPhraseSorted,
          isTermDeviceAccepted: stores.walletBackup.isTermDeviceAccepted,
          isTermRecoveryAccepted: stores.walletBackup.isTermRecoveryAccepted,
          isPrivacyNoticeAccepted: stores.walletBackup.isPrivacyNoticeAccepted,
          currentStep: stores.walletBackup.currentStep,
        },
        wallets: {
          createWalletRequest: {
            isExecuting: stores.wallets.createWalletRequest.isExecuting,
          },
        },
      },
      actions: {
        walletBackup: {
          cancelWalletBackup: {
            trigger: actions.walletBackup.cancelWalletBackup.trigger,
          },
          startWalletBackup: {
            trigger: actions.walletBackup.startWalletBackup.trigger,
          },
          addWordToWalletBackupVerification: {
            trigger: actions.walletBackup.addWordToWalletBackupVerification.trigger,
          },
          clearEnteredRecoveryPhrase: {
            trigger: actions.walletBackup.clearEnteredRecoveryPhrase.trigger,
          },
          acceptWalletBackupTermDevice: {
            trigger: actions.walletBackup.acceptWalletBackupTermDevice.trigger,
          },
          acceptWalletBackupTermRecovery: {
            trigger: actions.walletBackup.acceptWalletBackupTermRecovery.trigger,
          },
          restartWalletBackup: {
            trigger: actions.walletBackup.restartWalletBackup.trigger,
          },
          finishWalletBackup: {
            trigger: actions.walletBackup.finishWalletBackup.trigger,
          },
          removeOneMnemonicWord: {
            trigger: actions.walletBackup.removeOneMnemonicWord.trigger,
          },
          continueToPrivacyWarning: {
            trigger: actions.walletBackup.continueToPrivacyWarning.trigger,
          },
          acceptPrivacyNoticeForWalletBackup: {
            trigger: actions.walletBackup.acceptPrivacyNoticeForWalletBackup.trigger,
          },
          continueToRecoveryPhraseForWalletBackup: {
            trigger: actions.walletBackup.continueToRecoveryPhraseForWalletBackup.trigger,
          },
        },
      },
    });
  }
}
