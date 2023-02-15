// @flow
import { WebDriver } from 'selenium-webdriver';
import { defaultRepeatPeriod, defaultWaitTimeout } from './helpers/common-constants';

type WindowType = 'tab' | 'window';
type CustomWindowHandle = {|
  title: string,
  handle: string,
|};

class WindowManagerError extends Error {}

export const mockDAppName = 'MockDApp';
export const popupConnectorName = 'popupConnectorWindow';
export const extensionTabName = 'Yoroi';
export const faqTabName = 'Yoroi - EMURGO';
export const trezorConnectTabName = 'Trezor';
export const backgroungTabName = 'background';

export class WindowManager {
  windowHandles: Array<CustomWindowHandle>;
  driver: WebDriver;
  logger: Object;

  constructor(driver: WebDriver, logger: Object) {
    this.driver = driver;
    this.windowHandles = [];
    this.logger = logger;
  }

  async init() {
    this.logger.info(`WindowManager: Initializing the Window manager`);
    const mainWindowHandle = await this._getCurrentWindowHandle();
    const windowTitle = await this._getWindowTitle();
    this.logger.info(
      `WindowManager: -> The first and main window is { "${windowTitle}": "${mainWindowHandle}" }`
    );
    this.windowHandles.push({ title: windowTitle, handle: mainWindowHandle });
  }

  async _waitWindowTitle(
    timeoutMs: number = defaultWaitTimeout,
    repeatPeriodMs: number = defaultRepeatPeriod): Promise<string> {
    this.logger.info(`WindowManager:_waitWindowTitle: Waiting for the window title`);
    const endTime = Date.now() + timeoutMs;

    while (endTime >= Date.now()) {
      const windowTitle = await this.driver.getTitle();
      if (windowTitle !== '') return windowTitle;
      await this.driver.sleep(repeatPeriodMs);
    }
    this.logger.error(`WindowManager:_waitWindowTitle: -> The window has the empty title`);
    throw new WindowManagerError(`The window has the empty title`);
  }

  async _getWindowTitle(): Promise<string> {
    this.logger.info(`WindowManager: Getting a window title`);
    const windowTitle = await this._waitWindowTitle();
    this.logger.info(`WindowManager: -> The window title is "${windowTitle}"`);
    if (windowTitle === extensionTabName) {
      return extensionTabName;
    }
    if (windowTitle === mockDAppName) {
      return mockDAppName;
    }
    return 'main';
  }

  _getHandleByTitle(title: string): Array<CustomWindowHandle> {
    this.logger.info(`WindowManager: Getting a handle by the title "${title}"`);
    const handles = this.windowHandles.filter(customHandle => customHandle.title === title);
    this.logger.info(
      `WindowManager: -> The handles for title "${title}" are ${JSON.stringify(handles)}`
    );
    return handles;
  }

  _getTitleByHandle(handle: string): Array<CustomWindowHandle> {
    this.logger.info(`WindowManager: Getting a title by the handle "${handle}"`);
    const handles = this.windowHandles.filter(customHandle => customHandle.handle === handle);
    this.logger.info(
      `WindowManager: -> The titles for the handle "${handle}" are ${JSON.stringify(handles)}`
    );
    return handles;
  }

  async _getCurrentWindowHandle(): Promise<string> {
    this.logger.info(`WindowManager: Getting the current handle`);
    const currentHandle = await this.driver.getWindowHandle();
    this.logger.info(`WindowManager: -> The current handle is "${currentHandle}"`);
    return currentHandle;
  }

  async getAllWindowHandles(): Promise<Array<string>> {
    this.logger.info(`WindowManager: Getting all window handles`);
    const allHandles = await this.driver.getAllWindowHandles();
    this.logger.info(`WindowManager: -> All handles: ${JSON.stringify(allHandles)}`);
    return allHandles;
  }

  async _openNew(type: WindowType, windowName: string): Promise<CustomWindowHandle> {
    this.logger.info(`WindowManager: Opening a new ${type} with a name "${windowName}"`);
    await this.driver.switchTo().newWindow(type);
    const currentWindowHandle = await this._getCurrentWindowHandle();
    this.logger.info(
      `WindowManager: -> The new ${type} with a name "${windowName}" has handle "${currentWindowHandle}"`
    );

    return { title: windowName, handle: currentWindowHandle };
  }

  async getCurrentWindowName(): Promise<string> {
    this.logger.info(`WindowManager: Getting the window name from window manager`);
    const currentHandle = await this._getCurrentWindowHandle();
    const handles = this._getTitleByHandle(currentHandle);
    if (handles.length === 1) {
      return handles[0].title;
    }
    throw new WindowManagerError(`Too many titles for the handle ${currentHandle}`);
  }

  async _openNewWithCheck(
    type: WindowType,
    windowName: string,
    url: string
  ): Promise<CustomWindowHandle> {
    this.logger.info(
      `WindowManager: Opening with checking a new ${type} "${url}" with a name "${windowName}"`
    );
    const checkTitle = this._getHandleByTitle(windowName);
    if (!checkTitle.length) {
      const handle = await this._openNew(type, windowName);
      await this.driver.get(url);
      this.windowHandles.push(handle);
      return handle;
    }
    this.logger.error(`WindowManager: -> The handle with the title ${windowName} already exists`);
    throw new WindowManagerError(`The handle with the title ${windowName} already exists`);
  }

  async openNewTab(tabTitle: string, url: string): Promise<CustomWindowHandle> {
    return await this._openNewWithCheck('tab', tabTitle, url);
  }

  async openNewWindow(windowTitle: string, url: string): Promise<CustomWindowHandle> {
    return await this._openNewWithCheck('window', windowTitle, url);
  }

  async closeTabWindow(titleToClose: string, switchToTitle: string): Promise<void> {
    this.logger.info(
      `WindowManager: Closing the tab "${titleToClose}" and switching to the tab "${switchToTitle}"`
    );
    const handleToClose = this._getHandleByTitle(titleToClose)[0];
    const switchToHandle = this._getHandleByTitle(switchToTitle)[0];
    await this.driver.switchTo().window(handleToClose.handle);
    await this.driver.close();
    await this.driver.switchTo().window(switchToHandle.handle);
    const indexOfHandle = this.windowHandles.indexOf(handleToClose);
    this.windowHandles.splice(indexOfHandle, 1);
    this.logger.info(
      `WindowManager: -> The tab "${titleToClose}" is closed and removed from this.windowHandles`
    );
  }

  async switchTo(title: string): Promise<void> {
    this.logger.info(`WindowManager: Switching to the tab|window "${title}"`);
    const searchHandle = this._getHandleByTitle(title);
    if (searchHandle.length !== 1) {
      this.logger.error(
        `WindowManger: -> Unable to switch to the window ${title} because found ${searchHandle.length} handles for the title`
      );
      throw new WindowManagerError(
        `Unable to switch to the window ${title} because found ${searchHandle.length} handles for the title`
      );
    }
    await this.driver.switchTo().window(searchHandle[0].handle);
    this.logger.info(`WindowManager: -> Switching to the tab|window "${title}" is done`);
  }

  _filterHandles(newWindowHandles: Array<string>): Array<string> {
    const oldHandles = this.windowHandles.map(customHandle => customHandle.handle);
    return newWindowHandles.filter(handle => !oldHandles.includes(handle));
  }

  async findNewWindows(tries: number = 50): Promise<Array<string>> {
    this.logger.info(`WindowManager: Finding a new window`);
    let newWindowHandles: Array<string> = [];
    for (let i = 0; i < tries; i++) {
      this.logger.info(`WindowManager: -> Try ${i} to find a new window`);
      await new Promise(resolve => setTimeout(resolve, 100));
      newWindowHandles = await this.getAllWindowHandles();
      this.logger.info(`WindowManager: -> newWindowHandles: ${JSON.stringify(newWindowHandles)}`);
      this.logger.info(`WindowManager: -> oldHandles: ${JSON.stringify(this.windowHandles)}`);
      if (newWindowHandles.length > this.windowHandles.length) {
        const newHandle = this._filterHandles(newWindowHandles);
        this.logger.info(
          `WindowManager: -> The new window handle is "${JSON.stringify(newHandle)}"`
        );
        return newHandle;
      }
    }
    this.logger.info(`WindowManager: -> The new window handle is not found`);
    return this._filterHandles(newWindowHandles);
  }

  async findNewWindowAndSwitchTo(newWindowTitle: string): Promise<CustomWindowHandle> {
    this.logger.info(
      `WindowManager: Finding a new window and switching to it and set the title "${newWindowTitle}" to it`
    );
    const popupWindowHandleArr = await this.findNewWindows();
    if (popupWindowHandleArr.length !== 1) {
      this.logger.error(`WindowManager: -> Can not find the popup window`);
      throw new WindowManagerError('Can not find the popup window');
    }
    const popupWindowHandle = popupWindowHandleArr[0];
    const popUpCustomHandle = { title: newWindowTitle, handle: popupWindowHandle };
    this.windowHandles.push(popUpCustomHandle);

    await this.driver.switchTo().window(popupWindowHandle);
    this.logger.info(
      `WindowManager: -> Switched to the new window ${JSON.stringify(popUpCustomHandle)}`
    );
    await this._waitWindowTitle();

    return popUpCustomHandle;
  }

  async isClosed(title: string): Promise<boolean> {
    this.logger.info(`WindowManager: Checking the window with the title "${title}" is closed`);
    const expectToBeClosedHandle: Array<CustomWindowHandle> = this.windowHandles.filter(
      customHandle => customHandle.title === title
    );
    if (!expectToBeClosedHandle.length) {
      this.logger.error(`WindowManager: -> There is no handle for the title ${title}`);
      throw new WindowManagerError(`There is no handle for the title ${title}`);
    }
    for (let i = 0; i < 50; i++) {
      const windowHandles = await this.getAllWindowHandles();
      if (windowHandles.includes(expectToBeClosedHandle[0].handle)) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      const indexOfHandle = this.windowHandles.indexOf(expectToBeClosedHandle);
      this.windowHandles.splice(indexOfHandle, 1);
      this.logger.info(`WindowManager: -> The window with the title "${title}" is closed`);
      return true;
    }
    this.logger.info(`WindowManager: -> The window with the title "${title}" is still opened`);
    return false;
  }

  async waitForClosingAndSwitchTo(
      titleToClose: string,
      titleSwitchTo: string
  ): Promise<CustomWindowHandle> {
    const result = await this.isClosed(titleToClose);
    if (!result) {
      throw new WindowManagerError(`The window with the title "${titleToClose}" is still opened`);
    }
    await this.switchTo(titleSwitchTo);

    return this._getHandleByTitle(titleSwitchTo)[0];
  }
}
