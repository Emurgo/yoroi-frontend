import { halfMinute, fiveSeconds, quarterSecond } from '../helpers/timeConstants.js';
import WalletCommonBase from './walletCommonBase.page.js';
import { CardanoNetworks } from '../helpers/constants.js';

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
  mainnetNetworkButtonLocator = {
    locator: 'connectHWWallet-selectMainnetNetwork-button',
    method: 'id',
  };
  preprodNetworkButtonLocator = {
    locator: 'connectHWWallet-selectPreprodNetwork-button',
    method: 'id',
  };
  previewNetworkButtonLocator = {
    locator: 'connectHWWallet-selectPreviewNetwork-button',
    method: 'id',
  };
  // ::start HW connect section
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
  // ::end HW connect section

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
  async selectCardanoNetwork(network = CardanoNetworks.MN) {
    this.logger.info(`AddNewWallet::selectCardanoNetwork is called. Network to select: ${network}`);
    let networkButtonLocator;
    switch (network) {
      case CardanoNetworks.PP:
        networkButtonLocator = this.preprodNetworkButtonLocator;
        break;
      case CardanoNetworks.PV:
        networkButtonLocator = this.previewNetworkButtonLocator;
        break;
      default:
        networkButtonLocator = this.mainnetNetworkButtonLocator;
        break;
    }
    await this.waitPresentedAndAct(networkButtonLocator, async () => {
      await this.click(networkButtonLocator);
    });
  }
  // ::start HW connect section
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
