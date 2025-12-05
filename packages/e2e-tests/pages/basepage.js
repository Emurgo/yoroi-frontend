import { until, Key, logging, WebElement, WebDriver } from 'selenium-webdriver';
import path from 'path';
import * as fs from 'node:fs';
import { promisify } from 'util';
import { createTestRunDataDir, getByLocator, getSnapshotObjectFromJSON, isMacOS } from '../utils/utils.js';
import { getExtensionUrl, getTransactionsURL } from '../utils/driverBootstrap.js';
import {
  defaultRepeatPeriod,
  defaultWaitTimeout,
  fiveSeconds,
  halfSecond,
  oneSecond,
  quarterSecond,
} from '../helpers/timeConstants.js';
import { dbSnapshotsDir } from '../helpers/constants.js';
import { ElementLocator } from './locator.js';
import { Logger } from 'simple-node-logger';

const writeFile = promisify(fs.writeFile);

class BasePage {
  /**
   *
   * @param {WebDriver} webDriver
   * @param {Logger} logger
   */
  constructor(webDriver, logger) {
    /**@type {WebDriver} */
    this.driver = webDriver;
    /**@type {Logger} */
    this.logger = logger;
  }

  rootLocator = {
    locator: 'root',
    method: 'id',
  };

  linkLocator = {
    locator: './a',
    method: 'xpath',
  };

