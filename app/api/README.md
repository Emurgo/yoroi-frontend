# API

Acts as the bridge between our application and the following external components:
1) `js-cardano-wasm`
2) Chrome `localstorage`
3) Local `lovefield` database
4) Yoroi's [backend-service](https://github.com/Emurgo/yoroi-backend-service)

The API should limit the exposure of its internal type system to the rest of the application. Specifically, it should only exponse the types required to make `requests` and parse `responses`. Any non-primitive type in either of these should be stored in the `domain` folder.
