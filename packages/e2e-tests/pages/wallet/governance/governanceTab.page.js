import WalletCommonBase from '../../walletCommonBase.page.js';
import { ElementLocator } from '../../locator.js';
import { defaultWaitTimeout, fiveSeconds, quarterSecond } from '../../../helpers/timeConstants.js';
import { pageTitle } from '../../../helpers/pageTitles.js';

export default class GovernanceTab extends WalletCommonBase {
  // locators
  /** @type {ElementLocator} */
  titleLocator = {
    locator: 'governance-title-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  pageDescriptionLocator = {
    locator: 'governance-status-text',
    method: 'id',
  };
  /** @type {ElementLocator} */
  delegateToYoroiBtnLocator = {
    locator: 'governance-delegateToYoroiDRep-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  delegateToYoroiSkeletonLocator = {
    locator: 'governance-delegateToYoroiDRepSkeleton-component',
    method: 'id',
  };
  /** @type {ElementLocator} */
  delegateToDrepBtnLocator = {
    locator: 'governance-delegateToADRep-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  delegateToDrepSkeletonLocator = {
    locator: 'governance-delegateToADRepSkeleton-component',
    method: 'id',
  };
  /** @type {ElementLocator} */
  abstainBtnLocator = {
    locator: 'governance-abstain-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  abstainSkeletonLocator = {
    locator: 'governance-abstainSkeleton-component',
    method: 'id',
  };
  /** @type {ElementLocator} */
  noConfidenceBtnLocator = {
    locator: 'governance-noConfidence-button',
    method: 'id',
  };
  /** @type {ElementLocator} */
  noConfidenceSkeletonLocator = {
    locator: 'governance-noConfidenceSkeleton-component',
    method: 'id',
  };
  /** @type {ElementLocator} */
  learnMoreLinkLocator = {
    locator: 'governance-learnMore-link',
    method: 'id',
  };

  // methods
  async isDisplayed() {
    const titleIsCorrect = await this.titleIsCorrect(pageTitle.governance);
    const discriptionDisplayedPromise = this.customWaitIsPresented(this.pageDescriptionLocator, fiveSeconds, quarterSecond);
    const linkDisplayedPromise = this.customWaitIsPresented(this.learnMoreLinkLocator, fiveSeconds, quarterSecond);
    const [discriptionDisplayed, linkDisplayed] = await Promise.all([discriptionDisplayedPromise, linkDisplayedPromise]);
    return titleIsCorrect && discriptionDisplayed && linkDisplayed;
  }

  async votingCardsAreDisplayed() {
    const yoroiCardPromise = this.customWaitIsPresented(this.delegateToYoroiBtnLocator, fiveSeconds, quarterSecond);
    const drepCardPromise = this.customWaitIsPresented(this.delegateToDrepBtnLocator, fiveSeconds, quarterSecond);
    const abstainCardPromise = this.customWaitIsPresented(this.abstainBtnLocator, fiveSeconds, quarterSecond);
    const noConfidenceCardPromise = this.customWaitIsPresented(this.noConfidenceBtnLocator, fiveSeconds, quarterSecond);

    const allDisplayed = await Promise.all([yoroiCardPromise, drepCardPromise, abstainCardPromise, noConfidenceCardPromise]);

    return allDisplayed.every(result => result === true);
  }

  async isLoaded() {
    const yoroiSkeletonDisplayedPromise = this.customWaitIsNotPresented(this.delegateToYoroiSkeletonLocator);
    const drepSkeletonDisplayedPromise = this.customWaitIsNotPresented(this.delegateToDrepSkeletonLocator);
    const abstainSkeletonDisplayedPromise = this.customWaitIsNotPresented(this.abstainSkeletonLocator);
    const noConfidenceSkeletonDisplayedPromise = this.customWaitIsNotPresented(this.noConfidenceSkeletonLocator);
    const allResults = await Promise.all([
      yoroiSkeletonDisplayedPromise,
      drepSkeletonDisplayedPromise,
      abstainSkeletonDisplayedPromise,
      noConfidenceSkeletonDisplayedPromise,
    ]);

    const allLoaded = allResults.every(result => result === true);

    if (allLoaded) {
      return await this.votingCardsAreDisplayed();
    } else {
      throw new Error(`The governance voting cards are still loading after ${defaultWaitTimeout / 1000} seconds`);
    }
  }
}
