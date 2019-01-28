// @flow

import { setWorldConstructor, setDefaultTimeout } from 'cucumber';
import seleniumWebdriver, { By, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';
import path from 'path';

const fs = require('fs');

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

function getChromeBuilder() {
  return new seleniumWebdriver.Builder()
    .withCapabilities({
      chromeOptions: {
        args: [
          'start-maximized'
        ]
      }
    })
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addExtensions(path.resolve(__dirname, '../../yoroi-test.crx')));
}

function getFirefoxBuilder() {
  const profile = new firefox.Profile();

  /**
   * Firefox disallows unsigned extensions by default. We solve this through a config change
   * The proper way to do this is to use the "temporary addon" feature of Firefox
   * However, our version of selenium doesn't support this yet
   * The config is deprecated and may be removed in the future.
   */
  profile.setPreference('xpinstall.signatures.required', false);
  profile.setPreference('extensions.webextensions.uuids', firefoxUuidMapping);
  profile.addExtension(path.resolve(__dirname, '../../yoroi-test.xpi'));
  const options = new firefox.Options().setProfile(profile);

  return new seleniumWebdriver.Builder()
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
    browser: 'chrome' | 'firefox'
  }
};

// TODO: We should add methods to `this.driver` object, instead of use `this` directly
function CustomWorld(cmdInput: WorldInput) {
  const builder = cmdInput.parameters.browser === 'chrome'
    ? getChromeBuilder()
    : getFirefoxBuilder();
  this.driver = builder.build();

  this.getExtensionUrl = (): string => {
    if (cmdInput.parameters.browser === 'chrome') {
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
  this.getValue = this.driver.getValue =
    async (locator) => this.getElementBy(locator).getAttribute('value');

  this.waitForElementLocated = (locator, method = By.css) => {
    const isLocated = seleniumWebdriver.until.elementLocated(method(locator));
    return this.driver.wait(isLocated);
  };

  // Returns a promise that resolves to the element
  this.waitForElement = this.driver.waitForElement = async (locator, method = By.css) => {
    await this.waitForElementLocated(locator, method);
    const element = await this.getElementBy(locator, method);
    const condition = seleniumWebdriver.until.elementIsVisible(element);
    return this.driver.wait(condition);
  };

  this.waitElementTextMatches = async (regex, locator, method = By.css) => {
    await this.waitForElement(locator, method);
    const element = await this.getElementBy(locator, method);
    const condition = seleniumWebdriver.until.elementTextMatches(element, regex);
    await this.driver.wait(condition);
    return element;
  };

  this.waitForElementNotPresent = this.driver.waitForElementNotPresent =
    async (locator, method = By.css) => {
      await this.driver.wait(async () => {
        const elements = await this.getElementsBy(locator, method);
        return elements.length === 0;
      });
    };

  this.waitEnable = async (locator, method = By.css) => {
    const element = await this.getElementBy(locator, method);
    const condition = seleniumWebdriver.until.elementIsEnabled(element);
    return this.driver.wait(condition);
  };

  this.waitUntilText = async (locator, text, timeout = 60000) => {
    await this.driver.wait(async () => {
      try {
        const value = await this.getText(locator);
        return value === text;
      } catch (err) {
        return false;
      }
    }, timeout);
  };

  this.waitUntilContainsText = async (locator, text, timeout = 10000) => {
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

  this.executeLocalStorageScript = (script) => this.driver.executeScript(`return window.localStorage.${script}`);

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

  this.saveAddressesToDB = addresses => (
    this.driver.executeScript(addrs => {
      addrs.forEach(addr => window.yoroi.api.ada.saveAddress(addr, 'External'));
    }, addresses)
  );

  this.saveTxsToDB = transactions => {
    this.driver.executeScript(txs => {
      window.yoroi.api.ada.saveTxs(txs);
    }, transactions);
  };

  this.chooseFile = async (filePath, fileType) => {
    const certificateFileContent = fs.readFileSync(filePath);
    await this.driver.executeScript((fileContent, type) => {
      const content = new Uint8Array(fileContent.data);
      const certificate = new Blob([content], { type });
      window.yoroi.actions.ada.adaRedemption.setCertificate.trigger({ certificate });
    }, certificateFileContent, fileType);
  };

  this.enterPassphrase = async passphrase => {
    for (let i = 0; i < passphrase.length; i++) {
      const word = passphrase[i];
      await this.input('.AdaRedemptionForm_scrollableContent .pass-phrase input', word);
      await this.waitForElement(`//li[contains(text(), '${word}')]`, By.xpath);
      await this.click(`//li[contains(text(), '${word}')]`, By.xpath);
      await this.waitForElement(`//span[contains(text(), '${word}')]`, By.xpath);
    }
  };
}

setWorldConstructor(CustomWorld);
// I'm setting this timeout to 10 seconds as usually it takes about 5 seconds
// to startup
setDefaultTimeout(60 * 1000);
