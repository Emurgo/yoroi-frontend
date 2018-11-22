# Stores

Stores are a mobx concept described [here](https://mobx.js.org/best/store.html). The stores interact with the `api` layer and cache results that the `components` and `containers` can then use to populate the UI.

Additionally, stores listen to `actions` to trigger state updates. Only `@computed` functions should be called directly from `components` and `containers`.

## Toplevel Stores

These stores are uesd for currency-independent portions of the application.

## Base store

Base stores represent the interface that can be extended for individual currencies.

## Substores

While the main store represents the core information for running the app, substores exist to provide the interface for specific cryptocurrencies.
