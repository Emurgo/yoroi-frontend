export default {
  wallets: {
    ADDRESS_COPY_NOTIFICATION_DURATION: 10,
    WALLET_CREATED_NOTIFICATION_DURATION: 8,
    WALLET_RESTORED_NOTIFICATION_DURATION: 8,
    MAX_ALLOWED_UNUSED_ADDRESSES: 20,
    TRANSACTION_REQUEST_SIZE: 20,
    WALLET_RECOVERY_PHRASE_WORD_COUNT: 12,
    // https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
    BIP44_CARDANO_FIRST_ACCOUNT_SUB_PATH: 'm/44\'/1815\'/0\'',
    hardwareWallet: {
      trezorT: {
        VENDOR: 'trezor.io',
        MODEL: 'T',
        manifest: {
          EMAIL: 'systems@emurgo.io',
          APP_URL: 'https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb'
        }
      },
      ledgerNanoS: {
        // Ledger doesn’t provide any device name so using hard-coded name
        DEFAULT_WALLET_NAME: 'Yoroi-Ledger',
        VENDOR: 'ledger.com',
        MODEL: 'NanoS'
      }
    }
  },
  forms: {
    FORM_VALIDATION_DEBOUNCE_WAIT: 250
  },
  adaRedemption: {
    ADA_REDEMPTION_PASSPHRASE_LENGTH: 9
  }
};
