#!/bin/bash

cd /yoroi

chown -R "$(whoami):$(whoami)" .

curl https://sh.rustup.rs -sSf | sh -s -- -y

source $HOME/.cargo/env
rustup install 1.32.0

# needed for js-cardano-wasm depedency
rustup install 1.32.0

rustup target add wasm32-unknown-unknown --toolchain 1.32.0

chown -R "$(whoami):$(whoami)" /usr/local/lib/node_modules

npm run build-js-cardano-wasm

npm install
