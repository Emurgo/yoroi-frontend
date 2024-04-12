import { Key } from 'selenium-webdriver';
import SettingsTab from './settingsTab.page.js';

class WalletSubTab extends SettingsTab {
  // locator
  // Wallet name input
  walletNameInputLocator = {
    locator: 'settings:wallet:walletName-editValue-input',
    method: 'id',
  };
  walletNameCancelChangesButtonLocator = {
    locator: 'settings:wallet:walletName-cancelChanges-button',
    method: 'id',
  };
  // Change password button
  changePasswordButtonLocator = {
    locator: 'settings:wallet-changePassword-button',
    method: 'id',
  };
  // Change password
  changePasswordDialogLocator = {
    locator: 'changePasswordDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  // Change password dialog, Current password input
  changePasswordCurrentPaswordInputLocator = {
    locator: '//input[starts-with(@id, "currentPassword--")]', // unfortunately, I didn't find a way to make a proper ID
    method: 'xpath',
  };
  // Change password dialog, New password input
  changePasswordNewPaswordInputLocator = {
    locator: '//input[starts-with(@id, "walletPassword--")]', // unfortunately, I didn't find a way to make a proper ID
    method: 'xpath',
  };
  changePasswordNewPaswordHelpMsgTextLocator = {
    locator: '//p[starts-with(@id, "walletPassword--") and contains(@id, "-helper-text")]', // unfortunately, I didn't find a way to make a proper ID
    method: 'xpath',
  };
  // Change password dialog, Repeat New password input
  changePasswordRepeatNewPaswordInputLocator = {
    locator: '//input[starts-with(@id, "repeatPassword--")]', // unfortunately, I didn't find a way to make a proper ID
    method: 'xpath',
  };
  changePasswordRepeatNewPaswordHelpMsgLocator = {
    locator: '//p[starts-with(@id, "repeatPassword--") and contains(@id, "-helper-text")]', // unfortunately, I didn't find a way to make a proper ID
    method: 'xpath',
  };
  // Change password dialog, Save button
  changePasswordSaveButtonLocator = {
    locator: 'changePasswordDialog-save-button',
    method: 'id',
  };
  // Change password dialog, Error message
  changePasswordErrorMessageLocator = {
    locator: 'changePasswordDialog-errorMessage-text',
    method: 'id',
  };
  // Resync wallet button
  resyncWalletButtonLocator = {
    locator: 'settings:wallet-resyncWallet-button',
    method: 'id',
  };
  // Resync wallet dialog, I undestand checkbox
  // Resync wallet dialog, Cancel button
  // Resync wallet dialog, Resync button
  // Export wallet button
  exportWalletButtonLocator = {
    locator: 'settings:wallet-exportWallet-button',
    method: 'id',
  };
  // Export wallet dialog, Public key text
  // Export wallet dialog, Cross button
  // Remove wallet button
  removeWalletButtonLocator = {
    locator: 'settings:wallet-removeWallet-button',
    method: 'id',
  };
  // Remove wallet dialog
  removeWalletDialogLocator = {
    locator: 'removeWalletDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  // Remove wallet dialog, I have seed phrase checkbox
  removeWalletAcknowledgeCheckboxLocator = {
    locator: 'removeWalletDialog-acknowledgeAction-checkbox',
    method: 'id',
  };
  // Remove wallet dialog, Cancel button
  removeWalletCancelButtonLocator = {
    locator: 'removeWalletDialog-cancel-button',
    method: 'id',
  };
  // Remove wallet dialog, Remove button
  removeWalletRemoveButtonLocator = {
    locator: 'removeWalletDialog-remove-button',
    method: 'id',
  };
  // functions
  async changeWalletName(newName, oldName, confirm = true) {
    this.logger.info(
      `WalletSubTab::changeWalletName is called. Name: ${newName}, confirm new name: ${confirm}`
    );
    await this.click(this.walletNameInputLocator);
    await this.clearInputUpdatingForm(this.walletNameInputLocator, oldName.length);
    if (confirm) {
      await this.input(this.walletNameInputLocator, newName + Key.RETURN);
    } else {
      await this.input(this.walletNameInputLocator, newName);
      await this.click(this.walletNameCancelChangesButtonLocator);
    }
  }
  async changeWalletPassword(oldPassword, newPassword, repeatNewPassword, confirm = true) {
    this.logger.info(
      `WalletSubTab::getWalletExportInfo is called.` +
        `The old password: ${oldPassword}, the new password: ${newPassword}, the repeat new password: ${repeatNewPassword}`
    );
    await this.click(this.changePasswordButtonLocator);
    await this.waitForElement(this.changePasswordDialogLocator);

    await this.click(this.changePasswordCurrentPaswordInputLocator);
    await this.input(this.changePasswordCurrentPaswordInputLocator, oldPassword);

    await this.click(this.changePasswordNewPaswordInputLocator);
    await this.input(this.changePasswordNewPaswordInputLocator, newPassword);

    await this.click(this.changePasswordRepeatNewPaswordInputLocator);
    await this.input(this.changePasswordRepeatNewPaswordInputLocator, repeatNewPassword);

    if (confirm) {
      await this.click(this.changePasswordSaveButtonLocator);
    }
  }
  async getPasswordErrorMsg() {
    this.logger.info(`WalletSubTab::getPasswordErrorMsg is called.`);
    await this.waitElementTextMatches(this.changePasswordErrorMessageLocator, /\w+/g);
    return await this.getText(this.changePasswordErrorMessageLocator);
  }
  async getNewPasswordErrorMsg() {
    this.logger.info(`WalletSubTab::getNewPasswordErrorMsg is called.`);
    await this.waitElementTextMatches(this.changePasswordNewPaswordHelpMsgTextLocator, /\w+/g);
    return await this.getText(this.changePasswordNewPaswordHelpMsgTextLocator);
  }
  async getRepeatNewPasswordErrorMsg() {
    this.logger.info(`WalletSubTab::getRepeatNewPasswordErrorMsg is called.`);
    await this.waitElementTextMatches(this.changePasswordRepeatNewPaswordHelpMsgLocator, /\w+/g);
    return await this.getText(this.changePasswordRepeatNewPaswordHelpMsgLocator);
  }
  async getWalletExportInfo() {
    this.logger.info(`WalletSubTab::getWalletExportInfo is called`);
  }
  async resyncWallet() {
    this.logger.info(`WalletSubTab::resyncWallet is called`);
  }
  async removeWallet(confirm = true) {
    this.logger.info(`WalletSubTab::removeWallet is called`);
    await this.click(this.removeWalletButtonLocator);
    await this.waitForElement(this.removeWalletDialogLocator);
    if (!confirm) {
      await this.click(this.removeWalletCancelButtonLocator);
    } else {
      await this.click(this.removeWalletAcknowledgeCheckboxLocator);
      await this.click(this.removeWalletRemoveButtonLocator);
    }
  }
}

export default WalletSubTab;
