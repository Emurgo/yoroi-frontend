import { expect } from 'chai';
import InitialStepsPage from '../pages/initialSteps.page.js';
import BasePage from '../pages/basepage.js';
import { getDriver } from '../utils/driverBootstrap.js';
import { customAfterEach } from '../utils/customHooks.js';
import { getTestLogger } from '../utils/utils.js';
import { oneMinute } from '../helpers/timeConstants.js';

describe('Changing language on the initial screen', function () {
  this.timeout(2 * oneMinute);
  let webdriver = null;
  let logger = null;

  before(function () {
    webdriver = getDriver();
    logger = getTestLogger(this.test.parent.title);
    const basePage = new BasePage(webdriver, logger);
    basePage.goToExtension();
  });

  const testData = [
    {
      lang: 'ja-JP',
      btnTransalation: '次へ',
    },
    {
      lang: 'ko-KR',
      btnTransalation: '계속'
    },
    {
      lang: 'zh-Hans',
      btnTransalation: '继续',
    },
    {
      lang: 'ru-RU',
      btnTransalation: 'Продолжить',
    },
    {
      lang: 'de-DE',
      btnTransalation: 'Weiter',
    },
    {
      lang: 'es-ES',
      btnTransalation: 'Continuar',
    },
    {
      lang: 'fr-FR',
      btnTransalation: 'Continuer'
    },
    {
      lang: 'pt-BR',
      btnTransalation: 'Continuar',
    },
    {
      lang: 'id-ID',
      btnTransalation: 'Lanjutkan',
    },
    {
      lang: 'vi-VN',
      btnTransalation: 'Tiếp tục',
    },
    {
      lang: 'en-US',
      btnTransalation: 'Continue',
    },
  ];

  for (const testDatum of testData) {
    describe(`Changing language to ${testDatum.lang}`, function () {
      it(`Selecting language ${testDatum.lang}`, async function () {
        const initialStepsPage = new InitialStepsPage(webdriver, logger);
        await initialStepsPage.selectLanguage(testDatum.lang);
      });

      it(`Checking translation on the button ${testDatum.lang}`, async function () {
        const initialStepsPage = new InitialStepsPage(webdriver, logger);
        const btnText = await initialStepsPage.getContinueButtonText();
        expect(btnText).to.equal(testDatum.btnTransalation.toLocaleUpperCase());
      });
    });
  }

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
