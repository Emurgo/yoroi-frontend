# Yoroi - Cardano ADA wallet

## First-time setup (or branch change)

[SETUP.md](docs/SETUP.md)

*if you switched git branches, it may affect translation files*. Consider [rebuilding the translation cache](app/i18n/README.md)

## Build Yoroi Chrome extension

Extension can be built for both the Cardano mainnet and testnet:

- Localhost _(recommended)_
```bash
# build files to './dev'
$ npm run dev
```

- Mainnet
```bash
# build files to './build'
$ npm run build -- --env "mainnet"
```

- Testnet
```bash
# build files to './build'
$ npm run build -- --env "testnet"
```

## Run Yoroi Chrome extension

1. Open new webpage with `chrome://extensions`
2. Turn on the developer mode (checkbox in the top right-hand corner)
3. Press [Load unpacked](https://developer.chrome.com/extensions/getstarted#unpacked)
4. Select either `dev` or `build` folder (depending which `npm` command you ran)

_Note_: `dev` should hot reload on code change

## Build release candidate

[RELEASE.md](docs/RELEASE.md)

## Test

* `features`: E2E tests (use [chromedriver](https://www.npmjs.com/package/chromedriver), [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver))

```bash
# flow
$ npm run flow
# lint
$ npm run eslint
# features (command to run all existing tests)
$ npm run test-e2e
# How to run one .feature file (One feature file = one covered component from youtrack)
$ npm run test-by-feature feature/wallet-creation.feature
# How to run one test. Instead of '@it-10' you can use any tag from youtrack
$ npm run test-by-tag @it-10
```

 

## Update Cardano crypto library

In order to update it run the following commands:

```bash
# Update js-cardano-wasm
cd js-cardano-wasm;
git checkout master;
git pull origin master;
cd ..;

# Commit the update
git add .
git commit -S -m "${youCommitMessage}"
git push ...

# Re-install the module
$ npm run build-js-cardano-wasm 
$ npm install

# At this point you can go back to Development steps. 
```

## LICENSE

[MIT](LICENSE)