  /**
   * Navigates the browser to the given URL.
   * @param {string} theURL - URL to go to
   */
  async goToUrl(theURL) {
    this.logger.info(`BasePage::goToUrl is called. "${theURL}"`);
    await this.driver.get(theURL);
  }
  /**
   * Refreshes the current page.
   */
  async refreshPage() {
    this.logger.info('BasePage::refreshPage is called');
    await this.driver.navigate().refresh();
  }
  /**
   * Closes the browser.
   */
  async closeBrowser() {
    this.logger.info('BasePage::closeBrowser is called');
    await this.driver.quit();
  }
  /**
   * Navigates to the browser extension's root URL and waits for root element.
   */
  async goToExtension() {
    this.logger.info('BasePage::goToExtension is called');
    await this.setImplicitTimeout(halfSecond, this.goToExtension.name);

    const extURL = getExtensionUrl();
    await this.driver.get(extURL);
    await this.waitForElementLocated(this.rootLocator);

    await this.setImplicitTimeout(defaultWaitTimeout, this.goToExtension.name);
  }
  /**
   * Navigates to the Transactions URL of the extension and waits for root element.
   */
  async goToExtensionTransactions() {
    this.logger.info('BasePage::goToExtensionTransactions is called');
    await this.setImplicitTimeout(halfSecond, this.goToExtensionTransactions.name);
    await this.driver.get(getTransactionsURL());
    await this.waitForElementLocated(this.rootLocator);

    await this.setImplicitTimeout(defaultWaitTimeout, this.goToExtensionTransactions.name);
  }
  /**
   * Clicks an element found by the given locator, with retries on stale element error.
   * @param {ElementLocator} locator
   */
  async click(locator) {
    this.logger.info(`BasePage::click is called. Locator: ${JSON.stringify(locator)}`);
    let success = false;
    for (let clickAttempt = 0; clickAttempt < 5; clickAttempt++) {
      const element = await this.driver.findElement(getByLocator(locator));
      this.logger.info(`BasePage::click Attemp ${clickAttempt} to click`);
      try {
        await element.click();
        success = true;
        break;
      } catch (error) {
        if (error.name === 'StaleElementReferenceError') {
          await this.sleep(150);
          continue;
        } else {
          throw error;
        }
      }
    }
    if (!success) {
      throw new Error(`StaleElementReferenceError on the element ${JSON.stringify(locator)}`);
    }
  }
  /**
   * Clicks the element specified by locator using JavaScript.
   * @param {ElementLocator} locator
   */
  async clickByScript(locator) {
    this.logger.info(`BasePage::clickByScript is called. Locator: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    await this.driver.executeScript(`arguments[0].click()`, element);
  }
  /**
   * Clicks the given WebElement using JavaScript.
   * @param {WebElement} webElement
   */
  async clickElementByScript(webElement) {
    this.logger.info(`BasePage::clickElementByScript is called.`);
    await this.driver.executeScript(`arguments[0].click()`, webElement);
  }
  /**
   * Focuses on the element by locator.
   * @param {ElementLocator} locator
   */
  async focus(locator) {
    this.logger.info(`BasePage::focus is called. Locator: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    await this.driver.executeScript('arguments[0].focus();', element);
  }
  /**
   * Dispatches a mouse down event on the given locator.
   * @param {ElementLocator} locator
   */
  async dispatchMouseDownEvent(locator) {
    this.logger.info(`BasePage::dispatchMouseDownEvent is called. Locator: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    await this.driver.executeScript(
      `arguments[0].dispatchEvent(new MouseEvent('mousedown', {view: window, bubbles : true, cancelable: true}))`,
      element
    );
  }
  /**
   * Hovers over the element specified by locator.
   * @param {ElementLocator} locator
   */
  async hover(locator) {
    this.logger.info(`BasePage::hoverOnElement is called. Locator: ${JSON.stringify(locator)}`);
    const webElement = await this.findElement(locator);
    await this.hoverOnElement(webElement);
  }
  /**
   * Hovers over the provided web element.
   * @param {WebElement} webElement
   */
  async hoverOnElement(webElement) {
    this.logger.info(`BasePage::hoverOnElement is called.`);
    const actions = this.driver.actions();
    await actions.move({ origin: webElement }).perform();
  }
  /**
   * Scrolls the element found by locator into view.
   * @param {ElementLocator} locator
   */
  async scrollIntoView(locator) {
    this.logger.info(`BasePage::scrollIntoView is called. Values: ${JSON.stringify(locator)}`);
    await this.waitForElement(locator);
    const clickable = await this.findElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView()', clickable);
  }
  /**
   * Scrolls the provided web element into view.
   * @param {WebElement} webElement
   */
  async scrollIntoViewElement(webElement) {
    this.logger.info(`BasePage::scrollIntoViewElement is called.`);
    await this.driver.executeScript('arguments[0].scrollIntoView()', webElement);
  }
  /**
   * Finds an element using the locator.
   * @param {ElementLocator} locator
   * @returns {Promise<WebElement>}
   */
  async findElement(locator) {
    this.logger.info(`BasePage::findElement is called. Locator: ${JSON.stringify(locator)}`);
    return await this.driver.findElement(getByLocator(locator));
  }
  /**
   * Finding all suitable WebElements by the locator
   * @param {ElementLocator} locator
   * @returns {Promise<WebElement[]>}
   */
  async findElements(locator) {
    this.logger.info(`BasePage::findElements is called. Locator: ${JSON.stringify(locator)}`);
    return await this.driver.findElements(getByLocator(locator));
  }
  /**
   * Getting a text by element locator
   * @param {ElementLocator} locator
   * @returns {Promise<string>}
   */
  async getText(locator) {
    this.logger.info(`BasePage::getText is called. Locator: ${JSON.stringify(locator)}`);
    return await this.waitPresentedAndAct(locator, async () => {
      let element = await this.findElement(locator);
      try {
        const result = await element.getText();
        this.logger.info(`BasePage::getText. Result: ${result}`);
        return result;
      } catch (error) {
        if (error.name === 'StaleElementReferenceError') {
          this.logger.info(`BasePage::getText Re-try because of StaleElementReferenceError`);
          element = await this.findElement(locator);
          const result = await element.getText();
          this.logger.info(`BasePage::getText. Result: ${result}`);
          return result;
        } else {
          throw error;
        }
      }
    });
  }
  /**
   * Gets the CSS value for a specific style property of an element by locator.
   * @param {ElementLocator} locator
   * @param {string} cssStyleProperty
   * @returns {Promise<*>}
   */
  async getCssValue(locator, cssStyleProperty) {
    this.logger.info(`BasePage::getCssValue is called. Locator: ${JSON.stringify(locator)}, property: ${cssStyleProperty}`);
    const element = await this.driver.findElement(getByLocator(locator));
    const result = element.getCssValue(cssStyleProperty);
    this.logger.info(`BasePage::getCssValue Result: ${result}`);
    return result;
  }
  /**
   * Gets the CSS value for a specific style property of a WebElement.
   * @param {WebElement} webElement
   * @param {string} cssStyleProperty
   * @returns {Promise<*>}
   */
  async getCssValueElement(webElement, cssStyleProperty) {
    this.logger.info(`BasePage::getCssValueElement is called. Property: ${cssStyleProperty}`);
    const result = await webElement.getCssValue(cssStyleProperty);
    this.logger.info(`BasePage::getCssValueElement Result: ${result}`);
    return result;
  }

  /**
   * Utility method for logging and error handling.
   */
  async withLogging(action, fn) {
    this.logger.info(`${this.constructor.name}::${action} called`);
    try {
      const result = await fn();
      this.logger.info(`${this.constructor.name}::${action} succeeded`);
      return result;
    } catch (error) {
      this.logger.error(`${this.constructor.name}::${action} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets the value of an attribute for an element by locator.
   * @param {ElementLocator} locator
   * @param {string} property
   * @returns {Promise<*>}
   */
  async getAttribute(locator, property) {
    this.logger.info(`BasePage::getAttribute is called. Locator: ${JSON.stringify(locator)}, property: ${property}`);
    return await this.driver.findElement(getByLocator(locator)).getAttribute(property);
  }
  /**
   * Gets the value of an attribute for a WebElement.
   * @param {WebElement} webElement
   * @param {string} property
   * @returns {Promise<*>}
   */
  async getAttributeElement(webElement, property) {
    this.logger.info(`BasePage::getAttributeElement is called. Property: ${property}`);
    return await webElement.getAttribute(property);
  }
  /**
   * Gets a link URL from a component using a locator.
   * @param {ElementLocator} locator
   * @returns {Promise<string>}
   */
  async getLinkFromComponent(locator) {
    this.logger.info(`BasePage::getLinkFromComponent is called. Locator: ${JSON.stringify(locator)}`);
    const webElem = await this.driver.findElement(getByLocator(locator));
    const linkElem = await webElem.findElement(getByLocator(this.linkLocator));
    const linkText = await this.getAttributeElement(linkElem, 'href');
    return linkText;
  }
  /**
   * Gets the parent web element above the given element by a certain level.
   * @param {ElementLocator} locator
   * @param {number} numberAbove
   * @returns {Promise<WebElement>}
   */
  async getWebElementAbove(locator, numberAbove) {
    this.logger.info(
      `BasePage::getWebElementAbove is called. Locator: ${JSON.stringify(locator)}, NumberAbove: ${JSON.stringify(numberAbove)}`
    );
    const webElement = await this.findElement(locator);
    return await this.getWebElementAboveElement(webElement, numberAbove);
  }
  /**
   * Gets the parent web element above the given WebElement by a certain level.
   * @param {WebElement} webElement
   * @param {number} numberAbove
   * @returns {Promise<WebElement>}
   */
  async getWebElementAboveElement(webElement, numberAbove) {
    this.logger.info(`BasePage::getWebElementAboveElement is called. NumberAbove: ${JSON.stringify(numberAbove)}`);
    const parentLocator = '.' + '/..'.repeat(numberAbove);
    const elLocator = {
      locator: parentLocator,
      method: 'xpath',
    };
    const parentElement = await webElement.findElement(getByLocator(elLocator));

    return parentElement;
  }
  /**
   * Executes a given script on local storage.
   * @param {string} script
   * @returns {Promise<*>}
   */
  async executeLocalStorageScript(script) {
    this.logger.info(`BasePage::executeLocalStorageScript is called. Script: ${JSON.stringify(script)}`);
    return await this.driver.executeScript(`return localStorage.${script}`);
  }
  /**
   * Types a value into an input found by locator.
   * @param {ElementLocator} locator
   * @param {string} value
   * @param {boolean} [hideInLog=false]
   * @returns {Promise<void>}
   */
  async input(locator, value, hideInLog = false) {
    this.logger.info(`BasePage::input is called. Locator: ${JSON.stringify(locator)}, Value: ${hideInLog ? '******' : value}`);
    const input = await this.findElement(locator);
    for (let index = 0; index < value.length; index++) {
      await input.sendKeys(value[index]);
      await this.sleep(5, false);
    }
  }
  /**
   * Types a value into a WebElement input.
   * @param {WebElement} webElement
   * @param {string} value
   * @param {boolean} [hideInLog=false]
   * @returns {Promise<void>}
   */
  async inputElem(webElement, value, hideInLog = false, delayBetweenChars = 5) {
    this.logger.info(`BasePage::inputElem is called. Value: ${hideInLog ? '******' : value}`);
    await webElement.click();
    await this.sleep(50, false);
    for (let index = 0; index < value.length; index++) {
      await webElement.sendKeys(value[index]);
      await this.sleep(delayBetweenChars, false);
    }
  }
  /**
   * Clears the value in an input field found by locator.
   * @param {ElementLocator} locator
   * @returns {Promise<void>}
   */
  async clearInput(locator) {
    this.logger.info(`BasePage::clearInput is called. Locator: ${JSON.stringify(locator)}`);
    const input = await this.findElement(locator);
    await input.clear();
  }
  /**
   * Clears the value in an input WebElement.
   * @param {WebElement} inputWebElement
   * @returns {Promise<void>}
   */
  async clearInputElem(inputWebElement) {
    this.logger.info(`BasePage::clearInput is clearInputElem.`);
    await inputWebElement.clear();
  }
  /**
   * Clears the input and updates the underlying form by simulating backspaces.
   * @param {ElementLocator} locator
   * @param {number} textLength
   * @returns {Promise<void>}
   */
  async clearInputUpdatingForm(locator, textLength) {
    this.logger.info(
      `BasePage::clearInputUpdatingForm is called. Locator: ${JSON.stringify(locator)}, Text lenght: ${textLength}`
    );
    const input = await this.findElement(locator);
    for (let i = 0; i < textLength; i++) {
      await input.sendKeys(Key.BACK_SPACE);
    }
  }
  /**
   * Selects all text in the input and deletes it.
   * @param {ElementLocator} locator
   * @returns {Promise<void>}
   */
  async clearInputAll(locator) {
    this.logger.info(`BasePage::clearInputAll is called. Locator: ${JSON.stringify(locator)}`);
    const input = await this.findElement(locator);
    await this.click(locator);
    await this.sleep(250);
    await input.sendKeys(Key.chord(isMacOS() ? Key.COMMAND : Key.CONTROL, 'a'));
    await this.sleep(500);
    await input.sendKeys(Key.NULL);
    await input.sendKeys(Key.BACK_SPACE);
  }
  /**
   * Clears the value in an input WebElement.
   * @param {WebElement} inputWebElement
   * @returns {Promise<void>}
   */
  async clearInputAllElem(inputWebElement) {
    this.logger.info(`BasePage::clearInputAllElem is called.`);
    await inputWebElement.click();
    await this.sleep(250);
    await inputWebElement.sendKeys(Key.chord(isMacOS() ? Key.COMMAND : Key.CONTROL, 'a'));
    await this.sleep(500);
    await inputWebElement.sendKeys(Key.NULL);
    await inputWebElement.sendKeys(Key.BACK_SPACE);
  }
  /**
   * Sets the implicit wait timeout for driver commands.
   * @param {number} timeoutMs
   * @param {string} functionName
   * @returns {Promise<void>}
   */
  async setImplicitTimeout(timeoutMs, functionName) {
    this.logger.info(`BasePage::setImplicitTimeout is called. Function: ${functionName}. Timeout: ${timeoutMs}`);
    await this.driver.manage().setTimeouts({ implicit: timeoutMs });
  }
  /**
   * Gets a JSON value from local storage by key.
   * @param {string} key
   * @returns {Promise<*>}
   */
  async getFromLocalStorage(key) {
    this.logger.info(`BasePage::getFromLocalStorage is called. Key: ${key}`);
    const result = await this.executeLocalStorageScript(`getItem("${key}")`);
    return JSON.parse(result);
  }
  /**
   * Saves a value to local storage under the specified key.
   * @param {string} key
   * @param {*} value
   * @returns {Promise<void>}
   */
  async saveToLocalStorage(key, value) {
    this.logger.info(`BasePage::saveToLocalStorage is called. Key: "${key}", Value: "${value}"`);
    await this.executeLocalStorageScript(`setItem("${key}", '${JSON.stringify(value)}')`);
  }
  /**
   * Drops the Yoroi extension's Ada database.
   * @returns {Promise<void>}
   */
  async dropDB() {
    await this.driver.executeScript(() => window.yoroi.api.ada.dropDB());
  }
  /**
   * Takes a screenshot and writes it to the test suite's data directory.
   * @param {string} testSuiteName
   * @param {string} screenshotName
   * @returns {Promise<void>}
   */
  async takeScreenshot(testSuiteName, screenshotName) {
    this.logger.info(
      `BasePage::takeScreenshot is called. testSuiteName: "${testSuiteName}", screenshotName: "${screenshotName}" `
    );
    const screenshot = await this.driver.takeScreenshot();
    const testRundDataDir = createTestRunDataDir(testSuiteName);

    const cleanName = screenshotName.replace(/ /gi, '_');
    const screenshotPath = path.resolve(testRundDataDir, `screenshot_${cleanName}.png`);
    await writeFile(screenshotPath, screenshot, 'base64');
  }
  /**
   * Takes a DOM snapshot and writes it to the test suite's data directory.
   * @param {string} testSuiteName
   * @param {string} snapshotName
   * @returns {Promise<void>}
   */
  async takeSnapshot(testSuiteName, snapshotName) {
    this.logger.info(`BasePage::takeSnapshot is called. testSuiteName: "${testSuiteName}", snapshotName: "${snapshotName}" `);
    const testRundDataDir = createTestRunDataDir(testSuiteName);
    const cleanName = snapshotName.replace(/ /gi, '_');

    const snapshotPath = path.resolve(testRundDataDir, `snapshot_${cleanName}-dom.html`);
    const html = await this.driver.executeScript('return document.body.innerHTML;');
    await writeFile(snapshotPath, html);
  }
  /**
   * Collects browser logs and saves them to file.
   * @param {string} testSuiteName
   * @param {string} logFileName
   * @returns {Promise<void>}
   */
  async getBrowserLogs(testSuiteName, logFileName) {
    this.logger.info(`BasePage::getBrowserLogs is called. testSuiteName: "${testSuiteName}", logFileName: "${logFileName}" `);
    const testRundDataDir = createTestRunDataDir(testSuiteName);
    const cleanName = logFileName.replace(/ /gi, '_');
    const logsPaths = path.resolve(testRundDataDir, `console_browser_${cleanName}.log`);
    const logEntries = await this.driver.manage().logs().get(logging.Type.BROWSER, logging.Level.ALL);
    const jsonLogsStrings = logEntries.map(l => {
      const splitMsg = l.message.split(' ');
      const message = splitMsg.slice(2).join(' ');
      return `[${l.level}] [${l.timestamp}] ${message}`;
    });
    await writeFile(logsPaths, jsonLogsStrings.join(',\n'));
  }
  /**
   * Collects driver logs and saves them to file.
   * @param {string} testSuiteName
   * @param {string} logFileName
   * @returns {Promise<void>}
   */
  async getDriverLogs(testSuiteName, logFileName) {
    this.logger.info(`BasePage::getDriverLogs is called.`);
    const testRundDataDir = createTestRunDataDir(testSuiteName);
    const cleanName = logFileName.replace(/ /gi, '_');
    const driverLogsPaths = path.resolve(testRundDataDir, `driver_${cleanName}.log`);
    const driverLogEntries = await this.driver.manage().logs().get(logging.Type.DRIVER, logging.Level.INFO);
    const driverLogsStrings = driverLogEntries.map(l => `[${l.level}] [${l.timestamp}] ${l.message}`);
    await writeFile(driverLogsPaths, driverLogsStrings.join(''));
  }
  /**
   * Waits for an element at the given locator to be located.
   * @param {ElementLocator} locator
   * @returns {Promise<WebElement>}
   */
  async waitForElementLocated(locator) {
    this.logger.info(`BasePage::waitForElementLocated is called. Value: ${JSON.stringify(locator)}`);
    const isLocated = until.elementLocated(getByLocator(locator));
    return await this.driver.wait(isLocated);
  }
  /**
   * Waits for an element at the given locator to become visible.
   * @param {ElementLocator} locator
   * @returns {Promise<WebElement>}
   */
  async waitForElement(locator) {
    this.logger.info(`BasePage::waitForElement is called. Value: ${JSON.stringify(locator)}`);
    const element = await this.waitForElementLocated(locator);
    return await this.driver.wait(until.elementIsVisible(element));
  }
  /**
   * Waits for an element at the given locator to become enabled.
   * @param {ElementLocator} locator
   * @returns {Promise<WebElement>}
   */
  async waitEnable(locator) {
    this.logger.info(`BasePage::waitEnable is called. Value: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    const condition = until.elementIsEnabled(element);
    return this.driver.wait(condition);
  }
  /**
   * Returns a boolean indicating if a button is enabled by checking the 'disabled' attribute.
   * @param {ElementLocator} locator
   * @returns {Promise<boolean>}
   */
  async buttonIsEnabled(locator) {
    this.logger.info(`BasePage::buttonIsEnabled is called. Value: ${JSON.stringify(locator)}`);
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
  /**
   * Waits for an element at the given locator to become disabled.
   * @param {ElementLocator} locator
   * @returns {Promise<WebElement>}
   */
  async waitDisabled(locator) {
    this.logger.info(`BasePage::waitDisabled is called. Value: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    const condition = until.elementIsDisabled(element);
    return this.driver.wait(condition);
  }
  /**
   * Waits for an element at the locator to not be present.
   * @param {ElementLocator} locator
   * @returns {Promise<void>}
   */
  async waitForElementNotPresent(locator) {
    this.logger.info(`BasePage::waitForElementNotPresent is called. Value: ${JSON.stringify(locator)}`);
    await this.driver.wait(async () => {
      const elements = await this.findElements(locator);
      return elements.length === 0;
    });
  }
  /**
   * Waits for an element at the locator and checks its text matches a regex.
   * @param {ElementLocator} locator
   * @param {RegExp} regex
   * @returns {Promise<WebElement>}
   */
  async waitElementTextMatches(locator, regex) {
    this.logger.info(`BasePage::waitElementTextMatches is called. Value: ${JSON.stringify(locator)}. Regex "${regex}"`);
    await this.waitForElement(locator);
    const element = await this.findElement(locator);
    const condition = until.elementTextMatches(element, regex);
    await this.driver.wait(condition);
    return element;
  }
  /**
   * Waits for a custom condition function until timeout or repeat period.
   * @param {function():Promise<boolean>} conditionFunc
   * @param {number} [timeout=defaultWaitTimeout]
   * @param {number} [repeatPeriod=defaultRepeatPeriod]
   * @returns {Promise<boolean>}
   */
  async customWaiter(conditionFunc, timeout = defaultWaitTimeout, repeatPeriod = defaultRepeatPeriod) {
    this.logger.info(`BasePage::customWaiter is called.`);
    const endTime = Date.now() + timeout;
    await this.setImplicitTimeout(halfSecond, this.customWaiter.name);

    while (endTime >= Date.now()) {
      const conditionState = await conditionFunc();
      this.logger.info(`BasePage::customWaiter conditionState is ${conditionState}.`);
      if (conditionState) {
        await this.setImplicitTimeout(defaultWaitTimeout, this.customWaiter.name);
        return true;
      }
      await this.sleep(repeatPeriod);
    }
    await this.setImplicitTimeout(defaultWaitTimeout, this.customWaiter.name);
    return false;
  }
  /**
   * Waits until the element at locator is presented on the page.
   * @param {ElementLocator} locator
   * @param {number} [timeout=defaultWaitTimeout]
   * @param {number} [repeatPeriod=defaultRepeatPeriod]
   * @returns {Promise<boolean>}
   */
  async customWaitIsPresented(locator, timeout = defaultWaitTimeout, repeatPeriod = defaultRepeatPeriod) {
    this.logger.info(`BasePage::customWaitIsPresented is called.`);
    const result = await this.customWaiter(
      async () => {
        const elemsPresented = await this.findElements(locator);
        return elemsPresented.length === 1;
      },
      timeout,
      repeatPeriod
    );
    return result;
  }
  /**
   * Waits until the element at locator is not presented on the page.
   * @param {ElementLocator} locator
   * @param {number} [timeout=defaultWaitTimeout]
   * @param {number} [repeatPeriod=defaultRepeatPeriod]
   * @returns {Promise<boolean>}
   */
  async customWaitIsNotPresented(locator, timeout = defaultWaitTimeout, repeatPeriod = defaultRepeatPeriod) {
    this.logger.info(`BasePage::customWaitIsNotPresented is called.`);
    const result = await this.customWaiter(
      async () => {
        const elemsPresented = await this.findElements(locator);
        return elemsPresented.length === 0;
      },
      timeout,
      repeatPeriod
    );
    return result;
  }
  /**
   * The function wait until the passed element is found and call the passed function
   * @param {ElementLocator} locator Element locator
   * @param {object} funcToCall A function that should be called when the element is found
   * @param {number} timeout Total time of search in milliseconds. Default values is **5000** milliseconds
   * @param {number} repeatPeriod The time after which it is necessary to repeat the check. Default value is **250** milliseconds
   * @returns {Promise<any>}
   */
  async waitPresentedAndAct(locator, funcToCall, timeout = fiveSeconds, repeatPeriod = quarterSecond) {
    this.logger.info(`BasePage::waitPresentedAndAct is called. Locator: '${locator.locator}'`);
    const elemState = await this.customWaitIsPresented(locator, timeout, repeatPeriod);
    if (elemState) {
      return await funcToCall();
    } else {
      throw new Error(`The element is not found. Element: ${locator.locator}`);
    }
  }
  /**
   * Sleeps for the given amount of milliseconds.
   * @param {number} milliseconds
   * @param {boolean} [logIt=true]
   * @returns {Promise<void>}
   */
  async sleep(milliseconds, logIt = true) {
    if (logIt) {
      this.logger.info(`BasePage::sleep is called. Value: ${milliseconds}`);
    }
    await this.driver.sleep(milliseconds);
  }
  /**
   * Checks if the given locator exists on the page.
   * @param {ElementLocator} locator
   * @returns {Promise<boolean>}
   */
  async checkIfExists(locator) {
    this.logger.info(`BasePage::checkIfExists: Checking if element exists "${JSON.stringify(locator)}"`);
    await this.setImplicitTimeout(oneSecond, this.checkIfExists.name);
    try {
      await this.findElement(locator);
      this.logger.info(`BasePage::checkIfExists: The element "${JSON.stringify(locator)}" exists`);
      await this.setImplicitTimeout(defaultWaitTimeout, this.checkIfExists.name);
      return true;
    } catch (error) {
      this.logger.error(`BasePage::checkIfExists: The element "${JSON.stringify(locator)}" does not exists`);
      this.logger.error(`BasePage::checkIfExists: The error: ${JSON.stringify(error, null, 2)}`);
      await this.setImplicitTimeout(defaultWaitTimeout, this.checkIfExists.name);
      return false;
    }
  }
  /**
   * Highlighting the web element with red border and yellow backgorund.
   * !!IT IS ONLY FOR DEBUGGING!!
   * @param {WebElement} webElement
   */
  async highlightElement(webElement) {
    this.logger.info(`Webdriver::highlightElement: Highlighting element "${JSON.stringify(webElement)}"`);
    await this.driver.executeScript(
      "arguments[0].setAttribute('style', 'background: yellow; border: 2px solid red;');",
      webElement
    );
  }
  /**
   * Gets info from IndexedDB for a given table name.
   * @param {string} tableName
   * @returns {Promise<*>}
   */
  async getInfoFromIndexedDB(tableName) {
    this.logger.info(`BasePage::getInfoFromIndexedDB Table name "${tableName}"`);
    const result = await this.getInfoFromIndexedDBChrome(tableName);
    this.logger.info(`BasePage::getInfoFromIndexedDB::result ${JSON.stringify(result)}`);
    return result;
  }
  /**
   * Gets info from IndexedDB (Chrome) for a given table name.
   * @param {string} tableName
   * @returns {Promise<*>}
   */
  async getInfoFromIndexedDBChrome(tableName) {
    await this.driver.executeScript(() => {
      window.allDBsPromise = window.indexedDB.databases();
    });

    const allDBs = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.allDBsPromise.then(response => callback(response)).catch(err => callback(err));
    });
    const { name, version } = allDBs[allDBs.length - 1];

    await this.driver.executeScript(
      (dbName, dbVersion, table) => {
        const request = window.indexedDB.open(dbName, dbVersion);
        request.onsuccess = function (event) {
          const db = event.target.result;
          const tableContentRequest = db.transaction(table, 'readonly').objectStore(table).getAll();
          tableContentRequest.onsuccess = function (event) {
            window.tableData = event.target.result;
          };
        };
      },
      name,
      version,
      tableName
    );
    let tableContent;
    try {
      tableContent = await this.driver.executeScript(() => window.tableData);
    } catch (error) {
      this.webDriverLogger.warn(error);
      tableContent = {};
    }

    return tableContent;
  }

  /**
   * Gets the complete IndexedDB database from Chrome.
   * @returns {Promise<*>}
   */
  async getFullIndexedDBFromChrome() {
    this.logger.info(`BasePage::getFullIndexedDBFromChrome is called.`);
    await this.driver.executeScript(() => {
      window.allDBsPromise = window.indexedDB.databases();
    });
    const allDBs = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.allDBsPromise.then(response => callback(response)).catch(err => callback(err));
    });
    const { name, version } = allDBs[allDBs.length - 1];

    await this.driver.executeScript(
      (dbName, dbVersion) => {
        const request = window.indexedDB.open(dbName, dbVersion);
        request.onsuccess = function (event) {
          const db = event.target.result;
          const allTables = db.objectStoreNames;
          const fullDBData = {};
          for (const table of allTables) {
            const tableContentRequest = db.transaction(table, 'readonly').objectStore(table).getAll();
            tableContentRequest.onsuccess = function (event) {
              const allInfo = event.target.result;
              fullDBData[table] = allInfo;
            };
          }
          window.fullDBData = fullDBData;
        };
      },
      name,
      version
    );

    let fullDBDataResult;
    try {
      fullDBDataResult = await this.driver.executeScript(() => window.fullDBData);
    } catch (error) {
      this.webDriverLogger.warn(error);
      fullDBDataResult = {};
    }
    this.logger.info(`Webdriver::getFullIndexedDBFromChrome::allTables. DB is collected.`);

    return fullDBDataResult;
  }

