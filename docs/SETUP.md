# Environment

Tested on Ubuntu 18.04

# Prerequisites

### NodeJS

If you have `nvm`, just run `nvm use`

Otherwise, you can download `node` manually from [here](https://nodejs.org) but you need to be careful the version matches the one specified in our `package.lock` file.

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

### Firefox

Adding unsigned extensions is not supported for the regular version of Firefox.
You can test Yoroi as a temporary extension, but the extension will disappear every time you close your browser.
To avoid this, we recommend the following:
1) [Setting up Firefox-dev](https://askubuntu.com/questions/548003/how-do-i-install-the-firefox-developer-edition) (note that the Aurora PPA has been deprecated, so you might want to try another installation method).
2) Setting `xpinstall.signatures.required` to `false` in `about:config`.
3) Make sure typing `firefox` in your terminal opens firefox-dev or set the path of the binary using `setBinary(path)` in `firefox.Options()` in webdriver.js (otherwise the unittests will not pass).

### Git hooks

To register the githooks locally you must run this command

```bash
$ git config core.hooksPath .githooks
```
