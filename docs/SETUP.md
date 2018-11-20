# Environment

Tested on Ubuntu 18.04


# Prerequisites

### NodeJS

- node [v8.9.4](https://nodejs.org/download/release/v8.9.4/) (if you are using nvm, just execute: `nvm use`)

### Rust

```bash
$ curl https://sh.rustup.rs -sSf | sh
```

Don't forget to configure your current shell run for `rustup`:
```bash
$ source $HOME/.cargo/env
```

Toolchain install:
```bash
$ rustup install nightly-2018-10-30
$ rustup target add wasm32-unknown-unknown --toolchain nightly-2018-10-30
```

If you having trouble with `nightly-2018-10-30` version, try to update to the latest one and provide target info:
```bash
$ rustup toolchain install nightly
$ rustup update
$ rustup target add wasm32-unknown-unknown --toolchain nightly
```

### Submodules

```bash
# clone the repository with the submodule js-cardano-wasm
$ git clone --recursive git@github.com:Emurgo/yoroi-frontend.git
$ git submodule update --init --recursive
```

To automate downloading and installation of `js-cardano-wasm` dependency run `setup_cardano_crypto.sh` to download latest `js-cardano-wasm` repository into `js-cardano-wasm` folder.
```bash
$ sh setup_cardano_crypto.sh
```

### Packages
To install other Yoroi-frontend related dependencies use:
```bash
$ npm install
```

Rebuild dll
```bash
$ npm run build-dll
```

# IDE

We suggestion Visual Studio Code

To make it work, you must: 

- Download the [Flow plugin](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode) for VS Code and change the following workspace settings:
1) `javascript.validate.enable` to `false`
1) `flow.useNPMPackagedFlow` to `true`
