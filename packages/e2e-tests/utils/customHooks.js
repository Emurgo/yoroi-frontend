import BasePage from '../pages/basepage.js';
import { mockDAppName, popupConnectorName } from '../helpers/windowManager.js';

export const customAfterEach = async (mochaContext, webdriver, logger) => {
  if (mochaContext.currentTest.isFailed()) {
    const basepage = new BasePage(webdriver, logger);
    // preparing test name
    const curTestTitle = mochaContext.currentTest.title;
    const testsNameAndTestIndex = mochaContext.currentTest.parent.tests
      .map((testCase, testIndex) => [testCase.title, testIndex])
      .filter(testData => testData[0] === curTestTitle)[0];
    const testCaseNameWithNumberInTestSuite = `${testsNameAndTestIndex[1]}_${testsNameAndTestIndex[0]}`;
    // taking page screenshot
    basepage.takeScreenshot(mochaContext.test.parent.title, testCaseNameWithNumberInTestSuite);
    // taking page snapshot
    basepage.takeSnapshot(mochaContext.test.parent.title, testCaseNameWithNumberInTestSuite);
    // taking browser console logs
    basepage.getBrowserLogs(mochaContext.test.parent.title, testCaseNameWithNumberInTestSuite);
    basepage.getDriverLogs(mochaContext.test.parent.title, testCaseNameWithNumberInTestSuite);
  }
};

export const customBeforeNestedDAppTest = async (mochaContext, windowManager) => {
  const parentTitle = mochaContext.currentTest.parent.title;
  if (parentTitle.includes('nested-dapp')) {
    const popupIsClosed = await windowManager.isClosed(popupConnectorName);
    if (!popupIsClosed) {
      await windowManager.closeTabWindow(popupConnectorName, mockDAppName);
    }
  }
};
