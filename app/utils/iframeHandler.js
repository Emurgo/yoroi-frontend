// @flow
import { LedgerBridge } from 'yoroi-extension-ledger-bridge';

export async function prepareLedgerBridger(ledgerBridge: LedgerBridge): Promise<void> {
  if (ledgerBridge == null) {
    throw new Error(`Error: LedgerBridge is undefined`);
  }

  return new Promise((resolve, reject) => {
    let checkCounter = 0;
    const checkInterval = setInterval(() => {
      if (ledgerBridge.isReady) {
        clearInterval(checkInterval);
        resolve();
      } else if (checkCounter > 10) {
        clearInterval(checkInterval);
        reject(new Error(`Error: Cann't setup LedgerBridge`));
      }
      checkCounter++;
    }, 500);
  });
}

export function getIFrame(name: string): ?any {
  return document.getElementById(name);
}
