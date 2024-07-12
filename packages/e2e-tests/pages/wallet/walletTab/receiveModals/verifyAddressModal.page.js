import { fiveSeconds, quarterSecond } from '../../../../helpers/timeConstants.js';
import BasePage from '../../../basepage.js';

class VerifyAddressModal extends BasePage {
  // locators
  verifyAddressModalLocator = {
    locator: 'verifyAddressDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  verifyAddressModalTitleLocator = {
    locator: 'verifyAddressDialog-dialogTitle-text',
    method: 'id',
  };
  closeModalButtonLocator = {
    locator: 'verifyAddressDialog-closeModal-button',
    method: 'id',
  };
  // address
  addressTextLocator = {
    locator: 'verifyAddressDialog-address-text',
    method: 'id',
  };
  // derivation path
  derivationPathTextLocator = {
    locator: 'verifyAddressDialog-derivationPath-text',
    method: 'id',
  };
  // staking key hash
  stakingKeyHashTextLocator = {
    locator: 'verifyAddressDialog-stakingKeyHash-text',
    method: 'id',
  };
  // methods
  // isDisplayed
  async isDisplayed() {
    this.logger.info(`ReceiveSubTab::VerifyAddressModal::isDisplayed is called.`);
    const modalIsFound = await this.customWaitIsPresented(
      this.verifyAddressModalLocator,
      fiveSeconds,
      quarterSecond
    );
    const titleIsFound = await this.customWaitIsPresented(
      this.verifyAddressModalTitleLocator,
      fiveSeconds,
      quarterSecond
    );
    return modalIsFound && titleIsFound;
  }
  // closeModal
  async closeModal() {
    this.logger.info(`ReceiveSubTab::VerifyAddressModal::closeModal is called.`);
    await this.click(this.closeModalButtonLocator);
  }
  // getVerifyAddressInfo
  async getVerifyAddressInfo(isRewardAddr = false) {
    this.logger.info(`ReceiveSubTab::VerifyAddressModal::getVerifyAddressInfo is called.`);
    // short address
    const addressShort = await this.getText(this.addressTextLocator);
    // full address
    const addressLinkText = await this.getLinkFromComponent(this.addressTextLocator);
    const linkArr = addressLinkText.split('/');
    const addressFull = linkArr[linkArr.length - 1];
    // derivation path
    const derivationPath = await this.getText(this.derivationPathTextLocator);
    if (isRewardAddr) {
      return {
        addressShort,
        addressFull,
        derivationPath,
      };
    }
    // staking key hash
    const stakingKeyHash = await this.getText(this.stakingKeyHashTextLocator);
    return {
      addressShort,
      addressFull,
      derivationPath,
      stakingKeyHash,
    };
  }
}

export default VerifyAddressModal;
