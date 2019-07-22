module.exports = {
  "moduleNameMapper": {
    // mock out the browser version of WASM bindings with the nodejs bindings
    "cardano-wallet-browser": "cardano-wallet",
    "\\.png$": "lodash/noop.js",
    "pdfParser$": "lodash/noop.js",
  },
  "transformIgnorePatterns": [
    "<rootDir>/node_modules/(?!yoroi-extension-ledger-bridge)"
  ],
};
