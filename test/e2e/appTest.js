import path from 'path';
import webdriver from 'selenium-webdriver';
import { startChromeDriver, buildWebDriver } from '../func';
import manifest from '../../chrome/manifest.prod.json';

const extensionName = manifest.name;

describe('window (popup) page', function test() {
  let driver;
  this.timeout(15000);

  before(async () => {
    await startChromeDriver();
    const extPath = path.resolve('build');
    driver = buildWebDriver(extPath);
    await driver.get('chrome://extensions-frame');
    const elems = await driver.findElements(webdriver.By.xpath(
      '//div[contains(@class, "extension-list-item-wrapper") and ' +
      `.//h2[contains(text(), "${extensionName}")]]`
    ));
    const extensionId = await elems[0].getAttribute('id');
    await driver.get(`chrome-extension://${extensionId}/window.html`);
  });

  after(async () => driver.quit());
});
