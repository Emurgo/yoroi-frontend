# Yoroi - Cardano ADA wallet

## Contributing

Check out our [documents](docs/specs/meta) on the governance of this project.

## First-time setup (or branch change)

[SETUP.md](docs/SETUP.md)

[TOOLS.md](docs/TOOLS.md)

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

- Testnet (not supported yet)
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

## Run Yoroi Firefox extension

Debug builds are not maintained for Firefox as firefox rejects manifest files with non-https `localhost` in them.
You can bypass this by manually adding the extension into your Firefox folder but this is kind of tedious.
I suggest instead installing the `mainnet` build as it does not use `localhost`. (through `about:debugging` or `about:addons`). See [SETUP.md](docs/SETUP.md) for how to makes the unittests pass.

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
