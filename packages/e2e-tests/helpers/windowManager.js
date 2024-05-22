import { defaultRepeatPeriod, defaultWaitTimeout } from './timeConstants.js';

class WindowManagerError extends Error {}

export const mockDAppName = 'MockDApp';
export const popupConnectorName = 'popupConnectorWindow';
export const popupConnectorWindowTitle = 'Yoroi dApp Connector';
export const extensionTabName = 'Yoroi';
export const faqTabName = 'Yoroi - EMURGO';
export const trezorConnectTabName = 'Trezor';
export const backgroungTabName = 'background';

export class WindowManager {
  constructor(driver, logger) {
    this.driver = driver;
    this.windowHandles = [];
    this.logger = logger;
  }

  async init() {
    this.logger.info(`WindowManager::init Initializing the Window manager`);
    const mainWindowHandle = await this._getCurrentWindowHandle();
    const windowTitle = await this._getWindowTitle();
    this.logger.info(
      `WindowManager::init The first and main window is { "${windowTitle}": "${mainWindowHandle}" }`
    );
    this.windowHandles.push({ title: windowTitle, handle: mainWindowHandle });
  }

  async _waitWindowTitle(timeoutMs = defaultWaitTimeout, repeatPeriodMs = defaultRepeatPeriod) {
    this.logger.info(`WindowManager::_waitWindowTitle Waiting for the window title`);
    const endTime = Date.now() + timeoutMs;

    while (endTime >= Date.now()) {
      const windowTitle = await this.driver.getTitle();
      if (windowTitle !== '') return windowTitle;
      await this.driver.sleep(repeatPeriodMs);
    }
    this.logger.error(`WindowManager::_waitWindowTitle The window has the empty title`);
    throw new WindowManagerError(`The window has the empty title`);
  }

  async _getWindowTitle() {
    this.logger.info(`WindowManager::_getWindowTitle Getting a window title`);
    const windowTitle = await this._waitWindowTitle();
    this.logger.info(`WindowManager::_getWindowTitle The window title is "${windowTitle}"`);
    if (windowTitle === extensionTabName) {
      return extensionTabName;
    }
    if (windowTitle === mockDAppName) {
      return mockDAppName;
    }
    return 'main';
  }

  _getHandleByTitle(title) {
    this.logger.info(`WindowManager::_getHandleByTitle Getting a handle by the title "${title}"`);
    const handles = this.windowHandles.filter(customHandle => customHandle.title === title);
    this.logger.info(
      `WindowManager::_getHandleByTitle The handles for title "${title}" are ${JSON.stringify(handles)}`
    );
    return handles;
  }

  _getTitleByHandle(handle) {
    this.logger.info(`WindowManager::_getTitleByHandle Getting a title by the handle "${handle}"`);
    const handles = this.windowHandles.filter(customHandle => customHandle.handle === handle);
    this.logger.info(
      `WindowManager::_getTitleByHandle The titles for the handle "${handle}" are ${JSON.stringify(handles)}`
    );
    return handles;
  }

  async _getCurrentWindowHandle() {
    this.logger.info(`WindowManager::_getCurrentWindowHandle Getting the current handle`);
    const currentHandle = await this.driver.getWindowHandle();
    this.logger.info(
      `WindowManager::_getCurrentWindowHandle The current handle is "${currentHandle}"`
    );
    return currentHandle;
  }

  async getAllWindowHandles() {
    this.logger.info(`WindowManager::getAllWindowHandles Getting all window handles`);
    const allHandles = await this.driver.getAllWindowHandles();
    this.logger.info(
      `WindowManager::getAllWindowHandles All handles: ${JSON.stringify(allHandles)}`
    );
    return allHandles;
  }

  async _openNew(type, windowName) {
    this.logger.info(`WindowManager::_openNew Opening a new ${type} with a name "${windowName}"`);
    await this.driver.switchTo().newWindow(type);
    const currentWindowHandle = await this._getCurrentWindowHandle();
    this.logger.info(
      `WindowManager::_openNew The new ${type} with a name "${windowName}" has handle "${currentWindowHandle}"`
    );

    return { title: windowName, handle: currentWindowHandle };
  }

  async getCurrentWindowName() {
    this.logger.info(
      `WindowManager::getCurrentWindowName Getting the window name from window manager`
    );
    const currentHandle = await this._getCurrentWindowHandle();
    const handles = this._getTitleByHandle(currentHandle);
    if (handles.length === 1) {
      return handles[0].title;
    }
    throw new WindowManagerError(`Too many titles for the handle ${currentHandle}`);
  }

  async _openNewWithCheck(type, windowName, url) {
    this.logger.info(
      `WindowManager::_openNewWithCheck Opening with checking a new ${type} "${url}" with a name "${windowName}"`
    );
    const checkTitle = this._getHandleByTitle(windowName);
    if (!checkTitle.length) {
      const handle = await this._openNew(type, windowName);
      await this.driver.get(url);
      this.windowHandles.push(handle);
      return handle;
    }
    this.logger.error(
      `WindowManager::_openNewWithCheck The handle with the title ${windowName} already exists`
    );
    throw new WindowManagerError(`The handle with the title ${windowName} already exists`);
  }

  async openNewTab(tabTitle, url) {
    return await this._openNewWithCheck('tab', tabTitle, url);
  }

