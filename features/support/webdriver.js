import { setWorldConstructor, setDefaultTimeout } from 'cucumber';
import seleniumWebdriver, { By, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import path from 'path';

// FIXME: We should add methods to `this.driver` object, instead of use `this` directly
function CustomWorld() {
  this.driver = new seleniumWebdriver.Builder()
    .withCapabilities({
      chromeOptions: {
        args: [
          'start-maximized'
        ]
      }
    })
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addExtensions(path.resolve(__dirname, '../../yoroi-light-cardano-wallet-poc-test.crx')))
    .build();

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
      await input.sendKeys(Key.BACK_SPACE);
    }
  };

  this.executeLocalStorageScript = (script) => this.driver.executeScript(`return window.localStorage.${script}`);

  this.getFromLocalStorage = async (key) => {
    const result = await this.executeLocalStorageScript(`getItem("${key}")`);
    return JSON.parse(result);
  };

  this.saveToLocalStorage = (key, value) => this.executeLocalStorageScript(`setItem("${key}", '${JSON.stringify(value)}')`);

  this.intl = (key, lang = 'en-US') =>
    this.driver.executeScript((k, l) =>
        window.yoroi.translations[l][k]
    , key, lang);

  this.saveAddressesToDB = addresses =>
    this.driver.executeScript(addrs => {
      addrs.forEach(addr => window.yoroi.api.ada.saveAddress(addr, 'External'));
    }, addresses);

  this.saveTxsToDB = transactions => {
    this.driver.executeScript(txs => {
      window.yoroi.api.ada.saveTxs(txs);
    }, transactions);
  };
}

setWorldConstructor(CustomWorld);
// I'm setting this timeout to 10 seconds as usually it takes about 5 seconds
// to startup
setDefaultTimeout(60 * 1000);
