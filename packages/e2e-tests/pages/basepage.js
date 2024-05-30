import { until, Key, logging } from 'selenium-webdriver';
import path from 'path';
import * as fs from 'node:fs';
import { promisify } from 'util';
import { createTestRunDataDir, getByLocator, isFirefox, isChrome } from '../utils/utils.js';
import { getExtensionUrl } from '../utils/driverBootstrap.js';
import {
  defaultRepeatPeriod,
  defaultWaitTimeout,
  halfSecond,
  oneSecond,
} from '../helpers/timeConstants.js';
import { getSnapshotObjectFromJSON } from '../utils/utils.js';

const writeFile = promisify(fs.writeFile);

class BasePage {
  constructor(webDriver, logger) {
    this.driver = webDriver;
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

  async goToUrl(theURL) {
    this.logger.info('BasePage::goToUrl is called');
    await this.driver.get(theURL);
  }
  async refreshPage() {
    this.logger.info('BasePage::refreshPage is called');
    await this.driver.navigate().refresh();
  }
  async closeBrowser() {
    this.logger.info('BasePage::closeBrowser is called');
    await this.driver.quit();
  }
  async goToExtension() {
    this.logger.info('BasePage::goToExtension is called');
    await this.driver.manage().setTimeouts({ implicit: halfSecond });

    const extURL = getExtensionUrl();
    await this.driver.get(extURL);
    await this.waitForElementLocated(this.rootLocator);

    await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
  }
  async click(locator) {
    this.logger.info(`BasePage::click is called. Locator: ${JSON.stringify(locator)}`);
    await this.driver.findElement(getByLocator(locator)).click();
  }
  async clickByScript(locator) {
    this.logger.info(`BasePage::clickByScript is called. Locator: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    await this.driver.executeScript(`arguments[0].click()`, element);
  }
  async hover(locator) {
    this.logger.info(`BasePage::hoverOnElement is called. Locator: ${JSON.stringify(locator)}`);
    const webElement = await this.findElement(locator);
    await this.hoverOnElement(webElement);
  }
  async hoverOnElement(webElement) {
    this.logger.info(`BasePage::hoverOnElement is called.`);
    const actions = this.driver.actions();
    await actions.move({ origin: webElement }).perform();
  }
  async scrollIntoView(locator) {
    this.logger.info(`BasePage::scrollIntoView is called. Values: ${JSON.stringify(locator)}`);
    await this.waitForElement(locator);
    const clickable = await this.findElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView()', clickable);
  }
  async findElement(locator) {
    this.logger.info(`BasePage::findElement is called. Locator: ${JSON.stringify(locator)}`);
    return await this.driver.findElement(getByLocator(locator));
  }
  async findElements(locator) {
    this.logger.info(`BasePage::findElements is called. Locator: ${JSON.stringify(locator)}`);
    return await this.driver.findElements(getByLocator(locator));
  }
  async getText(locator) {
    this.logger.info(`BasePage::getText is called. Locator: ${JSON.stringify(locator)}`);
    return await this.driver.findElement(getByLocator(locator)).getText();
  }
  async getCssValue(locator, cssStyleProperty) {
    this.logger.info(
      `BasePage::getCssValue is called. Locator: ${JSON.stringify(locator)}, property: ${cssStyleProperty}`
    );
    return await this.driver.findElement(getByLocator(locator)).getCssValue(cssStyleProperty);
  }
  async getCssValueElement(webElement, cssStyleProperty) {
    this.logger.info(`BasePage::getCssValueElement is called. Property: ${cssStyleProperty}`);
    return await webElement.getCssValue(cssStyleProperty);
  }
  async getAttribute(locator, property) {
    this.logger.info(
      `BasePage::getAttribute is called. Locator: ${JSON.stringify(locator)}, property: ${property}`
    );
    return await this.driver.findElement(getByLocator(locator)).getAttribute(property);
  }
  async getAttributeElement(webElement, property) {
    this.logger.info(`BasePage::getAttributeElement is called. Property: ${property}`);
    return await webElement.getAttribute(property);
  }
  async getLinkFromComponent(locator) {
    this.logger.info(
      `BasePage::getLinkFromComponent is called. Locator: ${JSON.stringify(locator)}`
    );
    const webElem = await this.driver.findElement(getByLocator(locator));
    const linkElem = await webElem.findElement(getByLocator(this.linkLocator));
    const linkText = await this.getAttributeElement(linkElem, 'href');
    return linkText;
  }
  async getWebElementAbove(locator, numberAbove) {
    this.logger.info(
      `BasePage::getWebElementAbove is called. Locator: ${JSON.stringify(locator)}, NumberAbove: ${JSON.stringify(numberAbove)}`
    );
    const webElement = await this.findElement(locator);
    return await this.getWebElementAboveElement(webElement, numberAbove);
  }
  async getWebElementAboveElement(webElement, numberAbove) {
    this.logger.info(
      `BasePage::getWebElementAboveElement is called. NumberAbove: ${JSON.stringify(numberAbove)}`
    );
    const parentLocator = '.' + '/..'.repeat(numberAbove);
    const elLocator = {
      locator: parentLocator,
      method: 'xpath',
    };
    const parentElement = await webElement.findElement(getByLocator(elLocator));

    return parentElement;
  }
  async executeLocalStorageScript(script) {
    this.logger.info(
      `BasePage::executeLocalStorageScript is called. Script: ${JSON.stringify(script)}`
    );
    return await this.driver.executeScript(`return localStorage.${script}`);
  }
  async input(locator, value) {
    this.logger.info(
      `BasePage::input is called. Locator: ${JSON.stringify(locator)}, Value: ${value}`
    );
    const input = await this.findElement(locator);
    await input.sendKeys(value);
  }
  async inputElem(webElement, value) {
    this.logger.info(
      `BasePage::inputElem is called. WebElement: ${JSON.stringify(webElement)}, Value: ${value}`
    );
    await webElement.sendKeys(value);
  }
  async clearInput(locator) {
    this.logger.info(`BasePage::clearInput is called. Locator: ${JSON.stringify(locator)}`);
    const input = await this.findElement(locator);
    await input.clear();
  }
  async clearInputElem(inputWebElement) {
    this.logger.info(`BasePage::clearInput is clearInputElem.`);
    await inputWebElement.clear();
  }
  async clearInputUpdatingForm(locator, textLength) {
    this.logger.info(
      `BasePage::clearInputUpdatingForm is called. Locator: ${JSON.stringify(locator)}, Text lenght: ${textLength}`
    );
    const input = await this.findElement(locator);
    for (let i = 0; i < textLength; i++) {
      await input.sendKeys(Key.BACK_SPACE);
    }
  }
  async getFromLocalStorage(key) {
    this.logger.info(`BasePage::getFromLocalStorage is called. Key: ${key}`);
    const result = await this.executeLocalStorageScript(`getItem("${key}")`);
    return JSON.parse(result);
  }
  async saveToLocalStorage(key, value) {
    this.logger.info(`BasePage::saveToLocalStorage is called. Key: "${key}", Value: "${value}"`);
    await this.executeLocalStorageScript(`setItem("${key}", '${JSON.stringify(value)}')`);
  }
  async dropDB() {
    await this.driver.executeScript(() => window.yoroi.api.ada.dropDB());
  }
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
  async takeSnapshot(testSuiteName, snapshotName) {
    this.logger.info(
      `BasePage::takeSnapshot is called. testSuiteName: "${testSuiteName}", snapshotName: "${snapshotName}" `
    );
    const testRundDataDir = createTestRunDataDir(testSuiteName);
    const cleanName = snapshotName.replace(/ /gi, '_');

    const snapshotPath = path.resolve(testRundDataDir, `snapshot_${cleanName}-dom.html`);
    const html = await this.driver.executeScript('return document.body.innerHTML;');
    await writeFile(snapshotPath, html);
  }
  async getBrowserLogs(testSuiteName, logFileName) {
    this.logger.info(
      `BasePage::getBrowserLogs is called. testSuiteName: "${testSuiteName}", logFileName: "${logFileName}" `
    );
    const testRundDataDir = createTestRunDataDir(testSuiteName);
    const cleanName = logFileName.replace(/ /gi, '_');
    const logsPaths = path.resolve(testRundDataDir, `console_${cleanName}-log.json`);
    if (isChrome()) {
      const logEntries = await this.driver
        .manage()
        .logs()
        .get(logging.Type.BROWSER, logging.Level.ALL);
      const jsonLogs = logEntries.map(l => JSON.stringify(l.toJSON(), null, 2));
      await writeFile(logsPaths, `[\n${jsonLogs.join(',\n')}\n]`);
    }
  }
  async waitForElementLocated(locator) {
    this.logger.info(
      `BasePage::waitForElementLocated is called. Value: ${JSON.stringify(locator)}`
    );
    const isLocated = until.elementLocated(getByLocator(locator));
    return await this.driver.wait(isLocated);
  }
  async waitForElement(locator) {
    this.logger.info(`BasePage::waitForElement is called. Value: ${JSON.stringify(locator)}`);
    await this.waitForElementLocated(locator);
    const element = await this.findElement(locator);
    return await this.driver.wait(until.elementIsVisible(element));
  }
  async waitEnable(locator) {
    this.logger.info(`BasePage::waitEnable is called. Value: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    const condition = until.elementIsEnabled(element);
    return this.driver.wait(condition);
  }
  async waitDisabled(locator) {
    this.logger.info(`BasePage::waitDisabled is called. Value: ${JSON.stringify(locator)}`);
    const element = await this.findElement(locator);
    const condition = until.elementIsDisabled(element);
    return this.driver.wait(condition);
  }
  async waitForElementNotPresent(locator) {
    this.logger.info(
      `BasePage::waitForElementNotPresent is called. Value: ${JSON.stringify(locator)}`
    );
    await this.driver.wait(async () => {
      const elements = await this.findElements(locator);
      return elements.length === 0;
    });
  }
  async waitElementTextMatches(locator, regex) {
    this.logger.info(
      `BasePage::waitElementTextMatches is called. Value: ${JSON.stringify(locator)}. Regex "${regex}"`
    );
    await this.waitForElement(locator);
    const element = await this.findElement(locator);
    const condition = until.elementTextMatches(element, regex);
    await this.driver.wait(condition);
    return element;
  }
  async customWaiter(
    conditionFunc,
    timeout = defaultWaitTimeout,
    repeatPeriod = defaultRepeatPeriod
  ) {
    this.logger.info(`BasePage::customWaiter is called.`);
    const endTime = Date.now() + timeout;
    await this.driver.manage().setTimeouts({ implicit: oneSecond });

    while (endTime >= Date.now()) {
      const conditionState = await conditionFunc();
      this.logger.info(`BasePage::customWaiter conditionState is ${conditionState}.`);
      if (conditionState) {
        await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
        return true;
      }
      await this.sleep(repeatPeriod);
    }
    await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
    return false;
  }
  async customWaitIsPresented(
    locator,
    timeout = defaultWaitTimeout,
    repeatPeriod = defaultRepeatPeriod
  ) {
    this.logger.info(`BasePage::customWaitIsPresented is called.`);
    const result = await this.customWaiter(
      async () => {
        const elemsPresented = await this.findElements(locator);
        return elemsPresented === 1;
      },
      timeout,
      repeatPeriod
    );
    return result;
  }
  async sleep(milliseconds) {
    this.logger.info(`BasePage::sleep is called. Value: ${milliseconds}`);
    await this.driver.sleep(milliseconds);
  }
  async checkIfExists(locator) {
    this.logger.info(
      `BasePage::checkIfExists: Checking if element exists "${JSON.stringify(locator)}"`
    );
    await this.driver.manage().setTimeouts({ implicit: oneSecond });
    try {
      await this.findElement(locator);
      this.logger.info(`BasePage::checkIfExists: The element "${JSON.stringify(locator)}" exists`);
      await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
      return true;
    } catch (error) {
      this.logger.error(
        `BasePage::checkIfExists: The element "${JSON.stringify(locator)}" does not exists`
      );
      this.logger.error(`BasePage::checkIfExists: The error: ${JSON.stringify(error, null, 2)}`);
      await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
      return false;
    }
  }
  // The method is for debugging
  async highlightElement(webElement) {
    this.logger.info(
      `Webdriver::highlightElement: Highlighting element "${JSON.stringify(webElement)}"`
    );
    await this.driver.executeScript(
      "arguments[0].setAttribute('style', 'background: yellow; border: 2px solid red;');",
      webElement
    );
  }
  // tableNames are [ 'UtxoAtSafePointTable', 'UtxoDiffToBestBlock', 'UtxoTransactionInput', 'UtxoTransactionOutput']
  async getInfoFromIndexedDB(tableName) {
    this.logger.info(`Webdriver::getInfoFromIndexedDB Table name "${tableName}"`);
    let result;
    if (isFirefox()) {
      result = await this.getInfoFromIndexedDBFF(tableName);
    }
    result = await this.getInfoFromIndexedDBChrome(tableName);
    this.logger.info(`Webdriver::getInfoFromIndexedDB::result ${JSON.stringify(result)}`);
    return result;
  }
  async getInfoFromIndexedDBFF(tableName) {
    await this.driver.executeScript(
      (dbName, table) => {
        const dbRequest = window.indexedDB.open(dbName);
        dbRequest.onsuccess = function (event) {
          const db = event.target.result;
          const tableContentRequest = db.transaction(table, 'readonly').objectStore(table).getAll();
          tableContentRequest.onsuccess = function (event) {
            window.tableData = event.target.result;
          };
        };
      },
      'yoroi-schema',
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
  async getInfoFromIndexedDBChrome(tableName) {
    await this.driver.executeScript(() => {
      window.allDBsPromise = window.indexedDB.databases();
    });

    const allDBs = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.allDBsPromise.then(response => callback(response)).catch(err => callback(err));
    });
    const { name, version } = allDBs[0];

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

  async getFullIndexedDBFromChrome() {
    this.logger.info(`BasePage::getFullIndexedDBFromChrome is called.`);
    await this.driver.executeScript(() => {
      window.allDBsPromise = window.indexedDB.databases();
    });
    const allDBs = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.allDBsPromise.then(response => callback(response)).catch(err => callback(err));
    });
    const { name, version } = allDBs[0];

    await this.driver.executeScript(
      (dbName, dbVersion) => {
        const request = window.indexedDB.open(dbName, dbVersion);
        request.onsuccess = function (event) {
          const db = event.target.result;
          const allTables = db.objectStoreNames;
          const fullDBData = {};
          for (const table of allTables) {
            const tableContentRequest = db
              .transaction(table, 'readonly')
              .objectStore(table)
              .getAll();
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
    this.logger.info(
      `Webdriver::getFullIndexedDBFromChrome::allTables. All data ${JSON.stringify(fullDBDataResult)}`
    );

    return fullDBDataResult;
  }

  async setInfoToIndexedDBChrome(tableName, value) {
    this.logger.info(`BasePage::setInfoToIndexedDBChrome is called for the table ${tableName}.`);
    this.driver.executeScript(() => {
      window.allDBsPromise = window.indexedDB.databases();
    });

    const allDBs = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.allDBsPromise.then(response => callback(response)).catch(err => callback(err));
    });
    const { name, version } = allDBs[0];

    for (const valueItem of value) {
      await this.driver.executeScript(
        (dbName, dbVersion, tableName, valueItem) => {
          const request = window.indexedDB.open(dbName, dbVersion);
          request.onsuccess = function (event) {
            const db = event.target.result;
            const tx = db.transaction(tableName, 'readwrite');
            tx.oncomplete = function (event) {
              console.log(
                `-----> Transaction is completed. Data is added to the table "${tableName}"`
              );
            };
            tx.onerror = function (event) {
              console.log('-----> Error happend:', event.target.result);
            };
            const store = tx.objectStore(tableName);
            const addRequest = store.put(valueItem);
          };
        },
        name,
        version,
        tableName,
        valueItem
      );
    }
  }

  async getInfoChromeLocalStorage(key) {
    this.logger.info(`BasePage::getInfoChromeLocalStorage is called. Key: "${key}"`);
    this.driver.executeScript(
      `await chrome.storage.local.get('${key}', function (result) {window.someKeyValue = result})`
    );
    const result = await this.driver.executeScript(() => window.someKeyValue);
    this.logger.info(`BasePage::getInfoChromeLocalStorage::result ${JSON.stringify(result)}`);
    return result;
  }

  async setInfoChromeLocalStorage(key, value) {
    this.logger.info(
      `BasePage::setInfoChromeLocalStorage is called. Key: "${key}", value: "${value}"`
    );
    await this.driver.executeScript(`await chrome.storage.local.set({ "${key}": "${value}" })`);
  }

  async prepareDBAndStorage(templateName) {
    // import info into the indexedDB
    const dbSnapshot = getSnapshotObjectFromJSON(`${templateName}.indexedDB.json`);
    for (const dbKey in dbSnapshot) {
      await this.setInfoToIndexedDBChrome(dbKey, dbSnapshot[dbKey]);
    }
    // set info into the chrome local storage
    const chromeStorageSnapshot = getSnapshotObjectFromJSON(
      `${templateName}.chromeLocalStorage.json`
    );
    for (const storageKey in chromeStorageSnapshot) {
      await this.setInfoChromeLocalStorage(storageKey, chromeStorageSnapshot[storageKey]);
    }
    // set info into regular storage
    const commonStorageSnaphot = getSnapshotObjectFromJSON(`${templateName}.localStorage.json`);
    for (const commonStorageKey in commonStorageSnaphot) {
      await this.saveToLocalStorage(commonStorageKey, commonStorageSnaphot[commonStorageKey]);
    }
  }
}

export default BasePage;
