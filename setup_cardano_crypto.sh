#! /bin/bash

# https://stackoverflow.com/a/10168693/3329806
git submodule update --init --remote && \
cd js-cardano-wasm && \
npm install && \
./build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto