// @flow
import { WebDriver } from 'selenium-webdriver';

type WindowType = 'tab' | 'window';
type CustomWindowHandle = {|
  title: string,
  handle: string,
|};

class WindowManagerError extends Error {}

export class WindowManager {
  windowHandles: Array<CustomWindowHandle>;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.windowHandles = [];
  }

  async init() {
    const mainWindowHandle = await this.#getCurrentWindowHandle();
    this.windowHandles.push({ title: 'main', handle: mainWindowHandle });
  }

  #getHandleByTitle(title: string): Array<CustomWindowHandle> {
    return this.windowHandles.filter(customHandle => customHandle.title === title);
  }

  async #getCurrentWindowHandle() {
    return await this.driver.getWindowHandle();
  }

  async getAllWindowHandles() {
    return await this.driver.getAllWindowHandles();
  }

  async #openNew(type: WindowType, windowName: string): Promise<CustomWindowHandle> {
    await this.driver.switchTo().newWindow(type);
    const currentWindowHandle = await this.#getCurrentWindowHandle();

    return { title: windowName, handle: currentWindowHandle };
  }

  async #openNewWithCheck(
    type: WindowType,
    windowName: string,
    url: string
  ): Promise<CustomWindowHandle> {
    const checkTitle = this.#getHandleByTitle(windowName);
    if (!checkTitle.length) {
      const handle = await this.#openNew(type, windowName);
      await this.driver.get(url);
      this.windowHandles.push(handle);
      return handle;
    }
    throw new WindowManagerError(`The handle with the title ${windowName} already exists`);
  }

  async openNewTab(tabTitle: string, url: string) {
    return await this.#openNewWithCheck('tab', tabTitle, url);
  }

  async openNewWindow(windowTitle: string, url: string) {
    return await this.#openNewWithCheck('window', windowTitle, url);
  }

  async switchTo(title: string) {
    const searchHandle = this.#getHandleByTitle(title);
    if (searchHandle.length !== 1) {
      throw new WindowManagerError(
        `Unable to switch to the window ${title} because found ${searchHandle.length} handles for the title`
      );
    }
    await this.driver.switchTo().window(searchHandle[0].handle);
  }

  async findNewWindowAndSwitchTo(newWindowTitle: string) {
    let newWindowHandles;
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
    const expectToBeClosedHandle = this.windowHandles.filter(
      customHandle => customHandle.title === title
    );
    if (!expectToBeClosedHandle.length) {
      throw new WindowManagerError(`There is no handle for the title ${title}`);
    }
    for (let i = 0; i < 20; i++) {
      const windowHandles = await this.getAllWindowHandles();
      if (windowHandles.includes(expectToBeClosedHandle[0])) {
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
