export default {
  wallets: {
    ADDRESS_COPY_NOTIFICATION_DURATION: 10,
    MAX_ALLOWED_UNUSED_ADDRESSES: 20,
    TRANSACTION_REQUEST_SIZE: 20
  },
  trezor: {
    // https://github.com/trezor/connect/blob/develop/docs/methods/cardanoGetPublicKey.md
    // https://cardanolaunch.com/assets/Ed25519_BIP.pdf
    DEFAULT_CARDANO_PATH: 'm/44\'/1815\'/0\''
  }
};
