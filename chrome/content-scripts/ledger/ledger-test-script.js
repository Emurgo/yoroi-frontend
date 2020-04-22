// @flow

/*::
import type {
  ExtendedPublicKeyResp,
} from 'yoroi-extension-ledger-connect-handler';
import type {
  DeriveAddressResponse,
  SignTransactionResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
*/

/*::
declare var chrome;
*/

console.debug('[CS-LEDGER] Loading');
(function init () {
  console.debug('[CS-LEDGER] Execution begins');

  const YOROI_LEDGER_CONNECT_TARGET_NAME = 'YOROI-LEDGER-CONNECT';
  const ORIGIN = 'https://emurgo.github.io';
  const closeWindowMsg = {
    target: YOROI_LEDGER_CONNECT_TARGET_NAME,
    action: 'close-window'
  }
  const portName = {
    name: YOROI_LEDGER_CONNECT_TARGET_NAME
  };
  
  // Make Extension and WebPage port to communicate over this channel
  let browserPort = chrome.runtime.connect(portName);
  
  // Passing messages from Extension ==> WebPage
  browserPort.onMessage.addListener(msg => {
    window.postMessage(msg, window.location.origin);
  });
  
  // Close WebPage window when port is closed
  browserPort.onDisconnect.addListener(d => {
    console.debug(`[CS-LEDGER] Closing WebPage window!!`);
    window.postMessage(closeWindowMsg, window.location.origin);
  });
  
  // Passing messages from WebPage ==> Extension
  window.addEventListener('message', event => {
    if(event.origin === ORIGIN && event.data) {
      const { data } = event;
      if (data.action === 'ledger-get-extended-public-key') {
        const payload /*: ExtendedPublicKeyResp */ = {
          ePublicKey: {
            // from ledger-wallet mnemonic
            publicKeyHex: 'd54844edc8ffe0f41ec686a2199f4d182dd477450ec2d5b251d877178f366b81',
            chainCodeHex: 'd8b2aa0ca5ed670a252387c9d4c2f41946c2f760d118bec9b70b5fbabfef7fc6',
          },
          deviceVersion: {
            major: '1',
            minor: '0',
            patch: '0',
            flags: {
              isDebug: false,
            }
          },
        };
        const postData = {
          action: 'ledger-get-extended-public-key-reply',
          success: true,
          payload,
        };
        browserPort.postMessage(postData)
      } if (data.action === 'ledger-sign-transaction') {
        const payload /*: SignTransactionResponse */ = {
          txHashHex: '208665877514b4582572c3efc79d331e644898339ffa0d13b34a4ec724b92809',
          witnesses: [{
            path: [2147483692,2147485463,2147483648,0,0],
            witnessSignatureHex: '210a059ea7e630734ba039c3be7e3ebc86dccc16c0d75de3ebf33beb11b12db7557fcde9bd223567c1c41ef08cb9571a6a1a80d84703ef2b5dfae1e20544c20d'
          }]
        };
        const postData = {
          action: 'ledger-sign-transaction-reply',
          success: true,
          payload,
        };
        browserPort.postMessage(postData)
      } if (data.action === 'ledger-show-address') {
        const payload /*: void */ = undefined;
        const postData = {
          action: 'ledger-show-address-reply',
          success: true,
          payload,
        };
        browserPort.postMessage(postData)
      } if (data.action === 'ledger-derive-address') {
        const payload /*: DeriveAddressResponse */ = {
          address58: 'Ae2tdPwUPEYxqRJXnstgBN88qtjtDVNRXD5Ghm3wK9NS7fhKRseQ2TVVpth',
        };
        const postData = {
          action: 'ledger-derive-address-reply',
          success: true,
          payload,
        };
        browserPort.postMessage(postData)
      } if (data.action === 'ledger-get-version') {
        const payload /*: ExtendedPublicKeyResp */ = {
        };
        const postData = {
          action: 'ledger-get-version-reply',
          success: true,
          payload,
        };
        browserPort.postMessage(postData)
      } else {
        throw new Error(`Unknown action ${data.action}`);
      }
    } else {
      console.debug(`[CS-LEDGER] Wrong origin or no data object: ${event.origin}`);
    }
  });
}());