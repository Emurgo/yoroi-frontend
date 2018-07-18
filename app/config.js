export default {
  wallets: {
    ADDRESS_COPY_NOTIFICATION_DURATION: 10,
    MAX_ALLOWED_UNUSED_ADDRESSES: 20,
    // We will query the backend for 20 addresses window
    // FIXME: Improve this to decouple requests and BIP-44 unused window parsing
    ADDRESS_REQUEST_SIZE: 20,
  },
};
