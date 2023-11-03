// @flow

import { setWorldConstructor } from 'cucumber';
import { Builder, Key, until, error, promise, WebDriver, WebElement, logging } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import path from 'path';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { getMethod } from './helpers/helpers';
import { WebDriverError } from 'selenium-webdriver/lib/error';
import * as helpers from './helpers/helpers';
import {
  defaultWaitTimeout,
  defaultRepeatPeriod,
  halfSecond,
  quarterMinute,
  oneMinute,
} from './helpers/common-constants';

const fs = require('fs');

const firefoxBin = process.env.FIREFOX_BIN != null
  ? process.env.FIREFOX_BIN
  : '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox-bin';

function encode(file: any) {
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
 * Then we use Selenium to override the config to manually specify a fixed UUID
 */
const firefoxExtensionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const firefoxUuidMapping = `{"{530f7c6c-6077-4703-8f71-cb368c663e35}":"${firefoxExtensionId}"}`;

const prefs = new logging.Preferences();
prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

function getBraveBuilder() {
  return new Builder()
    .forBrowser('chrome')
    .setLoggingPrefs(prefs)
    .setChromeOptions(
      new chrome.Options()
        .setChromeBinaryPath('/usr/bin/brave-browser')
        .addArguments(
          '--no-sandbox', // Disables the sandbox for all process types that are normally sandboxed. Meant to be used as a browser-level switch for testing purposes only
          '--disable-gpu', // Disables GPU hardware acceleration. If software renderer is not in place, then the GPU process won't launch
          '--disable-dev-shm-usage', // The /dev/shm partition is too small in certain VM environments, causing Chrome to fail or crash
          '--disable-setuid-sandbox', // Disable the setuid sandbox (Linux only)
          '--start-maximized' // Starts the browser maximized, regardless of any previous settings
        )
        .addExtensions(encode(path.resolve(__dirname, '../../Yoroi-test.crx')))
  );
}

function getChromeBuilder() {
  return new Builder()
    .forBrowser('chrome')
    .setLoggingPrefs(prefs)
    .setChromeOptions(
      new chrome.Options()
        .addExtensions(encode(path.resolve(__dirname, '../../Yoroi-test.crx')))
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
    /**
     * For Firefox it is needed to use "Firefox for Developers" to load the unsigned extensions
     * Set the FIREFOX_DEV env variable to the "Firefix for Developers" executable
     */
    .setBinary(firefoxBin)
    .addExtensions(path.resolve(__dirname, '../../Yoroi.xpi'))
    /**
     * Firefox disallows unsigned extensions by default. We solve this through a config change
     * The proper way to do this is to use the "temporary addon" feature of Firefox
     * However, our version of selenium doesn't support this yet
     * The config is deprecated and may be removed in the future.
     */
    .setPreference('xpinstall.signatures.required', false)
    .setPreference('devtools.console.stdout.content', true)
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

export type HasDriver = { driver: WebDriver, ... };

function CustomWorld(this: any, cmdInput: WorldInput) {
  let builder;
  switch (cmdInput.parameters.browser) {
    case 'brave': {
      builder = getBraveBuilder();
      break;
    }
    case 'firefox': {
      builder = getFirefoxBuilder();
      break;
    }
    default: {
      builder = getChromeBuilder();
      break;
    }
  }
  this.driver = builder.build();
  this.getBrowser = (): string => cmdInput.parameters.browser;

  this._allLoggers = [];

  this.trezorController = undefined;

  this.windowManager = undefined;

  this.webDriverLogger = undefined;

  this.trezorEmuLogger = undefined;

  this.chromeExtIdUrl = `chrome-extension://bdlknlffjjmjckcldekkbejaogpkjphg`;

  this.firefoxExtIdUrl = `moz-extension://${firefoxExtensionId}`;

  this.addToLoggers = (logger: any) => {
    this._allLoggers.push(logger);
  } ;

  this.sendToAllLoggers = (message: string, level: string = 'info') => {
    for (const someLogger of this._allLoggers) {
      someLogger[level](message);
    }
  };

  this.getExtensionUrl = (): string => {
    if (cmdInput.parameters.browser === 'chrome' || cmdInput.parameters.browser === 'brave') {
      /**
       * Extension id is deterministically calculated based on pubKey used to generate the crx file
       * so we can just hardcode this value if we keep e2etest-key.pem file
       * https://stackoverflow.com/a/10089780/3329806
       */
      return `${this.chromeExtIdUrl}/main_window.html`;
    }
    return `${this.firefoxExtIdUrl}/main_window.html`;
  };

  this.getBackgroundUrl = (): string => {
    if (cmdInput.parameters.browser === 'chrome' || cmdInput.parameters.browser === 'brave') {
      return `${this.chromeExtIdUrl}/background.html`;
    }
    return `${this.firefoxExtIdUrl}/background.html`;
  };

  this.get = async (url: string) => {
    for (let i = 0; i < 6; i++) {
      try {
        await this.driver.get(url);
      } catch (e) {
        if (e instanceof WebDriverError) {
          this.webDriverLogger.info(`Webdriver: Caught the WebDriverError. Sleep for 0.5 second and retry`);
          await helpers.sleep(halfSecond);
          continue;
        }
      }
      break;
    }
  };

  this.getElementBy = (locator: LocatorObject) =>
    this.driver.findElement(getMethod(locator.method)(locator.locator));

  this.getElementsBy = (locator: LocatorObject) =>
    this.driver.findElements(getMethod(locator.method)(locator.locator));

  this.getText = (locator: LocatorObject) => this.getElementBy(locator).getText();

  this.getValue = async (locator: LocatorObject) =>
    this.getElementBy(locator).getAttribute('value');

  this.waitForElementLocated = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Waiting for element "${JSON.stringify(locator)}" to be located`);
    const isLocated = until.elementLocated(getMethod(locator.method)(locator.locator));
    return await this.driver.wait(isLocated);
  };

  // Returns a promise that resolves to the element
  this.waitForElement = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Waiting for element "${JSON.stringify(locator)}" to be visible`);
    await this.waitForElementLocated(locator);
    const element = await this.getElementBy(locator);
    const condition = until.elementIsVisible(element);
    return this.driver.wait(condition);
  };

  this.waitElementTextMatches = async (regex, locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Waiting for text on element "${locator.locator}" matches "${regex}"`);
    await this.waitForElement(locator);
    const element = await this.getElementBy(locator);
    const condition = until.elementTextMatches(element, regex);
    await this.driver.wait(condition);
    return element;
  };

  this.waitForElementNotPresent = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Waiting for element "${JSON.stringify(locator)}" not present`);
    await this.driver.wait(async () => {
      const elements = await this.getElementsBy(locator);
      return elements.length === 0;
    });
  };

  this.waitEnable = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Waiting until "${JSON.stringify(locator)}" is enabled`);
    const element = await this.getElementBy(locator);
    const condition = until.elementIsEnabled(element);
    return this.driver.wait(condition);
  };

  this.waitDisable = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Waiting Until "${JSON.stringify(locator)}" is disabled`);
    const element = await this.getElementBy(locator);
    const condition = until.elementIsDisabled(element);
    return this.driver.wait(condition);
  };

  this.waitUntilText = async (
    locator: LocatorObject,
    text,
    timeout = oneMinute + quarterMinute
  ) => {
    this.webDriverLogger.info(`Webdriver: Waiting Until "${JSON.stringify(locator)}" contains "${text}"`);
    await this.driver.wait(async () => {
      try {
        const value = await this.getText(locator);
        return value === text;
      } catch (err) {
        return false;
      }
    }, timeout);
  };

  this.waitUntilContainsText = async (locator: LocatorObject, text, timeout = quarterMinute) => {
    this.webDriverLogger.info(`Webdriver: Waiting for "${JSON.stringify(locator)}" to contain text "${text}"`);
    await this.driver.wait(async () => {
      try {
        const value = await this.getText(locator);
        return value.indexOf(text) !== -1;
      } catch (err) {
        return false;
      }
    }, timeout);
  };

  this.scrollIntoView = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Scroll into view "${JSON.stringify(locator)}"`);
    await this.waitForElement(locator);
    const clickable = await this.getElementBy(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView()', clickable);
  };


  this.click = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Clicking on "${JSON.stringify(locator)}"`);
    await this.waitForElement(locator);
    await this.waitEnable(locator);
    const clickable = await this.getElementBy(locator);
    await clickable.click();
  };

  this.input = async (locator: LocatorObject, value) => {
    this.webDriverLogger.info(`Webdriver: Input "${value}" into "${JSON.stringify(locator)}"`);
    const input = await this.getElementBy(locator);
    await input.sendKeys(value);
  };

  this.clearInput = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Clearing Input for "${JSON.stringify(locator)}"`);
    const input = await this.getElementBy(locator);
    await input.clear();
  };

  this.clearInputUpdatingForm = async (locator: LocatorObject, textLength) => {
    this.webDriverLogger.info(`Webdriver: Clearing Input Updating Form for "${JSON.stringify(locator)}"`);
    const input = await this.getElementBy(locator);
    for (let i = 0; i < textLength; i++) {
      // eslint-disable-next-line no-await-in-loop
      await input.sendKeys(Key.BACK_SPACE);
    }
  };

  this.executeLocalStorageScript = script => {
    this.webDriverLogger.info(`Webdriver: Executing Local Storage Script`);
    return this.driver.executeScript(`return window.yoroi.api.localStorage.${script}`);
  };

  this.getFromLocalStorage = async key => {
    this.webDriverLogger.info(`Webdriver: Getting item "${key}" from Local Storage`);
    const result = await this.executeLocalStorageScript(`getItem("${key}")`);
    this.webDriverLogger.info(`Webdriver: Result ${JSON.stringify(result)}`);
    return JSON.parse(result);
  };

  this.saveToLocalStorage = (key, value) => {
    this.webDriverLogger.info(`Webdriver: Saving to Local Storage key: "${key}", value: "${value}"`);
    this.executeLocalStorageScript(`setItem("${key}", '${JSON.stringify(value)}')`);
  };

  this.intl = (key, lang = 'en-US') =>
    this.driver.executeAsyncScript(
      (k, l, callback) => {
        window.yoroi.translations[l]
          .then(translation => callback(translation[k]))
          .catch(e => {
            // eslint-disable-next-line no-console
            console.error('Intl fail: ', e);
          });
      },
      key,
      lang
    );

  this.dropDB = () => this.driver.executeScript(() => window.yoroi.api.ada.dropDB());

  this.saveLastReceiveAddressIndex = index => {
    this.webDriverLogger.info(`Webdriver: Saving last Receive Address Index`);
    this.driver.executeScript(i => {
      const selected = window.yoroi.stores.wallets.selected;
      if (selected == null) throw new Error('executeScript no public deriver selected');
      window.yoroi.api.ada.saveLastReceiveAddressIndex({
        publicDeriver: selected,
        index: i,
      });
    }, index);
  };

  this.clickByScript = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Clicking with executeScript on "${JSON.stringify(locator)}"`);
    const element = await this.getElementBy(locator);
    await this.driver.executeScript(`arguments[0].click()`, element);
  };

  this.checkIfExists = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Checking if element exists "${JSON.stringify(locator)}"`);
    const state = this.driver
      .findElement(getMethod(locator.method)(locator.locator))
      .then(
        (response) => {
          this.webDriverLogger.info(`Webdriver:checkIfExists: Response is received: ${response}`);
          this.webDriverLogger.info(`Webdriver:checkIfExists: The element "${JSON.stringify(locator)}" exists`);
          return true;
        },
        (err) => {
          if (err instanceof error.NoSuchElementError) {
            this.webDriverLogger.info(`Webdriver:checkIfExists: The element "${JSON.stringify(locator)}" does not exists`);
            return false;
          }
          promise.rejected(err); // some other error
        }
      ).catch(
        (err) => {
          if (err instanceof error.NoSuchElementError){
            this.webDriverLogger.info(`Webdriver:checkIfExists: The element "${JSON.stringify(locator)}" does not exists`);
            return false;
          }
          throw(err)
        }
      )

    return state;
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
    this.webDriverLogger.info(`Webdriver: Highlighting element "${JSON.stringify(element)}"`);
    await this.driver.executeScript(
      "arguments[0].setAttribute('style', 'background: yellow; border: 2px solid red;');",
      element
    );
  };

  this.isDisplayed = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver: Checking if element "${JSON.stringify(locator)}" is displayed`);
    const element = await this.driver.findElement(getMethod(locator.method)(locator.locator));

    return await element.isDisplayed();
  };

  this.findElement = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver:findElement: Finding element "${JSON.stringify(locator)}"`);

    return await this.driver.findElement(getMethod(locator.method)(locator.locator));
  }

  this.findElements = async (locator: LocatorObject) => {
    this.webDriverLogger.info(`Webdriver:findElements: Finding elements "${JSON.stringify(locator)}"`);

    return await this.driver.findElements(getMethod(locator.method)(locator.locator));
  }

  this.hoverOnElement = async (locator: WebElement) => {
    this.webDriverLogger.info(`Webdriver:hoverOnElement: Hovering on element "${JSON.stringify(locator)}"`);
    const actions = this.driver.actions();
    await actions.move({ origin: locator }).perform();
  };

  this.getInfoFromIndexedDB = async (tableName: string) => {
    if (this.getBrowser() === 'firefox') {
      return await this.getInfoFromIndexedDBFF(tableName);
    }
    return await this.getInfoFromIndexedDBChrome(tableName);
  };

  this.getInfoFromIndexedDBFF = async (tableName: string) => {
    await this.driver.executeScript((dbName, table) => {
      const dbRequest = window.indexedDB.open(dbName);
      dbRequest.onsuccess = function (event) {
          const db = event.target.result;
          const tableContentRequest = db
            .transaction(table, 'readonly')
            .objectStore(table)
            .getAll();
            // eslint-disable-next-line no-shadow
            tableContentRequest.onsuccess = function (event) {
              window.tableData = event.target.result;
            }
      }
    },
      'yoroi-schema',
      tableName
    );
    let tableContent;
    try {
      tableContent = await this.driver.executeScript(() => window.tableData);
    // eslint-disable-next-line no-shadow
    } catch (error) {
      this.webDriverLogger.warn(error);
      tableContent = {};
    }

    return tableContent;
  };

  this.getInfoFromIndexedDBChrome = async (tableName: string) => {
    await this.driver.executeScript(() => {
      window.allDBsPromise = window.indexedDB.databases();
    });

    const allDBs = await this.driver.executeAsyncScript((...args) => {
      const callback = args[args.length - 1];
      window.allDBsPromise
        .then(response => callback(response))
        .catch(err => callback(err));
    });
    const { name, version } = allDBs[0];

    await this.driver.executeScript((dbName, dbVersion, table) => {
      const request = window.indexedDB.open(dbName, dbVersion);
      request.onsuccess = function (event) {
          const db = event.target.result;
          const tableContentRequest = db
            .transaction(table, 'readonly')
            .objectStore(table)
            .getAll();
            // eslint-disable-next-line no-shadow
            tableContentRequest.onsuccess = function (event) {
              window.tableData = event.target.result;
            }
      }
    },
      name,
      version,
      tableName
    );
    let tableContent;
    try {
      tableContent = await this.driver.executeScript(() => window.tableData);
    // eslint-disable-next-line no-shadow
    } catch (error) {
      this.webDriverLogger.warn(error);
      tableContent = {};
    }

    return tableContent;
  };
}

// no need to await
RustModule.load()
  .then(() => {
    setWorldConstructor(CustomWorld);
    return undefined;
  })
  .catch();
