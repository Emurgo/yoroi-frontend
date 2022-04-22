// @flow
import { WebDriver } from 'selenium-webdriver';

type WindowType = 'tab' | 'window';
type CustomWindowHandle = {|
  title: string,
  handle: string,
|};

class WindowManagerError extends Error {}

export const mockDAppName = 'MockDApp';
export const popupConnectorName = 'popupConnectorWindow';
export const extensionTabName = 'Yoroi';

export class WindowManager {
  windowHandles: Array<CustomWindowHandle>;
  driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.windowHandles = [];
  }

  async init() {
    const mainWindowHandle = await this._getCurrentWindowHandle();
    const windowTitle = await this._getWindowTitle();
    this.windowHandles.push({ title: windowTitle, handle: mainWindowHandle });
  }

  async _getWindowTitle(): Promise<string> {
    const windowTitle = await this.driver.getTitle();
    if (windowTitle === extensionTabName) {
      return extensionTabName;
    }
    if (windowTitle === mockDAppName) {
      return mockDAppName;
    }
    return 'main';
  }

  _getHandleByTitle(title: string): Array<CustomWindowHandle> {
    return this.windowHandles.filter(customHandle => customHandle.title === title);
  }

  async _getCurrentWindowHandle(): Promise<string> {
    return await this.driver.getWindowHandle();
  }

  async getAllWindowHandles(): Promise<Array<string>> {
    return await this.driver.getAllWindowHandles();
  }

  async _openNew(type: WindowType, windowName: string): Promise<CustomWindowHandle> {
    await this.driver.switchTo().newWindow(type);
    const currentWindowHandle = await this._getCurrentWindowHandle();

    return { title: windowName, handle: currentWindowHandle };
  }

  async _openNewWithCheck(
    type: WindowType,
    windowName: string,
    url: string
  ): Promise<CustomWindowHandle> {
    const checkTitle = this._getHandleByTitle(windowName);
    if (!checkTitle.length) {
      const handle = await this._openNew(type, windowName);
      await this.driver.get(url);
      this.windowHandles.push(handle);
      return handle;
    }
    throw new WindowManagerError(`The handle with the title ${windowName} already exists`);
  }

  async openNewTab(tabTitle: string, url: string): Promise<CustomWindowHandle> {
    return await this._openNewWithCheck('tab', tabTitle, url);
  }

  async openNewWindow(windowTitle: string, url: string): Promise<CustomWindowHandle> {
    return await this._openNewWithCheck('window', windowTitle, url);
  }

  async closeTabWindow(titleToClose: string, switchToTitle: string): Promise<void> {
    const handleToClose = this._getHandleByTitle(titleToClose)[0];
    const switchToHandle = this._getHandleByTitle(switchToTitle)[0];
    await this.driver.switchTo().window(handleToClose.handle);
    await this.driver.close();
    await this.driver.switchTo().window(switchToHandle.handle);
    const indexOfHandle = this.windowHandles.indexOf(handleToClose);
    this.windowHandles.splice(indexOfHandle, 1);
  }

  async switchTo(title: string): Promise<void> {
    const searchHandle = this._getHandleByTitle(title);
    if (searchHandle.length !== 1) {
      throw new WindowManagerError(
        `Unable to switch to the window ${title} because found ${searchHandle.length} handles for the title`
      );
    }
    await this.driver.switchTo().window(searchHandle[0].handle);
  }

  async findNewWindowAndSwitchTo(newWindowTitle: string): Promise<CustomWindowHandle> {
    let newWindowHandles: Array<string> = [];
    for (;;) {
      await new Promise(resolve => setTimeout(resolve, 100));
      newWindowHandles = await this.getAllWindowHandles();
      if (newWindowHandles.length > this.windowHandles.length) {
        break;
      }
    }
    const oldHandles = this.windowHandles.map(customHandle => customHandle.handle);
    const popupWindowHandleArr = newWindowHandles.filter(handle => !oldHandles.includes(handle));
    if (popupWindowHandleArr.length !== 1) {
      throw new WindowManagerError('Can not find the popup window');
    }
    const popupWindowHandle = popupWindowHandleArr[0];
    const popUpCustomHandle = { title: newWindowTitle, handle: popupWindowHandle };
    this.windowHandles.push(popUpCustomHandle);

    await this.driver.switchTo().window(popupWindowHandle);

    return popUpCustomHandle;
  }

  async isClosed(title: string): Promise<boolean> {
    const expectToBeClosedHandle: Array<CustomWindowHandle> = this.windowHandles.filter(
      customHandle => customHandle.title === title
    );
    if (!expectToBeClosedHandle.length) {
      throw new WindowManagerError(`There is no handle for the title ${title}`);
    }
    for (let i = 0; i < 20; i++) {
      const windowHandles = await this.getAllWindowHandles();
      if (windowHandles.includes(expectToBeClosedHandle[0].handle)) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      const indexOfHandle = this.windowHandles.indexOf(expectToBeClosedHandle);
      this.windowHandles.splice(indexOfHandle, 1);
      return true;
    }
    return false;
  }
}
