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
$ rustup install 1.32.0
$ rustup target add wasm32-unknown-unknown --toolchain 1.32.0
```

If you having trouble with `1.32.0` version, try to update to the latest one and provide target info:
```bash
$ rustup toolchain install nightly
$ rustup update
$ rustup target add wasm32-unknown-unknown --toolchain nightly
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

### Firefox

Adding unsigned extensions is not supported for the regular version of Firefox.
You can test Yoroi as a temporary extension, but the extension will disappear every time you close your browser.
To avoid this, we recommend the following:
1) [setting up Firefox-dev](https://askubuntu.com/questions/548003/how-do-i-install-the-firefox-developer-edition)
2) Setting `xpinstall.signatures.required` to `false` in `about:config`.
3) Make sure typing `firefox` in your terminal opens firefox-dev (otherwise the unittests will not pass)

### Git hooks

To regiter the githooks locally you must run this command

```bash
$ git config core.hooksPath .githooks
```
