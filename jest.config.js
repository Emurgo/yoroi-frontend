module.exports = {
  moduleNameMapper: {
    // mock out the browser version of WASM bindings with the nodejs bindings
    'cardano-wallet-browser': 'cardano-wallet',
    'js-chain-libs': 'js-chain-libs-node',
    '\\.png$': 'lodash/noop.js',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!yoroi-extension-ledger-bridge)'
  ],
  setupFiles: [
    'jest-canvas-mock'
  ],
  // ignore manifest.test.js file, because it isn't a test
  testPathIgnorePatterns: ['manifest.test.js']
};
