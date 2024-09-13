// @flow
declare var chrome;

export function sendToInjector(tabId: number, message: any) {
  chrome.tabs.sendMessage(tabId, message);
}

async function getDefaultBounds(
): Promise<{| width: number, positionX: number, positionY: number |}> {
  let width;
  if (window.screen != null) { // mv2
    width = window.screen.availWidth;
  } else { // mv3
    const displayUnitInfoArr = await chrome.system.display.getInfo();
    width = displayUnitInfoArr[0].bounds.width;
  }

  return {
    width,
    positionX: 0,
    positionY: 0,
  };
}

async function getBoundsForWindow(
  targetWindow
): Promise<{| width: number, positionX: number, positionY: number |}> {
  const defaults = await getDefaultBounds();

  const bounds = {
      width: targetWindow.width ?? defaults.width,
      positionX: targetWindow.left ?? defaults.positionX,
      positionY: targetWindow.top ?? defaults.positionY,
  };

  return bounds;
}

export function getBoundsForTabWindow(
  targetTabId: number,
): Promise<{| width: number, positionX: number, positionY: number |}> {
  return new Promise(resolve => {
    chrome.tabs.get(targetTabId, (tab) => {
      if (tab == null) return resolve(getDefaultBounds());
      chrome.windows.get(tab.windowId, (targetWindow) => {
        if (targetWindow == null) return resolve(getDefaultBounds());
        resolve(getBoundsForWindow(targetWindow));
      });
    });
  });
}

export const popupProps: {|width: number, height: number, focused: boolean, type: string|} = {
  width: 500,
  height: 700,
  focused: true,
  type: 'popup',
};
