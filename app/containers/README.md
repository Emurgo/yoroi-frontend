# Container

Represents higher-level building blocks of the UI. These are meant to contain **no raw html** and only simple logic to combine together `components` to form pages and other high-level concepts.

`Containers` can access both `store` and `actions` to interact with application state.

## Flow with mobx-react

We want to use a mobx-react `Provider` to inject props throughout all containers for `store` and `actions`. However, Flow doesn't support decorators so this would lead to type errors. We instead use a type refinement trick to have it work in practice (but not ideal).
You can read more about it [here](https://wietse.loves.engineering/using-flowtype-with-decorators-in-react-af4fe69e66d6)