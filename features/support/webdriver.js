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
  this.waitForElement = (locator) => {
    const condition = seleniumWebdriver.until.elementLocated(By.css(locator));
    return this.driver.wait(condition);
  };

  this.getElement = (locator) => {
    return this.driver.findElement(By.css(locator));
  };
}

setWorldConstructor(CustomWorld);
// I'm setting this timeout to 10 seconds as usually it takes about 5 seconds
// to startup
setDefaultTimeout(60 * 10000);
