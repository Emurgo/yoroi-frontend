import { Builder, logging } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  chromeExtIdUrl,
  firefoxBin,
  firefoxExtIdUrl,
  firefoxUuidMapping,
  TargetBrowser,
} from '../helpers/constants.js';
import { getDownloadsDir, getTargetBrowser, isBrave, isChrome, isFirefox } from './utils.js';

const prefs = new logging.Preferences();
prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __projectRoot = path.resolve(__dirname, '../..');
const __extensionDir = path.resolve(__projectRoot, 'yoroi-extension');

export const getExtensionUrl = () => {
  if (isChrome() || isBrave()) {
    /**
     * Extension id is deterministically calculated based on pubKey used to generate the crx file
     * so we can just hardcode this value if we keep e2etest-key.pem file
     * https://stackoverflow.com/a/10089780/3329806
     */
    return `${chromeExtIdUrl}/main_window.html`;
  }
  return `${firefoxExtIdUrl}/main_window.html`;
};

// builders
const getBraveBuilder = () => {
  return new Builder()
    .forBrowser(TargetBrowser.Chrome)
    .setLoggingPrefs(prefs)
    .setChromeOptions(
      new chrome.Options()
        .setChromeBinaryPath('/usr/bin/brave-browser')
        .addArguments(
          '--no-sandbox', // Disables the sandbox for all process types that are normally sandboxed. Meant to be used as a browser-level switch for testing purposes only
          '--disable-gpu', // Disables GPU hardware acceleration. If software renderer is not in place, then the GPU process won't launch
          '--disable-dev-shm-usage', // The /dev/shm partition is too small in certain VM environments, causing Chrome to fail or crash
          '--disable-setuid-sandbox', // Disable the setuid sandbox (Linux only)
          '--start-maximized', // Starts the browser maximized, regardless of any previous settings
          '--headless=new', // Runs the browser in the headless mode
        )
        .addExtensions(path.resolve(__extensionDir, 'Yoroi-test.crx'))
    );
};

const getChromeBuilder = () => {
  const downloadsDir = getDownloadsDir();
  return new Builder()
    .forBrowser(TargetBrowser.Chrome)
    .setLoggingPrefs(prefs)
    .setChromeOptions(
      new chrome.Options()
        .addExtensions(path.resolve(__extensionDir, 'Yoroi-test.crx'))
        .addArguments(
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--start-maximized',
          // '--headless=new', // Runs the browser in the headless mode
        )
        .setUserPreferences({ 'download.default_directory': downloadsDir })
    );
};

const getFirefoxBuilder = () => {
  const downloadsDir = getDownloadsDir();
  const options = new firefox.Options()
    // .addArguments('--headless') // Runs the browser in the headless mode
    /**
     * For Firefox it is needed to use "Firefox for Developers" to load the unsigned extensions
     * Set the FIREFOX_BIN env variable to the "Firefox for Developers" executable
     */
    .setBinary(firefoxBin)
    /**
     * Firefox disallows unsigned extensions by default. We solve this through a config change
     * The proper way to do this is to use the "temporary addon" feature of Firefox
     * However, our version of selenium doesn't support this yet
     * The config is deprecated and may be removed in the future.
     */
    .setPreference('xpinstall.signatures.required', false)
    .setPreference('devtools.console.stdout.content', true)
    .setPreference('extensions.webextensions.uuids', firefoxUuidMapping)
    .setPreference('browser.download.folderList', 2)
    .setPreference('browser.download.manager.showWhenStarting', false)
    .setPreference('browser.download.dir', downloadsDir)
    .setPreference(
      'browser.helperApps.neverAsk.saveToDisk',
      'application/csv, text/csv, application/pdfss, text/csv, application/excel'
    )
    .setPreference('browser.download.manager.showAlertOnComplete', false)
    .addExtensions(path.resolve(__extensionDir, 'Yoroi.xpi'));

  return new Builder()
    .withCapabilities({
      chromeOptions: {
        args: ['start-maximized'],
      },
    })
    .forBrowser(TargetBrowser.FF)
    .setFirefoxOptions(options);
};

// getting a builder according to a set browser
export const getBuilder = () => {
  switch (getTargetBrowser()) {
    case TargetBrowser.Brave: {
      return getBraveBuilder();
    }
    case TargetBrowser.FF: {
      return getFirefoxBuilder();
    }
    default: {
      return getChromeBuilder();
    }
  }
};
// getting a driver
export const getDriver = () => {
  const driver = getBuilder().build();
  driver.manage().setTimeouts({ implicit: 10000 });
  if (isFirefox()) {
    driver.manage().window().maximize();
  }
  return driver;
};
