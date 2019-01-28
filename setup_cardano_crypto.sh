#! /bin/bash

git submodule update --init --recursive && \
cd js-cardano-wasm && \
git checkout 386cc1ebe9cba1a1bf90304a491221d6986cd865 && \
git submodule update
npm install && \
../js-cardano-wasm-build && \
npm link && \
cd .. && \
npm link rust-cardano-crypto