  async openNewWindow(windowTitle, url) {
    return await this._openNewWithCheck('window', windowTitle, url);
  }

  async closeTabWindow(titleToClose, switchToTitle) {
    this.logger.info(
      `WindowManager::closeTabWindow Closing the tab "${titleToClose}" and switching to the tab "${switchToTitle}"`
    );
    const handleToClose = this._getHandleByTitle(titleToClose)[0];
    const switchToHandle = this._getHandleByTitle(switchToTitle)[0];
    await this.driver.switchTo().window(handleToClose.handle);
    await this.driver.close();
    await this.driver.switchTo().window(switchToHandle.handle);
    const indexOfHandle = this.windowHandles.indexOf(handleToClose);
    this.windowHandles.splice(indexOfHandle, 1);
    this.logger.info(
      `WindowManager::closeTabWindow The tab "${titleToClose}" is closed and removed from this.windowHandles`
    );
  }

  async switchTo(title) {
    this.logger.info(`WindowManager::switchTo Switching to the tab|window "${title}"`);
    const searchHandle = this._getHandleByTitle(title);
    if (searchHandle.length !== 1) {
      this.logger.error(
        `WindowManger::switchTo Unable to switch to the window ${title} because found ${searchHandle.length} handles for the title`
      );
      throw new WindowManagerError(
        `Unable to switch to the window ${title} because found ${searchHandle.length} handles for the title`
      );
    }
    await this.driver.switchTo().window(searchHandle[0].handle);
    this.logger.info(`WindowManager::switchTo Switching to the tab|window "${title}" is done`);
  }

  _filterHandles(newWindowHandles) {
    const oldHandles = this.windowHandles.map(customHandle => customHandle.handle);
    return newWindowHandles.filter(handle => !oldHandles.includes(handle));
  }

  async findNewWindows(tries = 50) {
    this.logger.info(`WindowManager::findNewWindows Finding a new window`);
    let newWindowHandles = [];
    for (let i = 0; i < tries; i++) {
      this.logger.info(`WindowManager::findNewWindows Try ${i} to find a new window`);
      await new Promise(resolve => setTimeout(resolve, 100));
      newWindowHandles = await this.getAllWindowHandles();
      this.logger.info(
        `WindowManager::findNewWindows newWindowHandles: ${JSON.stringify(newWindowHandles)}`
      );
      this.logger.info(
        `WindowManager::findNewWindows oldHandles: ${JSON.stringify(this.windowHandles)}`
      );
      if (newWindowHandles.length > this.windowHandles.length) {
        const newHandle = this._filterHandles(newWindowHandles);
        this.logger.info(`WindowManager::findNewWindows The new window handle is "${newHandle}"`);
        return newHandle;
      }
    }
    this.logger.info(`WindowManager::findNewWindows The new window handle is not found`);
    return this._filterHandles(newWindowHandles);
  }

  async findNewWindowAndSwitchTo(newWindowTitle) {
    this.logger.info(
      `WindowManager::findNewWindowAndSwitchTo Finding a new window and switching to it and set the title "${newWindowTitle}" to it`
    );
    const popupWindowHandleArr = await this.findNewWindows();
    if (popupWindowHandleArr.length !== 1) {
      this.logger.error(`WindowManager::findNewWindowAndSwitchTo Can not find the popup window`);
      throw new WindowManagerError('Can not find the popup window');
    }
    const popupWindowHandle = popupWindowHandleArr[0];
    const popUpCustomHandle = { title: newWindowTitle, handle: popupWindowHandle };
    this.windowHandles.push(popUpCustomHandle);

    await this.driver.switchTo().window(popupWindowHandle);
    this.logger.info(
      `WindowManager::findNewWindowAndSwitchTo Switched to the new window ${JSON.stringify(popUpCustomHandle)}`
    );
    await this._waitWindowTitle();

    return popUpCustomHandle;
  }

  async isClosed(title) {
    this.logger.info(
      `WindowManager::isClosed Checking the window with the title "${title}" is closed`
    );
    const expectToBeClosedHandle = this.windowHandles.filter(
      customHandle => customHandle.title === title
    );
    if (!expectToBeClosedHandle.length) {
      this.logger.warn(
        `WindowManager::isClosed There is no handle for the title ${title}. Suppose it is closed`
      );
      return true;
    }
    for (let i = 0; i < 50; i++) {
      const windowHandles = await this.getAllWindowHandles();
      if (windowHandles.includes(expectToBeClosedHandle[0].handle)) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      const indexOfHandle = this.windowHandles.indexOf(expectToBeClosedHandle);
      this.windowHandles.splice(indexOfHandle, 1);
      this.logger.info(`WindowManager::isClosed The window with the title "${title}" is closed`);
      return true;
    }
    this.logger.info(
      `WindowManager::isClosed The window with the title "${title}" is still opened`
    );
    return false;
  }

  async waitForClosingAndSwitchTo(titleToClose, titleSwitchTo) {
    this.logger.info(
      `WindowManager::waitForClosingAndSwitchTo Waiting for closing a window with the title "${titleToClose}" and switching to a window with a title "${titleSwitchTo}"`
    );
    const result = await this.isClosed(titleToClose);
    if (!result) {
      throw new WindowManagerError(`The window with the title "${titleToClose}" is still opened`);
    }
    await this.switchTo(titleSwitchTo);

    return this._getHandleByTitle(titleSwitchTo)[0];
  }
}
