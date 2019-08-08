import { ConnectionTypeValue } from 'yoroi-extension-ledger-connector';

// @flow
export default {
  wallets: {
    ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION: 2,
    WALLET_CREATED_NOTIFICATION_DURATION: 8,
    WALLET_RESTORED_NOTIFICATION_DURATION: 8,
    MAX_ALLOWED_UNUSED_ADDRESSES: 20,
    TRANSACTION_REQUEST_SIZE: 20,
    DAEDALUS_RECOVERY_PHRASE_WORD_COUNT: 12,
    WALLET_RECOVERY_PHRASE_WORD_COUNT: 15,
    hardwareWallet: {
      trezorT: {
        VENDOR: 'trezor.io',
        MODEL: 'T',
        manifest: {
          EMAIL: 'rnd@emurgo.io',
          appURL: {
            CHROME: 'https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb',
            FIREFOX: 'https://addons.mozilla.org/en-US/firefox/addon/yoroi/'
          }
        }
      },
      ledgerNanoS: {
        // Ledger doesn’t provide any device name so using hard-coded name
        DEFAULT_WALLET_NAME: 'Yoroi-Ledger',
        VENDOR: 'ledger.com',
        MODEL: 'NanoS',
        DEFAULT_TRANSPORT_PROTOCOL: ConnectionTypeValue.WEB_AUTHN
      }
    }
  },
  forms: {
    FORM_VALIDATION_DEBOUNCE_WAIT: 250
  },
};
