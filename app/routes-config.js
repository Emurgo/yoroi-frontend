// @flow
export const ROUTES = {
  ROOT: '/',
  STAKING: '/staking',
  ADA_REDEMPTION: '/ada-redemption',
  NO_WALLETS: '/no-wallets',
  PROFILE: {
    LANGUAGE_SELECTION: '/profile/language-selection',
    TERMS_OF_USE: '/profile/terms-of-use',
    SEND_LOGS: '/profile/send-logs-choice',
  },
  WALLETS: {
    ROOT: '/wallets',
    ADD: '/wallets/add',
    PAGE: '/wallets/:id/:page',
    SUMMARY: '/wallets/:id/summary',
    SEND: '/wallets/:id/send',
    RECEIVE: '/wallets/:id/receive',
  },
  SETTINGS: {
    ROOT: '/settings',
    WALLET: '/settings/wallet',
    GENERAL: '/settings/general',
    TERMS_OF_USE: '/settings/terms-of-use',
    SUPPORT: '/settings/support',
    DISPLAY: '/settings/display',
  },
  DAEDALUS_TRANFER: {
    ROOT: '/daedalus-transfer',
  }
};
