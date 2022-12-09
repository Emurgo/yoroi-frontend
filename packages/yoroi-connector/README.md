# Yoroi dApp Connector

~~This experimental extension is the first in a modular design to interface the [Yoroi frontend extension](https://github.com/Emurgo/yoroi-frontend) with dApps. It targets the [Ergo](https://ergoplatform.org/en/) cryptocurrency.~~

~~The implementation will follow our [EIP-0012](https://github.com/ergoplatform/eips/pull/23) spec.~~

This project is used only as an example application.

All related to the dApp is moved to the folder `packages/yoroi-extension/app/connector`.

### Testing

1. Build the test version of the extension. (Read how to build the test app [here](../yoroi-extension/docs/TEST.md#e2e-tests))
2. Use `npm run test:run:e2e:dApp:chrome` to run all dApp-connector related tests

### Running dApp example page

1. Install node modules
2. Run example for cardano network `npm run cardano` or run example for ergo network `npm run ergo`
