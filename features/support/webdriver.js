import { setWorldConstructor, setDefaultTimeout } from 'cucumber';
import seleniumWebdriver, { By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import path from 'path';

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
    .setChromeOptions(new chrome.Options().addExtensions(path.resolve(__dirname, '../../icarus-light-cardano-wallet-poc-test.crx')))
    .build();

  // Returns a promise that resolves to the element
  // FIXME: We should move this to driver object, not `this`
  this.waitForElement = this.driver.waitForElement = (locator, method = By.css) => {
    const condition = seleniumWebdriver.until.elementLocated(method(locator));
    return this.driver.wait(condition);
  };

  // FIXME: We should move this to driver object, not `this`
  this.waitForElementNotPresent = this.driver.waitForElementNotPresent =
    async (locator, method = By.css) => {
      await this.driver.wait(async () => {
        const elements = await this.getElementsBy(locator, method);
        return elements.length === 0;
      });
    };

  this.waitForContent = (locator) => this.waitForElement(locator, By.xpath);

  this.waitEnable = async (locator) => {
    const element = this.getElementBy(locator);
    const condition = seleniumWebdriver.until.elementIsEnabled(element);
    return this.driver.wait(condition);
  };

  this.getElementBy = (locator, method = By.css) => this.driver.findElement(method(locator));
  this.getElementsBy = (locator, method = By.css) => this.driver.findElements(method(locator));

  this.getText = (locator) => this.getElementBy(locator).getText();

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

  this.getValue = this.driver.getValue = async (locator) => this.getElementBy(locator).getAttribute('value');

  const clickElement = async (locator, method) => {
    const clickable = await this.getElementBy(locator, method);
    await clickable.click();
  };

  this.click = async (locator) => {
    await clickElement(locator);
  };

  this.clickByXpath = async (locator) => {
    await clickElement(locator, By.xpath);
  };

  this.input = async (locator, value) => {
    const input = await this.getElementBy(locator);
    await input.sendKeys(value);
  };

  this.clearInput = async (locator) => {
    const input = await this.getElementBy(locator);
    await input.clear();
  };

  this.executeLocalStorageScript = (script) => this.driver.executeScript(`return window.localStorage.${script}`);

  this.getFromLocalStorage = async (key) => {
    const result = await this.executeLocalStorageScript(`getItem("${key}")`);
    return JSON.parse(result);
  };

  this.saveToLocalStorage = (key, value) => this.executeLocalStorageScript(`setItem("${key}", '${JSON.stringify(value)}')`);

  this.intl = (key, lang = 'en-US') =>
    this.driver.executeScript((k, l) =>
        window.icarus.translations[l][k]
    , key, lang);

  this.saveAddressesToDB = addresses =>
    this.driver.executeScript(addrs => {
      addrs.forEach(addr => window.icarus.api.ada.saveAddress(addr, 'External'));
    }, addresses);
}

setWorldConstructor(CustomWorld);
// I'm setting this timeout to 10 seconds as usually it takes about 5 seconds
// to startup
setDefaultTimeout(60 * 1000);
