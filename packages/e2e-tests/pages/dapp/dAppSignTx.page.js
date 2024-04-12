import { getByLocator } from '../../utils/utils.js';
import DAppSignBase from './dAppSignBase.page.js';

class DAppSignTx extends DAppSignBase {
  // locators
  //
  // details tab
  summaryBoxLocator = {
    locator: 'signTxMessagesSummaryBox',
    method: 'id',
  };
  transactionTotalAmountLabelLocator = {
    locator: 'signTxMessagesSummaryBox-total',
    method: 'id',
  };
  transactionFeeLabelLocator = {
    locator: 'signTxAdditionalInfoPanelBox-fee',
    method: 'id',
  };
  assetsAmountTextLocator = {
    locator: 'asseetValueDisplayBox',
    method: 'id',
  };
  // utxos tab
  fromAddressYourInputsLocator = {
    locator: 'fromAddressesBox-yourInputs',
    method: 'id',
  };
  fromAddressForeignInputsLocator = {
    locator: 'fromAddressesBox-foreignInputs',
    method: 'id',
  };
  toAddressYourInputsLocator = {
    locator: 'toAddressesBox-yourOutputs',
    method: 'id',
  };
  toAddressForeignInputsLocator = {
    locator: 'toAddressesBox-foreignOutputs',
    method: 'id',
  };
  addressRowLocator = {
    locator: 'addressRow',
    method: 'id',
  };
  addressRowAddressInfoLocator = rowIndex => {
    return {
      locator: `utxoDetails_${rowIndex}-address-text`,
      method: 'id',
    };
  };
  addressRowLinkLocator = {
    locator: '.ExplorableHash_url',
    method: 'css',
  };
  addressRowAmountLocator = {
    locator: 'addressRow-amount',
    method: 'id',
  };
  // error message
  errorMessageLocator = {
    locator: '.Layout_content',
    methos: 'css',
  };
  // functions
  async getFee() {
    this.logger.info(`DAppSignTx::getFee is called`);
    await this.waitForElement(this.transactionFeeLabelLocator);
    const rawText = await this.getText(this.transactionFeeLabelLocator);
    return rawText.split(' ')[0];
  }
  async getTotalAmount() {
    this.logger.info(`DAppSignTx::getTotalAmount is called`);
    await this.waitForElement(this.transactionTotalAmountLabelLocator);
    const rawText = await this.getText(this.transactionTotalAmountLabelLocator);
    return rawText.split(' ')[0];
  }
  // should be improved in case of several outputs
  async _getAssetsFromRow(addressRow) {
    const result = [];
    this.logger.info(`DAppSignTx::_getAmountFromRow is called`);
    const amountElements = await addressRow.findElements(
      getByLocator(this.addressRowAmountLocator)
    );
    for (const amountEl of amountElements) {
      const [amount, name] = (await amountEl.getText()).split(' ');
      result.push({ tokenName: name, tokenAmount: amount });
    }
    return result;
  }
  async _getAddressFromRow(addressRow, rowIndex) {
    this.logger.info(`DAppSignTx::_getAddressFromRow is called`);
    const addressElement = await addressRow.findElement(
      getByLocator(this.addressRowAddressInfoLocator(rowIndex))
    );
    const linkElement = await addressElement.findElement(getByLocator(this.addressRowLinkLocator));
    const linkText = await linkElement.getAttribute('href');
    const linkTextArr = linkText.split('/');
    return linkTextArr[linkTextArr.length - 1];
  }
  async _getAddressesRows(addressPart) {
    this.logger.info(`DAppSignTx::_getAddressesRows is called`);
    return await addressPart.findElements(getByLocator(this.addressRowLocator));
  }
  async _getAddresses(addressesPart) {
    this.logger.info(`DAppSignTx::_getAddresses is called`);
    const result = [];
    const addressesRows = await this._getAddressesRows(addressesPart);
    for (let rowIndex = 0; rowIndex < addressesRows.length; rowIndex++) {
      const addressesRow = addressesRows[rowIndex];
      const address = await this._getAddressFromRow(addressesRow, rowIndex);
      const addressAssets = await this._getAssetsFromRow(addressesRow);
      const mappedAddrAssets = addressAssets.map(addrAsset => {
        return {
          tokenName: addrAsset.tokenName,
          tokenAmount: parseFloat(addrAsset.tokenAmount),
        };
      });
      result.push({
        addr: address,
        assets: mappedAddrAssets,
      });
    }
    return result;
  }
  async _getSectionAddresses(yourAddrsSectionLocator, foreignAddrsSectionLocator) {
    this.logger.info(`DAppSignTx::_getSectionAddresses is called`);
    const result = {
      yourAddrs: [],
      foreignAddrs: [],
    };
    if (await this.checkIfExists(yourAddrsSectionLocator)) {
      const yourInputsBoxElem = await this.findElement(yourAddrsSectionLocator);
      const yourAddrsArr = await this._getAddresses(yourInputsBoxElem);
      result.yourAddrs.push(...yourAddrsArr);
    }
    if (await this.checkIfExists(foreignAddrsSectionLocator)) {
      const foreignInputsBoxElem = await this.findElement(foreignAddrsSectionLocator);
      const foreignAddrsArr = await this._getAddresses(foreignInputsBoxElem);
      result.foreignAddrs.push(...foreignAddrsArr);
    }

    return result;
  }
  async getInputsInfo() {
    this.logger.info(`DAppSignTx::getInputsInfo is called`);
    const result = await this._getSectionAddresses(
      this.fromAddressYourInputsLocator,
      this.fromAddressForeignInputsLocator
    );
    this.logger.info(`DAppSignTx::getInputsInfo Result: ${JSON.stringify(result, null, 2)}`);
    return result;
  }
  async getOutputsInfo() {
    this.logger.info(`DAppSignTx::getOutputsInfo is called`);
    const result = await this._getSectionAddresses(
      this.toAddressYourInputsLocator,
      this.toAddressForeignInputsLocator
    );
    this.logger.info(`DAppSignTx::getOutputsInfo Result: ${JSON.stringify(result, null, 2)}`);
    return result;
  }
  async getErrorMessage() {
    this.logger.info(`DAppSignTx::getErrorMessage is called`);
    const result = await this.getText(this.errorMessageLocator);
    this.logger.info(`DAppSignTx::getErrorMessage Result: ${result}`);
    return result;
  }
}

export default DAppSignTx;
