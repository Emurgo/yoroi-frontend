// @flow
import {
  LedgerConnect,
} from 'yoroi-extension-ledger-connect-handler';

const LEDGER_BRIDGE_CHECK_INTERVAL = 800; // in ms (1000ms = 1sec)
const LEDGER_BRIDGE_CHECK_COUNT = 10;

export async function prepareLedgerConnect(ledgerConnect: LedgerConnect): Promise<void> {
  if (ledgerConnect == null) {
    throw new Error(`LedgerConnect Error: LedgerConnect is undefined`);
  }

  return new Promise((resolve, reject) => {
    let checkCounter = 0;
    const checkInterval = setInterval(async () => {
      if (ledgerConnect.isConnectorReady()) {
        clearInterval(checkInterval);
        resolve();
      } else if (checkCounter > LEDGER_BRIDGE_CHECK_COUNT) {
        clearInterval(checkInterval);
        const timeSpentInSec = LEDGER_BRIDGE_CHECK_INTERVAL * LEDGER_BRIDGE_CHECK_COUNT / 1000;
        reject(new Error(`LedgerConnect Error: Timeout. Couldn't connect to bridge in less than ${timeSpentInSec}seconds`));
      }
      checkCounter++;
    }, LEDGER_BRIDGE_CHECK_INTERVAL);
  });
}
