// @flow
import { observable, action, computed } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';

export type walletBackupSteps = 'privacyWarning' | 'recoveryPhraseDisplay' | 'recoveryPhraseEntry' | null;

type RecoveryPhraseWordArray = Array<{ word: string }>;
type recoveryPhraseSortedArray = Array<{ word: string, isActive: boolean }>;

/** Pipeline for users to create their wallet and backing up their mnemonic somewhere safe */
export default
class WalletBackupStore extends Store {

  @observable inProgress: boolean;
  @observable currentStep: walletBackupSteps;
  @observable recoveryPhrase: Array<string>;
  @observable name: string;
  @observable password: string;
  @observable recoveryPhraseWords: RecoveryPhraseWordArray;
  /** Sorted recovery phrase the user clicks on to make sure they remember their mnemonic */
  @observable recoveryPhraseSorted: recoveryPhraseSortedArray;
  @observable completed: boolean;
  @observable enteredPhrase: Array<{ word: string, index: number }>;
  @observable isPrivacyNoticeAccepted: boolean;
  @observable isEntering: boolean;
  @observable isTermDeviceAccepted: boolean;
  @observable isTermRecoveryAccepted: boolean;
  @observable countdownRemaining: number;

  countdownTimerInterval: ?IntervalID;

  setup() {
    this._reset();
    const a = this.actions.walletBackup;
    a.initiateWalletBackup.listen(this._initiateWalletBackup);
    a.continueToPrivacyWarning.listen(this._continueToPrivacyWarning);
    a.acceptPrivacyNoticeForWalletBackup.listen(this._acceptPrivacyNoticeForWalletBackup);
    a.continueToRecoveryPhraseForWalletBackup.listen(this._continueToRecoveryPhraseForWalletBackup);
    a.startWalletBackup.listen(this._startWalletBackup);
    a.addWordToWalletBackupVerification.listen(this._addWordToWalletBackupVerification);
    a.clearEnteredRecoveryPhrase.listen(this._clearEnteredRecoveryPhrase);
    a.acceptWalletBackupTermDevice.listen(this._acceptWalletBackupTermDevice);
    a.acceptWalletBackupTermRecovery.listen(this._acceptWalletBackupTermRecovery);
    a.restartWalletBackup.listen(this._restartWalletBackup);
    a.cancelWalletBackup.listen(this._cancelWalletBackup);
    a.removeOneMnemonicWord.listen(this._removeOneWord);
  }

  @action _initiateWalletBackup = (params: {
      recoveryPhrase: Array<string>,
      name: string,
      password: string,
  }) => {
    this.recoveryPhrase = params.recoveryPhrase;
    this.name = params.name;
    this.password = params.password;
    this.inProgress = true;
    this.currentStep = 'privacyWarning';
    this.recoveryPhraseWords = this.recoveryPhrase.map(word => ({ word }));
    this.recoveryPhraseSorted = this.recoveryPhrase
      .sort() // sort mnemonics by alphabetical order to make it easier for humans to click
      .map(w => ({ word: w, isActive: true }));
    this.completed = false;
    this.enteredPhrase = [];
    this.isPrivacyNoticeAccepted = false;
    this.isEntering = false;
    this.isTermDeviceAccepted = false;
    this.isTermRecoveryAccepted = false;
    this.countdownRemaining = !environment.isMainnet() ? 0 : 10;
    if (this.countdownTimerInterval) clearInterval(this.countdownTimerInterval);
    this.countdownTimerInterval = setInterval(() => {
      if (this.countdownRemaining > 0) {
        action(() => this.countdownRemaining--)();
      } else if (this.countdownTimerInterval != null) {
        clearInterval(this.countdownTimerInterval);
      }
    }, 1000);
    this.actions.dialogs.open.trigger({
      dialog: WalletBackupDialog,
    });
  };

  @action _continueToPrivacyWarning = () => {
    this.currentStep = 'privacyWarning';
  };

  @action _acceptPrivacyNoticeForWalletBackup = () => {
    this.isPrivacyNoticeAccepted = true;
  };

  @action _continueToRecoveryPhraseForWalletBackup = () => {
    this.currentStep = 'recoveryPhraseDisplay';
  };

  @action _startWalletBackup = () => {
    this.currentStep = 'recoveryPhraseEntry';
  };

  @action _addWordToWalletBackupVerification = (params: { word: string, index: number }) => {
    const { word, index } = params;
    this.enteredPhrase.push({ word, index });
    const pickedWord = this.recoveryPhraseSorted[index];
    if (pickedWord && pickedWord.word === word) pickedWord.isActive = false;
  };

  @action _clearEnteredRecoveryPhrase = () => {
    this.enteredPhrase = [];
    this.recoveryPhraseSorted = this.recoveryPhraseSorted.map(
      ({ word }) => ({ word, isActive: true })
    );
  };

  @action _removeOneWord = () => {
    if (!this.enteredPhrase) {
      return;
    }
    const poppedWord = this.enteredPhrase.pop();
    this.recoveryPhraseSorted[poppedWord.index].isActive = true;
  };

  @computed get isRecoveryPhraseValid(): boolean {
    return (
      this.recoveryPhraseWords.reduce((words, { word }) => words + word, '') ===
      this.enteredPhrase.reduce((words, { word }) => words + word, '')
    );
  }

  @action _acceptWalletBackupTermDevice = () => {
    this.isTermDeviceAccepted = true;
  };

  @action _acceptWalletBackupTermRecovery = () => {
    this.isTermRecoveryAccepted = true;
  };

  @action _restartWalletBackup = () => {
    this._clearEnteredRecoveryPhrase();
    this.currentStep = 'recoveryPhraseDisplay';
  };

  @action _cancelWalletBackup = () => {
    this.teardown();
  };

  teardown(): void {
    this._reset();
    super.teardown();
  }

  @action
  _reset = () => {
    this.inProgress = false;
    this.name = '';
    this.password = '';
    this.currentStep = null;
    this.recoveryPhrase = [];
    this.recoveryPhraseWords = [];
    this.recoveryPhraseSorted = [];
    this.completed = false;
    this.enteredPhrase = [];
    this.isPrivacyNoticeAccepted = false;
    this.isEntering = false;
    this.isTermDeviceAccepted = false;
    this.isTermRecoveryAccepted = false;
    this.countdownRemaining = 0;

    this.countdownTimerInterval = null;
  };

}
