import { fiveSeconds, quarterSecond } from '../helpers/timeConstants.js';
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
    const createBtnDisplayed = await this.customWaitIsPresented(
      this.createWalletButtonLocator,
      fiveSeconds,
      quarterSecond
    );
    const restoreBtnDisplayed = await this.customWaitIsPresented(
      this.restoreWalletButtonLocator,
      fiveSeconds,
      quarterSecond
    );
    const connectHWBtnDisplayed = await this.customWaitIsPresented(
      this.connectHwButtonLocator,
      fiveSeconds,
      quarterSecond
    );
    return createBtnDisplayed && restoreBtnDisplayed && connectHWBtnDisplayed;
  }
  async selectCreateNewWallet() {
    this.logger.info(`AddNewWallet::selectCreateNewWallet is called`);
    await this.waitPresentedAndAct(this.createWalletButtonLocator, async () => {
      await this.click(this.createWalletButtonLocator);
    });
  }
  async selectRestoreWallet() {
    this.logger.info(`AddNewWallet::selectRestoreWallet is called`);
    await this.waitPresentedAndAct(this.restoreWalletButtonLocator, async () => {
      await this.click(this.restoreWalletButtonLocator);
    });
  }
  async selectConnectHW() {
    this.logger.info(`AddNewWallet::selectConnectHW is called`);
    await this.waitPresentedAndAct(this.connectHwButtonLocator, async () => {
      await this.click(this.connectHwButtonLocator);
    });
  }
  // ::start trezor connect section
  async selectCardanoNetwork() {
    this.logger.info(`AddNewWallet::selectCardanoNetwork is called`);
    await this.waitPresentedAndAct(this.cardanoNetworkButtonLocator, async () => {
      await this.click(this.cardanoNetworkButtonLocator);
    });
  }
  async selectTrezorHW() {
    this.logger.info(`AddNewWallet::selectTrezorHW is called`);
    await this.waitPresentedAndAct(this.trezorHWButtonLocator, async () => {
      await this.click(this.trezorHWButtonLocator);
    });
  }
  async confirmChecking() {
    this.logger.info(`AddNewWallet::confirmChecking is called`);
    await this.customWaitIsPresented(this.checkDialogLocator, fiveSeconds, quarterSecond);
    await this.waitPresentedAndAct(this.nextButtonLocator, async () => {
      const btnEnabled = await this.buttonIsEnabled(this.nextButtonLocator);
      if (btnEnabled) {
        await this.click(this.nextButtonLocator);
      } else {
        throw new Error(`The button ${this.nextButtonLocator.locator} is disabled`);
      }
    });
  }
  async connectTrezor() {
    this.logger.info(`AddNewWallet::connectTrezor is called`);
    await this.customWaitIsPresented(this.connectDialogLocator, fiveSeconds, quarterSecond);
    await this.waitPresentedAndAct(this.nextButtonLocator, async () => {
      const btnEnabled = await this.buttonIsEnabled(this.nextButtonLocator);
      if (btnEnabled) {
        await this.click(this.nextButtonLocator);
      } else {
        throw new Error(`The button ${this.nextButtonLocator.locator} is disabled`);
      }
    });
  }
  async enterHWWalletName(walletName) {
    await this.customWaitIsPresented(this.hwWalletNameInputLocator, fiveSeconds, quarterSecond);
    // the label "Emulator" is used in TrezorEmulatorController.emulatorSetup()
    await this.clearInputUpdatingForm(this.hwWalletNameInputLocator, 'Emulator'.length);
    await this.input(this.hwWalletNameInputLocator, walletName);
  }
  async saveHWInfo() {
    await this.waitPresentedAndAct(this.nextButtonLocator, async () => {
      await this.click(this.nextButtonLocator);
    });
  }
  // ::end trezor connect section
}

export default AddNewWallet;
