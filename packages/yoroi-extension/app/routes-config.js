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
    ASSETS: '/wallets/assets',
    RECEIVE: {
      ROOT: '/wallets/receive',
      ADDRESS_LIST: '/wallets/receive/:group/:name',
    },
    DELEGATION_DASHBOARD: '/wallets/delegation-dashboard',
    ADAPOOL_DELEGATION_SIMPLE: '/wallets/delegation-simple',
    CARDANO_DELEGATION: '/wallets/cardano-delegation',
    CATALYST_VOTING: '/wallets/voting',
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
  },
  TRANSFER: {
    ROOT: '/transfer',
  },
  SEND_FROM_URI: {
    ROOT: '/send-from-uri',
  },
  OAUTH_FROM_EXTERNAL: {
    DROPBOX: '/foo', // TODO: think about this. GET params don't work well with react-router I think
    // DROPBOX: '/access_token=:token&token_type=:token_type&uid=:uid&account_id=:account_id',
  },
  // revamp
  STAKING: '/staking',
  ASSETS: {
    ROOT: '/assets',
    DETAILS: '/assets/tokens/:tokenId',
  },
  NFTS: {
    ROOT: '/nfts',
    DETAILS: '/nfts/:nftId',
  },
  DAPP_CONNECTOR: {
    CONNECTED_WEBSITES: '/connector/connected-websites',
  },
  EXPERIMENTAL: {
    YOROI_PALETTE: '/experimental/yoroi-palette',
    YOROI_COMPONENTS: '/experimental/components',
    THEMES: '/experimental/themes',
  },
  // Revamp specific routes:
  REVAMP: {
    // `voting` is part of the sidebar
    CATALYST_VOTING: '/voting',
  },
  SWAP: {
    ROOT: '/swap',
    ORDERS: '/swap/orders',
  },
  EXCHANGE_END: '/exchange-end',

  // NEW UI ROUTES
  Gouvernance: {
    ROOT: '/gouvernance',
    DELEGATE: '/gouvernance/delagation',
  },
};
