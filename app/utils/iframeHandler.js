// @flow
import {
  LedgerBridge,
  YOROI_LEDGER_BRIDGE_TARGET_NAME
} from 'yoroi-extension-ledger-bridge';

const LEDGER_BRIDGE_CHECK_INTERVAL = 500; // in ms (1000ms = 1sec)
const LEDGER_BRIDGE_CHECK_COUNT = 10;

export async function prepareLedgerBridger(ledgerBridge: LedgerBridge): Promise<void> {
  if (ledgerBridge == null) {
    throw new Error(`LedgerBridge Error: LedgerBridge is undefined`);
  }

  return new Promise((resolve, reject) => {
    let checkCounter = 0;
    const checkInterval = setInterval(async () => {
      if (await ledgerBridge.isBridgeReady()) {
        clearInterval(checkInterval);
        resolve();
      } else if (checkCounter > LEDGER_BRIDGE_CHECK_COUNT) {
        clearInterval(checkInterval);
        const timeSpentInSec = LEDGER_BRIDGE_CHECK_INTERVAL * LEDGER_BRIDGE_CHECK_COUNT / 1000;
        reject(new Error(`LedgerBridge Error: Timeout. Couldn't connect to bridge in less than ${timeSpentInSec}seconds`));
      }
      checkCounter++;
    }, LEDGER_BRIDGE_CHECK_INTERVAL);
  });
}

// TODO: not used, can remove getIFrame
export function getIFrame(id: string): ?HTMLIFrameElement {
  const element = document.getElementById(id);
  if (element instanceof HTMLIFrameElement) {
    return element;
  }
}

/** In order to keep all iframe related logic in iframeHandler
  * softly restricting YOROI_LEDGER_BRIDGE_TARGET_NAME use from outside */
export function disposeLedgerBridgeIFrame() {
  disposeIFrame(YOROI_LEDGER_BRIDGE_TARGET_NAME);
}

export function disposeIFrame(id: string): void {
  const element = document.getElementById(id);
  if (element instanceof HTMLIFrameElement) {
    element.remove();
  }
}
