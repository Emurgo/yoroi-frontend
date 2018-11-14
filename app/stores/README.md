# Stores

Stores represent the models in our application as required by `mobx`. These models interact with the `api` layer and cache results that the `components` and `containers` can then use to populate the UI.

Additionally, stores listen to `actions` to trigger state updates. Only `@computed` functions should be called directly from `components` and `containers`.