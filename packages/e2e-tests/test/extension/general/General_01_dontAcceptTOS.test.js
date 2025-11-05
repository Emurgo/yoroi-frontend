import { expect } from 'chai';
import InitialStepsPage from '../../../pages/initialSteps.page.js';
import BasePage from '../../../pages/basepage.js';
import { getDriver } from '../../../utils/driverBootstrap.js';
import { customAfterEach } from '../../../utils/customHooks.js';
import { getTestLogger } from '../../../utils/utils.js';
import { oneMinute } from '../../../helpers/timeConstants.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

describe("Can't proceed without accepting the ToS", function () {
  this.timeout(2 * oneMinute);
  /** @type {WebDriver} */
  let webdriver = null;
  /** @type {Logger} */
  let logger = null;
  /** @type {BasePage} */
  let basePage = null;
  /** @type {InitialStepsPage} */
  let initialStepsPage = null;

  before(async function () {
    webdriver = getDriver();
    logger = getTestLogger(this.test.parent.title);
    basePage = new BasePage(webdriver, logger);
    initialStepsPage = new InitialStepsPage(webdriver, logger);
    await basePage.goToExtension();
  });

  it('Checking the continue button', async function () {
    const result = await initialStepsPage.cantProceedWithoutToS();
    expect(result, 'The continue button is enabled').to.be.true;
  });

  afterEach(async function () {
    await customAfterEach(this, webdriver, logger);
  });

  after(async function () {
    await basePage.closeBrowser();
  });
});
