# Build Yoroi Chrome extension

Extension can be built for both Byron mainnet and Jormungandr testnet:

## Debug build

All `npm` commands starting with `dev` build a debug build.

Example
```bash
# build files to './dev'
$ npm run dev:byron
```

This command will run extension as locally-hosted, create a `./dev` directory in the project, and then you can "load unpacked" extension from there. When you stop the running process - extension will stop working, but it also means you can create code-changes while process is running and extension will be hot-reloaded with these changes.

Note: debug build does not imply that you are connecting to a testnet. The network picked depends on the `npm` command.

#### Production build

All `npm` commands starting with `prod` build a production build.

Example
#### with byron mainnet
```bash
# build files to './build'
$ npm run prod:byron
```

This command will create a full build of the extension in the `./build` directory, which you can also "load unpacked" into your browser, and it will not require you to keep a running process to continue working (standalone build).

Note: debug build does not imply that you are connecting to the mainnet. The network picked depends on the `npm` command.

#### Shelley testnet
```bash
# build files to './dev'
$ npm run dev:shelley
# build files to './build'
$ npm run prod:shelley
```

Same as previous but connects to the [Jormungandr testnet]https://staking.cardano.org/).