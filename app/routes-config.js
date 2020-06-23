// @flow
export const ROUTES = {
  ROOT: '/',

  NIGHTLY_INFO: '/nightly',
  MY_WALLETS: '/my-wallets',
  PROFILE: {
    LANGUAGE_SELECTION: '/profile/language-selection',
    TERMS_OF_USE: '/profile/terms-of-use',
    COMPLEXITY_LEVEL: '/profile/complexity-level',
    URI_PROMPT: '/profile/uri-prompt',
  },
  SWITCH: '/switch',
  WALLETS: {
    ROOT: '/wallets',
    ADD: '/wallets/add',
    TRANSACTIONS: '/wallets/transactions',
    SEND: '/wallets/send',
    RECEIVE: {
      ROOT: '/wallets/receive',
      ADDRESS_LIST: '/wallets/receive/:group/:name',
    },
    DELEGATION_DASHBOARD: '/wallets/delegation-dashboard',
    DELEGATION_SIMPLE: '/wallets/delegation-simple',
    DELEGATION_ADVANCE: '/wallets/delegation-advance',
  },
  SETTINGS: {
    ROOT: '/settings',
    GENERAL: '/settings/general',
    BLOCKCHAIN: '/settings/blockchain',
    PAPER_WALLET: '/settings/paper-wallet',
    WALLET: '/settings/wallet',
    EXTERNAL_STORAGE: '/settings/external-storage',
    TERMS_OF_USE: '/settings/terms-of-use',
    SUPPORT: '/settings/support',
    LEVEL_OF_COMPLEXITY: '/settings/level-of-complexity',
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
    ROOT: '/staking'
  },
  OAUTH_FROM_EXTERNAL: {
    DROPBOX: '/foo', // TODO: think about this. GET params don't work well with react-router I think
    // DROPBOX: '/access_token=:token&token_type=:token_type&uid=:uid&account_id=:account_id',
  },
  NOTICE_BOARD: {
    ROOT: '/notice-board',
  },
};
