// @flow

export const PAGE_ERROR_SUBROUTE: string = '/page-error';

export const ROUTES = {
  ROOT: '/',
  PAGE_ERROR: PAGE_ERROR_SUBROUTE,
  NIGHTLY_INFO: '/nightly',
  PROFILE: {
    LANGUAGE_SELECTION: '/profile/language-selection',
    TERMS_OF_USE: '/profile/terms-of-use',
    COMPLEXITY_LEVEL: '/profile/complexity-level',
    URI_PROMPT: '/profile/uri-prompt',
    OPT_FOR_ANALYTICS: '/profile/opt-for-analytics',
  },
  SWITCH: '/switch',
  WALLETS: {
    ROOT: '/wallets',
    ADD: '/wallets/add',
    CREATE_NEW_WALLET: '/wallets/new',
    RESTORE_WALLET: '/wallets/restore',
    TRANSACTIONS: '/wallets/transactions',
    SEND: '/wallets/send',
    RECEIVE: {
      ROOT: '/wallets/receive',
      ADDRESS_LIST: '/wallets/receive/:group/:name',
    },
  },
  SETTINGS: {
    ROOT: '/settings',
    GENERAL: '/settings/general',
    BLOCKCHAIN: '/settings/blockchain',
    WALLET: '/settings/wallet',
    EXTERNAL_STORAGE: '/settings/external-storage',
    TERMS_OF_USE: '/settings/terms-of-use',
    SUPPORT: '/settings/support',
    LEVEL_OF_COMPLEXITY: '/settings/level-of-complexity',
    ANALYTICS: '/settings/analytics',
    PAPER_WALLET: '/settings/paper-wallet',
  },
  TRANSFER: {
    ROOT: '/transfer',
  },
  SEND_FROM_URI: {
    ROOT: '/send-from-uri',
  },
  // revamp
  STAKING: '/staking',
  ASSETS: {
    ROOT: '/assets',
    DETAILS: '/assets/tokens/:tokenId',
  },
  // Bringweb3
  CASHBACK: {
    ROOT: '/cashback'
  },
  NFTS: {
    ROOT: '/nfts',
    DETAILS: '/nfts/:nftId',
  },
  DAPP_CONNECTOR: {
    CONNECTED_WEBSITES: '/connector/connected-websites',
  },
  // Revamp specific routes:
  REVAMP: {
    // `voting` is part of the sidebar
    CATALYST_VOTING: '/voting',
  },
  SWAP: {
    ROOT: '/swap',
    // $FlowIgnore
    ERROR: '/swap' + PAGE_ERROR_SUBROUTE,
    ORDERS: '/swap/orders',
  },
  EXCHANGE_END: '/exchange-end',

  // NEW UI ROUTES
  Governance: {
    ROOT: '/governance',
    DELEGATE: '/governance/delagation',
    SUBMITTED: '/governance/submitted',
    FAIL: '/governance/failed',
  },
  PORTFOLIO: {
    ROOT: '/portfolio',
    DAPPS: '/portfolio/dapps',
    DETAILS: '/portfolio/details/:tokenId',
  },
  TX_REVIEW: {
    FAIL: '/tx-review/failed',
    SUCCESS: '/tx-review/success',
  },
};
