// @flow

/*::
import type {
  ExtendedPublicKeyResp,
} from '@emurgo/ledger-connect-handler';
import type {
  DeriveAddressResponse,
  SignTransactionResponse,
  GetVersionResponse,
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
        const byronKey = {
          // from ledger-wallet mnemonic
          publicKeyHex: 'd54844edc8ffe0f41ec686a2199f4d182dd477450ec2d5b251d877178f366b81',
          chainCodeHex: 'd8b2aa0ca5ed670a252387c9d4c2f41946c2f760d118bec9b70b5fbabfef7fc6',
        };
        const shelleyKey = {
          // from ledger-wallet mnemonic
          publicKeyHex: 'a849fc88a55ceb3ee00bb22511448556fb6a0fc1f981e9e82d002f4a1906a7a5',
          chainCodeHex: '6e7759167a1e1cbd0b2aac7aef423a4ea9ce0f5eae829b111b619fb1c38f4b08',
        };
        const payload /*: ExtendedPublicKeyResp */ = {
          response: data.params.path[0] === 2147483692 // BIP44
            ? byronKey
            : shelleyKey,
          deviceVersion: {
            major: '2',
            minor: '0',
            patch: '4',
            flags: {
              isDebug: false,
            }
          },
          deriveSerial: {
            serial: '707fa118bf6b83',
          },
        };
        const postData = {
          action: 'ledger-get-extended-public-key-reply',
          success: true,
          payload,
        };
        browserPort.postMessage(postData)
      } if (data.action === 'ledger-sign-transaction') {
        // note: this is the same bip44 tx for bip44 and cip1852
        // should be an if/else in the future
        const payload /*: SignTransactionResponse */ = {
          txHashHex: 'a2831b89854114f706eb8cc9aa3c9ba49cd76f7d2863aa74ac15e0e755e1d524',
          witnesses: [{
            path: [2147483692,2147485463,2147483648,0,0],
            // note: fake witness -- not the real witness for this transaction
            witnessSignatureHex: '8458208fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c05840d4da0fe3615f90581926281be0510df5f6616ebed5a6d6831cceab4dd9935f7f5b6150d43b918d79e8db7cd3e17b9de91fdfbaed7cdab18818331942852fd10b58202623fceb96b07408531a5cb259f53845a38d6b68928e7c0c7e390f07545d0e6241a0'
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
          // Ae2tdPwUPEYxqRJXnstgBN88qtjtDVNRXD5Ghm3wK9NS7fhKRseQ2TVVpth
          addressHex: '82d818582183581c14548de9a66908993328cbbd1a1e5ed78fe55520f3c43b22e7334485a0001a64903272',
        };
        const postData = {
          action: 'ledger-derive-address-reply',
          success: true,
          payload,
        };
        browserPort.postMessage(postData)
      } if (data.action === 'ledger-get-version') {
        const payload /*: GetVersionResponse */ = {
          major: '2',
          minor: '0',
          patch: '4',
          flags: {
            isDebug: false,
          }
        }
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