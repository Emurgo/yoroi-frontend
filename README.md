# Yoroi - Cardano ADA wallet

### Download

|   | Firefox | Chrome |
|---|---|----|
| Mainnet | [<img src="https://pbs.twimg.com/profile_images/1138489258207899648/9_KBUEn7_400x400.jpg" width="48">](https://addons.mozilla.org/en-US/firefox/addon/yoroi/) | [<img src="https://pbs.twimg.com/profile_images/1037025533182193664/aCWlGSZF_400x400.jpg" width="48">](https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb) |
| Shelley testnet | [<img src="https://pbs.twimg.com/profile_images/1138489258207899648/9_KBUEn7_400x400.jpg" width="48">](https://addons.mozilla.org/en-US/firefox/addon/yoroi-shelley-testnet/) |[ <img src="https://pbs.twimg.com/profile_images/1037025533182193664/aCWlGSZF_400x400.jpg" width="48">](https://chrome.google.com/webstore/detail/yoroi-shelley-testnet/bioklcnnnpdblghplkifbemcigeanmjn) |

Looking for Yoroi Mobile? See [here](https://github.com/Emurgo/yoroi-mobile)

## Contributing

Check out our [documents](docs/specs/meta) on the governance of this project.

## First-time setup (or branch change)

[SETUP.md](docs/SETUP.md)

[TOOLS.md](docs/TOOLS.md)

## Build Yoroi Chrome extension

Extension can be built for both Byron mainnet and Jormungandr testnet:

#### Debug build with byron mainnet
```bash
# build files to './dev'
$ npm run dev:byron
```

This command will run extension as locally-hosted, create a `./dev` directory in the project, and then you can "load unpacked" extension from there. When you stop the running process - extension will stop working, but it also means you can create code-changes while process is running and extension will be hot-reloaded with these changes.

This will connect to the Cardano mainnet with ADA coins having real monetary value.

#### Production build with byron mainnet
```bash
# build files to './build'
$ npm run prod:byron
```

This command will create a full build of the extension in the `./build` directory, which you can also "load unpacked" into your browser, and it will not require you to keep a running process to continue working (standalone build).

This will connect to the Cardano mainnet with ADA coins having real monetary value (equal to what users are downloading from browser stores).

#### Jormungandr testnet
```bash
# build files to './dev'
$ npm run dev:shelley
# build files to './build'
$ npm run prod:shelley
```

Same as previous but connects to the [Jormungandr testnet]https://staking.cardano.org/).

## Run Yoroi Chrome extension

1. Open new webpage with `chrome://extensions`
2. Turn on the developer mode (checkbox in the top right-hand corner)
3. Press [Load unpacked](https://developer.chrome.com/extensions/getstarted#unpacked)
4. Select either `dev` or `build` folder (depending which `npm` command you ran)

_Note_: `dev` should hot reload on code change

## Run Yoroi Firefox extension

Debug builds for Firefox require the [Debugger for Firefox](https://marketplace.visualstudio.com/items?itemName=firefox-devtools.vscode-firefox-debug) addon.

You can use the following config in `vscode/.launch.json` to launch the debugger.

```json
{
  "type": "firefox",
  "request": "launch",
  "reAttach": true,
  "name": "Launch add-on",
  "addonPath": "${workspaceFolder}/dev/",
  "preferences": {
    "security.csp.enable": false
  },
  "pathMappings": [
    {
      "url": "webpack:///",
      "path": "${workspaceFolder}/"
    }
  ]
},
```

See [SETUP.md](docs/SETUP.md) for how to makes the unittests pass.

## Build release candidate

[RELEASE.md](docs/RELEASE.md)

## Test

### Selenium + Cucumber
You **must** run `npm run test:build` **before** running the tests!

`test:build` will *BUILD* the extension and then the tests will *LOAD* the extension.

Rerun `test:build` anytime you make changes to the application itself. If you only change test files, you do not need to rerun it.

```bash
# flow
$ npm run flow
# lint
$ npm run eslint
# features (command to run all existing tests)
$ npm run test:run:e2e:chrome
# How to run one .feature file
$ npm run test:run:feature:chrome features/wallet-creation.feature
# How to run one test.
$ npm run test:run:tag:chrome @it-10
```

### Jest

We use Jest for unittests.

```bash
$ npm run jest
```

## LICENSE

[MIT](LICENSE)
