import TxReviewCommon from './txReviewCommon.page';

class TxReviewOverviewTab extends TxReviewCommon {
  // locators
  //* wallet name and plate
  walletNameAndPlateLocator = {
    locator: 'txReview:overview-walletNameAndPlate-text',
    method: 'id',
  };
  //* wallet info button
  walletInfoBtnLocator = {
    locator: 'txReview:overview-walletInfo-button',
    method: 'id',
  };
  //* fee
  txFeeLocator = {
    locator: 'txReview:overview-infoFee-text',
    method: 'id',
  };
  //* your wallet stake address
  yourTrucatedStakeAddressLocator = {
    locator: 'txReview:overview:yourAddress-truncatedAddress-text',
    method: 'id',
  };
  //* operation name
  //* amount
  txSendAmountLocator = {
    locator: 'txReview:overview-txSendAmount-text',
    method: 'id',
  };
  //* to address|domain
  receiverLocator = {
    locator: 'txReview:overview:to-receiver-text',
    method: 'id',
  };
  //* associated address in case of domain
  associatedAddressLocator = {
    locator: 'txReview:overview:associatedAddress-truncatedAddress-text',
    method: 'id',
  };

  // methods
  async getWalletNameAndPlate() {
    this.logger.info(`TxReviewOverviewTab::getWalletNameAndPlate is called`);
    return await this.getText(this.walletNameAndPlateLocator);
  }
  async getTxFee() {
    this.logger.info(`TxReviewOverviewTab::getTxFee is called`);
    return await this.getText(this.txFeeLocator);
  }
  async getYourAddress() {
    this.logger.info(`TxReviewOverviewTab::getYourAddress is called`);
    return await this.getText(this.yourTrucatedStakeAddressLocator);
  }
  async getSendAmount() {
    this.logger.info(`TxReviewOverviewTab::getSendAmount is called`);
    return await this.getText(this.txSendAmountLocator);
  }
  async getReceiver() {
    this.logger.info(`TxReviewOverviewTab::getReceiver is called`);
    return await this.getText(this.receiverLocator);
  }
  async getAsocciatedAddress() {
    this.logger.info(`TxReviewOverviewTab::getAsocciatedAddress is called`);
    return await this.getText(this.associatedAddressLocator);
  }
}

export default TxReviewOverviewTab;
