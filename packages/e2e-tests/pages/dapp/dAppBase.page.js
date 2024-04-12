import { defaultWaitTimeout, quarterSecond } from '../../helpers/timeConstants.js';
import { popupConnectorName, popupConnectorWindowTitle } from '../../helpers/windowManager.js';
import BasePage from '../basepage.js';

class DAppBase extends BasePage {
  // locators
  loaderSpinner = {
    locator: '.LoadingSpinner_component',
    method: 'css',
  };
  // functions
  async popUpIsDisplayed(windowManager) {
    this.logger.info(`DAppBase::connectorPopUpIsDisplayed is called`);
    await windowManager.findNewWindowAndSwitchTo(popupConnectorName);
    const windowTitle = await this.driver.getTitle();
    const result = windowTitle === popupConnectorWindowTitle;
    this.logger.info(`DAppBase::connectorPopUpIsDisplayed pop-up window is displayed: ${result}`);

    return result;
  }
  async waitingConnectorIsReady() {
    this.logger.info(`DAppBase::connectorIsReady is called`);
    const state = await this.customWaiter(
      async () => {
        const elAmount = await this.findElements(this.loaderSpinner);
        return elAmount.length === 0;
      },
      defaultWaitTimeout,
      quarterSecond
    );
    if (!state) {
      this.logger.error(
        `DAppBase::connectorIsReady The loader on the connector is still displayed`
      );
      throw new Error(
        `The loader on the connector is still displayed after ${defaultWaitTimeout} milliseconds`
      );
    }
  }
}

export default DAppBase;
