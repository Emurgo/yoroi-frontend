// @flow

import { setWorldConstructor, setDefaultTimeout } from 'cucumber';
import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import path from 'path';

const fs = require('fs');

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

function getBraveBuilder() {
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options()
      .setChromeBinaryPath('/usr/bin/brave-browser')
      .addArguments(
        '--start-maximized',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      )
      .addExtensions(encode(path.resolve(__dirname, '../../yoroi-test.crx'))));
}

function getChromeBuilder() {
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options()
      .addExtensions(encode(path.resolve(__dirname, '../../yoroi-test.crx')))
      .addArguments(
        '--start-maximized',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ));
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
        args: [
          'start-maximized'
        ]
      }
    })
    .forBrowser('firefox')
    .setFirefoxOptions(options);
}

type WorldInput = {
  parameters: {
    browser: 'brave' | 'chrome' | 'firefox'
  }
};

// TODO: We should add methods to `this.driver` object, instead of use `this` directly
function CustomWorld(cmdInput: WorldInput) {
  switch (cmdInput.parameters.browser) {
    case 'brave': {
      const braveBuilder = getBraveBuilder();
      this.driver = braveBuilder.build();
      break;
    }
    case 'firefox': {
      const firefoxBuilder = getFirefoxBuilder();
      this.driver = firefoxBuilder.build();
      break;
    }
    default: {
      const chromeBuilder = getChromeBuilder();
      this.driver = chromeBuilder.build();
      break;
    }
  }

  this.getBrowser = (): string => cmdInput.parameters.browser;

  this.getExtensionUrl = (): string => {
    if (cmdInput.parameters.browser === 'chrome' || cmdInput.parameters.browser === 'brave') {
      /**
       * Extension id is determinisitically calculated based on pubKey used to generate the crx file
       * so we can just hardcode this value if we keep e2etest-key.pem file
       * https://stackoverflow.com/a/10089780/3329806
       */
      return 'chrome-extension://bdlknlffjjmjckcldekkbejaogpkjphg/main_window.html';
    }
    return `moz-extension://${firefoxExtensionId}/main_window.html`;
  };

  this.getElementBy = (locator, method = By.css) => this.driver.findElement(method(locator));
  this.getElementsBy = (locator, method = By.css) => this.driver.findElements(method(locator));
  this.getText = (locator) => this.getElementBy(locator).getText();
  // $FlowFixMe Flow doesn't like that we add a new function to driver
  this.getValue = this.driver.getValue =
    async (locator) => this.getElementBy(locator).getAttribute('value');

  this.waitForElementLocated = (locator, method = By.css) => {
    const isLocated = until.elementLocated(method(locator));
    return this.driver.wait(isLocated);
  };

  // Returns a promise that resolves to the element
  // $FlowFixMe Flow doesn't like that we add a new function to driver
  this.waitForElement = this.driver.waitForElement = async (locator, method = By.css) => {
    await this.waitForElementLocated(locator, method);
    const element = await this.getElementBy(locator, method);
    const condition = until.elementIsVisible(element);
    return this.driver.wait(condition);
  };

  this.waitElementTextMatches = async (regex, locator, method = By.css) => {
    await this.waitForElement(locator, method);
    const element = await this.getElementBy(locator, method);
    const condition = until.elementTextMatches(element, regex);
    await this.driver.wait(condition);
    return element;
  };

  // $FlowFixMe Flow doesn't like that we add a new function to driver
  this.waitForElementNotPresent = this.driver.waitForElementNotPresent =
    async (locator, method = By.css) => {
      await this.driver.wait(async () => {
        const elements = await this.getElementsBy(locator, method);
        return elements.length === 0;
      });
    };

  this.waitEnable = async (locator, method = By.css) => {
    const element = await this.getElementBy(locator, method);
    const condition = until.elementIsEnabled(element);
    return this.driver.wait(condition);
  };

  this.waitDisable = async (locator, method = By.css) => {
    const element = await this.getElementBy(locator, method);
    const condition = until.elementIsDisabled(element);
    return this.driver.wait(condition);
  };

  this.waitUntilText = async (locator, text, timeout = 75000) => {
    await this.driver.wait(async () => {
      try {
        const value = await this.getText(locator);
        return value === text;
      } catch (err) {
        return false;
      }
    }, timeout);
  };

  this.waitUntilContainsText = async (locator, text, timeout = 15000) => {
    await this.driver.wait(async () => {
      try {
        const value = await this.getText(locator);
        return value.indexOf(text) !== -1;
      } catch (err) {
        return false;
      }
    }, timeout);
  };

  this.click = async (locator, method = By.css) => {
    await this.waitForElement(locator, method);
    await this.waitEnable(locator, method);
    const clickable = await this.getElementBy(locator, method);
    await clickable.click();
  };

  this.input = async (locator, value) => {
    const input = await this.getElementBy(locator);
    await input.sendKeys(value);
  };

  this.clearInput = async (locator) => {
    const input = await this.getElementBy(locator);
    await input.clear();
  };

  this.clearInputUpdatingForm = async (locator, textLength) => {
    const input = await this.getElementBy(locator);
    for (let i = 0; i < textLength; i++) {
      // eslint-disable-next-line no-await-in-loop
      await input.sendKeys(Key.BACK_SPACE);
    }
  };

  this.executeLocalStorageScript = (script) => this.driver.executeScript(`return window.yoroi.api.localStorage.${script}`);

  this.getFromLocalStorage = async (key) => {
    const result = await this.executeLocalStorageScript(`getItem("${key}")`);
    return JSON.parse(result);
  };

  this.saveToLocalStorage = (key, value) => this.executeLocalStorageScript(`setItem("${key}", '${JSON.stringify(value)}')`);

  this.intl = (key, lang = 'en-US') => (
    this.driver.executeScript(
      (k, l) => window.yoroi.translations[l][k],
      key,
      lang
    )
  );

  this.dropDB = () => (
    this.driver.executeScript(() => window.yoroi.api.ada.dropDB())
  );

  this.saveLastReceiveAddressIndex = index => {
    this.driver.executeScript(i => {
      const selected = window.yoroi.stores.substores.ada.wallets.selected;
      if (selected == null) throw new Error('executeScript no public deriver selected');
      window.yoroi.api.ada.saveLastReceiveAddressIndex({
        publicDeriver: selected.self,
        index: i,
      });
    }, index);
  };
}

setWorldConstructor(CustomWorld);
setDefaultTimeout(60 * 1000);
