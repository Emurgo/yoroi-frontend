#!/bin/bash

cd /yoroi

user="circleci"
chown -R "$user:$user" .

curl https://sh.rustup.rs -sSf | sh -s -- -y

source $HOME/.cargo/env
rustup install 1.32.0

# needed for js-cardano-wasm depedency
rustup install 1.32.0

rustup target add wasm32-unknown-unknown --toolchain 1.32.0

chown -R "$user:$user" /usr/local/lib/node_modules

npm install
