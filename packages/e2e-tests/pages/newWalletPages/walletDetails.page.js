import AddWalletBase from './addWalletBase.page.js';
import { fiveSeconds, quarterSecond } from '../../helpers/timeConstants.js';

class WalletDetails extends AddWalletBase {
  defaultMessage =
    'Use a combination of letters, numbers and symbols to make your password stronger';
  // locators
  // add learnMoreLink
  tipsModalLocator = {
    locator: 'infoDialog',
    method: 'id',
  };
  tipModalContinueButtonLocator = {
    locator: 'infoDialogContinueButton',
    method: 'id',
  };
  // wallet name
  walletNameInputLocator = {
    locator: 'walletNameInput',
    method: 'id',
  };
  // wallet name error message
  walletNameErrorLabelLocator = {
    locator: 'walletNameInput-helper-text',
    method: 'id',
  };
  // wallet password
  walletPasswordInputLocator = {
    locator: 'walletPasswordInput',
    method: 'id',
  };
  // wallet password error message
  walletPasswordErrorLabelLocator = {
    locator: 'walletPasswordInput-helper-text',
    method: 'id',
  };
  // repeat wallet password
  walletRepeatPasswordInputLocator = {
    locator: 'repeatPasswordInput',
    method: 'id',
  };
  // repear wallet password error message
  walletRepeatPasswordErrorLabelLocator = {
    locator: 'repeatPasswordInput-helper-text',
    method: 'id',
  };
  // wallet plate
  walletPlateLabelLocator = {
    locator: 'walletPlateText',
    method: 'id',
  };

  // functions
  //
  async closeTipsModalWindow() {
    this.logger.info(`WalletDetails::closeTipsModalWindow is called`);
    await this.waitForElement(this.tipsModalLocator);
    const buttonIsPresented = await this.customWaitIsPresented(
      this.tipModalContinueButtonLocator,
      fiveSeconds,
      quarterSecond
    );
    if (buttonIsPresented) {
      await this.click(this.tipModalContinueButtonLocator);
    } else {
      throw new Error('New wallet -> Details page -> Tips modal -> The continue button is not found.');
    }
  }
  async enterWalletName(walletName) {
    this.logger.info(`WalletDetails::enterWalletName is called`);
    await this.waitForElement(this.walletNameInputLocator);
    await this.input(this.walletNameInputLocator, walletName);
  }
  async enterWalletPassword(password) {
    this.logger.info(`WalletDetails::enterWalletPassword is called`);
    await this.waitForElement(this.walletPasswordInputLocator);
    await this.input(this.walletPasswordInputLocator, password);
  }
  async repeatWalletPassword(password) {
    this.logger.info(`WalletDetails::repeatWalletPassword is called`);
    await this.waitForElement(this.walletRepeatPasswordInputLocator);
    await this.input(this.walletRepeatPasswordInputLocator, password);
  }
  async checkWalletNameHasNoError() {
    this.logger.info(`WalletDetails::checkWalletNameHasNoError is called`);
    await this.sleep(500);
    await this.waitForElement(this.walletNameErrorLabelLocator);
    const errorText = await this.getText(this.walletNameErrorLabelLocator);
    return errorText.length === 0;
  }
  async checkWalletPaswordHasNoError() {
    this.logger.info(`WalletDetails::checkWalletPaswordHasNoError is called`);
    await this.sleep(500);
    await this.waitForElement(this.walletPasswordErrorLabelLocator);
    const errorText = await this.getText(this.walletPasswordErrorLabelLocator);
    return errorText === this.defaultMessage || errorText.length === 0;
  }
  async checkWalletRepeatPasswordHasNoError() {
    this.logger.info(`WalletDetails::checkWalletRepeatPasswordHasNoError is called`);
    await this.sleep(500);
    await this.waitForElement(this.walletRepeatPasswordErrorLabelLocator);
    const errorText = await this.getText(this.walletRepeatPasswordErrorLabelLocator);
    return errorText.length === 0;
  }
  async getWalletPlate() {
    this.logger.info(`WalletDetails::getWalletPlate is called`);
    await this.waitForElement(this.walletPlateLabelLocator);
    return await this.getText(this.walletPlateLabelLocator);
  }
}

export default WalletDetails;