  /**
   * Saves the full IndexedDB from Chrome to a file, optionally overwriting.
   * @param {string} fileName
   * @param {boolean} [overwrite=false]
   * @returns {Promise<void>}
   */
  async saveFullIndexedDBChrome(fileName, overwrite = false) {
    this.logger.info(`BasePage::saveFullIndexedDBChrome is called. File name: "${fileName}"`);
    const fullDB = await this.getFullIndexedDBFromChrome();
    const dbfileName = `${fileName}.indexedDB.json`;
    const snapshotPath = path.resolve(dbSnapshotsDir, dbfileName);
    const fileExists = fs.existsSync(snapshotPath);
    if (!fileExists || (fileExists && overwrite)) {
      this.logger.info(`BasePage::saveFullIndexedDBChrome Writting data to the file "${snapshotPath}"`);
      writeFile(snapshotPath, JSON.stringify(fullDB, null, 2));
    } else {
      throw new Error(`The file "${dbfileName}" exists. Overwritting the file is not allowed.`);
    }
  }

  /**
   * Sets info into an IndexedDB table in Chrome.
   * @param {string} tableName
   * @param {Array} value
   * @returns {Promise<void>}
   */
  async setInfoToIndexedDBChrome(tableName, value) {
    this.logger.info(`BasePage::setInfoToIndexedDBChrome is called for the table ${tableName}.`);
    this.driver.executeScript(() => {
      window.allDBsPromise = window.indexedDB.databases();
    });

    const allDBs = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.allDBsPromise.then(response => callback(response)).catch(err => callback(err));
    });
    const { name, version } = allDBs[allDBs.length - 1];

    for (const valueItem of value) {
      await this.driver.executeScript(
        (dbName, dbVersion, tableName, valueItem) => {
          const request = window.indexedDB.open(dbName, dbVersion);
          request.onsuccess = function (event) {
            const db = event.target.result;
            const tx = db.transaction(tableName, 'readwrite');
            tx.oncomplete = function (event) {
              console.log(`-----> Transaction is completed. Data is added to the table "${tableName}"`);
            };
            tx.onerror = function (event) {
              console.log('-----> Error happend:', event.target.result);
            };
            const store = tx.objectStore(tableName);
            store.put(valueItem);
          };
        },
        name,
        version,
        tableName,
        valueItem
      );
    }
  }

  /**
   * Gets info from Chrome browser local storage for a specified key.
   * @param {string} key
   * @returns {Promise<*>}
   */
  async getInfoBrowserLocalStorage(key) {
    this.logger.info(`BasePage::getInfoBrowserLocalStorage is called. Key: "${key}"`);
    this.driver.executeScript(`await chrome.storage.local.get('${key}', function (result) {window.someKeyValue = result})`);
    const result = await this.driver.executeScript(() => window.someKeyValue);
    this.logger.info(`BasePage::getInfoBrowserLocalStorage::result ${JSON.stringify(result)}`);
    return result;
  }

  /**
   * Sets information in Chrome browser local storage under a specific key.
   * @param {string} key
   * @param {string} value
   * @returns {Promise<void>}
   */
  async setInfoBrowserLocalStorage(key, value) {
    this.logger.info(`BasePage::setInfoChromeLocalStorage is called. Key: "${key}", value: "${value}"`);
    await this.driver.executeScript(`chrome.storage.local.set({ "${key}": "${value}" })`);
  }

  /**
   * Prepares IndexedDB, Chrome local storage, and localStorage using predefined templates.
   * @param {string} templateName
   * @param {boolean} [useGeneralStorageInfo=true]
   * @returns {Promise<void>}
   */
  async prepareDBAndStorage(templateName, useGeneralStorageInfo = true) {
    // import info into the indexedDB
    const dbSnapshot = getSnapshotObjectFromJSON(`${templateName}.indexedDB.json`, true);
    for (const dbKey in dbSnapshot) {
      await this.setInfoToIndexedDBChrome(dbKey, dbSnapshot[dbKey]);
    }
    // set info into the chrome local storage
    const browserStorageFileName = `${useGeneralStorageInfo ? 'general' : templateName}.browserLocalStorage.json`;
    const browserStorageSnapshot = getSnapshotObjectFromJSON(browserStorageFileName, useGeneralStorageInfo);
    for (const storageKey in browserStorageSnapshot) {
      await this.setInfoBrowserLocalStorage(storageKey, browserStorageSnapshot[storageKey]);
    }
    // set info into regular storage
    const commonStorageFileName = 'general.localStorage.json';
    const commonStorageSnaphot = getSnapshotObjectFromJSON(commonStorageFileName, true);
    for (const commonStorageKey in commonStorageSnaphot) {
      await this.saveToLocalStorage(commonStorageKey, commonStorageSnaphot[commonStorageKey]);
    }
  }
  /**
   * Setting info into the browser local storage
   * @param {string} templateName
   * @param {boolean} useGeneralStorageInfo
   */
  async prepareBrowserLocalStorage(templateName, useGeneralStorageInfo, opts = {}) {
    const browserStorageFileName = `${useGeneralStorageInfo ? 'general' : templateName}.browserLocalStorage.json`;
    const browserStorageSnapshot = getSnapshotObjectFromJSON(browserStorageFileName, useGeneralStorageInfo);
    const snapshotObject = Object.assign(browserStorageSnapshot, opts);
    for (const storageKey in snapshotObject) {
      await this.setInfoBrowserLocalStorage(storageKey, browserStorageSnapshot[storageKey]);
    }
  }
  /**
   * Getting an element size
   * @param {ElementLocator} locator
   * @returns {{height: number, width: number}}
   */
  async getSize(locator) {
    this.logger.info(`BasePage::getSize is called. Value: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    const rect = await element.getRect();
    this.logger.info(`BasePage::getSize is called. Result: ${JSON.stringify(rect)}`);
    return {
      height: rect.height,
      width: rect.width,
    };
  }

  /**
   * Reading a buffer info
   * @returns {Promise<string>}
   */
  async getClipboardData() {
    this.logger.info(`BasePage::getClipboardData is called.`);
    const clipboardText = await this.driver.executeAsyncScript(async callback => {
      try {
        const text = await navigator.clipboard.readText();
        callback(text);
      } catch (error) {
        console.error('Failed to read clipboard:', error);
        callback(null);
      }
    });
    this.logger.info(`BasePage::getClipboardData is called. Result: ${clipboardText}`);
    return clipboardText;
  }
}

export default BasePage;
