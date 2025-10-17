import { Builder, logging, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromeBin, chromeExtIdUrl } from '../helpers/constants.js';
import { getDownloadsDir, isHeadless, isTrezorTests } from './utils.js';
import { defaultWaitTimeout } from '../helpers/timeConstants.js';
import * as chromeDriver from 'chromedriver';

const prefs = new logging.Preferences();
prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
prefs.setLevel(logging.Type.DRIVER, logging.Level.INFO);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __projectRoot = path.resolve(__dirname, '../..');
const __extensionDir = path.resolve(__projectRoot, 'yoroi-extension');

export const getExtensionUrl = () => `${chromeExtIdUrl}/main_window.html`;

export const getTransactionsURL = () => `${getExtensionUrl()}#/wallets/transactions`;

// builders
const getChromeBuilder = () => {
  const downloadsDir = getDownloadsDir();
  const chromeServiceBuilder = new chrome.ServiceBuilder(chromeDriver.path);
  const chromeOpts = new chrome.Options({
    'goog:chromeOptions': {
      enableExtensionTargets: true,
    },
  })
    .setChromeBinaryPath(chromeBin)
    .addExtensions(path.resolve(__extensionDir, 'Yoroi-test.crx'))
    .addArguments('--disable-dev-shm-usage')
    .addArguments('--no-sandbox')
    .addArguments('--disable-gpu')
    .addArguments('--disable-setuid-sandbox')
    .addArguments('--start-maximized')
    .addArguments('--remote-debugging-pipe')
    .setUserPreferences({
      'download.default_directory': downloadsDir,
      'profile.content_settings.exceptions.clipboard': {
        '*': { last_modified: Date.now(), setting: 1 },
      },
      'profile.default_content_setting_values.notifications': 1, // allow notification
    })
    .addArguments('disable-infobars')
    .addArguments('--enable-clipboard');
  if (isHeadless()) {
    chromeOpts.addArguments('--headless=new');
  }
  if (isTrezorTests()) {
    chromeOpts.addArguments('--disable-web-security');
  }
  return new Builder()
    .forBrowser('chrome')
    .setLoggingPrefs(prefs)
    .setChromeOptions(chromeOpts)
    .setChromeService(chromeServiceBuilder);
};

/**
 * Getting a driver object
 * @param {number} maxAttempts number of attempts to create a driver
 * @param {number} retryDelay Delay between attempts to create a driver in milliseconds
 * @returns {WebDriver}
 */
export const getDriver = (maxAttempts = 3, retryDelay = 2000) => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const driver = getChromeBuilder().build();
      driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
      driver.manage().window().setRect({ width: 1440, height: 900 });

      return driver;
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') && attempts < maxAttempts - 1) {
        console.error(`Connection error (attempt ${attempts + 1}):`, error.message);
        const sleepPromise = new Promise(resolve => setTimeout(resolve, retryDelay));
        sleepPromise.then(() => console.log('Waited for 2 seconds'));
        attempts++;
      } else {
        console.error('No success to run the driver after all attempts:', error);
        throw error;
      }
    }
  }
  throw new Error('Not able to get a driver. All attempts exhausted');
};
