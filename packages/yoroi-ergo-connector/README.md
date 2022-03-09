# Yoroi dApp Connector

This experimental extension is the first in a modular design to interface the [Yoroi frontend extension](https://github.com/Emurgo/yoroi-frontend) with dApps. It targets the [Ergo](https://ergoplatform.org/en/) cryptocurrency.

The implementation will follow our [EIP-0012](https://github.com/ergoplatform/eips/pull/23) spec.

### Testing

1. Run the Yoroi Extension and get its extension ID
1. Use `npm run prod:custom -- --yoroiExtensionId=extension-id-here`
1. Select "load unpacked" in your browser and select the build folder (or ZIP file also works in prod/nightly builds)
1. Note the extension ID of the connector extension. Now, when you re-build Yoroi passing `--ergoConnectorExtensionId=connector-extension-id-here` as a build argument.
Example: `npm run dev:stable -- --ergoConnectorExtensionId=ebnncddeiookdmpglbhiamljhpdgbjcm`
1. Build the example project in the `example` folder (`npm install && npm run start`)
1. Open the page from the example project
