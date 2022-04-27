// @flow

import { setWorldConstructor, setDefaultTimeout } from 'cucumber';
import { Builder, Key, until, error, promise, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import path from 'path';
// eslint-disable-next-line import/named
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { getMethod, getLogDate } from './helpers/helpers';
import { WindowManager } from './windowManager';
import { MockDAppWebpage } from '../mock-dApp-webpage';
import { mockDAppLogsDir, windowManagerLogsDir } from './helpers/common-constants';

const fs = require('fs');
const simpleNodeLogger= require('simple-node-logger');

function encode(file) {
  return fs.readFileSync(file, { encoding: 'base64' });
}

/**
 * Chrome extension URLs are fixed and never change. This is a security problem as it allows
 * websites to check if you have certain known extensions installed by monitoring the browser's
 * response to resource access.
 * https://www.ghacks.net/2017/08/29/browsers-leak-installed-extensions-to-sites/
 *
 * To tackle this, Firefox gives every extension a unique UUID to create a random URL on install
 * However, this means Selenium tests cannot open the extension page based on a static url
 *
 * To solve this, we first note Firefox allows you to optionally specify your extension ID
 * We then note the mapping of the extension ID to the random UUID is stored in about:config
 * Under the key "extensions.webextensions.uuids".
 * Therefore, we specify a fixed extension ID for Yoroi in the manifest
 * Then we use Selenium to override the config to manually specify a a fixed UUID
 */
const firefoxExtensionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const firefoxUuidMapping = `{"{530f7c6c-6077-4703-8f71-cb368c663e35}":"${firefoxExtensionId}"}`;
const defaultWaitTimeout = 10 * 1000;
const defaultRepeatPeriod = 1000;

function getBraveBuilder() {
  return new Builder().forBrowser('chrome').setChromeOptions(
    new chrome.Options()
      .setChromeBinaryPath('/usr/bin/brave-browser')
      .addArguments(
        '--no-sandbox', // Disables the sandbox for all process types that are normally sandboxed. Meant to be used as a browser-level switch for testing purposes only
        '--disable-gpu', // Disables GPU hardware acceleration. If software renderer is not in place, then the GPU process won't launch
        '--disable-dev-shm-usage', // The /dev/shm partition is too small in certain VM environments, causing Chrome to fail or crash
        '--disable-setuid-sandbox', // Disable the setuid sandbox (Linux only)
        '--start-maximized' // Starts the browser maximized, regardless of any previous settings
      )
      .addExtensions(encode(path.resolve(__dirname, '../../yoroi-test.crx')))
  );
}

function getChromeBuilder() {
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(
      new chrome.Options()
        .addExtensions(encode(path.resolve(__dirname, '../../yoroi-test.crx')))
        .addArguments(
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--start-maximized'
        )
    );
}

function getFirefoxBuilder() {
  const options = new firefox.Options()
    // .setBinary(firefox.Channel.NIGHTLY)
    .addExtensions(path.resolve(__dirname, '../../yoroi-test.xpi'))
    /**
     * Firefox disallows unsigned extensions by default. We solve this through a config change
     * The proper way to do this is to use the "temporary addon" feature of Firefox
     * However, our version of selenium doesn't support this yet
     * The config is deprecated and may be removed in the future.
     */
    .setPreference('xpinstall.signatures.required', false)
    .setPreference('extensions.webextensions.uuids', firefoxUuidMapping);

  return new Builder()
    .withCapabilities({
      chromeOptions: {
        args: ['start-maximized'],
      },
    })
    .forBrowser('firefox')
    .setFirefoxOptions(options);
}

type WorldInput = {| parameters: {| browser: 'brave' | 'chrome' | 'firefox' |} |};

export type LocatorObject = {|
  locator: string,
  method:
    | 'css'
    | 'id'
    | 'xpath'
    | 'name'
    | 'className'
    | 'linkText'
    | 'js'
    | 'partialLinkText'
    | 'tagName',
|};

function CustomWorld(cmdInput: WorldInput) {
  switch (cmdInput.parameters.browser) {
    case 'brave': {
      const braveBuilder = getBraveBuilder();
      this.driver = braveBuilder.build();
      this.windowManager = new WindowManager(this.driver);
      this.windowManager.init().then().catch();
      this.mockDAppPage = new MockDAppWebpage(this.driver);
      break;
    }
    case 'firefox': {
      const firefoxBuilder = getFirefoxBuilder();
      this.driver = firefoxBuilder.build();
      this.windowManager = new WindowManager(this.driver);
      this.windowManager.init().then().catch();
      this.mockDAppPage = new MockDAppWebpage(this.driver);
      break;
    }
    default: {
      this._allLoggers = [];
      const chromeBuilder = getChromeBuilder();
      this.driver = chromeBuilder.build();
      const windowManagerLogPath = `${windowManagerLogsDir}windowManagerLog_${getLogDate()}.log`;
      const windowManagerLogger = simpleNodeLogger.createSimpleFileLogger(windowManagerLogPath);
      this.windowManager = new WindowManager(this.driver, windowManagerLogger);
      this.windowManager.init().then().catch();
      const dAppLogPath = `${mockDAppLogsDir}mockDAppLog_${getLogDate()}.log`;
      const mockDAppLogger = simpleNodeLogger.createSimpleFileLogger(dAppLogPath);
      this._allLoggers.push(mockDAppLogger);
      this.mockDAppPage = new MockDAppWebpage(this.driver, mockDAppLogger);
      break;
    }
  }

  this.sendToAllLoggers = (message: string, level: string = 'info') => {
    for (const someLogger of this._allLoggers) {
      someLogger[level](message);
    }
  };

  this.getBrowser = (): string => cmdInput.parameters.browser;

  this.getExtensionUrl = (): string => {
    if (cmdInput.parameters.browser === 'chrome' || cmdInput.parameters.browser === 'brave') {
      /**
       * Extension id is deterministically calculated based on pubKey used to generate the crx file
       * so we can just hardcode this value if we keep e2etest-key.pem file
       * https://stackoverflow.com/a/10089780/3329806
       */
      return 'chrome-extension://bdlknlffjjmjckcldekkbejaogpkjphg/main_window.html';
    }
    return `moz-extension://${firefoxExtensionId}/main_window.html`;
  };

  this.getElementBy = (locator: LocatorObject) =>
    this.driver.findElement(getMethod(locator.method)(locator.locator));

  this.getElementsBy = (locator: LocatorObject) =>
    this.driver.findElements(getMethod(locator.method)(locator.locator));

  this.getText = (locator: LocatorObject) => this.getElementBy(locator).getText();

  // $FlowExpectedError[prop-missing] Flow doesn't like that we add a new function to driver
  this.getValue = this.driver.getValue = async (locator: LocatorObject) =>
    this.getElementBy(locator).getAttribute('value');

  this.waitForElementLocated = async (locator: LocatorObject) => {
    const isLocated = until.elementLocated(getMethod(locator.method)(locator.locator));
    return await this.driver.wait(isLocated);
  };

  // Returns a promise that resolves to the element
  // $FlowExpectedError[prop-missing] Flow doesn't like that we add a new function to driver
  this.waitForElement = this.driver.waitForElement = async (locator: LocatorObject) => {
    await this.waitForElementLocated(locator);
    const element = await this.getElementBy(locator);
    const condition = until.elementIsVisible(element);
    return this.driver.wait(condition);
  };

  this.waitElementTextMatches = async (regex, locator: LocatorObject) => {
    await this.waitForElement(locator);
    const element = await this.getElementBy(locator);
    const condition = until.elementTextMatches(element, regex);
    await this.driver.wait(condition);
    return element;
  };

  // $FlowExpectedError[prop-missing] Flow doesn't like that we add a new function to driver
  this.waitForElementNotPresent = this.driver.waitForElementNotPresent = async (
    locator: LocatorObject
  ) => {
    await this.driver.wait(async () => {
      const elements = await this.getElementsBy(locator);
      return elements.length === 0;
    });
  };

  this.waitEnable = async (locator: LocatorObject) => {
    const element = await this.getElementBy(locator);
    const condition = until.elementIsEnabled(element);
    return this.driver.wait(condition);
  };

  this.waitDisable = async (locator: LocatorObject) => {
    const element = await this.getElementBy(locator);
    const condition = until.elementIsDisabled(element);
    return this.driver.wait(condition);
  };

  this.waitUntilText = async (locator: LocatorObject, text, timeout = 75000) => {
    await this.driver.wait(async () => {
      try {
        const value = await this.getText(locator);
        return value === text;
      } catch (err) {
        return false;
      }
    }, timeout);
  };

  this.waitUntilContainsText = async (locator: LocatorObject, text, timeout = 15000) => {
    await this.driver.wait(async () => {
      try {
        const value = await this.getText(locator);
        return value.indexOf(text) !== -1;
      } catch (err) {
        return false;
      }
    }, timeout);
  };

  this.click = async (locator: LocatorObject) => {
    await this.waitForElement(locator);
    await this.waitEnable(locator);
    const clickable = await this.getElementBy(locator);
    await clickable.click();
  };

  this.input = async (locator: LocatorObject, value) => {
    const input = await this.getElementBy(locator);
    await input.sendKeys(value);
  };

  this.clearInput = async (locator: LocatorObject) => {
    const input = await this.getElementBy(locator);
    await input.clear();
  };

  this.clearInputUpdatingForm = async (locator: LocatorObject, textLength) => {
    const input = await this.getElementBy(locator);
    for (let i = 0; i < textLength; i++) {
      // eslint-disable-next-line no-await-in-loop
      await input.sendKeys(Key.BACK_SPACE);
    }
  };

  this.executeLocalStorageScript = script =>
    this.driver.executeScript(`return window.yoroi.api.localStorage.${script}`);

  this.getFromLocalStorage = async key => {
    const result = await this.executeLocalStorageScript(`getItem("${key}")`);
    return JSON.parse(result);
  };

  this.saveToLocalStorage = (key, value) =>
    this.executeLocalStorageScript(`setItem("${key}", '${JSON.stringify(value)}')`);

  this.intl = (key, lang = 'en-US') =>
    this.driver.executeScript((k, l) => window.yoroi.translations[l][k], key, lang);

  this.dropDB = () => this.driver.executeScript(() => window.yoroi.api.ada.dropDB());

  this.saveLastReceiveAddressIndex = index => {
    this.driver.executeScript(i => {
      const selected = window.yoroi.stores.wallets.selected;
      if (selected == null) throw new Error('executeScript no public deriver selected');
      window.yoroi.api.ada.saveLastReceiveAddressIndex({
        publicDeriver: selected,
        index: i,
      });
    }, index);
  };

  this.clickElementByQuery = async query => {
    await this.driver.executeScript(`document.querySelector('${query}').click()`);
  };

  this.checkIfExists = async (locator: LocatorObject) => {
    return await this.driver.findElement(getMethod(locator.method)(locator.locator)).then(
      () => true,
      err => {
        if (err instanceof error.NoSuchElementError) {
          return false;
        }
        promise.rejected(err); // some other error
      }
    );
  };

  this.customWaiter = async (
    condition,
    timeout = defaultWaitTimeout,
    repeatPeriod = defaultRepeatPeriod
  ) => {
    const endTime = Date.now() + timeout;

    while (endTime >= Date.now()) {
      if (condition()) return true;
      await this.driver.sleep(repeatPeriod);
    }
    return false;
  };

  // The method is for debugging
  this.highlightElement = async (element: WebElement) => {
    await this.driver.executeScript(
      "arguments[0].setAttribute('style', 'background: yellow; border: 2px solid red;');",
      element
    );
  };

  this.isDisplayed = async (locator: LocatorObject) => {
    const element = await this.driver.findElement(getMethod(locator.method)(locator.locator));

    return await element.isDisplayed();
  };

  this.findElement = async (locator: LocatorObject) =>
    await this.driver.findElement(getMethod(locator.method)(locator.locator));

  this.findElements = async (locator: LocatorObject) =>
    await this.driver.findElements(getMethod(locator.method)(locator.locator));

  this.hoverOnElement = async (locator: WebElement) => {
    const actions = this.driver.actions();
    await actions.move({ origin: locator }).perform();
  };
}

// no need to await
RustModule.load()
  .then(() => {
    setWorldConstructor(CustomWorld);
    setDefaultTimeout(30 * 1000);
    return undefined;
  })
  .catch();
