# Icarus light Cardano wallet - PoC
  
  We use as template for this repository: [React Chrome Extension Boilerplate](https://github.com/jhen0409/react-chrome-extension-boilerplate)

## Features

 - Hot reloading React (Using [Webpack](https://github.com/webpack/webpack) and [React Transform](https://github.com/gaearon/react-transform))
 - Write code with ES2015+ syntax (Using [Babel](https://github.com/babel/babel))
 - E2E tests of Window & Popup & Inject pages (Using [Chrome Driver](https://www.npmjs.com/package/chromedriver), [Selenium Webdriver](https://www.npmjs.com/package/selenium-webdriver))

## Installation

### Prerequisites

- node v8.9.4 (if you are using nvm, just execute: `$ nvm use`)
- Install rust tools as mentioned in [js-cardano-wasm](https://github.com/input-output-hk/js-cardano-wasm#installation)

```bash
# clone the repository with the submodule js-cardano-wasm
$ git clone --recursive git@github.com:input-output-hk/icarus-poc.git
# or
$ git submodule update --init --recursive

# Install dependencies
$ npm run build-js-cardano-wasm 
$ npm install
```

In order to update it:

```bash
#### Update js-cardano-wasm
cd js-cardano-wasm;
git checkout master;
git pull origin master;
cd ..;

# Commit the update
git add .
git commit -S -m "${youCommitMessage}"
git push ...

# Repeat process from `$npm run build-js-cardano-wasm`
```

## Development

* Run script
```bash
# build dll dependencies
$ npm run build-dll
# build files to './dev'
# start webpack development server
$ npm run dev
# or
$ npm run start -- --env "development"
```
* If you're developing Inject page, please allow `https://localhost:3000` connections. (Because `injectpage` injected GitHub (https) pages, so webpack server procotol must be https.)
* [Load unpacked extensions](https://developer.chrome.com/extensions/getstarted#unpacked) 

  Extensions that you download from the Chrome Web Store are packaged up as .crx files, which is great for distribution, but not so great for development. Recognizing this, Chrome gives you a quick way of loading up your working directory for testing. Let's do that now.

  Visit `chrome://extensions` in your browser (or open up the Chrome menu by clicking the icon to the far right of the Omnibox:  The menu's icon is three horizontal bars. and select Extensions under the More Tools menu to get to the same place).

  Ensure that the Developer mode checkbox in the top right-hand corner is checked.

  Click Load unpacked extension… to pop up a file-selection dialog.

  Navigate to the directory in which your extension files live (`./dev` folder), and select it.


#### React hot reload

This boilerplate uses `Webpack` and `react-transform`. You can hot reload by editing related files of Popup & Window & Inject page.

## Build

Extension can be built for both the Cardano mainnet and testnet:

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

## Compress

This tasks allow to generate compressed bundles (zip and crx).

**Note**: The same `--env` flag should be used as for the build.

### Zip

Zip files can be uploaded to the Chrome Web Store

```bash
# compress build folder to {manifest.name}.zip and crx
$ npm run build -- --env "${chain}" 
$ npm run compress -- --env "${chain}" --zip-only --app-id "APP_ID" --codebase "https://www.sample.com/dw/icarus-extension.crx" 
```

### CRX

Crx are compressed and signed chrome extension bundles

```bash
# compress build folder to {manifest.name}.zip and crx
$ npm run build -- --env "${chain}" 
$ npm run compress -- --env "${chain}" --app-id "APP_ID" --codebase "https://www.sample.com/dw/icarus-extension.crx" --key ./production-key.pem
```

#### Options

If you want to build `crx` file (auto update), please provide options, and add `update.xml` file url in [manifest.json](https://developer.chrome.com/extensions/autoupdate#update_url manifest.json).

* --app-id: your extension id (can be get it when you first release extension)
* --key: your private key path (default: './key.pem')  
  you can use `npm run compress-keygen` to generate private key `./key.pem`
* --codebase: your `crx` file url

See [autoupdate guide](https://developer.chrome.com/extensions/autoupdate) for more information.

## Test

* `features`: E2E tests (use [chromedriver](https://www.npmjs.com/package/chromedriver), [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver))

```bash
# flow
$ npm run flow
# lint
$ npm run eslint
# features
$ npm run test-e2e
```

## LICENSE

[MIT](LICENSE)
