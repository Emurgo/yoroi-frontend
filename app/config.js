export default {
  wallets: {
    ADDRESS_COPY_NOTIFICATION_DURATION: 10,
    TREZOR_WALLET_INTEGRATED_NOTIFICATION_DURATION: 8,
    WALLET_CREATED_NOTIFICATION_DURATION: 8,
    WALLET_RESTORED_NOTIFICATION_DURATION: 8,
    MAX_ALLOWED_UNUSED_ADDRESSES: 20,
    TRANSACTION_REQUEST_SIZE: 20,
    WALLET_RECOVERY_PHRASE_WORD_COUNT: 12
  },
  forms: {
    FORM_VALIDATION_DEBOUNCE_WAIT: 250
  },
  adaRedemption: {
    ADA_REDEMPTION_PASSPHRASE_LENGTH: 9
  },
  trezor: {
    // https://github.com/trezor/connect/blob/develop/docs/methods/cardanoGetPublicKey.md
    // https://cardanolaunch.com/assets/Ed25519_BIP.pdf
    DEFAULT_CARDANO_PATH: 'm/44\'/1815\'/0\'',
    manifest: {
      EMAIL: 'systems@emurgo.io',
      APP_URL: 'https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb'
    }
  }
};
