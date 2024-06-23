import { getBuilder } from './driverBootstrap.js';
import { getTargetBrowser, getTestLogger } from './utils.js';
import { TargetBrowser } from '../helpers/constants.js';
import BasePage from '../pages/basepage.js';
import InitialStepsPage from '../pages/initialSteps.page.js';
import { defaultWaitTimeout } from '../helpers/timeConstants.js';

let instance = null;
let poolOfDrivers = [];
let driverGlobalCounter = 0;

class DriversManager {
  constructor() {
    if (instance) {
      throw new Error('New instance cannot be created!');
    }

    instance = this;
    this.logger = getTestLogger(`DriversManager_${Date.now()}`, 'DriversManager');
  }

  buildDriver() {
    this.logger.info(`DriversManager::buildDriver Building a new driver`);
    const driver = getBuilder().build();
    driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
    if (getTargetBrowser() === TargetBrowser.FF) {
      driver.manage().window().maximize();
    }
    return driver;
  }

  addNewDriverToPool() {
    const newDriver = this.buildDriver();
    driverGlobalCounter++;
    const driverObject = {
      driver: newDriver,
      driverId: driverGlobalCounter,
    };
    poolOfDrivers.push(driverObject);

    this.logger.info(
      `DriversManager::addNewDriverToPool A new driver is added. Driver ID: ${driverGlobalCounter}`
    );
    return driverObject;
  }

  createPoolOfDrivers(driversAmount) {
    this.logger.info(
      `DriversManager::createPoolOfDrivers. Creating pool of driver. Drivers amount ${driversAmount}`
    );
    for (let index = 0; index < driversAmount; index++) {
      this.addNewDriverToPool();
    }
  }

  async prepareExtension(driverObject) {
    this.logger.info(`DriversManager::prepareExtension driver ID ${driverObject.driverId}`);
    const logger = getTestLogger(`DriversManager_Page_${Date.now()}`, 'DriversManager');
    const basePage = new BasePage(driverObject.driver, logger);
    await basePage.goToExtension();
    const initialStepsPage = new InitialStepsPage(driverObject.driver, logger);
    return initialStepsPage.skipInitialSteps();
  }

  prepareExtensions() {
    const prepExtPromisesArr = [];
    this.logger.info(`DriversManager::prepareExtensions Amount of drivers ${poolOfDrivers.length}`);
    for (const driverObject of poolOfDrivers) {
      prepExtPromisesArr.push(this.prepareExtension(driverObject));
    }
    Promise.all(prepExtPromisesArr);
  }

  getDriverFromPool() {
    const driverObject = poolOfDrivers.shift();
    this.logger.info(`DriversManager::getDriverFromPool Returning driver ${driverObject.driverId}`);
    const newDriverObject = this.addNewDriverToPool();
    this.prepareExtension(newDriverObject);

    return driverObject.driver;
  }

  async closeAllUnused() {
    for (const driverObject of poolOfDrivers) {
      this.logger.info(`DriversManager::closeAllUnused. Closing driver ${driverObject.driverId}`);
      await driverObject.driver.quit();
    }
  }
}

const driversPoolsManager = Object.freeze(new DriversManager());

export default driversPoolsManager;
