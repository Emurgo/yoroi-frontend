#!/bin/bash

cd /yoroi

chown -R "$(whoami):$(whoami)" .

curl https://sh.rustup.rs -sSf | sh -s -- -y

source $HOME/.cargo/env
rustup install nightly

# needed for js-cardano-wasm depedency
rustup install nightly-2018-06-05-x86_64

rustup target add wasm32-unknown-unknown --toolchain nightly

chown -R "$(whoami):$(whoami)" /usr/local/lib/node_modules

npm run build-js-cardano-wasm

npm install
