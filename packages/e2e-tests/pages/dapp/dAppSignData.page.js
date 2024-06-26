import DAppSignBase from './dAppSignBase.page.js';

class DAppSignData extends DAppSignBase {
  // locators
  signMessageTitleLocator = {
    locator: 'signMessageTitle',
    method: 'id',
  };
  signMessageBoxLocator = {
    locator: 'signMessageBox-payload',
    method: 'id',
  };
  // methods
  async getDisplayedMessage() {
    this.logger.info(`DAppSignData::confirmSigning is called`);
    await this.waitForElement(this.signMessageBoxLocator);
    const signDataText = await this.getText(this.signMessageBoxLocator);
    return signDataText;
  }
}

export default DAppSignData;
