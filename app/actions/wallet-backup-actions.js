// @flow
import Action from './lib/Action';

// ======= WALLET BACKUP ACTIONS =======

export default class WalletBackupActions {
  startWalletBackup: Action<void> = new Action();
  initiateWalletBackup: Action<{ recoveryPhrase: string[] }> = new Action();
  continueToPrivacyWarning: Action<void> = new Action();
  acceptPrivacyNoticeForWalletBackup: Action<void> = new Action();
  continueToRecoveryPhraseForWalletBackup: Action<void> = new Action();
  addWordToWalletBackupVerification: Action<{ word: string, index: number }> = new Action();
  clearEnteredRecoveryPhrase: Action<void> = new Action();
  acceptWalletBackupTermDevice: Action<void> = new Action();
  acceptWalletBackupTermRecovery: Action<void> = new Action();
  restartWalletBackup: Action<void> = new Action();
  cancelWalletBackup: Action<void> = new Action();
  finishWalletBackup: Action<void> = new Action();
  removeOneMnemonicWord: Action<void> = new Action();
}
