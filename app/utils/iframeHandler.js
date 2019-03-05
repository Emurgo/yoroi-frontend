// @flow
import { LedgerBridge } from 'yoroi-extension-ledger-bridge';

const LEDGER_BRIDGE_CHECK_INTERVAL = 500; // in ms (1000ms = 1sec)
const LEDGER_BRIDGE_CHECK_COUNT = 10;

export async function prepareLedgerBridger(ledgerBridge: LedgerBridge): Promise<void> {
  if (ledgerBridge == null) {
    throw new Error(`LedgerBridge Error: LedgerBridge is undefined`);
  }

  return new Promise((resolve, reject) => {
    let checkCounter = 0;
    const checkInterval = setInterval(() => {
      if (ledgerBridge.isReady) {
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

export function getIFrame(name: string): ?any {
  return document.getElementById(name);
}
