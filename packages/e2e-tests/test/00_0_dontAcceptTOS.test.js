import { expect } from 'chai';
import InitialStepsPage from '../pages/initialSteps.page.js';
import BasePage from '../pages/basepage.js';
import { getDriver } from '../utils/driverBootstrap.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';

describe("Can't proceed without accepting the ToS", function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function (done) {
    webdriver = getDriver();
    logger = getTestLogger(this.test.parent.title);
    const basePage = new BasePage(webdriver, logger);
    basePage.goToExtension();
    done();
  });

  it('Checking the continue button', async function () {
    const initialStepsPage = new InitialStepsPage(webdriver, logger);
    const result = await initialStepsPage.cantProceedWithoutToS();
    expect(result, 'The continue button is enabled').to.be.true;
  });

  afterEach(function (done) {
    customAfterEach(this, webdriver, logger);
    done();
  });

  after(function (done) {
    const basePage = new BasePage(webdriver, logger);
    basePage.closeBrowser();
    done();
  });
});
