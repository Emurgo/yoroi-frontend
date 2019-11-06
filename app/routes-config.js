// @flow
export const ROUTES = {
  ROOT: '/',
  NO_WALLETS: '/no-wallets',
  PROFILE: {
    LANGUAGE_SELECTION: '/profile/language-selection',
    TERMS_OF_USE: '/profile/terms-of-use',
    URI_PROMPT: '/profile/uri-prompt',
  },
  WALLETS: {
    ROOT: '/wallets',
    ADD: '/wallets/add',
    PAGE: '/wallets/:id/:page',
    TRANSACTIONS: '/wallets/:id/transactions',
    SEND: '/wallets/:id/send',
    RECEIVE: '/wallets/:id/receive',
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
  STAKING: {
    ROOT: '/staking',
    PAGE: '/staking/:id/:page',
    DASHBOARD: '/staking/:id/dashboard',
    SIMULATOR: '/staking/:id/simulator',
    ADVANCED_SIMULATOR: '/staking/:id/advanced-simulator',
  }
};
