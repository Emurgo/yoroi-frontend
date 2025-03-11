import { halfMinute, fiveSeconds, quarterSecond } from '../helpers/timeConstants.js';
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
  ledgerHWButtonLocator = {
    locator: '.WalletConnectHWOptionDialog_connectLedger',
    method: 'css',
  };
  checkDialogLocator = {
    locator: '.CheckDialog',
    method: 'css',
  };
  nextButtonLocator = {
    locator: 'dialog-next-button',
    method: 'id',
  };
  connectButtonLocator = {
    locator: 'dialog-connect-button',
    method: 'id',
  };
  saveButtonLocator = {
    locator: 'dialog-save-button',
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
    const createBtnDisplayed = this.customWaitIsPresented(
      this.createWalletButtonLocator,
      halfMinute,
      quarterSecond
    );
    const restoreBtnDisplayed = this.customWaitIsPresented(
      this.restoreWalletButtonLocator,
      halfMinute,
      quarterSecond
    );
    const connectHWBtnDisplayed = this.customWaitIsPresented(
      this.connectHwButtonLocator,
      halfMinute,
      quarterSecond
    );
    return (
      (await createBtnDisplayed) && (await restoreBtnDisplayed) && (await connectHWBtnDisplayed)
    );
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
  async selectLedgerHW() {
    this.logger.info(`AddNewWallet::selectLedgerHW is called`);
    await this.waitPresentedAndAct(this.ledgerHWButtonLocator, async () => {
      await this.click(this.ledgerHWButtonLocator);
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
  async connectHardwareWallet() {
    this.logger.info(`AddNewWallet::connectHardwareWallet is called`);
    await this.customWaitIsPresented(this.connectDialogLocator, fiveSeconds, quarterSecond);
    await this.waitPresentedAndAct(this.connectButtonLocator, async () => {
      const btnEnabled = await this.buttonIsEnabled(this.connectButtonLocator);
      if (btnEnabled) {
        await this.click(this.connectButtonLocator);
      } else {
        throw new Error(`The button ${this.nextButtonLocator.locator} is disabled`);
      }
    });
  }
  async enterHWWalletName(walletName) {
    await this.customWaitIsPresented(this.hwWalletNameInputLocator, fiveSeconds, quarterSecond);
    await this.clearInputAll(this.hwWalletNameInputLocator);
    await this.input(this.hwWalletNameInputLocator, walletName);
  }
  async saveHWInfo() {
    await this.waitPresentedAndAct(this.saveButtonLocator, async () => {
      await this.click(this.saveButtonLocator);
    });
  }
  // ::end trezor connect section
}

export default AddNewWallet;
