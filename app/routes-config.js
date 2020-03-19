// @flow
export const ROUTES = {
  ROOT: '/',

  NIGHTLY_INFO: '/nightly',
  MY_WALLETS: '/my-wallets',
  PROFILE: {
    LANGUAGE_SELECTION: '/profile/language-selection',
    TERMS_OF_USE: '/profile/terms-of-use',
    URI_PROMPT: '/profile/uri-prompt',
  },
  WALLETS: {
    ROOT: '/wallets',
    SWITCH: '/wallets/switch',
    ADD: '/wallets/add',
    TRANSACTIONS: '/wallets/:id/transactions',
    SEND: '/wallets/:id/send',
    RECEIVE: {
      ROOT: '/wallets/:id/receive',
      EXTERNAL: '/wallets/:id/receive/external',
      INTERNAL: '/wallets/:id/receive/internal',
      MANGLED: '/wallets/:id/receive/mangled',
    },
    DELEGATION_DASHBOARD: '/wallets/:id/delegation-dashboard',
    DELEGATION_SIMPLE: '/wallets/:id/delegation-simple',
    DELEGATION_ADVANCE: '/wallets/:id/delegation-advance',
  },
  SETTINGS: {
    ROOT: '/settings',
    GENERAL: '/settings/general',
    PAPER_WALLET: '/settings/paper-wallet',
    WALLET: '/settings/wallet',
    TERMS_OF_USE: '/settings/terms-of-use',
    SUPPORT: '/settings/support',
  },
  TRANSFER: {
    ROOT: '/transfer',
    DAEDALUS: '/transfer/daedalus',
    YOROI: '/transfer/yoroi',
  },
  SEND_FROM_URI: {
    ROOT: '/send-from-uri',
  },
  NOTICE_BOARD: {
    ROOT: '/notice-board',
  },
};
