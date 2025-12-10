import WalletCommonBase from '../../walletCommonBase.page.js';
import { ElementLocator } from '../../locator.js';
import { defaultWaitTimeout, fiveSeconds, quarterSecond } from '../../../helpers/timeConstants.js';
import { pageTitle } from '../../../helpers/pageTitles.js';

export default class GovernanceTab extends WalletCommonBase {
  // locators
  /** @type {ElementLocator} */
  pageTitleLocator = {
    locator: 'governance-title-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  pageDescriptionLocator = {
    locator: 'governance-description-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  delegationStatusBtnLocator = {
    locator: 'governance-delegationStatus-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  otherOptionsBtnLocator = {
    locator: 'governance-otherOptions-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  delegationStatusCardSkeletonLocator = {
    locator: 'governance-delegationStatusSkeleton-component',
    method: 'id',
  };
  /** @type {ElementLocator} */
  otherOptionsCardSkeletonLocator = {
    locator: 'governance-otherOptionsSkeleton-component',
    method: 'id',
  };
  /** @type {ElementLocator} */
  learnMoreLinkLocator = {
    locator: 'governance-learnMore-link',
    method: 'id',
  };

  // methods
  async isDisplayed() {
    const pageTitleIsCorrect = await this.titleIsCorrect(pageTitle.governance);
    const titleDisplayedPromise = this.customWaitIsPresented(this.pageTitleLocator, fiveSeconds, quarterSecond);
    const discriptionDisplayedPromise = this.customWaitIsPresented(this.pageDescriptionLocator, fiveSeconds, quarterSecond);
    const linkDisplayedPromise = this.customWaitIsPresented(this.learnMoreLinkLocator, fiveSeconds, quarterSecond);
    const [titleDisplayed, discriptionDisplayed, linkDisplayed] = await Promise.all([
      titleDisplayedPromise,
      discriptionDisplayedPromise,
      linkDisplayedPromise,
    ]);
    return pageTitleIsCorrect && titleDisplayed && discriptionDisplayed && linkDisplayed;
  }

  async votingCardsAreDisplayed() {
    const yoroiCardPromise = this.customWaitIsPresented(this.delegationStatusBtnLocator, fiveSeconds, quarterSecond);
    const otherOptionsCardPromise = this.customWaitIsPresented(this.otherOptionsBtnLocator, fiveSeconds, quarterSecond);

    const allDisplayed = await Promise.all([yoroiCardPromise, otherOptionsCardPromise]);

    return allDisplayed.every(result => result === true);
  }

  async isLoaded() {
    const yoroiSkeletonDisplayedPromise = this.customWaitIsNotPresented(
      this.delegationStatusCardSkeletonLocator,
      defaultWaitTimeout,
      quarterSecond
    );
    const drepSkeletonDisplayedPromise = this.customWaitIsNotPresented(
      this.otherOptionsCardSkeletonLocator,
      defaultWaitTimeout,
      quarterSecond
    );
    const allResults = await Promise.all([yoroiSkeletonDisplayedPromise, drepSkeletonDisplayedPromise]);

    const allLoaded = allResults.every(result => result === true);

    if (allLoaded) {
      return await this.votingCardsAreDisplayed();
    } else {
      throw new Error(`The governance voting cards are still loading after ${defaultWaitTimeout / 1000} seconds`);
    }
  }
}
