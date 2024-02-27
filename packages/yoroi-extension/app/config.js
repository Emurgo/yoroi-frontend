// @flow

export default Object.freeze({
  wallets: Object.freeze({
    ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION: (2: 2),
    WALLET_CREATED_NOTIFICATION_DURATION: (8: 8),
    WALLET_RESTORED_NOTIFICATION_DURATION: (8: 8),
    MAX_ALLOWED_UNUSED_ADDRESSES: (20: 20),
    TRANSACTION_REQUEST_SIZE: (50: 50),
    MAX_RECOVERY_PHRASE_WORD_COUNT: (24: 24),
    WALLET_RECOVERY_PHRASE_WORD_COUNT: (15: 15),
    DAEDALUS_SHELLEY_RECOVERY_PHRASE_WORD_COUNT: (24: 24),
    // <TODO:PENDING_REMOVAL> paper
    YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT: (21: 21),
    MAX_RECENT_TXS_PER_LOAD: (20: 20),
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
    FORM_VALIDATION_DEBOUNCE_WAIT: 500,
    FORM_VALIDATION_DEBOUNCE_WAIT_LONGER: 1000,
  }),
});
