module.exports = {
  "moduleNameMapper": {
    // get rid of the fake module we use to trick flow
    "CardanoWallet": "lodash/noop.js",
    // mock out the browser version of WASM bindings with the nodejs bindings
    "cardano-wallet-browser": "cardano-wallet"
  },
  "transformIgnorePatterns": [
    "<rootDir>/node_modules/"
  ]
};
