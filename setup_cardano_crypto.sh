#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout c7d99c64d7af833b8990a95037755db3cb6d37d4 && \
git submodule update
../js-cardano-wasm-build && \
npm install && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
