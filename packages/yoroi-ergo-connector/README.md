# Yoroi-Ergo dApp Connector

This experimental extension is the first in a modular design to interface the [Yoroi frontend extension](https://github.com/Emurgo/yoroi-frontend) with dApps. It targets the [Ergo](https://ergoplatform.org/en/) cryptocurrency.

The implementation will follow our [EIP-0012](https://github.com/ergoplatform/eips/pull/23) spec.

### Testing

1. Run the Yoroi Extension and get its extension ID
2. Use `npm run prod:custom -- extension-id-here`
3. Select "load unpacked" in your browser and select the build (TODO: zip file instead)
4. Build the example project `npm install && npm run start`
5. Open the page from the example project
