import { getDriver } from './driverBootstrap.js';
import { getTestLogger } from './utils.js';
import BasePage from '../pages/basepage.js';
import InitialStepsPage from '../pages/initialSteps.page.js';
import { WebDriver } from 'selenium-webdriver';

let instance = null;
/** @type {Array<{driver: WebDriver, driverId: number}>} */
const poolOfDrivers = [];
let driverGlobalCounter = 0;

class DriversManager {
  constructor() {
    if (instance) {
      throw new Error('New instance cannot be created!');
    }

    instance = this;
    this.logger = getTestLogger(`DriversManager_${Date.now()}`, 'DriversManager');
  }

  /**
   * Adding a new driver to the pool of drivers
   * @returns {{driver: ThenableWebDriver, driverId: number}}
   */
  addNewDriverToPool() {
    const newDriver = getDriver();
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

  async _prepareExtensionCommon(driver) {
    const logger = getTestLogger(`DriversManager_Page_${Date.now()}`, 'DriversManager');
    const basePage = new BasePage(driver, logger);
    await basePage.goToExtension();
    const initialStepsPage = new InitialStepsPage(driver, logger);
    await initialStepsPage.skipInitialSteps();
  }

  /**
   * Preparing an extension for tests
   * @param {{driver: ThenableWebDriver, driverId: number}} driverObject
   * @returns
   */
  async prepareExtension(driverObject) {
    this.logger.info(`DriversManager::prepareExtension driver ID ${driverObject.driverId}`);
    await this._prepareExtensionCommon(driverObject.driver);
  }

  async prepareExtensions() {
    const prepExtPromisesArr = [];
    this.logger.info(`DriversManager::prepareExtensions Amount of drivers ${poolOfDrivers.length}`);
    for (const driverObject of poolOfDrivers) {
      prepExtPromisesArr.push(this.prepareExtension(driverObject));
    }
    return await Promise.all(prepExtPromisesArr);
  }

  async getDriverFromPool() {
    const driverObject = poolOfDrivers.shift();
    this.logger.info(`DriversManager::getDriverFromPool Returning driver ${driverObject.driverId}`);
    const newDriverObject = this.addNewDriverToPool();
    this.prepareExtension(newDriverObject);

    return driverObject.driver;
  }

  async getPreparedDriver() {
    this.logger.info(`DriversManager::getPreparedDriver is called`);
    const driver = getDriver();
    await this._prepareExtensionCommon(driver);

    return driver;
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
