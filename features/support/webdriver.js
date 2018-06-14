import { setWorldConstructor, setDefaultTimeout } from 'cucumber';
import seleniumWebdriver, { By } from 'selenium-webdriver';
import path from 'path';

function CustomWorld() {
  const extPath = path.resolve('dev');

  this.driver = new seleniumWebdriver.Builder()
    .withCapabilities({
      chromeOptions: {
        args: [
          `load-extension=${extPath}`,
          'start-maximized'
        ]
      }
    })
    .forBrowser('chrome')
    .build();

  // Returns a promise that resolves to the element
  this.waitForElement = (locator, method = By.css) => {
    const condition = seleniumWebdriver.until.elementLocated(method(locator));
    return this.driver.wait(condition);
  };

  this.waitForContent = (locator) => {
    return this.waitForElement(locator, By.xpath);
  };

  this.waitEnable = async (locator) => {
    const element = this.getElementBy(locator);
    const condition = seleniumWebdriver.until.elementIsEnabled(element);
    return this.driver.wait(condition);
  };

  this.getElementBy = (locator, method = By.css) => this.driver.findElement(method(locator));

  this.getText = async (locator) => this.getElementBy(locator).getText();

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

  const executeLocalStorageScript = (script) => this.driver.executeScript(`return window.localStorage.${script}`);

  this.getFromLocalStorage = async (key) => {
    const result = await executeLocalStorageScript(`getItem("${key}")`);
    return JSON.parse(result);
  };

  this.saveToLocalStorage = (key, value) => executeLocalStorageScript(`setItem("${key}", '${JSON.stringify(value)}')`);
}

setWorldConstructor(CustomWorld);
// I'm setting this timeout to 10 seconds as usually it takes about 5 seconds
// to startup
setDefaultTimeout(60 * 10000);
