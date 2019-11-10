module.exports = {
  moduleNameMapper: {
    // mock out the browser version of WASM bindings with the nodejs bindings
    'cardano-wallet-browser': 'cardano-wallet',
    '\\.png$': 'lodash/noop.js',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!yoroi-extension-ledger-connect-handler)'
  ],
  setupFiles: [
    'jest-canvas-mock'
  ],
  // ignore manifest.test.js file, because it isn't a test
  testPathIgnorePatterns: ['manifest.test.js']
};
