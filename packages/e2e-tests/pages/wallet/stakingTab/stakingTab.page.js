import { fiveSeconds, quarterSecond } from '../../../helpers/timeConstants.js';
import WalletCommonBase from '../../walletCommonBase.page.js';

class StakingTab extends WalletCommonBase {
  // locators
  // empty wallet banner
  walletEmptyBannerLocator = {
    locator: 'wallet|staking-emptyWalletBanner-box',
    method: 'id',
  };
  // wallet not delegated banner
  walletIsNotDelegatedBannerLocator = {
    locator: 'staking-delegationBanner-box',
    method: 'id',
  };
  // stake pools list
  // methods
  // walletIsEmpty
  async walletIsEmpty() {
    this.logger.info(`StakingTab::walletIsEmpty is called`);
    const emptyBannerIsDisplayed = await (
      await this.findElement(this.walletEmptyBannerLocator)
    ).isDisplayed();
    return emptyBannerIsDisplayed;
  }
  // walletIsNotDelegated
  async walletIsNotDelegated() {
    this.logger.info(`StakingTab::walletIsNotDelegated is called`);
    const bannerState = await this.customWaitIsPresented(
      this.walletIsNotDelegatedBannerLocator,
      fiveSeconds,
      quarterSecond
    );
    return bannerState;
  }
}

export default StakingTab;
