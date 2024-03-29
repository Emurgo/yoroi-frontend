// @flow
import { observable, action, computed } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import WalletBackupDialog from '../../components/wallet/WalletBackupDialog';
import {
  HARD_DERIVATION_START,
} from '../../config/numbersConfig';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export type WalletBackupSteps = 'privacyWarning' | 'recoveryPhraseDisplay' | 'recoveryPhraseEntry' | null;

export type RecoveryPhraseWordArray = Array<{| word: string, |}>;
export type RecoveryPhraseSortedArray = Array<{|
  word: string,
  isActive: boolean,
|}>;

/** Pipeline for users to create their wallet and backing up their mnemonic somewhere safe */
export default
class WalletBackupStore extends Store<StoresMap, ActionsMap> {

  @observable inProgress: boolean;
  @observable currentStep: WalletBackupSteps;
  @observable recoveryPhrase: Array<string>;
  @observable name: string;
  @observable password: string;
  @observable recoveryPhraseWords: RecoveryPhraseWordArray;
  /** Sorted recovery phrase the user clicks on to make sure they remember their mnemonic */
  @observable recoveryPhraseSorted: RecoveryPhraseSortedArray;
  @observable completed: boolean;
  @observable enteredPhrase: Array<{|
    word: string,
    index: number,
  |}>;
  @observable selectedAccount: number;
  @observable isPrivacyNoticeAccepted: boolean;
  @observable isEntering: boolean;
  @observable isTermDeviceAccepted: boolean;
  @observable isTermRecoveryAccepted: boolean;
  @observable countdownRemaining: number;

  countdownTimerInterval: ?IntervalID;

  setup(): void {
    super.setup();
    this._reset();
    const a = this.actions.walletBackup;
    a.initiateWalletBackup.listen(this._initiateWalletBackup);
    a.continueToPrivacyWarning.listen(this._continueToPrivacyWarning);
    a.togglePrivacyNoticeForWalletBackup.listen(this._togglePrivacyNoticeForWalletBackup);
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

  @action _initiateWalletBackup: {|
      recoveryPhrase: Array<string>,
      name: string,
      password: string,
  |} => void = (params) => {
    this.recoveryPhrase = params.recoveryPhrase;
    this.name = params.name;
    this.password = params.password;
    this.selectedAccount = 0 + HARD_DERIVATION_START;
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
    this.countdownRemaining = (!environment.isProduction() || environment.isTest()) ? 0 : 10;
    clearInterval(this.countdownTimerInterval);
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

  @action _continueToPrivacyWarning: void => void = () => {
    this.currentStep = 'privacyWarning';
  };

  @action _togglePrivacyNoticeForWalletBackup: void => void = () => {
    this.isPrivacyNoticeAccepted = !this.isPrivacyNoticeAccepted;
  };

  @action _continueToRecoveryPhraseForWalletBackup: void => void = () => {
    this.currentStep = 'recoveryPhraseDisplay';
  };

  @action _startWalletBackup: void => void = () => {
    this.currentStep = 'recoveryPhraseEntry';
  };

  @action _addWordToWalletBackupVerification: {|
    word: string,
    index: number
  |} => void = (params) => {
    const { word, index } = params;
    this.enteredPhrase.push({ word, index });
    const pickedWord = this.recoveryPhraseSorted[index];
    if (pickedWord && pickedWord.word === word) pickedWord.isActive = false;
  };

  @action _clearEnteredRecoveryPhrase: void => void = () => {
    this.enteredPhrase = [];
    this.recoveryPhraseSorted = this.recoveryPhraseSorted.map(
      ({ word }) => ({ word, isActive: true })
    );
  };

  @action _removeOneWord: void => void = () => {
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

  @action _acceptWalletBackupTermDevice: void => void = () => {
    this.isTermDeviceAccepted = true;
  };

  @action _acceptWalletBackupTermRecovery: void => void = () => {
    this.isTermRecoveryAccepted = true;
  };

  @action _restartWalletBackup: void => void = () => {
    this._clearEnteredRecoveryPhrase();
    this.currentStep = 'recoveryPhraseDisplay';
  };

  @action _cancelWalletBackup: void => void = () => {
    this.teardown();
  };

  teardown(): void {
    this._reset();
    super.teardown();
  }

  @action
  _reset: void => void = () => {
    this.inProgress = false;
    this.name = '';
    this.password = '';
    this.selectedAccount = 0 + HARD_DERIVATION_START;
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
    clearInterval(this.countdownTimerInterval);
    this.countdownTimerInterval = null;
  };

}
