// @flow
// routes to by tracked by analytics
export const TRACKED_ROUTES: RegExp = new RegExp(
  '^(' +
  '(/my-wallets)|' +
  '(/wallets/add)|' +
  '(/wallets/transactions)|' +
  '(/wallets/send)|' +
  '(/wallets/assets)|' +
  '(/wallets/receive/.+)|' +
  '(/wallets/delegation-dashboard)|' +
  '(/wallets/cardano-delegation)|' +
  '(/wallets/voting)|' +
  '(/settings/.+)|' +
  '(/transfer(/.+)?)|' +
  '(/send-from-uri)|' +
  '(/notice-board)|' +
  '(/staking)|' +
  '(/assets/.*)|' +
  '(/connector/connected-websites)|' +
  '(/experimental/.*)' +
  ')$'
);

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
    CREATE_NEW_WALLET: '/wallets/new',
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
  OAUTH_FROM_EXTERNAL: {
    DROPBOX: '/foo', // TODO: think about this. GET params don't work well with react-router I think
    // DROPBOX: '/access_token=:token&token_type=:token_type&uid=:uid&account_id=:account_id',
  },
  NOTICE_BOARD: {
    ROOT: '/notice-board',
  },
  // revamp
  STAKING: '/staking',
  ASSETS: {
    ROOT: '/assets',
    DETAILS: '/assets/tokens/:tokenId',
  },
  NFTS: {
    ROOT: '/nfts',
    DETAILS: '/nfts/:nftId'
  },
  DAPP_CONNECTOR: {
    CONNECTED_WEBSITES: '/connector/connected-websites'
  },
  EXPERIMENTAL: {
    YOROI_PALETTE: '/experimental/yoroi-palette',
    YOROI_COMPONENTS: '/experimental/components',
    THEMES: '/experimental/themes'
  },
  // Revamp specific routes:
  REVAMP: {
    // `transfer` the `wallet`
    TRANSFER: '/wallets/transfer',
    // `voting` is part of the sidebar
    CATALYST_VOTING: '/voting',
  }
};
