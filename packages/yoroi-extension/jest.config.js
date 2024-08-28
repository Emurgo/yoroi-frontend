// @flow

module.exports = {
  moduleNameMapper: {
    // mock out the browser version of WASM bindings with the nodejs bindings
    'cardano-wallet-browser': 'cardano-wallet',
    '@emurgo/cardano-serialization-lib-browser': '@emurgo/cardano-serialization-lib-nodejs',
    '@emurgo/cardano-message-signing-browser': '@emurgo/cardano-message-signing-nodejs',
    '@emurgo/cross-csl-browser': '@emurgo/cross-csl-nodejs',
    '\\.png$': 'lodash/noop.js',
    "^axios$": "axios/dist/node/axios.cjs",
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!@emurgo/ledger-connect-handler)'
  ],
  setupFiles: [
    'jest-canvas-mock',
    './jestSetup',
  ],
  // ignore manifest.test.js file, because it isn't a test
  testPathIgnorePatterns: ['manifest.test.js', 'manifest-mv2.test.js'],
};
