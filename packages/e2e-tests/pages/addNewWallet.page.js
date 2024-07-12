import WalletCommonBase from './walletCommonBase.page.js';

class AddNewWallet extends WalletCommonBase {
  // locators
  createWalletButtonLocator = {
    locator: 'createWalletButton',
    method: 'id',
  };
  restoreWalletButtonLocator = {
    locator: 'restoreWalletButton',
    method: 'id',
  };
  connectHwButtonLocator = {
    locator: 'connectHardwareWalletButton',
    method: 'id',
  };
  // ::start trezor connect section
  cardanoNetworkButtonLocator = {
    locator: '.PickCurrencyOptionDialog_cardano',
    method: 'css',
  };
  trezorHWButtonLocator = {
    locator: '.WalletConnectHWOptionDialog_connectTrezor',
    method: 'css',
  };
  checkDialogLocator = {
    locator: '.CheckDialog',
    method: 'css',
  };
  nextButtonLocator = {
    locator: 'primaryButton',
    method: 'id',
  };
  connectDialogLocator = {
    locator: '.ConnectDialog',
    method: 'css',
  };
  hwWalletNameInputLocator = {
    locator: '//input[starts-with(@id, "walletName-")]',
    method: 'xpath',
  };
  // ::end trezor connect section

  // functions
  async isDisplayed() {
    this.logger.info(`AddNewWallet::selectCreateNewWallet is called`);
    try {
      await this.waitForElement(this.createWalletButtonLocator);
      await this.waitForElement(this.restoreWalletButtonLocator);
      await this.waitForElement(this.connectHwButtonLocator);
      return true;
    } catch (error) {
      this.logger.warn(`AddNewWallet::selectCreateNewWallet An error has happen. Error ${error}`);
      return false;
    }
  }
  async selectCreateNewWallet() {
    this.logger.info(`AddNewWallet::selectCreateNewWallet is called`);
    await this.waitPresentedAndAct(
      this.createWalletButtonLocator, 
      async () => {
        await this.click(this.createWalletButtonLocator);
      },
    );
  }
  async selectRestoreWallet() {
    this.logger.info(`AddNewWallet::selectRestoreWallet is called`);
    await this.waitForElement(this.restoreWalletButtonLocator);
    await this.click(this.restoreWalletButtonLocator);
  }
  async selectConnectHW() {
    this.logger.info(`AddNewWallet::selectConnectHW is called`);
    await this.waitForElement(this.connectHwButtonLocator);
    await this.click(this.connectHwButtonLocator);
  }
  // ::start trezor connect section
  async selectCardanoNetwork() {
    this.logger.info(`AddNewWallet::selectCardanoNetwork is called`);
    await this.waitForElement(this.cardanoNetworkButtonLocator);
    await this.click(this.cardanoNetworkButtonLocator);
  }
  async selectTrezorHW() {
    this.logger.info(`AddNewWallet::selectTrezorHW is called`);
    await this.waitForElement(this.trezorHWButtonLocator);
    await this.click(this.trezorHWButtonLocator);
  }
  async confirmChecking() {
    this.logger.info(`AddNewWallet::confirmChecking is called`);
    await this.waitForElement(this.checkDialogLocator);
    await this.waitForElement(this.nextButtonLocator);
    await this.waitEnable(this.nextButtonLocator);
    await this.click(this.nextButtonLocator);
  }
  async connectTrezor() {
    this.logger.info(`AddNewWallet::connectTrezor is called`);
    await this.waitForElement(this.connectDialogLocator);
    await this.waitForElement(this.nextButtonLocator);
    await this.waitEnable(this.nextButtonLocator);
    await this.click(this.nextButtonLocator);
  }
  async enterHWWalletName(walletName) {
    await this.waitForElement(this.hwWalletNameInputLocator);
    // the label "Emulator" is used in TrezorEmulatorController.emulatorSetup()
    await this.clearInputUpdatingForm(this.hwWalletNameInputLocator, 'Emulator'.length);
    await this.input(this.hwWalletNameInputLocator, walletName);
  }
  async saveHWInfo() {
    await this.waitForElement(this.nextButtonLocator);
    await this.click(this.nextButtonLocator);
  }
  // ::end trezor connect section
}

export default AddNewWallet;
