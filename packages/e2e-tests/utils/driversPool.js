import { getBuilder } from './driverBootstrap.js';
import { getTargetBrowser, getTestLogger } from './utils.js';
import { TargetBrowser } from '../helpers/constants.js';
import BasePage from '../pages/basepage.js';
import InitialStepsPage from '../pages/initialSteps.page.js';
import { defaultWaitTimeout } from '../helpers/timeConstants.js';

let instance = null;
let poolOfDrivers = [];

class DriversManager {
  constructor() {
    if (instance) {
      throw new Error('New instance cannot be created!');
    }

    instance = this;
  }

  buildDriver() {
    const driver = getBuilder().build();
    driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
    if (getTargetBrowser() === TargetBrowser.FF) {
      driver.manage().window().maximize();
    }
    return driver;
  }

  addNewDriverToPool() {
    const newDriver = this.buildDriver();
    poolOfDrivers.push(newDriver);

    return newDriver;
  }

  createPoolOfDrivers(driversAmount) {
    for (let index = 0; index < driversAmount; index++) {
      this.addNewDriverToPool();
    }
  }

  async prepareExtension(driver) {
    const logger = getTestLogger(`DriversManager_${Date.now()}`, 'DriversManager');
    const basePage = new BasePage(driver, logger);
    await basePage.goToExtension();
    const initialStepsPage = new InitialStepsPage(driver, logger);
    return initialStepsPage.skipInitialSteps();
  }

  prepareExtensions() {
    const prepExtPromisesArr = [];
    for (const driver of poolOfDrivers) {
      prepExtPromisesArr.push(this.prepareExtension(driver));
    }
    Promise.all(prepExtPromisesArr);
  }

  getDriverFromPool() {
    const driver = poolOfDrivers.shift();
    const newDriver = this.addNewDriverToPool();
    this.prepareExtension(newDriver);

    return driver;
  }

  async closeAllUnused() {
    for (const driver of poolOfDrivers) {
      await driver.quit();
    }
  }
}

const driversPoolsManager = Object.freeze(new DriversManager());

export default driversPoolsManager;
