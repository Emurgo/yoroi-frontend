// @flow

export default Object.freeze({
  wallets: Object.freeze({
    ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION: (2: 2),
    WALLET_CREATED_NOTIFICATION_DURATION: (8: 8),
    WALLET_RESTORED_NOTIFICATION_DURATION: (8: 8),
    MAX_ALLOWED_UNUSED_ADDRESSES: (20: 20),
    TRANSACTION_REQUEST_SIZE: (50: 50),
    DAEDALUS_RECOVERY_PHRASE_WORD_COUNT: (12: 12),
    DAEDALUS_PAPER_RECOVERY_PHRASE_WORD_COUNT: (27: 27),
    MAX_RECOVERY_PHRASE_WORD_COUNT: (24: 24),
    WALLET_RECOVERY_PHRASE_WORD_COUNT: (15: 15),
    DAEDALUS_SHELLEY_RECOVERY_PHRASE_WORD_COUNT: (24: 24),
    YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT: (21: 21),
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
      ledgerNano: {
        // Ledger does not provide device model info up till now
        DEFAULT_WALLET_NAME: 'Yoroi-Ledger',
        VENDOR: 'ledger.com',
      }
    }
  }),
  forms: Object.freeze({
    FORM_VALIDATION_DEBOUNCE_WAIT: 1000
  }),
});
