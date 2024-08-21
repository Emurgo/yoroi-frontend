import WalletTab from './walletTab.page.js';
import { quarterSecond, fiveSeconds } from '../../../helpers/timeConstants.js';

class SendSubTab extends WalletTab {
  // locators
  // ------
  // step 1
  // ------
  receiverAddressInputLocator = {
    locator: '//input[starts-with(@id, "receiver--")]',
    method: 'xpath',
  };
  receiverHelperTextLocator = {
    locator: '//p[starts-with(@id, "receiver--") and contains(@id, "-helper-text")]',
    method: 'xpath',
  };
  receiverDoneIcon = {
    locator: 'input-done-icon',
    method: 'id',
  };
  receiverErrorIcon = {
    locator: 'input-error-icon',
    method: 'id',
  };
  domainResolverAddressTextLocator = {
    locator: 'wallet:send:enterAddressStep-domainResolverAddress-text',
    method: 'id',
  };
  memoInputLocator = {
    locator: 'wallet:send:enterAddressStep-enterMemo-input',
    method: 'id',
  };
  nextToStep2ButtonLocator = {
    locator: 'wallet:send:enterAddressStep-nextToAddAssets-button',
    method: 'id',
  };
  // ------
  // step 2
  // ------
  amountToSendInputLocator = {
    locator: '//input[starts-with(@id, "amount--")]', // unfortunately, I didn't find a way to make a proper ID
    method: 'xpath',
  };
  addTokenButtonLocator = {
    locator: 'wallet:send:addAssetsStep-addTokens-button',
    method: 'id',
  };
  addNFTButtonLocator = {
    locator: 'wallet:send:addAssetsStep-addNFTs-button',
    method: 'id',
  };
  nextToStep3ButtonLocator = {
    locator: 'wallet:send:addAssetsStep-nextToConfirmTransaction-button',
    method: 'id',
  };
  backToStep1ButtonLocator = {
    locator: 'wallet:send:addAssetsStep-backToEnterAddress-button',
    method: 'id',
  };
  // Tokens dialog
  // NFTs dialog
  // ------
  // step 3
  // ------
  receiverHandleBoxLocator = {
    locator: 'wallet:send:confrimTransactionStep-receiverHandle-box',
    method: 'id',
  };
  receiverHandleInfoTextLocator = {
    locator: 'wallet:send:confrimTransactionStep-receiverHandleInfo-text',
    method: 'id',
  }
  receiverAddressTextLocator = {
    locator: 'wallet:send:confrimTransactionStep-receiverAddress-text',
    method: 'id',
  };
  totalAmountToSendTextLocator = {
    locator: 'wallet:send:confrimTransactionStep-totalAmount-text',
    method: 'id',
  };
  transactionFeeTextLocator = {
    locator: 'wallet:send:confrimTransactionStep-feeAmount-text',
    method: 'id',
  };
  transactionAmountTextLocator = {
    locator: 'wallet:send:confrimTransactionStep-amountToSend-text',
    method: 'id',
  };
  passwordInputLocator = {
    locator: '//input[starts-with(@id, "walletPassword--")]',
    method: 'xpath',
  };
  passwordHelpMessageTextLocator = {
    locator: '//p[starts-with(@id, "walletPassword--") and contains(@id, "-helper-text")]',
    method: 'xpath',
  };
  backToStep2ButtonLocator = {
    locator: 'wallet:send:confrimTransactionStep-backToAddAssetsStep-button',
    method: 'id',
  };
  confirmTxButtonLocator = {
    locator: 'wallet:send:confrimTransactionStep-confirmTransaction-button',
    method: 'id',
  };
  // functions
  async stepOneIsDisplayed() {
    this.logger.info(`SendSubTab::stepOneIsDisplayed is called.`);
    const receiverState = await this.customWaitIsPresented(
      this.receiverAddressInputLocator,
      fiveSeconds,
      quarterSecond
    );
    const memoState = await this.customWaitIsPresented(
      this.memoInputLocator,
      fiveSeconds,
      quarterSecond
    );
    return receiverState && memoState;
  }
  async buttonIsEnabled(locator) {
    const buttonIsEnabled = await this.customWaiter(
      async () => {
        const buttonlIsEnabled = await this.getAttribute(locator, 'disabled');
        return buttonlIsEnabled === null;
      },
      fiveSeconds,
      quarterSecond
    );

    return buttonIsEnabled;
  }
  async enterReceiver(receiver) {
    this.logger.info(`SendSubTab::enterReceiver is called. Receiver: ${receiver}`);
    await this.click(this.receiverAddressInputLocator);
    await this.clearInputAll(this.receiverAddressInputLocator);
    await this.input(this.receiverAddressInputLocator, receiver);
  }
  async receiverIsGood() {
    this.logger.info(`SendSubTab::receiverIsGood is called.`);
    return await this.customWaitIsPresented(this.receiverDoneIcon, fiveSeconds, quarterSecond);
  }
  async receiverIsIncorrect() {
    this.logger.info(`SendSubTab::receiverIsIncorrect is called.`);
    return await this.customWaitIsPresented(this.receiverErrorIcon, fiveSeconds, quarterSecond);
  }
  async getReceiverHelperText() {
    this.logger.info(`SendSubTab::getReceiverHelperText is called.`);
    return await this.getText(this.receiverHelperTextLocator);
  }
  async getReceiverHandlerAddress() {
    this.logger.info(`SendSubTab::getReceiverHandlerAddress is called.`);
    return await this.getText(this.domainResolverAddressTextLocator)
  }
  async enterMemo(memo) {
    this.logger.info(`SendSubTab::enterMemo is called. Memo: ${memo}`);
    await this.click(this.memoInputLocator);
    await this.clearInputAll(this.memoInputLocator);
    await this.input(this.memoInputLocator, memo);
  }
  async clickNextToStep2() {
    this.logger.info(`SendSubTab::clickNextToStep2 is called.`);
    const nextButtonIsEnabled = await this.buttonIsEnabled(this.nextToStep2ButtonLocator);
    if (nextButtonIsEnabled) {
      await this.click(this.nextToStep2ButtonLocator);
    } else {
      throw new Error('The Next button is disabled');
    }
  }
  async enterReceiverAndMemo(receiver, memo = '', confirm = true) {
    this.logger.info(
      `SendSubTab::enterReceiverAndMemo is called. ` + `Receiver: ${receiver}, memo: ${memo}`
    );
    await this.enterReceiver(receiver);
    if (memo) {
      await this.enterMemo(memo);
    }
    if (confirm) {
      await this.clickNextToStep2();
    }
  }
  // It will require passing an object { <asset1Name>: <asset1Amount>, <asset2Name>: <asset2Amount> }
  // TODO: Add posibility to add tokens and NFTs.
  async addAssets(adaAmount, confirm = true) {
    this.logger.info(`SendSubTab::addAssets is called. ` + `Ada amount: ${adaAmount}`);
    if (adaAmount > 0) {
      await this.click(this.amountToSendInputLocator);
      await this.input(this.amountToSendInputLocator, adaAmount);
    }
    if (confirm) {
      const nextButtonIsEnabled = await this.buttonIsEnabled(this.nextToStep3ButtonLocator);
      if (nextButtonIsEnabled) {
        await this.click(this.nextToStep3ButtonLocator);
      } else {
        throw new Error('The Next button is disabled');
      }
    }
  }
  async getInfoFromConfirmTxPage() {
    this.logger.info(`SendSubTab::getInfoFromConfirmTxPage is called.`);
    throw new Error('The function is in development');
  }
  async getHandlerInfoConfirmTxPage() {
    this.logger.info(`SendSubTab::getHandlerInfoConfirmTxPage is called.`);
    return await this.getText(this.receiverHandleInfoTextLocator);
  }
  async confirmTransaction(password, isHW = false) {
    this.logger.info(`SendSubTab::confirmTransaction is called. ` + `Password: ${password}`);
    if (!isHW) {
      await this.click(this.passwordInputLocator);
      await this.input(this.passwordInputLocator, password);
    }
    const nextButtonIsEnabled = await this.buttonIsEnabled(this.confirmTxButtonLocator);
    if (nextButtonIsEnabled) {
      await this.click(this.confirmTxButtonLocator);
    } else {
      throw new Error('The Confirm button is disabled');
    }
  }
  async getPasswordErrorMsg() {
    this.logger.info(`SendSubTab::getPasswordErrorMsg is called.`);
    await this.waitElementTextMatches(this.passwordHelpMessageTextLocator, /\w+/g);
    return await this.getText(this.passwordHelpMessageTextLocator);
  }
}

export default SendSubTab;
